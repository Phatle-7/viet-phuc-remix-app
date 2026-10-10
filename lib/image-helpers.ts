// ============================================================
// FILE: lib/image-helpers.ts
// ============================================================

export interface ValidatedImageResult {
  valid: boolean;
  error?: string;
  dataUrl?: string;
  mimeType?: string;
  width?: number;
  height?: number;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function validateAndCompressImage(
  file: File,
  maxDimension = 960,
  quality = 0.86
): Promise<ValidatedImageResult> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Định dạng không hỗ trợ. Vui lòng chọn ảnh JPG, PNG hoặc WebP.',
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: 'Dung lượng ảnh vượt quá 5MB. Vui lòng chọn ảnh nhẹ hơn.',
    };
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onerror = () => {
      resolve({
        valid: false,
        error: 'Không thể đọc file ảnh. Vui lòng thử lại.',
      });
    };
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => {
        resolve({
          valid: false,
          error: 'File ảnh bị lỗi hoặc không hợp lệ.',
        });
      };
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({
            valid: true,
            dataUrl: reader.result as string,
            mimeType: file.type,
            width,
            height,
          });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve({
          valid: true,
          dataUrl: compressedDataUrl,
          mimeType: 'image/jpeg',
          width,
          height,
        });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
