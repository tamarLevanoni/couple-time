'use client';

import { useState, useEffect, useMemo } from 'react';
import { BaseFormModal } from '../../shared/modals/base-form-modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { UserForAdmin } from '@/types/computed';
import { Area } from '@/types/schema';
import { UpdateCenterInput } from '@/lib/validations';
import { getAreaLabel } from '@/lib/labels';
import { formatUserName } from '@/lib/utils';
import { MapPin, X, AlertTriangle, Search } from 'lucide-react';
import { CenterForAdmin } from '@/types';
import { Select } from '@/components/ui/select';

interface EditCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateCenterInput) => Promise<void>;
  center: CenterForAdmin | null;
  users: UserForAdmin[];
  isSubmitting?: boolean;
  error?: string | null;
  warnings?: string[];
}

interface LocationSearchResult {
  lat: string;
  lon: string;
  display_name: string;
}

const ALL_AREAS: Area[] = ['NORTH', 'CENTER', 'SOUTH', 'JERUSALEM', 'JUDEA_SAMARIA'];

export function EditCenterModal({
  isOpen,
  onClose,
  onSubmit,
  center,
  users,
  isSubmitting = false,
  error,
  warnings = [],
}: EditCenterModalProps) {
  const [formData, setFormData] = useState<UpdateCenterInput>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [clientWarnings, setClientWarnings] = useState<string[]>([]);

  // Location search state
  const [locationSearch, setLocationSearch] = useState('');
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [manualLocation, setManualLocation] = useState({ lat: '', lng: '' });

  // Reset form when modal opens or center changes
  useEffect(() => {
    if (isOpen && center) {
      // Parse location from JsonValue
      const locationData = center.location as { lat: number; lng: number } | null;

      setFormData({
        name: center.name,
        area: center.area,
        coordinatorId: center.coordinator?.id,
        superCoordinatorId: center.superCoordinator?.id,
        location: locationData || undefined,
        isActive: center.isActive,
      });
      setValidationErrors({});
      setLocationSearch('');
      setSearchResults([]);
      console.log("🚀 ~ EditCenterModal ~ locationData:", locationData)
      setManualLocation({
        lat: locationData?.lat.toString() || '',
        lng: locationData?.lng.toString() || '',
      });
      setClientWarnings([]);
    }
  }, [isOpen, center]);

  // Available coordinators - only those without a managed center (excluding current center's coordinator)
  const availableCoordinators = useMemo(() => {
    return users.filter(
      (user) =>
        user.roles.includes('CENTER_COORDINATOR') &&
        (!user.managedCenter || user.managedCenter.id === center?.id) &&
        user.isActive
    );
  }, [users, center]);

  // Available super coordinators
  const availableSuperCoordinators = useMemo(() => {
    return users.filter(
      (user) => user.roles.includes('SUPER_COORDINATOR') && user.isActive
    );
  }, [users]);

  // Check for client-side warnings
  useEffect(() => {
    const newWarnings: string[] = [];

    // Warn if removing coordinator from active center
    if (
      center &&
      center.isActive &&
      center.coordinatorId &&
      !formData.coordinatorId
    ) {
      newWarnings.push('הסרת רכז תגרום לכיבוי המוקד');
    }

    setClientWarnings(newWarnings);
  }, [formData.coordinatorId, center]);

  // Search address using Nominatim
  const searchAddress = async (query: string) => {
    console.log("🚀 ~ searchAddress ~ query:", query)
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&format=json&limit=5&accept-language=he`
      );
      const results = await response.json();
      setSearchResults(results);
    } catch (error) {
      console.error('Failed to search address:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search button click
  const handleSearchClick = () => {
    if (locationSearch) {
      searchAddress(locationSearch);
    }
  };

  // Handle selecting a search result
  const handleSelectResult = (result: LocationSearchResult) => {
    console.log("🚀 ~ handleSelectResult ~ result:", result)
    setFormData({
      ...formData,
      location: {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
      },
    });
    setLocationSearch(result.display_name);
    setSearchResults([]);
    setManualLocation({ lat: result.lat, lng: result.lon });
  };

  // Handle manual coordinate input
  const handleManualLocationChange = (field: 'lat' | 'lng', value: string) => {
    setManualLocation({ ...manualLocation, [field]: value });

    const lat = field === 'lat' ? parseFloat(value) : parseFloat(manualLocation.lat);
    const lng = field === 'lng' ? parseFloat(value) : parseFloat(manualLocation.lng);

    if (!isNaN(lat) && !isNaN(lng)) {
      setFormData({
        ...formData,
        location: { lat, lng },
      });
    } else if (value === '' && (field === 'lat' ? manualLocation.lng : manualLocation.lat) === '') {
      setFormData({
        ...formData,
        location: {lat:0,lng:0},
      });
    }
  };

  // Clear location
  const handleClearLocation = () => {
    setFormData({ ...formData, location: {lat:0,lng:0} });
    setLocationSearch('');
    setManualLocation({ lat: '', lng: '' });
    setSearchResults([]);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate name if provided
    if (formData.name !== undefined) {
      if (formData.name.length < 1 || formData.name.length > 100) {
        errors.name = 'שם המוקד חייב להיות בין 1-100 תווים';
      }
    }

    // Validate location if provided
    if (formData.location) {
      if (
        formData.location.lat < -90 ||
        formData.location.lat > 90 ||
        formData.location.lng < -180 ||
        formData.location.lng > 180
      ) {
        errors.location = 'קואורדינטות לא חוקיות';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    console.log("🚀 ~ handleSubmit ~ formData.coordinatorId :", formData.coordinatorId )

    // Only send fields that have changed
    const updates: UpdateCenterInput = {};
    if (formData.name !== center?.name) updates.name = formData.name;
    if (formData.area !== center?.area) updates.area = formData.area;
    if (formData.coordinatorId !== center?.coordinator?.id)
      updates.coordinatorId = formData.coordinatorId || null;
    if (formData.superCoordinatorId !== center?.superCoordinator?.id)
      updates.superCoordinatorId = formData.superCoordinatorId || null;
    if (JSON.stringify(formData.location) !== JSON.stringify(center?.location))
      updates.location = formData.location;
    if (formData.isActive !== center?.isActive) updates.isActive = formData.isActive;

    console.log("🚀 ~ handleSubmit ~ updates:", updates)
    await onSubmit(updates);
  };

  if (!center) return null;

  const allWarnings = [...clientWarnings, ...warnings];

  return (
    <BaseFormModal
      isOpen={isOpen}
      onClose={onClose}
      title="עריכת מוקד"
      onSubmit={handleSubmit}
      submitLabel="שמור שינויים"
      cancelLabel="ביטול"
      isSubmitting={isSubmitting}
      error={error}
      maxWidth="max-w-3xl"
    >
      {/* Warnings */}
      {allWarnings.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg space-y-1">
          {allWarnings.map((warning, index) => (
            <div key={index} className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-yellow-800">{warning}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Name */}
        <div className="col-span-2">
          <Label htmlFor="name">שם המוקד</Label>
          <Input
            id="name"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="שם המוקד"
            maxLength={100}
          />
          {validationErrors.name && (
            <p className="text-xs text-red-600 mt-1">{validationErrors.name}</p>
          )}
        </div>

        {/* Area */}
        <div>
          <Label htmlFor="area">אזור</Label>
          <Select
            id="area"
            value={formData.area}
            onChange={(e) => setFormData({...formData, area: e.target.value as Area})}
            options={[
                  { value: '', label: 'כל האזורים' },
                  ...ALL_AREAS.map(area => ({
                    value: area,
                    label: getAreaLabel(area)
                  }))
                ]}
          />
        </div>

        {/* Status */}
        <div className="flex items-center space-x-2 space-x-reverse">
          <Checkbox
            id="isActive"
            checked={formData.isActive}
            onChange={() =>
              setFormData({ ...formData, isActive: !formData.isActive })
            }
          />
          <Label htmlFor="isActive" className="cursor-pointer">
            מוקד פעיל
          </Label>
        </div>

        {/* Coordinator */}
        <div>
          <Label htmlFor="coordinatorId">רכז מוקד</Label>
          <Select
            id="coordinatorId"
            value={formData.coordinatorId || ''}
            onChange={(e) =>
              setFormData({ ...formData, coordinatorId: e.target.value || undefined })
            }
            options={[
              { value: '', label: 'ללא רכז' },
              ...availableCoordinators.map((user) => ({
                value: user.id,
                label: formatUserName(user.firstName, user.lastName)
              }))
            ]}
          />
        </div>

        {/* Super Coordinator */}
        <div>
          <Label htmlFor="superCoordinatorId">רכז על</Label>
          <Select
            id="superCoordinatorId"
            value={formData.superCoordinatorId || ''}
            onChange={(e) =>
              setFormData({ ...formData, superCoordinatorId: e.target.value || undefined })
            }
            options={[
              { value: '', label: 'ללא רכז על' },
              ...availableSuperCoordinators.map((user) => ({
                value: user.id,
                label: formatUserName(user.firstName, user.lastName)
              }))
            ]}
          />
        </div>

        {/* Location - Address Search */}
        <div className="col-span-2">
          <Label htmlFor="locationSearch">מיקום</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="locationSearch"
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearchClick();
                  }
                }}
                placeholder="חפש כתובת..."
              />
              {formData.location && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute left-2 top-1/2 -translate-y-1/2"
                  onClick={handleClearLocation}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button
              type="button"
              onClick={handleSearchClick}
              disabled={!locationSearch || isSearching}
              className="px-4"
            >
              {isSearching ? (
                <MapPin className="h-4 w-4 animate-pulse" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-2 border rounded-lg divide-y max-h-60 overflow-y-auto">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  type="button"
                  className="w-full p-2 text-right hover:bg-gray-50 text-sm"
                  onClick={() => handleSelectResult(result)}
                >
                  {result.display_name}
                </button>
              ))}
            </div>
          )}

          {/* Selected Location Display */}
          {formData.location && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg text-sm">
              <p className="text-green-800">
                קו רוחב: {formData.location.lat}, קו אורך: {formData.location.lng}
              </p>
            </div>
          )}
        </div>

        {/* Manual Coordinates */}
        <div className="col-span-2">
          <Label>או הזן קואורדינטות ידנית</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Input
                type="number"
                value={manualLocation.lat}
                onChange={(e) => handleManualLocationChange('lat', e.target.value)}
                placeholder="קו רוחב (-90 עד 90)"
                step="any"
                min="-90"
                max="90"
              />
            </div>
            <div>
              <Input
                type="number"
                value={manualLocation.lng}
                onChange={(e) => handleManualLocationChange('lng', e.target.value)}
                placeholder="קו אורך (-180 עד 180)"
                step="any"
                min="-180"
                max="180"
              />
            </div>
          </div>
          {validationErrors.location && (
            <p className="text-xs text-red-600 mt-1">{validationErrors.location}</p>
          )}
        </div>
      </div>
    </BaseFormModal>
  );
}
