'use client';

import { useState, useEffect } from 'react';
import { BaseFormModal } from '../../shared/modals/base-form-modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { CreateGameInput } from '@/lib/validations';
import { getCategoryLabel, getAudienceLabel } from '@/lib/labels';
import { GameCategory, TargetAudience } from '@/types/schema';
import { ImageUpload } from '../../shared/image-upload';
import { GalleryUpload } from '../../shared/gallery-upload';

interface CreateGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateGameInput) => Promise<void>;
  isSubmitting?: boolean;
  error?: string | null;
  warnings?: string[];
}

const INITIAL_FORM_DATA: CreateGameInput = {
  name: '',
  description: '',
  categories: [],
  targetAudiences: [],
  primaryImageUrl: '',
  galleryImageUrls: [],
};

const ALL_CATEGORIES: GameCategory[] = [
  GameCategory.COMMUNICATION,
  GameCategory.INTIMACY,
  GameCategory.FUN,
  GameCategory.THERAPY,
  GameCategory.PERSONAL_DEVELOPMENT,
];

const ALL_AUDIENCES: TargetAudience[] = [
  TargetAudience.SINGLES,
  TargetAudience.MARRIED,
  TargetAudience.GENERAL,
];

export function CreateGameModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  error,
  warnings,
}: CreateGameModalProps) {
  const [formData, setFormData] = useState<CreateGameInput>(INITIAL_FORM_DATA);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(INITIAL_FORM_DATA);
      setValidationErrors({});
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Name validation
    if (!formData.name || formData.name.trim().length === 0) {
      errors.name = 'שם המשחק הוא שדה חובה';
    } else if (formData.name.length > 100) {
      errors.name = 'שם המשחק חייב להיות עד 100 תווים';
    }

    // Categories validation
    if (!formData.categories || formData.categories.length === 0) {
      errors.categories = 'יש לבחור לפחות קטגוריה אחת';
    }

    // Target audiences validation
    if (!formData.targetAudiences || formData.targetAudiences.length === 0) {
      errors.targetAudiences = 'יש לבחור לפחות קהל יעד אחד';
    }

    // Description validation (optional but max length)
    if (formData.description && formData.description.length > 1000) {
      errors.description = 'התיאור חייב להיות עד 1000 תווים';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // Clean up empty optional fields
    const cleanData: CreateGameInput = {
      name: formData.name.trim(),
      categories: formData.categories,
      targetAudiences: formData.targetAudiences,
      galleryImageUrls: [],
    };

    if (formData.description && formData.description.trim()) {
      cleanData.description = formData.description.trim();
    }

    if (formData.primaryImageUrl && formData.primaryImageUrl.trim()) {
      cleanData.primaryImageUrl = formData.primaryImageUrl.trim();
    }

    if (formData.galleryImageUrls && formData.galleryImageUrls.length > 0) {
      cleanData.galleryImageUrls = formData.galleryImageUrls.filter((url) => url.trim());
    }

    await onSubmit(cleanData);
  };

  const handleCategoryToggle = (category: GameCategory) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handleAudienceToggle = (audience: TargetAudience) => {
    setFormData((prev) => ({
      ...prev,
      targetAudiences: prev.targetAudiences.includes(audience)
        ? prev.targetAudiences.filter((a) => a !== audience)
        : [...prev.targetAudiences, audience],
    }));
  };

  return (
    <BaseFormModal
      isOpen={isOpen}
      onClose={onClose}
      title="הוספת משחק חדש"
      onSubmit={handleSubmit}
      submitLabel="צור משחק"
      cancelLabel="ביטול"
      isSubmitting={isSubmitting}
      error={error}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6">
        {/* Warnings */}
        {warnings && warnings.length > 0 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            {warnings.map((warning, index) => (
              <p key={index} className="text-sm text-yellow-800">{warning}</p>
            ))}
          </div>
        )}
        {/* Name */}
        <div>
          <Label htmlFor="name">
            שם המשחק <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="הכנס שם משחק"
            maxLength={100}
            className="mt-1"
          />
          {validationErrors.name && (
            <p className="text-xs text-red-600 mt-1">{validationErrors.name}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">תיאור</Label>
          <Textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="תיאור קצר של המשחק (אופציונלי)"
            maxLength={1000}
            rows={4}
            className="mt-1"
          />
          {validationErrors.description && (
            <p className="text-xs text-red-600 mt-1">{validationErrors.description}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {formData.description?.length || 0}/1000 תווים
          </p>
        </div>

        {/* Categories */}
        <div>
          <Label>
            קטגוריות <span className="text-red-500">*</span>
          </Label>
          <div className="mt-2 space-y-2">
            {ALL_CATEGORIES.map((category) => (
              <div key={category} className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id={`category-${category}`}
                  checked={formData.categories.includes(category)}
                  onChange={() => handleCategoryToggle(category)}
                />
                <Label
                  htmlFor={`category-${category}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {getCategoryLabel(category)}
                </Label>
              </div>
            ))}
          </div>
          {validationErrors.categories && (
            <p className="text-xs text-red-600 mt-1">{validationErrors.categories}</p>
          )}
        </div>

        {/* Target Audiences */}
        <div>
          <Label>
            קהל יעד <span className="text-red-500">*</span>
          </Label>
          <div className="mt-2 space-y-2">
            {ALL_AUDIENCES.map((audience) => (
              <div key={audience} className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id={`audience-${audience}`}
                  checked={formData.targetAudiences.includes(audience)}
                  onChange={() => handleAudienceToggle(audience)}
                />
                <Label
                  htmlFor={`audience-${audience}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {getAudienceLabel(audience)}
                </Label>
              </div>
            ))}
          </div>
          {validationErrors.targetAudiences && (
            <p className="text-xs text-red-600 mt-1">{validationErrors.targetAudiences}</p>
          )}
        </div>

        {/* Primary Image */}
        <div>
          <Label>תמונה ראשית</Label>
          <div className="mt-2 space-y-3">
            <ImageUpload
              value={formData.primaryImageUrl}
              onChange={(url) => setFormData({ ...formData, primaryImageUrl: url })}
              onRemove={() => setFormData({ ...formData, primaryImageUrl: '' })}
              label="העלה תמונה ראשית"
            />
            <div>
              <Label htmlFor="primaryImageUrl" className="text-xs text-gray-600">
                או הדבק קישור לתמונה
              </Label>
              <Input
                id="primaryImageUrl"
                type="url"
                value={formData.primaryImageUrl || ''}
                onChange={(e) => setFormData({ ...formData, primaryImageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg (אופציונלי)"
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Gallery Images */}
        <div>
          <Label>גלריית תמונות</Label>
          <div className="mt-2">
            <GalleryUpload
              images={formData.galleryImageUrls || []}
              onImagesChange={(images) => setFormData({ ...formData, galleryImageUrls: images })}
            />
          </div>
        </div>
      </div>
    </BaseFormModal>
  );
}
