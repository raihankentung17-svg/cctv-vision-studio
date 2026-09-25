/**
 * CCTV Vision & Memory Corruption Processing Engine
 * 
 * Recreates the exact machine-vision tracking + stepped memory corruption
 * visual aesthetics as demonstrated in the reference video and prompt.
 */

// Preset Hex Diagnostic Code snippets extracted directly from the video frames
const DIAGNOSTIC_CODES = [
  ["MEM_ERR 0x03DF", "CORRUPT_PIXEL_BLOCK", "CORE_SECT: 7A", "RETRY_CNT: 3"],
  ["0x4F92... /4/S", "0x4F92... /4/S", "0x4F92... /4/S"],
  ["PAGE_FLT_0109: 0x8C000300", "CHECK5UM_FAIL", "MALLOC 3102 REQ", "ERR_0x02F4"],
  ["DATA_SEG_A: FAULT", "CRC_74_0x00A2", "MEM_BLK: 0x0119", "RETRY_CNT: 0"],
  ["[FAULT_ACTV: 0x98A]", "CORR_SECT: 0x4F", "MEM_CORRUPT_SET_2", "SYS_STATE: RED"],
  ["MEM_ERR 0x0548", "FRAME_SAT_LOST", "ERR_0 > 0x0F2", "ERR_0x4F2"],
  ["000001000", "010111010", "110010001", "101001110"]
];

/**
 * Pseudo-random generator with fixed seed for reproducible aesthetics
 */
