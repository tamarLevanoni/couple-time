'use client';

import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface FilterState {
  search: string;
  area: string;
  city: string;
}

interface CenterFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const areaOptions = [
  { value: '', label: 'כל האזורים' },
  { value: 'JERUSALEM', label: 'ירושלים' },
  { value: 'CENTER', label: 'מרכז' },
  { value: 'NORTH', label: 'צפון' },
  { value: 'SOUTH', label: 'דרום' },
  { value: 'JUDEA_SAMARIA', label: 'יהודה ושומרון' }
];

const cityOptions = [
  { value: '', label: 'כל הערים' },
  { value: 'ירושלים', label: 'ירושלים' },
  { value: 'תל אביב', label: 'תל אביב' },
  { value: 'חיפה', label: 'חיפה' },
  { value: 'באר שבע', label: 'באר שבע' },
  { value: 'פתח תקווה', label: 'פתח תקווה' },
  { value: 'נתניה', label: 'נתניה' },
  { value: 'ראשון לציון', label: 'ראשון לציון' },
  { value: 'חולון', label: 'חולון' },
  { value: 'בני ברק', label: 'בני ברק' },
  { value: 'רמת גן', label: 'רמת גן' }
];

export function CenterFilters({ filters, onFiltersChange }: CenterFiltersProps) {
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const resetFilters = {
      search: '',
      area: '',
      city: ''
    };
    onFiltersChange(resetFilters);
  };

  const hasActiveFilters = filters.area || filters.city || filters.search;

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Area Filter */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            אזור
          </label>
          <Select
            value={filters.area}
            onChange={(value) => handleFilterChange('area', value)}
            options={areaOptions}
            placeholder="בחר אזור"
          />
        </div>

        {/* City Filter */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            עיר
          </label>
          <Select
            value={filters.city}
            onChange={(value) => handleFilterChange('city', value)}
            options={cityOptions}
            placeholder="בחר עיר"
          />
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <div className="flex items-end">
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
            >
              נקה מסננים
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}