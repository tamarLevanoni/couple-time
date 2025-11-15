'use client';

import { useState } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface GalleryUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
}

export function GalleryUpload({ images, onImagesChange }: GalleryUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const handleAddImage = (url: string) => {
    if (url && !images.includes(url)) {
      onImagesChange([...images, url]);
    }
  };

  const handleRemoveImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    onImagesChange(newImages);
  };

  const handleAddEmpty = () => {
    onImagesChange([...images, '']);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {uploadPreset ? (
            <CldUploadWidget
              uploadPreset={uploadPreset}
              options={{
                multiple: true,
                maxFiles: 10,
                sources: ['local', 'url'],
                resourceType: 'image',
                clientAllowedFormats: ['png', 'jpg', 'jpeg', 'webp', 'gif'],
                maxFileSize: 5000000, // 5MB
              }}
              onUpload={() => {
                setIsUploading(true);
              }}
              onSuccess={(result: any) => {
                if (result?.info?.secure_url) {
                  handleAddImage(result.info.secure_url);
                }
                setIsUploading(false);
              }}
              onError={() => {
                setIsUploading(false);
              }}
            >
              {({ open }) => (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => open()}
                  disabled={isUploading}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {isUploading ? 'מעלה תמונות...' : 'העלה תמונות'}
                </Button>
              )}
            </CldUploadWidget>
          ) : (
            <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2">
              העלאת תמונות אינה זמינה - יש להגדיר Cloudinary
            </div>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={handleAddEmpty}
            className="text-sm"
          >
            + הוסף קישור ידני
          </Button>
        </div>
      </div>

      {/* Image List */}
      <div className="space-y-2">
        {images.map((url, index) => (
          <div key={index} className="flex gap-2 items-start">
            {/* URL Input */}
            <div className="flex-1">
              <Input
                type="url"
                value={url}
                onChange={(e) => handleImageChange(index, e.target.value)}
                placeholder={`תמונה ${index + 1}`}
              />
            </div>

            {/* Preview */}
            {url && (
              <div className="relative w-16 h-16 border rounded overflow-hidden bg-gray-50 flex-shrink-0">
                <img
                  src={url}
                  alt={`תצוגה ${index + 1}`}
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
                  <ImageIcon className="h-6 w-6 text-gray-400" />
                </div>
              </div>
            )}

            {/* Remove Button */}
            <Button
              type="button"
              variant="outline"
              onClick={() => handleRemoveImage(index)}
              className="px-3 py-2 flex-shrink-0"
              title="הסר תמונה"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {images.length > 0 && (
        <p className="text-xs text-gray-500">
          {images.filter((url) => url.trim()).length} תמונות בגלריה
        </p>
      )}
    </div>
  );
}