function createSeededRandom(seed = 12345) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function() {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Converts Hex color string to RGB object
 */
export function hexToRgb(hex) {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  const num = parseInt(c, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

/**
 * Main Render Pipeline
 */
export function renderCCTVVisionEffect(canvas, image, options) {
  if (!canvas || !image) return;

  const ctx = canvas.getContext('2d');
  const width = image.width || image.naturalWidth;
  const height = image.height || image.naturalHeight;

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  // 1. Render Base Image (Crisp, preserving 100% natural texture and lighting)
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(image, 0, 0, width, height);

  // Get raw pixel data for contrast / brightness analysis
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // 2. Perform Contrast / Bright / Dark / Combined Mask Generation
  const corruptionMask = generateCorruptionMask(data, width, height, options);

  // 3. Render Machine Vision Bounding Boxes & Reticles (FIRST LAYER)
  if (options.showBoxes && options.boxes && options.boxes.length > 0) {
    renderBoundingBoxes(ctx, options.boxes, options, width, height);
  }

  // 4. Render Tracking Crosses (+)
  if (options.showKeypoints && options.keypoints && options.keypoints.length > 0) {
    renderTrackingCrosses(ctx, options.keypoints, options);
  }

  // 5. Render Memory Corruption Glitch Blocks (INTERLOCKING LAYER: partially obscures boxes)
  if (options.corruptionEnabled !== false) {
    renderCorruptionBlocks(ctx, corruptionMask, width, height, options);
  }

  // 6. Render Diagnostic Hex Dump Code Inside/Around Corrupted Blocks
  if (options.showDiagnosticCode && options.corruptionEnabled !== false) {
    renderDiagnosticHexDumps(ctx, corruptionMask, width, height, options);
  }

  // 7. Render CCTV Telemetry & Header/Footer System Overlays
  if (options.showTelemetry) {
    renderCCTVTelemetry(ctx, width, height, options);
  }
}

/**
 * Analyzes pixels to detect dark, bright, contrast edges, or combined conditions
 */
function generateCorruptionMask(data, width, height, options) {
  const {
    detectionMode = 'combined', // 'dark' | 'bright' | 'contrast' | 'combined'
    darkThreshold = 75,         // 0 - 255: pixels with luminance < darkThreshold
    brightThreshold = 185,      // 0 - 255: pixels with luminance > brightThreshold
    contrastThreshold = 45,     // 0 - 255: gradient edge magnitude
    blockSize = 16,             // size of stepped pixelated chunks
    density = 55,               // 0 - 100 density factor
    confineToBoxes = true,      // confine to tracked subject areas
    boxes = [],
    seed = 42
  } = options;

  const rng = createSeededRandom(seed);
  const cols = Math.ceil(width / blockSize);
  const rows = Math.ceil(height / blockSize);
  const cellScore = new Float32Array(cols * rows);
  const cellActive = new Uint8Array(cols * rows);

  // Pre-calculate luminance buffer for fast Sobel operator
  const luma = new Uint8Array(width * height);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    // ITU-R BT.709 luminance
    luma[p] = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) | 0;
  }

  // Bounding box inclusion mask (with slight outline expansion)
  let boxMask = null;
  if (confineToBoxes && boxes && boxes.length > 0) {
    boxMask = new Uint8Array(cols * rows);
    const expand = 1.15; // 15% expansion to allow fragments to interrupt outline
    for (const b of boxes) {
      const cx = b.x + b.width / 2;
      const cy = b.y + b.height / 2;
      const ew = (b.width * expand);
      const eh = (b.height * expand);
      const minCol = Math.max(0, Math.floor((cx - ew / 2) / blockSize));
      const maxCol = Math.min(cols - 1, Math.ceil((cx + ew / 2) / blockSize));
      const minRow = Math.max(0, Math.floor((cy - eh / 2) / blockSize));
      const maxRow = Math.min(rows - 1, Math.ceil((cy + eh / 2) / blockSize));

      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          boxMask[r * cols + c] = 1;
        }
      }
    }
  }

  // Scan pixels and accumulate qualification score per block
  for (let y = 1; y < height - 1; y += 2) {
    const rowOffset = y * width;
    const cellY = Math.floor(y / blockSize);

    for (let x = 1; x < width - 1; x += 2) {
      const cellX = Math.floor(x / blockSize);
      const cellIdx = cellY * cols + cellX;

      // Skip if confined to boxes and outside
      if (boxMask && !boxMask[cellIdx]) continue;

      const p = rowOffset + x;
      const lum = luma[p];

      let isQualified = false;

      // 1. Luminance Tests
      const isDark = lum < darkThreshold;
      const isBright = lum > brightThreshold;

      // 2. Sobel Edge / Contrast Gradient
      let isHighContrast = false;
      if (detectionMode === 'contrast' || detectionMode === 'combined') {
        const gx = (-luma[p - width - 1] + luma[p - width + 1]) +
                   (-2 * luma[p - 1]     + 2 * luma[p + 1]) +
                   (-luma[p + width - 1] + luma[p + width + 1]);
        const gy = (-luma[p - width - 1] - 2 * luma[p - width] - luma[p - width + 1]) +
                   (luma[p + width - 1]  + 2 * luma[p + width]  + luma[p + width + 1]);
        const mag = Math.abs(gx) + Math.abs(gy); // Fast approximation
        isHighContrast = mag > (contrastThreshold * 4);
      }

      // 3. Selection Modes
      if (detectionMode === 'dark') {
        isQualified = isDark;
      } else if (detectionMode === 'bright') {
        isQualified = isBright;
      } else if (detectionMode === 'contrast') {
        isQualified = isHighContrast;
      } else if (detectionMode === 'combined') {
        // Combined mode: highlights or shadows intersecting sharp edges
        isQualified = (isDark || isBright) && (isHighContrast || rng() < 0.25);
      }

      if (isQualified) {
        cellScore[cellIdx] += 1;
      }
    }
  }

  // Normalize cell scores and apply density threshold
  const sampleCountPerCell = (blockSize * blockSize) / 4;
  const thresholdRatio = Math.max(0.08, 0.6 - (density / 100) * 0.45);

  for (let idx = 0; idx < cellScore.length; idx++) {
    const ratio = cellScore[idx] / sampleCountPerCell;
    if (ratio > thresholdRatio && rng() < (density / 100 + 0.2)) {
      cellActive[idx] = 1;
    }
  }

  // Morphological Stepped Clustering: Create chunky connected 8-bit staircase blocks
  const clustered = new Uint8Array(cols * rows);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      if (cellActive[idx]) {
        clustered[idx] = 1;
        // Occasional stepped expansion right / down for authentic glitch geometry
        if (rng() < 0.35 && c + 1 < cols) clustered[idx + 1] = 1;
        if (rng() < 0.25 && r + 1 < rows) clustered[idx + cols] = 1;
      }
    }
  }

  return {
    cols,
    rows,
    blockSize,
    cells: clustered,
    scores: cellScore
  };
}

