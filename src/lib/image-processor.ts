'use client';

export interface ProcessImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  fillColor?: string; // Default #FFFFFF to prevent black background on transparent PNGs
}

/**
 * Process and compress an image file client-side using HTML5 Canvas.
 * - Prevents black background bug on transparent PNGs by painting a white background first.
 * - Enforces orientation from EXIF metadata.
 * - Rejects unsafe SVGs and oversized files.
 * - Scales down to portrait aspect ratio (max 400x500).
 */
export async function processAndCompressImage(
  file: File,
  options: ProcessImageOptions = {}
): Promise<string> {
  const {
    maxWidth = 400,
    maxHeight = 500,
    quality = 0.85,
    fillColor = '#FFFFFF',
  } = options;

  // 1. Validate MIME type (strictly disallow SVG to prevent XSS)
  const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
  if (file.type && !validMimes.includes(file.type.toLowerCase())) {
    throw new Error('รองรับเฉพาะไฟล์รูปภาพ JPG, PNG และ WebP เท่านั้น (ไม่อนุญาตไฟล์ SVG เพื่อความปลอดภัย)');
  }

  // 2. Validate file size (max 12 MB raw input)
  if (file.size > 12 * 1024 * 1024) {
    throw new Error('ขนาดไฟล์รูปภาพต้นฉบับต้องไม่เกิน 12 MB');
  }

  // 3. Load image using createImageBitmap or Image element
  let imageSource: ImageBitmap | HTMLImageElement;
  try {
    imageSource = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    imageSource = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('ไม่สามารถอ่านไฟล์รูปภาพได้'));
      };
      img.src = objectUrl;
    });
  }

  const origWidth = imageSource.width;
  const origHeight = imageSource.height;

  // 4. Calculate target dimensions preserving aspect ratio
  const ratio = Math.min(maxWidth / origWidth, maxHeight / origHeight, 1);
  const targetWidth = Math.max(1, Math.round(origWidth * ratio));
  const targetHeight = Math.max(1, Math.round(origHeight * ratio));

  // 5. Draw onto Canvas with solid background fill
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) {
    throw new Error('ไม่สามารถสร้าง 2D Context สำหรับประมวลผลรูปภาพได้');
  }

  // Fill solid white background before drawing image to avoid black background on PNGs
  ctx.fillStyle = fillColor;
  ctx.fillRect(0, 0, targetWidth, targetHeight);
  ctx.drawImage(imageSource, 0, 0, targetWidth, targetHeight);

  // Close ImageBitmap if supported to release GPU memory
  if ('close' in imageSource && typeof (imageSource as any).close === 'function') {
    (imageSource as any).close();
  }

  // 6. Export as compressed JPEG Base64
  return canvas.toDataURL('image/jpeg', quality);
}
