'use client';

import { Role } from '@/types';
import { Label } from '@/components/ui/label';
import { getRoleLabel } from '@/lib/labels';

interface RoleSelectorProps {
  selectedRoles: Role[];
  onChange: (roles: Role[]) => void;
  label?: string;
  error?: string;
  multiple?: boolean;
}

export function RoleSelector({
  selectedRoles,
  onChange,
  label = 'תפקידים',
  error,
  multiple = true,
}: RoleSelectorProps) {
  const handleCheckboxChange = (role: Role) => {
    if (multiple) {
      const newRoles = selectedRoles.includes(role)
        ? selectedRoles.filter((r) => r !== role)
        : [...selectedRoles, role];
      onChange(newRoles);
    } else {
      onChange([role]);
    }
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="space-y-2">
        {Object.values(Role).map((role) => (
          <label key={role} className="flex items-center space-x-2 cursor-pointer">
            <input
              type={multiple ? 'checkbox' : 'radio'}
              checked={selectedRoles.includes(role)}
              onChange={() => handleCheckboxChange(role)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm">{getRoleLabel(role)}</span>
          </label>
        ))}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
