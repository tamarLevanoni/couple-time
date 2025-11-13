'use client';

import { useState, useEffect } from 'react';
import { BaseFormModal } from './base-form-modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserForAdmin } from '@/types/computed';
import { UpdateUserByAdminInput } from '@/lib/validations';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateUserByAdminInput) => Promise<void>;
  user: UserForAdmin | null;
  isSubmitting?: boolean;
  error?: string | null;
}

export function EditUserModal({
  isOpen,
  onClose,
  onSubmit,
  user,
  isSubmitting = false,
  error,
}: EditUserModalProps) {
  const [formData, setFormData] = useState<UpdateUserByAdminInput>({
    firstName: '',
    lastName: '',
    phone: '',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Reset form when user changes or modal opens
  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || '',
      });
      setValidationErrors({});
    }
  }, [user, isOpen]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (formData.firstName && (formData.firstName.length < 1 || formData.firstName.length > 50)) {
      errors.firstName = 'שם פרטי חייב להיות בין 1-50 תווים';
    }

    if (formData.lastName && (formData.lastName.length < 1 || formData.lastName.length > 50)) {
      errors.lastName = 'שם משפחה חייב להיות בין 1-50 תווים';
    }

    if (formData.phone && !/^[\d\-\+\(\)\s]+$/.test(formData.phone)) {
      errors.phone = 'מספר טלפון לא תקין';
    }

    if (formData.phone && (formData.phone.length < 9 || formData.phone.length > 15)) {
      errors.phone = 'מספר טלפון חייב להיות בין 9-15 תווים';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // Only send fields that have values (partial update)
    const updateData: UpdateUserByAdminInput = {};
    if (formData.firstName) updateData.firstName = formData.firstName;
    if (formData.lastName) updateData.lastName = formData.lastName;
    if (formData.phone) updateData.phone = formData.phone;

    // Check if at least one field is being updated
    if (Object.keys(updateData).length === 0) {
      setValidationErrors({ general: 'נא למלא לפחות שדה אחד' });
      return;
    }

    await onSubmit(updateData);
  };

  const handleClose = () => {
    setFormData({ firstName: '', lastName: '', phone: '' });
    setValidationErrors({});
    onClose();
  };

  if (!user) return null;

  return (
    <BaseFormModal
      isOpen={isOpen}
      onClose={handleClose}
      title="עריכת פרטי משתמש"
      onSubmit={handleSubmit}
      submitLabel="שמור"
      cancelLabel="ביטול"
      isSubmitting={isSubmitting}
      error={error || validationErrors.general}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          ניתן לערוך רק מידע אישי. לשינוי תפקידים, השתמש באפשרות 'תפקיד'.
        </p>

        <div className="grid grid-cols-2 gap-4">
          {/* First Name */}
          <div className="space-y-2">
            <Label htmlFor="firstName">שם פרטי</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              placeholder="שם פרטי"
              disabled={isSubmitting}
            />
            {validationErrors.firstName && (
              <p className="text-sm text-red-600">{validationErrors.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <Label htmlFor="lastName">שם משפחה</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              placeholder="שם משפחה"
              disabled={isSubmitting}
            />
            {validationErrors.lastName && (
              <p className="text-sm text-red-600">{validationErrors.lastName}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2 col-span-2">
            <Label htmlFor="phone">טלפון</Label>
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
        </div>

        {/* Non-editable fields info */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <span className="font-medium">אימייל:</span> {user.email} (לא ניתן לשינוי)
          </p>
        </div>
      </div>
    </BaseFormModal>
  );
}
