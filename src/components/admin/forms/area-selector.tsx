'use client';

import { Area } from '@/types';
import { Select } from '@/components/ui/select';
import { getAreaLabel } from '@/lib/labels';

interface AreaSelectorProps {
  value: Area | '';
  onChange: (area: Area) => void;
  label?: string;
  error?: string;
  required?: boolean;
}

export function AreaSelector({
  value,
  onChange,
  label = 'אזור',
  error,
  required = false,
}: AreaSelectorProps) {
  const options = Object.values(Area).map((area) => ({
    value: area,
    label: getAreaLabel(area),
  }));

  return (
    <Select
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value as Area)}
      options={options}
      placeholder="בחר אזור..."
      error={error}
      required={required}
      fullWidth
    />
  );
}
