'use client';

import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface FilterState {
  search: string;
  category: string;
  targetAudience: string;
}

interface GameFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const categoryOptions = [
  { value: '', label: 'כל הקטגוריות' },
  { value: 'COMMUNICATION', label: 'תקשורת' },
  { value: 'INTIMACY', label: 'אינטימיות' },
  { value: 'FUN', label: 'כיף' },
  { value: 'THERAPY', label: 'טיפול' },
  { value: 'PERSONAL_DEVELOPMENT', label: 'התפתחות אישית' }
];

const audienceOptions = [
  { value: '', label: 'כל הקהלים' },
  { value: 'SINGLES', label: 'רווקים' },
  { value: 'MARRIED', label: 'נשואים' },
  { value: 'GENERAL', label: 'כללי' }
];

export function GameFilters({ filters, onFiltersChange }: GameFiltersProps) {
  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const resetFilters = {
      search: '',
      category: '',
      targetAudience: ''
    };
    onFiltersChange(resetFilters);
  };

  const hasActiveFilters = filters.category || filters.targetAudience || filters.search;

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Category Filter */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            קטגוריה
          </label>
          <Select
            value={filters.category}
            onChange={(value) => handleFilterChange('category', value)}
            options={categoryOptions}
            placeholder="בחר קטגוריה"
          />
        </div>

        {/* Target Audience Filter */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            קהל יעד
          </label>
          <Select
            value={filters.targetAudience}
            onChange={(value) => handleFilterChange('targetAudience', value)}
            options={audienceOptions}
            placeholder="בחר קהל יעד"
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