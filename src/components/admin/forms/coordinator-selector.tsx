'use client';

import { UserForAdmin, Role } from '@/types';
import { Select } from '@/components/ui/select';
import { formatUserName } from '@/lib/utils';

interface CoordinatorSelectorProps {
  coordinators: UserForAdmin[];
  value: string;
  onChange: (coordinatorId: string) => void;
  label?: string;
  error?: string;
  required?: boolean;
  roleFilter?: 'CENTER_COORDINATOR' | 'SUPER_COORDINATOR';
  allowClear?: boolean;
}

export function CoordinatorSelector({
  coordinators,
  value,
  onChange,
  label = 'Coordinator',
  error,
  required = false,
  roleFilter,
  allowClear = true,
}: CoordinatorSelectorProps) {
  // Filter coordinators by role if specified
  const filteredCoordinators = roleFilter
    ? coordinators.filter((c) => c.roles?.includes(roleFilter))
    : coordinators;

  const options = filteredCoordinators.map((coordinator) => ({
    value: coordinator.id,
    label: `${formatUserName(coordinator.firstName, coordinator.lastName)} (${coordinator.email})`,
  }));

  return (
    <Select
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      options={options}
      placeholder={allowClear ? 'Select coordinator (optional)...' : 'Select coordinator...'}
      error={error}
      required={required}
      fullWidth
    />
  );
}
