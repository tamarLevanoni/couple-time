'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { AlertCircle } from '@/components/icons';
import { 
  useGamesStore, 
  useCentersStore, 
  useRentalsStore,
  useAuthStore
} from '@/store';
import { buildRentalNotes } from '@/lib/rental-helpers';
import { RENT_FORM_STORAGE_KEY } from '@/lib/rental-constants';
import { GameCheckboxList } from './game-checkbox-list';
import { SelectedGamesCard } from './selected-games-card';
import { SelectedCenterCard } from './selected-center-card';
import { ProcessInfoCard } from './process-info-card';
import { Area } from '@/types';
import { getAreaLabel } from '@/lib/game-labels';

interface RentFormState {
  selectedArea: Area | '';
  selectedGameInstanceIds: string[];
  selectedCenterId: string;
  notes: string;
}

/**
 * RentForm - Main rental form component that handles the complete rental request flow
 *
 * Features:
 * - Form state persistence in localStorage (survives auth flow)
 * - URL parameter handling for deep linking
 * - Area filtering and center selection
 * - Multi-game instance selection
 * - Authentication-aware submission
 * - Automatic notes generation for unavailable games
 *
 * Flow:
 * 1. User selects optional area filter
 * 2. User selects a center
 * 3. User selects game instances from the center
 * 4. User adds optional notes
 * 5. Form is submitted (redirects to auth if needed)
 * 6. On success, redirects to my-rentals page
 */
