'use client';

import { useState, useEffect } from 'react';
import { BaseFormModal } from '../../shared/modals/base-form-modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { UpdateGameInput } from '@/lib/validations';
import { getCategoryLabel, getAudienceLabel } from '@/lib/labels';
import { GameCategory, TargetAudience } from '@/types/schema';
import { GameWithInstances } from '@/types/models';
import { ImageUpload } from '../../shared/image-upload';
import { GalleryUpload } from '../../shared/gallery-upload';


interface EditGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateGameInput) => Promise<void>;
  game: GameWithInstances | null;
  isSubmitting?: boolean;
  error?: string | null;
  warnings?: string[];
}

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

interface FormData {
  name: string;
  description: string;
  categories: GameCategory[];
  targetAudiences: TargetAudience[];
  primaryImageUrl: string;
  galleryImageUrls: string[];
}

export function EditGameModal({
  isOpen,
  onClose,
  onSubmit,
  game,
  isSubmitting = false,
  error,
  warnings,
}: EditGameModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    categories: [],
    targetAudiences: [],
    primaryImageUrl: '',
    galleryImageUrls: [],
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [clientWarnings, setClientWarnings] = useState<string[]>([]);

  // Initialize form with game data
  useEffect(() => {
    if (isOpen && game) {
      setFormData({
        name: game.name,
        description: game.description || '',
        categories: game.categories,
        targetAudiences: game.targetAudiences,
        primaryImageUrl: game.primaryImageUrl || '',
        galleryImageUrls: game.galleryImageUrls || [],
      });
      setValidationErrors({});
      setClientWarnings([]);
    }
  }, [isOpen, game]);

  // Client-side warnings
  useEffect(() => {
    const newWarnings: string[] = [];

    if (formData.categories.length === 0) {
      newWarnings.push('משחק חייב לפחות קטגוריה אחת');
    }

    if (formData.targetAudiences.length === 0) {
      newWarnings.push('משחק חייב לפחות קהל יעד אחד');
    }

    setClientWarnings(newWarnings);
  }, [formData.categories, formData.targetAudiences]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Name validation
    if (!formData.name || formData.name.trim().length === 0) {
      errors.name = 'שם המשחק הוא שדה חובה';
    } else if (formData.name.length > 100) {
      errors.name = 'שם המשחק חייב להיות עד 100 תווים';
    }

    // Categories validation
    if (formData.categories.length === 0) {
      errors.categories = 'יש לבחור לפחות קטגוריה אחת';
    }

    // Target audiences validation
    if (formData.targetAudiences.length === 0) {
      errors.targetAudiences = 'יש לבחור לפחות קהל יעד אחד';
    }

    // Description validation
    if (formData.description && formData.description.length > 1000) {
      errors.description = 'התיאור חייב להיות עד 1000 תווים';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !game) return;

    // Build update data with only changed fields
    const updates: UpdateGameInput = {};

    if (formData.name.trim() !== game.name) {
      updates.name = formData.name.trim();
    }

    if (formData.description.trim() !== (game.description || '')) {
      updates.description = formData.description.trim() || undefined;
    }

    // Compare arrays
    const categoriesChanged =
      JSON.stringify([...formData.categories].sort()) !==
      JSON.stringify([...game.categories].sort());
    if (categoriesChanged) {
      updates.categories = formData.categories;
    }

    const audiencesChanged =
      JSON.stringify([...formData.targetAudiences].sort()) !==
      JSON.stringify([...game.targetAudiences].sort());
    if (audiencesChanged) {
      updates.targetAudiences = formData.targetAudiences;
    }

    if (formData.primaryImageUrl.trim() !== (game.primaryImageUrl || '')) {
      updates.primaryImageUrl = formData.primaryImageUrl.trim() || undefined;
    }

    const galleryChanged =
      JSON.stringify(formData.galleryImageUrls) !== JSON.stringify(game.galleryImageUrls || []);
    if (galleryChanged) {
      updates.galleryImageUrls = formData.galleryImageUrls.filter((url) => url.trim());
    }

    // Only submit if there are changes
    if (Object.keys(updates).length === 0) {
      setValidationErrors({ form: 'לא בוצעו שינויים' });
      return;
    }

    await onSubmit(updates);
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

  const allWarnings = [...clientWarnings, ...(warnings || [])];

  return (
    <BaseFormModal
      isOpen={isOpen}
      onClose={onClose}
      title="עריכת משחק"
      onSubmit={handleSubmit}
      submitLabel="שמור שינויים"
      cancelLabel="ביטול"
      isSubmitting={isSubmitting}
      error={error}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6">
        {/* Warnings */}
        {allWarnings.length > 0 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            {allWarnings.map((warning, index) => (
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
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="תיאור קצר של המשחק (אופציונלי)"
            maxLength={1000}
            rows={4}
            className="mt-1"
          />
          {validationErrors.description && (
            <p className="text-xs text-red-600 mt-1">{validationErrors.description}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">{formData.description.length}/1000 תווים</p>
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
                value={formData.primaryImageUrl}
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
              images={formData.galleryImageUrls}
              onImagesChange={(images) => setFormData({ ...formData, galleryImageUrls: images })}
            />
          </div>
        </div>

        {validationErrors.form && (
          <p className="text-xs text-yellow-600">{validationErrors.form}</p>
        )}
      </div>
    </BaseFormModal>
  );
}
