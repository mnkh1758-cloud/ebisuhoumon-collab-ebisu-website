import React, { useState, useRef } from 'react';
import { Camera, X, Loader2, Maximize2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { uploadOptimizedImage, OPTIMIZATION_PRESETS } from '../../utils/imageUploadOptimizer';

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  preset: keyof typeof OPTIMIZATION_PRESETS;
  storagePath: string;
  label?: string;
  className?: string;
  isCircular?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onImagesChange,
  maxImages = 5,
  preset,
  storagePath,
  label,
  className = '',
  isCircular = false
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check if adding these files exceeds maxImages
    if (images.length + files.length > maxImages) {
      alert(`最大${maxImages}枚までアップロード可能です。`);
      return;
    }

    setIsUploading(true);
    try {
      const uploadPromises = files.map(file => 
        uploadOptimizedImage(file, storagePath, preset)
      );
      const urls = await Promise.all(uploadPromises);
      onImagesChange([...images, ...urls]);
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(error.message || '画像のアップロードに失敗しました。');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (urlToRemove: string) => {
    onImagesChange(images.filter(url => url !== urlToRemove));
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {label && <label className="text-sm font-black text-stone-500 uppercase tracking-widest">{label}</label>}
      
      <div className={`grid gap-4 ${isCircular ? 'flex flex-col items-center' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'}`}>
        <AnimatePresence mode="popLayout">
          {images.map((url, index) => (
            <motion.div
              key={url}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`relative group aspect-square bg-stone-100 border-2 border-stone-200 overflow-hidden ${isCircular ? 'w-32 h-32 rounded-full' : 'rounded-2xl'}`}
            >
              <img 
                src={url} 
                alt={`Uploaded ${index + 1}`} 
                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-500"
                onClick={() => setSelectedImage(url)}
                loading="lazy"
              />
              
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedImage(url)}
                  className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors"
                  title="拡大表示"
                >
                  <Maximize2 size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="p-2 bg-red-500/80 hover:bg-red-600 rounded-full text-white transition-colors"
                  title="削除"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}

          {images.length < maxImages && (
            <motion.label
              layout
              className={`
                relative aspect-square flex flex-col items-center justify-center cursor-pointer
                border-2 border-dashed border-stone-300 bg-stone-50 text-stone-400
                hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-50/30
                transition-all duration-300 group
                ${isCircular ? 'w-32 h-32 rounded-full' : 'rounded-2xl'}
              `}
            >
              {isUploading ? (
                <Loader2 size={24} className="animate-spin text-emerald-500" />
              ) : (
                <>
                  <Camera size={24} className="group-hover:scale-110 transition-transform" />
                  {!isCircular && <span className="text-xs mt-2 font-bold">写真を追加</span>}
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple={maxImages > 1}
                className="hidden"
                onChange={handleUpload}
                disabled={isUploading}
              />
            </motion.label>
          )}
        </AnimatePresence>
      </div>

      {/* Modal for expanded view */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4 md:p-10"
            onClick={() => setSelectedImage(null)}
          >
            <button 
              className="absolute top-6 right-6 text-white hover:text-stone-300 transition-colors p-2"
              onClick={() => setSelectedImage(null)}
            >
              <X size={32} />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={selectedImage}
              alt="Expanded view"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
