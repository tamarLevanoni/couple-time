'use client';

import { useState, useEffect, useMemo } from 'react';
import { BaseFormModal } from '../../shared/modals/base-form-modal';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select } from '@/components/ui/select';
import { UserForAdmin, CenterForAdmin } from '@/types/computed';
import { Role } from '@/types/schema';
import { AssignRoleInput } from '@/lib/validations';
import { getRoleLabel } from '@/lib/labels';
import { AlertCircle } from 'lucide-react';

interface AssignRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AssignRoleInput) => Promise<void>;
  user: UserForAdmin | null;
  centers: CenterForAdmin[];
  isSubmitting?: boolean;
  error?: string | null;
  warnings?: string[];
}

const ALL_ROLES: Role[] = ['ADMIN', 'SUPER_COORDINATOR', 'CENTER_COORDINATOR'];

export function AssignRoleModal({
  isOpen,
  onClose,
  onSubmit,
  user,
  centers,
  isSubmitting = false,
  error,
  warnings = [],
}: AssignRoleModalProps) {
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
  const [managedCenterId, setManagedCenterId] = useState<string>('');
  const [supervisedCenterIds, setSupervisedCenterIds] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Reset form when user changes or modal opens
  useEffect(() => {
    if (user && isOpen) {
      setSelectedRoles(user.roles || []);
      setManagedCenterId(user.managedCenter?.id || '');
      setSupervisedCenterIds(user.supervisedCenters.map((c) => c.id) || []);
      setValidationErrors({});
    }
  }, [user, isOpen]);

  // Available centers for coordinator role (centers without coordinator OR user's current center)
  const availableCentersForCoordinator = useMemo(() => {
    return centers.filter(
      (center) =>
        !center.coordinator ||
        center.coordinator.id === user?.id ||
        center.id === user?.managedCenter?.id
    );
  }, [centers, user]);

  // Available centers for super coordinator role (centers without super OR user's current supervised centers)
  const availableCentersForSuper = useMemo(() => {
    const userSupervisedIds = user?.supervisedCenters.map((c) => c.id) || [];
    return centers.filter(
      (center) =>
        !center.superCoordinator ||
        center.superCoordinator.id === user?.id ||
        userSupervisedIds.includes(center.id)
    );
  }, [centers, user]);

  const hasCoordinatorRole = selectedRoles.includes('CENTER_COORDINATOR');
  const hasSuperRole = selectedRoles.includes('SUPER_COORDINATOR');

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (selectedRoles.length === 0) {
      errors.roles = 'נא לבחור לפחות תפקיד אחד';
    }

    // Regular user cannot have center assignments
    const isRegularUser = selectedRoles.length === 0;
    if (isRegularUser && (managedCenterId || supervisedCenterIds.length > 0)) {
      errors.general = 'משתמש רגיל לא יכול להיות משויך למוקדים';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const data: AssignRoleInput = {
      roles: selectedRoles,
      managedCenterId: hasCoordinatorRole && managedCenterId ? managedCenterId : undefined,
      supervisedCenterIds: hasSuperRole && supervisedCenterIds.length > 0 ? supervisedCenterIds : undefined,
    };

    await onSubmit(data);
  };

  const handleRoleToggle = (role: Role) => {
    setSelectedRoles((prev) => {
      if (prev.includes(role)) {
        return prev.filter((r) => r !== role);
      } else {
        return [...prev, role];
      }
    });
  };

  const handleSupervisorCenterToggle = (centerId: string) => {
    setSupervisedCenterIds((prev) => {
      if (prev.includes(centerId)) {
        return prev.filter((id) => id !== centerId);
      } else {
        return [...prev, centerId];
      }
    });
  };

  const handleClose = () => {
    setSelectedRoles([]);
    setManagedCenterId('');
    setSupervisedCenterIds([]);
    setValidationErrors({});
    onClose();
  };

  if (!user) return null;

  return (
    <BaseFormModal
      isOpen={isOpen}
      onClose={handleClose}
      title="שיוך תפקיד"
      onSubmit={handleSubmit}
      submitLabel="שמור"
      cancelLabel="ביטול"
      isSubmitting={isSubmitting}
      error={error || validationErrors.general}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-4">
        {/* Warnings from API */}
        {warnings.length > 0 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            {warnings.map((warning, index) => (
              <div key={index} className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-yellow-800">{warning}</p>
              </div>
            ))}
          </div>
        )}

        {/* User Info */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <span className="font-medium">משתמש:</span> {user.firstName} {user.lastName} ({user.email})
          </p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Roles */}
          <div className="space-y-3">
            <Label>תפקידים *</Label>
            <div className="space-y-2">
              {ALL_ROLES.map((role) => (
                <Checkbox
                  key={role}
                  id={role}
                  label={getRoleLabel(role)}
                  checked={selectedRoles.includes(role)}
                  onChange={() => handleRoleToggle(role)}
                  disabled={isSubmitting}
                />
              ))}
            </div>
            {validationErrors.roles && (
              <p className="text-sm text-red-600">{validationErrors.roles}</p>
            )}
            {selectedRoles.length === 0 && (
              <p className="text-xs text-gray-500">
                אם לא נבחר תפקיד, המשתמש יהיה משתמש רגיל
              </p>
            )}
          </div>

          {/* Right Columns - Center Assignments */}
          <div className="col-span-2 grid grid-cols-2 gap-6">
            {/* Managed Center (for CENTER_COORDINATOR) */}
            <div className="space-y-2">
              <Label htmlFor="managedCenter">מוקד מנוהל</Label>
              {hasCoordinatorRole ? (
                <>
                  <Select
                    id="managedCenter"
                    value={managedCenterId}
                    onChange={(e) => setManagedCenterId(e.target.value)}
                    options={[
                      { label: 'ללא מוקד', value: '' },
                      ...availableCentersForCoordinator.map((center) => ({
                        label: `${center.name} (${center.area})`,
                        value: center.id,
                      })),
                    ]}
                    placeholder="בחר מוקד..."
                    disabled={isSubmitting}
                  />
                  {!managedCenterId && (
                    <p className="text-xs text-yellow-600 flex items-start gap-1">
                      <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      המשתמש ישויך לתפקיד רכז מוקד ללא מוקד
                    </p>
                  )}
                  {availableCentersForCoordinator.length === 0 && (
                    <p className="text-xs text-gray-500">אין מוקדים זמינים</p>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-400">בחר תפקיד "רכז מוקד" כדי לשייך מוקד</p>
              )}
            </div>

            {/* Supervised Centers (for SUPER_COORDINATOR) */}
            <div className="space-y-2">
              <Label>מוקדים מפוקחים</Label>
              {hasSuperRole ? (
                <>
                  <div className="border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                    {availableCentersForSuper.length > 0 ? (
                      availableCentersForSuper.map((center) => (
                        <Checkbox
                          key={center.id}
                          id={`super-${center.id}`}
                          label={`${center.name} (${center.area})`}
                          checked={supervisedCenterIds.includes(center.id)}
                          onChange={() => handleSupervisorCenterToggle(center.id)}
                          disabled={isSubmitting}
                        />
                      ))
                    ) : (
                      <p className="text-xs text-gray-500">אין מוקדים זמינים</p>
                    )}
                  </div>
                  {supervisedCenterIds.length === 0 && (
                    <p className="text-xs text-yellow-600 flex items-start gap-1">
                      <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      המשתמש ישויך לתפקיד רכז על ללא מוקדים מפוקחים
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-400">בחר תפקיד "רכז על" כדי לשייך מוקדים</p>
              )}
            </div>
          </div>
        </div>

        {/* Info about role-center relationship */}
        {(hasCoordinatorRole || hasSuperRole) && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              💡 ניתן לשייך משתמש לתפקידים ללא מוקדים. ניתן יהיה לשייך מוקדים מאוחר יותר.
            </p>
          </div>
        )}
      </div>
    </BaseFormModal>
  );
}
