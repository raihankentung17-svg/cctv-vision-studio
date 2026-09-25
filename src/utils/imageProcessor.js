/**
 * Image Processing & Canvas Size Optimizer
 * Handles aspect ratio formatting, smart whitespace trimming, and framing.
 */

export const ASPECT_RATIOS = [
  { id: 'original', name: 'Original', ratio: null, label: 'Native' },
  { id: '4:5', name: '4:5 Portrait', ratio: 4 / 5, label: '1080 × 1350 (Video)' },
  { id: '1:1', name: '1:1 Square', ratio: 1, label: '1080 × 1080' },
  { id: '9:16', name: '9:16 Vertical', ratio: 9 / 16, label: '1080 × 1920' },
  { id: '16:9', name: '16:9 Widescreen', ratio: 16 / 9, label: '1920 × 1080' },
  { id: '3:4', name: '3:4 CCTV Frame', ratio: 3 / 4, label: '960 × 1280' },
];

/**
 * Automatically detects non-background content bounds (trims excessive white/transparent margin)
 */
export function detectContentBounds(canvas) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  let minX = w, maxX = 0, minY = h, maxY = 0;
  let hasContent = false;

  for (let y = 0; y < h; y += 2) {
    const row = y * w;
    for (let x = 0; x < w; x += 2) {
      const p = (row + x) * 4;
      const r = data[p];
      const g = data[p + 1];
      const b = data[p + 2];
      const a = data[p + 3];

      // Exclude transparent or solid white background (> 245)
      const isTransparent = a < 20;
      const isPureWhite = r > 245 && g > 245 && b > 245;

      if (!isTransparent && !isPureWhite) {
        hasContent = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (!hasContent || maxX <= minX || maxY <= minY) {
    return { minX: 0, minY: 0, maxX: w, maxY: h, width: w, height: h };
  }

  // Add 4% padding around subject
  const padX = Math.round((maxX - minX) * 0.04);
  const padY = Math.round((maxY - minY) * 0.04);

  const finalMinX = Math.max(0, minX - padX);
  const finalMinY = Math.max(0, minY - padY);
  const finalMaxX = Math.min(w, maxX + padX);
  const finalMaxY = Math.min(h, maxY + padY);

  return {
    minX: finalMinX,
    minY: finalMinY,
    maxX: finalMaxX,
    maxY: finalMaxY,
    width: finalMaxX - finalMinX,
    height: finalMaxY - finalMinY
  };
}

/**
 * Prepares an image onto a target canvas according to user size options
 */
export function prepareOptimizedImage(sourceImage, options = {}) {
  const {
    aspectRatioId = 'original',
    fitMode = 'contain', // 'contain' | 'cover'
    autoTrim = false,
    backgroundColor = '#ffffff'
  } = options;

  const rawW = sourceImage.naturalWidth || sourceImage.width;
  const rawH = sourceImage.naturalHeight || sourceImage.height;

  // Step 1: Create initial canvas of source
  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = rawW;
  srcCanvas.height = rawH;
  const srcCtx = srcCanvas.getContext('2d');
  srcCtx.drawImage(sourceImage, 0, 0, rawW, rawH);

  // Step 2: Auto-trim excessive whitespace if requested
  let cropBox = { minX: 0, minY: 0, width: rawW, height: rawH };
  if (autoTrim) {
    cropBox = detectContentBounds(srcCanvas);
  }

  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = cropBox.width;
  croppedCanvas.height = cropBox.height;
  const croppedCtx = croppedCanvas.getContext('2d');
  croppedCtx.drawImage(
    srcCanvas,
    cropBox.minX, cropBox.minY, cropBox.width, cropBox.height,
    0, 0, cropBox.width, cropBox.height
  );

  // If aspect ratio is original, return cropped canvas directly
  const selectedPreset = ASPECT_RATIOS.find(a => a.id === aspectRatioId);
  if (!selectedPreset || !selectedPreset.ratio) {
    return croppedCanvas;
  }

  // Step 3: Fit to target aspect ratio
  const targetRatio = selectedPreset.ratio;
  let targetW, targetH;

  // Set normalized standard baseline dimensions
  if (targetRatio <= 1) {
    // Portrait or square
    targetW = 1080;
    targetH = Math.round(1080 / targetRatio);
  } else {
    // Landscape
    targetH = 1080;
    targetW = Math.round(1080 * targetRatio);
  }

  const targetCanvas = document.createElement('canvas');
  targetCanvas.width = targetW;
  targetCanvas.height = targetH;
  const targetCtx = targetCanvas.getContext('2d');

  // Fill background
  targetCtx.fillStyle = backgroundColor;
  targetCtx.fillRect(0, 0, targetW, targetH);

  const imgW = croppedCanvas.width;
  const imgH = croppedCanvas.height;
  const imgRatio = imgW / imgH;

  let renderW, renderH, renderX, renderY;

  if (fitMode === 'cover') {
    if (imgRatio > targetRatio) {
      renderH = targetH;
      renderW = imgW * (targetH / imgH);
    } else {
      renderW = targetW;
      renderH = imgH * (targetW / imgW);
    }
  } else {
    // Contain (default)
    if (imgRatio > targetRatio) {
      renderW = targetW;
      renderH = imgH * (targetW / imgW);
    } else {
      renderH = targetH;
      renderW = imgW * (targetH / imgH);
    }
  }

  renderX = Math.round((targetW - renderW) / 2);
  renderY = Math.round((targetH - renderH) / 2);

  targetCtx.drawImage(croppedCanvas, renderX, renderY, renderW, renderH);
  return targetCanvas;
}
