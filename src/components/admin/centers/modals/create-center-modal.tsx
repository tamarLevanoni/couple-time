'use client';

import { useState, useEffect, useMemo } from 'react';
import { BaseFormModal } from '../../shared/modals/base-form-modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { UserForAdmin } from '@/types/computed';
import { Area } from '@/types/schema';
import { CreateCenterInput } from '@/lib/validations';
import { getAreaLabel } from '@/lib/labels';
import { formatUserName } from '@/lib/utils';
import { MapPin, X, Search } from 'lucide-react';

interface CreateCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCenterInput) => Promise<void>;
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

const INITIAL_FORM_DATA: CreateCenterInput = {
  name: '',
  area: 'CENTER',
  coordinatorId: undefined,
  superCoordinatorId: undefined,
  location: {lat:0,lng:0},
};

export function CreateCenterModal({
  isOpen,
  onClose,
  onSubmit,
  users,
  isSubmitting = false,
  error,
  warnings = [],
}: CreateCenterModalProps) {
  const [formData, setFormData] = useState<CreateCenterInput>(INITIAL_FORM_DATA);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Location search state
  const [locationSearch, setLocationSearch] = useState('');
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [manualLocation, setManualLocation] = useState({ lat: '', lng: '' });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(INITIAL_FORM_DATA);
      setValidationErrors({});
      setLocationSearch('');
      setSearchResults([]);
      setManualLocation({ lat: '', lng: '' });
    }
  }, [isOpen]);

  // Available coordinators - only those without a managed center
  const availableCoordinators = useMemo(() => {
    return users.filter(
      (user) =>
        user.roles.includes('CENTER_COORDINATOR') &&
        !user.managedCenter &&
        user.isActive
    );
  }, [users]);

  // Available super coordinators
  const availableSuperCoordinators = useMemo(() => {
    return users.filter(
      (user) => user.roles.includes('SUPER_COORDINATOR') && user.isActive
    );
  }, [users]);

  // Search address using Nominatim
  const searchAddress = async (query: string) => {
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

    // Required fields
    if (!formData.name || formData.name.length < 1 || formData.name.length > 100) {
      errors.name = 'שם המוקד חייב להיות בין 1-100 תווים';
    }

    if (!formData.area) {
      errors.area = 'יש לבחור אזור';
    }

    // Validate location if provided
    if (formData.location?.lat && formData.location?.lng) {
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

    await onSubmit(formData);
  };

  return (
    <BaseFormModal
      isOpen={isOpen}
      onClose={onClose}
      title="הוספת מוקד חדש"
      onSubmit={handleSubmit}
      submitLabel="צור מוקד"
      cancelLabel="ביטול"
      isSubmitting={isSubmitting}
      error={error}
      maxWidth="max-w-3xl"
    >
      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          {warnings.map((warning, index) => (
            <p key={index} className="text-sm text-yellow-800">
              {warning}
            </p>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Name */}
        <div className="col-span-2">
          <Label htmlFor="name">
            שם המוקד <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
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
          <Label htmlFor="area">
            אזור <span className="text-red-500">*</span>
          </Label>
          <Select
            id="area"
            value={formData.area}
            onChange={(e) => setFormData({ ...formData, area: e.target.value as Area })}
            options={ALL_AREAS.map((area) => ({
              value: area,
              label: getAreaLabel(area)
            }))}
          />
          {validationErrors.area && (
            <p className="text-xs text-red-600 mt-1">{validationErrors.area}</p>
          )}
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
        <div className="col-span-2">
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
          <Label htmlFor="locationSearch">מיקום (אופציונלי)</Label>
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
