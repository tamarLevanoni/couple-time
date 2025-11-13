'use client';

import { useState, useEffect, useMemo } from 'react';
import { BaseFormModal } from './base-form-modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CenterForAdmin } from '@/types/computed';
import { Role } from '@/types/schema';
import { CreateUserInput } from '@/lib/validations';
import { getRoleLabel } from '@/lib/labels';
import { AlertCircle } from 'lucide-react';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserInput) => Promise<void>;
  centers: CenterForAdmin[];
  isSubmitting?: boolean;
  error?: string | null;
  warnings?: string[];
}

const ALL_ROLES: Role[] = ['ADMIN', 'SUPER_COORDINATOR', 'CENTER_COORDINATOR'];

const INITIAL_FORM_DATA: CreateUserInput = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  roles: [],
  managedCenterId: undefined,
  supervisedCenterIds: undefined,
};

export function CreateUserModal({
  isOpen,
  onClose,
  onSubmit,
  centers,
  isSubmitting = false,
  error,
  warnings = [],
}: CreateUserModalProps) {
  const [formData, setFormData] = useState<CreateUserInput>(INITIAL_FORM_DATA);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(INITIAL_FORM_DATA);
      setValidationErrors({});
    }
  }, [isOpen]);

  // Available centers for coordinator role (centers without coordinator)
  const availableCentersForCoordinator = useMemo(() => {
    return centers.filter((center) => !center.coordinator);
  }, [centers]);

  // Available centers for super coordinator role (centers without super)
  const availableCentersForSuper = useMemo(() => {
    return centers.filter((center) => !center.superCoordinator);
  }, [centers]);

  const hasCoordinatorRole = formData.roles?.includes('CENTER_COORDINATOR');
  const hasSuperRole = formData.roles?.includes('SUPER_COORDINATOR');

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Required fields
    if (!formData.firstName || formData.firstName.length < 1 || formData.firstName.length > 50) {
      errors.firstName = 'שם פרטי חייב להיות בין 1-50 תווים';
    }

    if (!formData.lastName || formData.lastName.length < 1 || formData.lastName.length > 50) {
      errors.lastName = 'שם משפחה חייב להיות בין 1-50 תווים';
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'אימייל לא תקין';
    }

    if (!formData.phone || !/^[\d\-\+\(\)\s]+$/.test(formData.phone)) {
      errors.phone = 'מספר טלפון לא תקין';
    }

    if (formData.phone && (formData.phone.length < 9 || formData.phone.length > 15)) {
      errors.phone = 'מספר טלפון חייב להיות בין 9-15 תווים';
    }

    if (!formData.password || formData.password.length < 8 || formData.password.length > 100) {
      errors.password = 'סיסמה חייבת להיות לפחות 8 תווים';
    }

    // Regular user cannot have center assignments
    const isRegularUser = !formData.roles || formData.roles.length === 0;
    if (isRegularUser && (formData.managedCenterId || formData.supervisedCenterIds?.length)) {
      errors.general = 'משתמש רגיל לא יכול להיות משויך למוקדים';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const submitData: CreateUserInput = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      roles: formData.roles || [],
      managedCenterId: hasCoordinatorRole && formData.managedCenterId ? formData.managedCenterId : undefined,
      supervisedCenterIds:
        hasSuperRole && formData.supervisedCenterIds && formData.supervisedCenterIds.length > 0
          ? formData.supervisedCenterIds
          : undefined,
    };

    await onSubmit(submitData);
  };

  const handleRoleToggle = (role: Role) => {
    setFormData((prev) => {
      const roles = prev.roles || [];
      if (roles.includes(role)) {
        return { ...prev, roles: roles.filter((r) => r !== role) };
      } else {
        return { ...prev, roles: [...roles, role] };
      }
    });
  };

  const handleSupervisorCenterToggle = (centerId: string) => {
    setFormData((prev) => {
      const ids = prev.supervisedCenterIds || [];
      if (ids.includes(centerId)) {
        return { ...prev, supervisedCenterIds: ids.filter((id) => id !== centerId) };
      } else {
        return { ...prev, supervisedCenterIds: [...ids, centerId] };
      }
    });
  };

  const handleClose = () => {
    setFormData(INITIAL_FORM_DATA);
    setValidationErrors({});
    onClose();
  };

  return (
    <BaseFormModal
      isOpen={isOpen}
      onClose={handleClose}
      title="הוספת משתמש חדש"
      onSubmit={handleSubmit}
      submitLabel="צור משתמש"
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

        {/* Main Grid Layout */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Personal Information */}
          <div className="col-span-2 space-y-4">
            <h3 className="text-base font-semibold">מידע אישי</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="firstName">שם פרטי *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="שם פרטי"
                  disabled={isSubmitting}
                />
                {validationErrors.firstName && (
                  <p className="text-sm text-red-600">{validationErrors.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="lastName">שם משפחה *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="שם משפחה"
                  disabled={isSubmitting}
                />
                {validationErrors.lastName && (
                  <p className="text-sm text-red-600">{validationErrors.lastName}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">אימייל *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@email.com"
                  disabled={isSubmitting}
                />
                {validationErrors.email && (
                  <p className="text-sm text-red-600">{validationErrors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">טלפון *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="050-1234567"
                  disabled={isSubmitting}
                />
                {validationErrors.phone && (
                  <p className="text-sm text-red-600">{validationErrors.phone}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2 col-span-2">
                <Label htmlFor="password">סיסמה *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="לפחות 8 תווים"
                  disabled={isSubmitting}
                />
                {validationErrors.password && (
                  <p className="text-sm text-red-600">{validationErrors.password}</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Roles */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold">תפקידים</h3>
            <div className="space-y-2">
              {ALL_ROLES.map((role) => (
                <Checkbox
                  key={role}
                  id={`role-${role}`}
                  label={getRoleLabel(role)}
                  checked={formData.roles?.includes(role) || false}
                  onChange={() => handleRoleToggle(role)}
                  disabled={isSubmitting}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500">
              אם לא נבחר תפקיד, המשתמש יהיה משתמש רגיל
            </p>
          </div>
        </div>

        {/* Center Assignments Row */}
        {(hasCoordinatorRole || hasSuperRole) && (
          <div className="grid grid-cols-2 gap-6 pt-4 border-t">
            {/* Managed Center (for CENTER_COORDINATOR) */}
            {hasCoordinatorRole && (
              <div className="space-y-2">
                <Label htmlFor="managedCenter">מוקד מנוהל</Label>
                <Select
                  id="managedCenter"
                  value={formData.managedCenterId || ''}
                  onChange={(e) => setFormData({ ...formData, managedCenterId: e.target.value || undefined })}
                  options={[
                    { label: 'בחר מוקד...', value: '' },
                    ...availableCentersForCoordinator.map((center) => ({
                      label: `${center.name} (${center.area})`,
                      value: center.id,
                    })),
                  ]}
                  placeholder="בחר מוקד..."
                  disabled={isSubmitting}
                />
                {!formData.managedCenterId && (
                  <p className="text-xs text-yellow-600 flex items-start gap-1">
                    <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    המשתמש ישויך לתפקיד רכז מוקד ללא מוקד
                  </p>
                )}
                {availableCentersForCoordinator.length === 0 && (
                  <p className="text-xs text-gray-500">אין מוקדים זמינים</p>
                )}
              </div>
            )}

            {/* Supervised Centers (for SUPER_COORDINATOR) */}
            {hasSuperRole && (
              <div className="space-y-2">
                <Label>מוקדים מפוקחים</Label>
                <div className="border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                  {availableCentersForSuper.length > 0 ? (
                    availableCentersForSuper.map((center) => (
                      <Checkbox
                        key={center.id}
                        id={`super-${center.id}`}
                        label={`${center.name} (${center.area})`}
                        checked={formData.supervisedCenterIds?.includes(center.id) || false}
                        onChange={() => handleSupervisorCenterToggle(center.id)}
                        disabled={isSubmitting}
                      />
                    ))
                  ) : (
                    <p className="text-xs text-gray-500">אין מוקדים זמינים</p>
                  )}
                </div>
                {(!formData.supervisedCenterIds || formData.supervisedCenterIds.length === 0) && (
                  <p className="text-xs text-yellow-600 flex items-start gap-1">
                    <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    המשתמש ישויך לתפקיד רכז על ללא מוקדים מפוקחים
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            💡 כל המשתמשים נוצרים כ"פעילים" כברירת מחדל. ניתן לשייך תפקידים ומוקדים גם מאוחר יותר.
          </p>
        </div>
      </div>
    </BaseFormModal>
  );
}