export function RentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  // Store hooks
  const { games } = useGamesStore();
  const { centers } = useCentersStore();
  const { createRental, isSubmitting, error: rentalError } = useRentalsStore();
  const { openAuthPopup } = useAuthStore();

  // Form state
  const [selectedArea, setSelectedArea] = useState<Area | ''>('');
  const [selectedGameInstanceIds, setSelectedGameInstanceIds] = useState<string[]>([]);
  const [selectedCenterId, setSelectedCenterId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [hasRestoredFromStorage, setHasRestoredFromStorage] = useState(false);

  // Save form state to localStorage
  const saveFormState = () => {
    const state: RentFormState = {
      selectedArea,
      selectedGameInstanceIds,
      selectedCenterId,
      notes
    };
    try {
      localStorage.setItem(RENT_FORM_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save form state:', error);
      alert('לא ניתן לשמור את פרטי הטופס. ייתכן שתצטרכו למלא אותו שוב לאחר ההתחברות.');
    }
  };

  // Clear form state from localStorage
  const clearFormState = () => {
    try {
      localStorage.removeItem(RENT_FORM_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear form state:', error);
    }
  };

  // Combined effect: Handle URL params and restore from localStorage
  useEffect(() => {
    // Only run once centers are loaded and we haven't restored yet
    if (hasRestoredFromStorage || centers.length === 0) return;

    const urlCenterId = searchParams.get('centerId');
    const urlGameInstanceId = searchParams.get('gameInstanceId');

    try {
      // Step 1: If URL params exist, save them to localStorage and clear URL
      if (urlCenterId || urlGameInstanceId) {
        const newState: RentFormState = {
          selectedArea: '',
          selectedCenterId: urlCenterId || '',
          selectedGameInstanceIds: urlGameInstanceId ? [urlGameInstanceId] : [],
          notes: ''
        };

        localStorage.setItem(RENT_FORM_STORAGE_KEY, JSON.stringify(newState));

        // Clear URL params immediately
        router.replace('/rent', { scroll: false });
      }

      // Step 2: Restore form state from localStorage (including URL params we just saved)
      const saved = localStorage.getItem(RENT_FORM_STORAGE_KEY);
      if (saved) {
        const state: RentFormState = JSON.parse(saved);

        // Validate and apply center
        const savedCenter = centers.find(c => c.id === state.selectedCenterId);
        if (savedCenter) {
          setSelectedCenterId(state.selectedCenterId);

          // Validate game instances exist at this center - optimized with Set
          if (state.selectedGameInstanceIds.length > 0) {
            const centerInstanceIds = new Set(
              savedCenter.gameInstances?.map(gi => gi.id) || []
            );
            const validInstanceIds = state.selectedGameInstanceIds.filter(id =>
              centerInstanceIds.has(id)
            );

            if (validInstanceIds.length > 0) {
              setSelectedGameInstanceIds(validInstanceIds);
            }
          }
        }

        if (state.selectedArea) setSelectedArea(state.selectedArea);
        if (state.notes) setNotes(state.notes);
      }
    } catch (error) {
      console.error('Failed to handle form state:', error);
      alert('לא ניתן לשחזר את פרטי הטופס מהדפדפן.');
    }

    setHasRestoredFromStorage(true);
  }, [hasRestoredFromStorage, centers, searchParams, router]);

  // Filter centers by selected area (optional filter)
  const filteredCenters = useMemo(() => {
    if (!selectedArea) return centers;
    return centers.filter(c => c.area === selectedArea);
  }, [centers, selectedArea]);

  // Get selected center
  const selectedCenter = useMemo(() => {
    return centers.find(c => c.id === selectedCenterId);
  }, [centers, selectedCenterId]);

  // Get available game instances with game details
  const availableGameInstances = useMemo(() => {
    if (!selectedCenter || !selectedCenter.gameInstances) return [];

    return selectedCenter.gameInstances
      .map(instance => {
        const game = games.find(g => g.id === instance.gameId);
        return game ? { ...instance, game } : null;
      })
      .filter((instance): instance is NonNullable<typeof instance> => instance !== null);
  }, [selectedCenter, games]);

  // Get selected game instances with game details
  const selectedGameInstancesWithDetails = useMemo(() => {
    return availableGameInstances.filter(instance =>
      selectedGameInstanceIds.includes(instance.id)
    );
  }, [availableGameInstances, selectedGameInstanceIds]);

  // Get selected games (for display in sidebar)
  const selectedGames = useMemo(() => {
    return selectedGameInstancesWithDetails.map(instance => instance.game);
  }, [selectedGameInstancesWithDetails]);

  // Handle area change - clear center and games when area changes
  const handleAreaChange = (area: Area | '') => {
    setSelectedArea(area);
    setSelectedCenterId('');
    setSelectedGameInstanceIds([]);
  };

  // Handle center change - clear selected games when center changes
  const handleCenterChange = (centerId: string) => {
    setSelectedCenterId(centerId);
    // Clear selected games when center changes since available games will change
    setSelectedGameInstanceIds([]);
  };

  // Handle game instance selection toggle
  const toggleGameInstance = (instanceId: string, checked: boolean) => {
    setSelectedGameInstanceIds(prev =>
      checked ? [...prev, instanceId] : prev.filter(id => id !== instanceId)
    );
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validate required fields
    if (selectedGameInstanceIds.length === 0 || !selectedCenterId) {
      setFormError('אנא בחר לפחות משחק אחד ומוקד');
      return;
    }

    // Check if user is authenticated
    if (status === 'loading') {
      return; // Still checking auth status
    }

    if (!session) {
      // Save form state before opening auth popup (page will reload after login)
      saveFormState();
      openAuthPopup('login');
      return;
    }
    
    try {
      // Build rental notes with status information for unavailable games
      const finalNotes = buildRentalNotes(
        notes,
        selectedGameInstancesWithDetails,
        games
      );

      await createRental({
        centerId: selectedCenterId,
        gameInstanceIds: selectedGameInstanceIds,
        notes: finalNotes || undefined
      });

      // Clear saved form state after successful submission
      clearFormState();

      // Redirect to profile page with success message
      router.push('/profile?success=rental-created#my-rentals');
    } catch (error) {
      // The store already handles error translation
      // Just display the error message to the user
      const message = error instanceof Error ? error.message : 'שגיאה ביצירת הבקשה. אנא נסו שוב.';
      setFormError(message);
    }
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Form */}
      <div className="lg:col-span-2">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Area Filter - Optional */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                סנן לפי אזור (אופציונלי)
              </label>
              <Select
                value={selectedArea}
                onChange={(e) => handleAreaChange(e.target.value as Area | '')}
                options={[
                  { value: '', label: 'כל האזורים' },
                  ...Object.values(Area).map(area => ({
                    value: area,
                    label: getAreaLabel(area)
                  }))
                ]}
              />
            </div>

            {/* Center Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                בחר מוקד קרוב אליך <span className="text-red-500">*</span>
              </label>
              <Select
                value={selectedCenterId}
                onChange={(e) => handleCenterChange(e.target.value)}
                options={[
                  {
                    value: '',
                    label:'בחר מוקד...'
                  },
                  ...filteredCenters.map(center => ({
                    value: center.id,
                    label: center.name
                  }))
                ]}
                required
              />
              {selectedArea && filteredCenters.length === 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  אין מוקדים זמינים באזור זה
                </p>
              )}
            </div>

            {/* Game Selection - only shows after center selected */}
            {selectedCenterId && (
              <GameCheckboxList
                gameInstances={availableGameInstances}
                selectedInstanceIds={selectedGameInstanceIds}
                onToggle={toggleGameInstance}
              />
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                הערות (אופציונלי)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="הערות נוספות לרכז המוקד..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Error Display */}
            {(formError || rentalError) && (
              <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-500 ml-2" />
                <p className="text-sm text-red-700">
                  {formError || rentalError}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting || selectedGameInstanceIds.length === 0 || !selectedCenterId}
              className="w-full"
            >
              {isSubmitting ? 'שולח בקשה...' : 
               !session ? 'התחבר ושלח בקשה' : 'שלח בקשת השאלה'}
            </Button>

            {!session && (
              <p className="text-sm text-gray-600 text-center">
                תצטרכו להתחבר או להירשם כדי לשלוח את הבקשה
              </p>
            )}
          </form>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <SelectedGamesCard selectedGames={selectedGames} />
        <SelectedCenterCard selectedCenter={selectedCenter} isAuthenticated={!!session} />
        <ProcessInfoCard />
      </div>
    </div>
  );
}