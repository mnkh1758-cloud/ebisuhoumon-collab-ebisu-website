import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

export interface OptimizationOptions {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  outputType: string;
}

export const OPTIMIZATION_PRESETS = {
  QUESTIONNAIRE: {
    maxWidth: 1600,
    maxHeight: 1600,
    quality: 0.8,
    outputType: 'image/webp'
  },
  MEDICAL_RECORD: {
    maxWidth: 1600,
    maxHeight: 1600,
    quality: 0.8,
    outputType: 'image/webp'
  },
  STAFF: {
    maxWidth: 800,
    maxHeight: 800,
    quality: 0.75,
    outputType: 'image/webp'
  },
  PROPERTY: {
    maxWidth: 1600,
    maxHeight: 1600,
    quality: 0.8,
    outputType: 'image/webp'
  }
};

/**
 * Converts a File to an Image object
 */
const fileToImage = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Resizes and compresses an image, then converts it to WebP
 */
export const optimizeImage = async (file: File, options: OptimizationOptions): Promise<Blob> => {
  const img = await fileToImage(file);
  const canvas = document.createElement('canvas');
  let width = img.width;
  let height = img.height;

  // Resize if needed
  if (width > options.maxWidth || height > options.maxHeight) {
    if (width > height) {
      height = Math.round((height * options.maxWidth) / width);
      width = options.maxWidth;
    } else {
      width = Math.round((width * options.maxHeight) / height);
      height = options.maxHeight;
    }
  }

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.drawImage(img, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas toBlob failed'));
        }
      },
      options.outputType,
      options.quality
    );
  });
};

/**
 * Main function to optimize and upload an image to Firebase Storage
 */
export const uploadOptimizedImage = async (
  file: File,
  storagePath: string,
  preset: keyof typeof OPTIMIZATION_PRESETS | OptimizationOptions
): Promise<string> => {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('画像ファイル（JPEG, PNG, WebP）を選択してください。');
  }

  // Validate file size (10MB)
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('ファイルサイズが大きすぎます（最大10MB）。');
  }

  // Get options from preset or use provided options
  const options = typeof preset === 'string' ? OPTIMIZATION_PRESETS[preset] : preset;

  try {
    // 1. Optimize (Resize, Convert to WebP, Compress)
    const optimizedBlob = await optimizeImage(file, options);

    // 2. Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const fileName = `${timestamp}_${randomString}.webp`;
    const fullPath = `${storagePath}/${fileName}`;

    // 3. Upload to Firebase Storage
    const storageRef = ref(storage, fullPath);
    const metadata = {
      contentType: 'image/webp',
    };

    const snapshot = await uploadBytes(storageRef, optimizedBlob, metadata);
    
    // 4. Get and return download URL
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    console.error('Image optimization/upload error:', error);
    throw new Error('画像のアップロードに失敗しました。');
  }
};
