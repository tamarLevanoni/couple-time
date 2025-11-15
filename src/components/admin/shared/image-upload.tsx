'use client';

import { useState } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  label?: string;
  multiple?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  label = 'העלה תמונה',
  multiple = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  // If upload preset is not configured, don't render the upload widget
  if (!uploadPreset) {
    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2">
            העלאת תמונות אינה זמינה - יש להגדיר Cloudinary
          </div>
          {value && onRemove && (
            <Button
              type="button"
              variant="outline"
              onClick={onRemove}
              className="px-3"
              title="הסר תמונה"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {value && (
          <div className="relative w-32 h-32 border rounded-lg overflow-hidden bg-gray-50">
            <img
              src={value}
              alt="תצוגה מקדימה"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const placeholder = parent.querySelector('.placeholder-icon');
                  if (placeholder) {
                    (placeholder as HTMLElement).style.display = 'flex';
                  }
                }
              }}
            />
            <div className="placeholder-icon absolute inset-0 hidden items-center justify-center bg-gray-100">
              <ImageIcon className="h-12 w-12 text-gray-400" />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <CldUploadWidget
        uploadPreset={uploadPreset}
        options={{
          multiple,
          maxFiles: multiple ? 10 : 1,
          sources: ['local', 'url'],
          resourceType: 'image',
          clientAllowedFormats: ['png', 'jpg', 'jpeg', 'webp', 'gif'],
          maxFileSize: 5000000, // 5MB
        }}
        onUpload={(result: any) => {
          setIsUploading(true);
        }}
        onSuccess={(result: any) => {
          if (result?.info?.secure_url) {
            onChange(result.info.secure_url);
          }
          setIsUploading(false);
        }}
        onError={() => {
          setIsUploading(false);
        }}
      >
        {({ open }) => (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => open()}
              disabled={isUploading}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {isUploading ? 'מעלה...' : label}
            </Button>
            {value && onRemove && (
              <Button
                type="button"
                variant="outline"
                onClick={onRemove}
                className="px-3"
                title="הסר תמונה"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </CldUploadWidget>

      {/* Image Preview */}
      {value && (
        <div className="relative w-32 h-32 border rounded-lg overflow-hidden bg-gray-50">
          <img
            src={value}
            alt="תצוגה מקדימה"
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to placeholder icon if image fails to load
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                const placeholder = parent.querySelector('.placeholder-icon');
                if (placeholder) {
                  (placeholder as HTMLElement).style.display = 'flex';
                }
              }
            }}
          />
          <div className="placeholder-icon absolute inset-0 hidden items-center justify-center bg-gray-100">
            <ImageIcon className="h-12 w-12 text-gray-400" />
          </div>
        </div>
      )}
    </div>
  );
}
