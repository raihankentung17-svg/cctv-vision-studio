/**
 * Image Processing & Canvas Size Optimizer
 * Handles aspect ratio formatting, smart whitespace trimming, and framing.
 */

export const ASPECT_RATIOS = [
  { id: 'original', name: 'Original', ratio: null, label: 'Native Resolusi' },
  { id: 'smart_focus', name: 'Smart Focus', ratio: null, label: 'Pangkas Otomatis Subjek' },
  { id: '4:5', name: '4:5 Portrait', ratio: 4 / 5, label: '1080 × 1350 (IG/Mobile)' },
  { id: '1:1', name: '1:1 Square', ratio: 1, label: '1080 × 1080 (Feed)' },
  { id: '9:16', name: '9:16 Vertical', ratio: 9 / 16, label: '1080 × 1920 (Reels/TikTok)' },
  { id: '16:9', name: '16:9 Widescreen', ratio: 16 / 9, label: '1920 × 1080 (Monitor/Desktop)' },
  { id: '3:4', name: '3:4 CCTV Frame', ratio: 3 / 4, label: '960 × 1280 (Standard CCTV)' },
];

/**
 * Automatically detects non-background content bounds (trims excessive white/transparent margin)
 * Uses dynamic background color sampling from outer perimeter for extreme robustness.
 */
export function detectContentBounds(canvas) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  // Sample outer perimeter corners and edges
  const samplePoints = [
    0, // top-left
    Math.max(0, (w - 1) * 4), // top-right
    Math.max(0, (h - 1) * w * 4), // bottom-left
    Math.max(0, ((h - 1) * w + (w - 1)) * 4), // bottom-right
    Math.max(0, Math.floor(w / 2) * 4), // top-center
    Math.max(0, ((h - 1) * w + Math.floor(w / 2)) * 4) // bottom-center
  ];

  let sumR = 0, sumG = 0, sumB = 0, validSamples = 0;
  samplePoints.forEach(p => {
    if (p < data.length - 4) {
      sumR += data[p];
      sumG += data[p + 1];
      sumB += data[p + 2];
      validSamples++;
    }
  });

  const bgR = validSamples ? sumR / validSamples : 255;
  const bgG = validSamples ? sumG / validSamples : 255;
  const bgB = validSamples ? sumB / validSamples : 255;

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

      const colorDiff = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);
      const isForeground = a > 25 && colorDiff > 30;

      if (isForeground) {
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

  // Add 5% comfortable margin around subject
  const padX = Math.round((maxX - minX) * 0.05);
  const padY = Math.round((maxY - minY) * 0.05);

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
    fitMode = 'smart_fit', // 'smart_fit' | 'contain' | 'cover'
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

  // Step 2: Auto-trim excessive whitespace if requested or in smart focus
  const shouldTrim = autoTrim || aspectRatioId === 'smart_focus' || fitMode === 'smart_fit';
  const cropBox = shouldTrim ? detectContentBounds(srcCanvas) : { minX: 0, minY: 0, width: rawW, height: rawH };

  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = cropBox.width;
  croppedCanvas.height = cropBox.height;
  const croppedCtx = croppedCanvas.getContext('2d');
  croppedCtx.drawImage(
    srcCanvas,
    cropBox.minX, cropBox.minY, cropBox.width, cropBox.height,
    0, 0, cropBox.width, cropBox.height
  );

  // If aspect ratio is original or smart_focus, return cropped canvas directly
  if (aspectRatioId === 'original' && !autoTrim) {
    return srcCanvas;
  }
  if (aspectRatioId === 'original' || aspectRatioId === 'smart_focus') {
    return croppedCanvas;
  }

  const selectedPreset = ASPECT_RATIOS.find(a => a.id === aspectRatioId);
  if (!selectedPreset || !selectedPreset.ratio) {
    return croppedCanvas;
  }

  // Step 3: Fit to target aspect ratio
  const targetRatio = selectedPreset.ratio;
  let targetW, targetH;

  // Baseline standard high-definition dimensions
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
    renderX = Math.round((targetW - renderW) / 2);
    renderY = Math.round((targetH - renderH) / 2);
  } else if (fitMode === 'smart_fit') {
    // Smart Fit: Centers the trimmed subject nicely with 8% padding inside the frame
    const usableW = targetW * 0.90;
    const usableH = targetH * 0.90;
    const scale = Math.min(usableW / imgW, usableH / imgH);
    renderW = Math.round(imgW * scale);
    renderH = Math.round(imgH * scale);
    renderX = Math.round((targetW - renderW) / 2);
    renderY = Math.round((targetH - renderH) / 2);
  } else {
    // Contain: Preserves whole image within bounds
    if (imgRatio > targetRatio) {
      renderW = targetW;
      renderH = imgH * (targetW / imgW);
    } else {
      renderH = targetH;
      renderW = imgW * (targetH / imgH);
    }
    renderX = Math.round((targetW - renderW) / 2);
    renderY = Math.round((targetH - renderH) / 2);
  }

  targetCtx.drawImage(croppedCanvas, renderX, renderY, renderW, renderH);
  return targetCanvas;
}
