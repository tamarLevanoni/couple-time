'use client';

import { CenterWithCoordinator } from '@/types';
import { Label } from '@/components/ui/label';

interface CenterSelectorProps {
  centers: CenterWithCoordinator[];
  selectedCenterIds: string[];
  onChange: (centerIds: string[]) => void;
  label?: string;
  error?: string;
  multiple?: boolean;
  singleValue?: string;
  onSingleChange?: (centerId: string) => void;
}

export function CenterSelector({
  centers,
  selectedCenterIds,
  onChange,
  label = 'Centers',
  error,
  multiple = true,
  singleValue,
  onSingleChange,
}: CenterSelectorProps) {
  const handleCheckboxChange = (centerId: string) => {
    if (multiple) {
      const newCenterIds = selectedCenterIds.includes(centerId)
        ? selectedCenterIds.filter((id) => id !== centerId)
        : [...selectedCenterIds, centerId];
      onChange(newCenterIds);
    } else if (onSingleChange) {
      onSingleChange(centerId);
    }
  };

  // For single selection mode, use singleValue
  const isChecked = (centerId: string) => {
    if (multiple) {
      return selectedCenterIds.includes(centerId);
    }
    return singleValue === centerId;
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="space-y-2 max-h-64 overflow-y-auto border rounded-md p-3">
        {centers.length === 0 ? (
          <p className="text-sm text-gray-500">No centers available</p>
        ) : (
          centers.map((center) => (
            <label key={center.id} className="flex items-center space-x-2 cursor-pointer">
              <input
                type={multiple ? 'checkbox' : 'radio'}
                checked={isChecked(center.id)}
                onChange={() => handleCheckboxChange(center.id)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm">
                {center.name} ({center.area})
              </span>
            </label>
          ))
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