/**
 * Renders the stepped pixelated memory corruption blocks
 */
function renderCorruptionBlocks(ctx, mask, width, height, options) {
  const { cols, rows, blockSize, cells } = mask;
  const themeColor = options.themeColor || '#FFE600';
  const rgb = hexToRgb(themeColor);
  const opacity = options.corruptionOpacity !== undefined ? options.corruptionOpacity : 1.0;

  ctx.save();
  ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;

  // Group contiguous horizontal runs into rectangular strips for clean rendering
  for (let r = 0; r < rows; r++) {
    let runStart = -1;
    for (let c = 0; c <= cols; c++) {
      const active = (c < cols) && (cells[r * cols + c] === 1);
      if (active && runStart === -1) {
        runStart = c;
      } else if (!active && runStart !== -1) {
        const x = runStart * blockSize;
        const y = r * blockSize;
        const w = (c - runStart) * blockSize;
        const h = blockSize;
        ctx.fillRect(x, y, w, h);
        runStart = -1;
      }
    }
  }

  ctx.restore();
}

/**
 * Injects realistic diagnostic crash codes into large corrupted blocks
 */
function renderDiagnosticHexDumps(ctx, mask, width, height, options) {
  const { cols, rows, blockSize, cells } = mask;
  const seed = (options.seed || 100) + 77;
  const rng = createSeededRandom(seed);

  ctx.save();
  ctx.font = 'bold 9px "JetBrains Mono", "SF Mono", monospace';
  ctx.fillStyle = '#FFFFFF';
  ctx.textBaseline = 'top';

  // Find candidate regions with at least 3x2 connected blocks
  for (let r = 1; r < rows - 2; r += 2) {
    for (let c = 1; c < cols - 3; c += 2) {
      const idx = r * cols + c;
      if (cells[idx] && cells[idx + 1] && cells[idx + cols] && cells[idx + cols + 1]) {
        // Only place code in ~15-25% of large blocks to avoid clutter
        if (rng() < 0.22) {
          const codeSnippet = DIAGNOSTIC_CODES[Math.floor(rng() * DIAGNOSTIC_CODES.length)];
          const posX = c * blockSize + 3;
          let posY = r * blockSize + 3;

          for (const line of codeSnippet) {
            if (posY + 10 < height && posX + 80 < width) {
              ctx.fillText(line, posX, posY);
              posY += 10;
            }
          }
          c += 3; // jump ahead to prevent overlapping text
        }
      }
    }
  }

  ctx.restore();
}

/**
 * Renders Machine-Vision Bounding Boxes with technical labels & brackets
 */
