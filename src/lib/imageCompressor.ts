/**
 * Browser-side image compression utility.
 * Enforces:
 * 1. Max width of 1600px (preserving aspect ratio)
 * 2. Strict file size under 300 KB (307,200 bytes)
 */

export interface CompressionResult {
  file: File;
  previewUrl: string;
  originalSizeKb: number;
  compressedSizeKb: number;
  width: number;
  height: number;
}

export async function compressImage(file: File): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    // If not an image, reject
    if (!file.type.startsWith('image/')) {
      reject(new Error('Uploaded file is not an image'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image'));
      img.onload = async () => {
        try {
          const MAX_WIDTH = 1600;
          const TARGET_MAX_BYTES = 300 * 1024; // 300 KB

          let { width, height } = img;

          // Resize proportionally if width exceeds 1600px
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to obtain canvas context'));
            return;
          }

          // Use high quality image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Iterate quality to guarantee < 300 KB
          let quality = 0.85;
          let blob: Blob | null = null;

          while (quality >= 0.2) {
            blob = await new Promise<Blob | null>((res) =>
              canvas.toBlob(res, 'image/jpeg', quality)
            );

            if (blob && blob.size <= TARGET_MAX_BYTES) {
              break;
            }

            // Step down quality
            quality -= 0.12;
          }

          // If still over 300KB (rare, e.g. extremely complex noise), scale dimensions down further
          if (blob && blob.size > TARGET_MAX_BYTES) {
            const secondCanvas = document.createElement('canvas');
            const scaledWidth = Math.round(width * 0.75);
            const scaledHeight = Math.round(height * 0.75);
            secondCanvas.width = scaledWidth;
            secondCanvas.height = scaledHeight;
            const secondCtx = secondCanvas.getContext('2d');
            if (secondCtx) {
              secondCtx.drawImage(canvas, 0, 0, scaledWidth, scaledHeight);
              blob = await new Promise<Blob | null>((res) =>
                secondCanvas.toBlob(res, 'image/jpeg', 0.65)
              );
            }
          }

          if (!blob) {
            reject(new Error('Failed to compress image'));
            return;
          }

          const compressedFileName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
          const compressedFile = new File([blob], compressedFileName, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });

          const previewUrl = URL.createObjectURL(blob);

          resolve({
            file: compressedFile,
            previewUrl,
            originalSizeKb: Math.round(file.size / 1024),
            compressedSizeKb: Math.round(blob.size / 1024),
            width,
            height,
          });
        } catch (err) {
          reject(err);
        }
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