function renderBoundingBoxes(ctx, boxes, options, canvasWidth, canvasHeight) {
  const themeColor = options.themeColor || '#FFE600';
  const strokeWidth = options.boxStrokeWidth || 1.25;

  ctx.save();
  ctx.lineWidth = strokeWidth;
  ctx.strokeStyle = themeColor;
  ctx.fillStyle = themeColor;

  for (const box of boxes) {
    const { x, y, width, height, label, subLabel, conf, frame } = box;

    // 1. Draw thin crisp box outline
    ctx.strokeRect(x, y, width, height);

    // 2. Draw Corner Tick Brackets (Machine Vision Reticle)
    if (options.cornerTicks !== false) {
      const tick = Math.min(10, Math.min(width, height) * 0.25);
      ctx.beginPath();
      // Top-Left
      ctx.moveTo(x - 2, y + tick);
      ctx.lineTo(x - 2, y - 2);
      ctx.lineTo(x + tick, y - 2);
      // Top-Right
      ctx.moveTo(x + width - tick, y - 2);
      ctx.lineTo(x + width + 2, y - 2);
      ctx.lineTo(x + width + 2, y + tick);
      // Bottom-Left
      ctx.moveTo(x - 2, y + height - tick);
      ctx.lineTo(x - 2, y + height + 2);
      ctx.lineTo(x + tick, y + height + 2);
      // Bottom-Right
      ctx.moveTo(x + width - tick, y + height + 2);
      ctx.lineTo(x + width + 2, y + height + 2);
      ctx.lineTo(x + width + 2, y + height - tick);
      ctx.stroke();
    }

    // 3. Draw Small Technical Label
    const displayConf = conf !== undefined ? conf : '0.98';
    const displayFrame = frame !== undefined ? frame : options.telemetry?.frameNumber || '0234';
    const mainText = label ? `[${label}]` : '[subject_track]';
    const subText = subLabel ? ` ${subLabel}` : '';
    const confText = ` conf: ${displayConf}`;
    const fullTag = `${mainText}${subText}${confText}`;

    ctx.font = '500 11px "JetBrains Mono", "SF Mono", monospace';
    ctx.textBaseline = 'bottom';
    
    // Slight background shield for legibility (optional)
    const textWidth = ctx.measureText(fullTag).width;
    ctx.fillStyle = 'rgba(7, 9, 14, 0.7)';
    ctx.fillRect(x, Math.max(0, y - 16), textWidth + 6, 16);

    ctx.fillStyle = themeColor;
    ctx.fillText(fullTag, x + 3, y - 3);
  }

  ctx.restore();
}

/**
 * Renders Red Tracking Crosses (+) at key facial and joint coordinates
 */
function renderTrackingCrosses(ctx, keypoints, options) {
  const crossColor = options.crossColor || '#FF3333';
  const size = options.crossSize || 5;

  ctx.save();
  ctx.strokeStyle = crossColor;
  ctx.lineWidth = 1.5;

  for (const kp of keypoints) {
    const { x, y, label } = kp;
    ctx.beginPath();
    ctx.moveTo(x - size, y);
    ctx.lineTo(x + size, y);
    ctx.moveTo(x, y - size);
    ctx.lineTo(x, y + size);
    ctx.stroke();

    if (label && options.showKeypointLabels) {
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillStyle = crossColor;
      ctx.fillText(label, x + size + 2, y + 3);
    }
  }

  ctx.restore();
}

/**
 * Renders Top & Bottom CCTV Camera Telemetry
 */
function renderCCTVTelemetry(ctx, width, height, options) {
  const themeColor = options.themeColor || '#FFE600';
  const {
    cctvTag = 'CCTV_04',
    frameNumber = 'FRAME: 0234',
    subjectId = 'ID: 001A_person',
    confidence = 'CONF: 0.98',
    watermark = 'CREATED BY VISION_STUDIO'
  } = options.telemetry || {};

  ctx.save();
  ctx.font = '500 11px "JetBrains Mono", monospace';
  ctx.fillStyle = themeColor;
  ctx.textBaseline = 'top';

  // Top Left: CCTV Tag & Subject Info
  ctx.fillText(`[${cctvTag}] ${subjectId} ${confidence}`, 16, 16);

  // Top Center: Watermark / Creator Tag
  const wmWidth = ctx.measureText(watermark).width;
  ctx.fillText(watermark, (width - wmWidth) / 2, 16);

  // Top Right: Year & Frame Count
  const rightTag = `${frameNumber}  2030`;
  const rightWidth = ctx.measureText(rightTag).width;
  ctx.fillText(rightTag, width - rightWidth - 16, 16);

  // Bottom Center REC indicator
  ctx.fillStyle = '#FF3B30';
  ctx.beginPath();
  ctx.arc(22, height - 20, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = themeColor;
  ctx.textBaseline = 'middle';
  ctx.fillText('REC', 32, height - 20);

  ctx.restore();
}
