/**
 * CCTV Vision & Memory Corruption Processing Engine
 * 
 * Recreates the machine-vision tracking + stepped memory corruption
 * aesthetics with resolution-aware dynamic scaling and collision-safe telemetry.
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

function createSeededRandom(seed = 12345) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function() {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Font styles supported for CCTV Vision typography
export const FONT_OPTIONS = [
  { id: 'JetBrains Mono', name: 'JetBrains Mono', category: 'Modern Terminal', desc: 'Standar terminal modern, tajam & presisi' },
  { id: 'Share Tech Mono', name: 'Share Tech Mono', category: 'NASA / Military HUD', desc: 'Font telemetri radar militer & aerospace' },
  { id: 'VT323', name: 'VT323 (Retro 90s)', category: 'CCTV 90s Analog', desc: 'Font raster bitmap kamera CCTV pengawas' },
  { id: 'Chakra Petch', name: 'Chakra Petch', category: 'Tactical Recon', desc: 'Sudut futuristik tebal & tegas' },
  { id: 'Orbitron', name: 'Orbitron', category: 'Sci-Fi Cybernetic', desc: 'Gaya cyber sci-fi wide letterforms' },
  { id: 'Space Mono', name: 'Space Mono', category: 'Brutalist Monospace', desc: 'Monospace editorial cyberpunk tebal' }
];

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
 * Main Render Pipeline with dynamic resolution scaling and subpixel precision
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

  // Ensure high-grade vector text smoothing and anti-aliasing (prevents font pixelation)
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  if ('textRendering' in ctx) {
    ctx.textRendering = 'geometricPrecision';
  }

  // Calculate resolution-adaptive scale factor S
  const S = Math.max(0.75, Math.min(3.5, Math.sqrt((width * height) / (850 * 850))));

  // 1. Render Base Image
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(image, 0, 0, width, height);

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // 2. Perform Contrast / Bright / Dark / Combined Mask Generation
  const corruptionMask = generateCorruptionMask(data, width, height, options, S);

  // 3. Render Machine Vision Bounding Boxes & Reticles (FIRST LAYER)
  if (options.showBoxes && options.boxes && options.boxes.length > 0) {
    renderBoundingBoxes(ctx, options.boxes, options, width, height, S);
  }

  // 4. Render Tracking Crosses (+)
  if (options.showKeypoints && options.keypoints && options.keypoints.length > 0) {
    renderTrackingCrosses(ctx, options.keypoints, options, S);
  }

  // 5. Render Memory Corruption Glitch Blocks (INTERLOCKING LAYER)
  if (options.corruptionEnabled !== false) {
    renderCorruptionBlocks(ctx, corruptionMask, width, height, options);
  }

  // 6. Render Diagnostic Hex Dump Code Inside Corrupted Blocks
  if (options.showDiagnosticCode && options.corruptionEnabled !== false) {
    renderDiagnosticHexDumps(ctx, corruptionMask, width, height, options, S);
  }

  // 7. Render CCTV Telemetry & Header/Footer System Overlays
  if (options.showTelemetry) {
    renderCCTVTelemetry(ctx, width, height, options, S);
  }
}

/**
 * Analyzes pixels to detect dark, bright, contrast edges, or combined conditions
 */
function generateCorruptionMask(data, width, height, options, S) {
  const {
    detectionMode = 'combined',
    darkThreshold = 75,
    brightThreshold = 185,
    contrastThreshold = 45,
    blockSize = 16,
    density = 55,
    confineToBoxes = true,
    boxes = [],
    seed = 42
  } = options;

  // Adapt block size so high-res images maintain chunky aesthetic
  const effectiveBlockSize = Math.max(8, Math.round(blockSize * Math.min(2.0, S)));

  const rng = createSeededRandom(seed);
  const cols = Math.ceil(width / effectiveBlockSize);
  const rows = Math.ceil(height / effectiveBlockSize);
  const cellScore = new Float32Array(cols * rows);
  const cellActive = new Uint8Array(cols * rows);

  // Fast luminance buffer
  const luma = new Uint8Array(width * height);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    luma[p] = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) | 0;
  }

  // Strict bounding box inclusion mask
  let boxMask = null;
  if (confineToBoxes && boxes && boxes.length > 0) {
    boxMask = new Uint8Array(cols * rows);
    const expand = 1.08; // Small 8% outline bleed
    for (const b of boxes) {
      // Clamp coordinates strictly within canvas bounds
      const cx = Math.max(0, Math.min(width, b.x + b.width / 2));
      const cy = Math.max(0, Math.min(height, b.y + b.height / 2));
      const ew = Math.min(width, b.width * expand);
      const eh = Math.min(height, b.height * expand);

      const minCol = Math.max(0, Math.floor((cx - ew / 2) / effectiveBlockSize));
      const maxCol = Math.min(cols - 1, Math.ceil((cx + ew / 2) / effectiveBlockSize));
      const minRow = Math.max(0, Math.floor((cy - eh / 2) / effectiveBlockSize));
      const maxRow = Math.min(rows - 1, Math.ceil((cy + eh / 2) / effectiveBlockSize));

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
    const cellY = Math.floor(y / effectiveBlockSize);

    for (let x = 1; x < width - 1; x += 2) {
      const cellX = Math.floor(x / effectiveBlockSize);
      const cellIdx = cellY * cols + cellX;

      if (boxMask && !boxMask[cellIdx]) continue;

      const p = rowOffset + x;
      const lum = luma[p];

      let isQualified = false;
      const isDark = lum < darkThreshold;
      const isBright = lum > brightThreshold;

      let isHighContrast = false;
      if (detectionMode === 'contrast' || detectionMode === 'combined') {
        const gx = (-luma[p - width - 1] + luma[p - width + 1]) +
                   (-2 * luma[p - 1]     + 2 * luma[p + 1]) +
                   (-luma[p + width - 1] + luma[p + width + 1]);
        const gy = (-luma[p - width - 1] - 2 * luma[p - width] - luma[p - width + 1]) +
                   (luma[p + width - 1]  + 2 * luma[p + width]  + luma[p + width + 1]);
        const mag = Math.abs(gx) + Math.abs(gy);
        isHighContrast = mag > (contrastThreshold * 4);
      }

      if (detectionMode === 'dark') {
        isQualified = isDark;
      } else if (detectionMode === 'bright') {
        isQualified = isBright;
      } else if (detectionMode === 'contrast') {
        isQualified = isHighContrast;
      } else if (detectionMode === 'combined') {
        isQualified = (isDark || isBright) && (isHighContrast || rng() < 0.25);
      }

      if (isQualified) {
        cellScore[cellIdx] += 1;
      }
    }
  }

  const sampleCountPerCell = (effectiveBlockSize * effectiveBlockSize) / 4;
  const thresholdRatio = Math.max(0.08, 0.6 - (density / 100) * 0.45);

  for (let idx = 0; idx < cellScore.length; idx++) {
    const ratio = cellScore[idx] / sampleCountPerCell;
    if (ratio > thresholdRatio && rng() < (density / 100 + 0.2)) {
      cellActive[idx] = 1;
    }
  }

  // Morphological Stepped Clustering (8-bit geometric staircase)
  const clustered = new Uint8Array(cols * rows);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      if (cellActive[idx]) {
        clustered[idx] = 1;
        if (rng() < 0.35 && c + 1 < cols) clustered[idx + 1] = 1;
        if (rng() < 0.25 && r + 1 < rows) clustered[idx + cols] = 1;
      }
    }
  }

  return {
    cols,
    rows,
    blockSize: effectiveBlockSize,
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
 * Injects realistic diagnostic crash codes with dynamic scaling
 */
function renderDiagnosticHexDumps(ctx, mask, width, height, options, S) {
  const { cols, rows, blockSize, cells } = mask;
  const seed = (options.seed || 100) + 77;
  const rng = createSeededRandom(seed);
  const fontScale = options.fontScale || 1.0;
  const fontFamily = options.fontFamily || 'JetBrains Mono';

  const fontSize = Math.max(8, Math.round(9 * S * fontScale));
  const lineHeight = Math.round(11 * S * fontScale);

  ctx.save();
  ctx.font = `bold ${fontSize}px "${fontFamily}", monospace`;
  ctx.fillStyle = '#FFFFFF';
  ctx.textBaseline = 'top';

  for (let r = 1; r < rows - 2; r += 2) {
    for (let c = 1; c < cols - 3; c += 2) {
      const idx = r * cols + c;
      if (cells[idx] && cells[idx + 1] && cells[idx + cols] && cells[idx + cols + 1]) {
        if (rng() < 0.22) {
          const codeSnippet = DIAGNOSTIC_CODES[Math.floor(rng() * DIAGNOSTIC_CODES.length)];
          const posX = Math.round(c * blockSize + 3 * S);
          let posY = Math.round(r * blockSize + 3 * S);

          for (const line of codeSnippet) {
            if (posY + lineHeight < height && posX + 80 * S * fontScale < width) {
              ctx.fillText(line, posX, posY);
              posY += lineHeight;
            }
          }
          c += 3;
        }
      }
    }
  }

  ctx.restore();
}

/**
 * Renders Machine-Vision Bounding Boxes strictly clamped within canvas
 */
function renderBoundingBoxes(ctx, boxes, options, canvasWidth, canvasHeight, S) {
  const themeColor = options.themeColor || '#FFE600';
  const fontScale = options.fontScale || 1.0;
  const fontFamily = options.fontFamily || 'JetBrains Mono';
  const strokeWidth = Math.max(1.25, (options.boxStrokeWidth || 1.25) * S);
  const fontSize = Math.max(9, Math.round(11 * S * fontScale));
  const badgeH = Math.round(Math.max(16 * S, fontSize + 6 * S));

  ctx.save();
  ctx.lineWidth = strokeWidth;
  ctx.strokeStyle = themeColor;
  ctx.fillStyle = themeColor;

  for (const rawBox of boxes) {
    // Strictly clamp box within canvas boundaries and snap to integer pixels
    const x = Math.round(Math.max(0, Math.min(canvasWidth - 10, rawBox.x)));
    const y = Math.round(Math.max(0, Math.min(canvasHeight - 10, rawBox.y)));
    const width = Math.round(Math.max(10, Math.min(canvasWidth - x, rawBox.width)));
    const height = Math.round(Math.max(10, Math.min(canvasHeight - y, rawBox.height)));

    const { label, subLabel, conf } = rawBox;

    // 1. Box outline
    ctx.strokeRect(x, y, width, height);

    // 2. Corner Reticles
    if (options.cornerTicks !== false) {
      const tick = Math.min(Math.round(10 * S), Math.min(width, height) * 0.25);
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

    // 3. Technical Label Badge
    const displayConf = conf !== undefined ? conf : '0.98';
    const mainText = label ? `[${label}]` : '[subject_track]';
    const subText = subLabel ? ` ${subLabel}` : '';
    let fullTag = `${mainText}${subText} conf: ${displayConf}`;

    ctx.font = `600 ${fontSize}px "${fontFamily}", monospace`;
    ctx.textBaseline = 'bottom';
    
    let textWidth = Math.round(ctx.measureText(fullTag).width);
    if (textWidth > width - 16) {
      fullTag = `[${label || 'track'}] ${displayConf}`;
      textWidth = Math.round(ctx.measureText(fullTag).width);
    }

    const badgeW = textWidth + Math.round(8 * S);
    const badgeX = Math.round(Math.max(2, Math.min(x, canvasWidth - badgeW - 2)));
    const badgeY = Math.round(Math.max(0, y - badgeH));

    ctx.fillStyle = 'rgba(7, 9, 14, 0.85)';
    ctx.fillRect(badgeX, badgeY, badgeW, badgeH);

    ctx.fillStyle = themeColor;
    ctx.fillText(fullTag, badgeX + Math.round(4 * S), Math.round(badgeY + badgeH - 3 * S));
  }

  ctx.restore();
}

/**
 * Renders Red Tracking Crosses (+) with dynamic scaling
 */
function renderTrackingCrosses(ctx, keypoints, options, S) {
  const crossColor = options.crossColor || '#FF3333';
  const size = Math.max(4, Math.round(5 * S));
  const strokeW = Math.max(1.5, Math.round(1.5 * S));

  ctx.save();
  ctx.strokeStyle = crossColor;
  ctx.lineWidth = strokeW;

  for (const kp of keypoints) {
    const { x, y } = kp;
    ctx.beginPath();
    ctx.moveTo(x - size, y);
    ctx.lineTo(x + size, y);
    ctx.moveTo(x, y - size);
    ctx.lineTo(x, y + size);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Renders Top & Bottom CCTV Telemetry safely positioned without collisions
 */
function renderCCTVTelemetry(ctx, width, height, options, S) {
  const themeColor = options.themeColor || '#FFE600';
  const fontScale = options.fontScale || 1.0;
  const fontFamily = options.fontFamily || 'JetBrains Mono';
  const {
    cctvTag = 'CCTV_04',
    frameNumber = 'FRAME: 0234',
    subjectId = 'ID: 001A_person',
    confidence = 'CONF: 0.98',
    watermark = 'CREATED BY VISION_STUDIO'
  } = options.telemetry || {};

  // Fit font size and margins to the actual canvas width and user font scale
  const baseFontSize = Math.round(11 * S * fontScale);
  const fontSize = Math.max(8, Math.min(baseFontSize, Math.floor((width / 32) * fontScale)));
  const marginX = Math.round(Math.max(6, Math.min(16 * S, width * 0.04)));
  const marginY = Math.round(Math.max(6, Math.min(16 * S, height * 0.03)));

  ctx.save();
  ctx.font = `600 ${fontSize}px "${fontFamily}", monospace`;
  ctx.fillStyle = themeColor;
  ctx.textBaseline = 'top';

  if (width >= 480) {
    // Wide Canvas Layout: Standard single line
    const leftTag = `[${cctvTag}] ${subjectId} ${confidence}`;
    ctx.fillText(leftTag, marginX, marginY);

    const rightTag = `${frameNumber}  2030`;
    const rightWidth = Math.round(ctx.measureText(rightTag).width);
    ctx.fillText(rightTag, Math.round(width - rightWidth - marginX), marginY);

    const leftWidth = Math.round(ctx.measureText(leftTag).width);
    const wmWidth = Math.round(ctx.measureText(watermark).width);
    if (width - leftWidth - rightWidth - marginX * 4 > wmWidth + 20) {
      ctx.fillText(watermark, Math.round((width - wmWidth) / 2), marginY);
    }
  } else if (width >= 300) {
    // Medium / Compact Single Line Layout
    const leftTag = `[${cctvTag}] ${subjectId.replace('person', '')}`;
    ctx.fillText(leftTag, marginX, marginY);

    const rightTag = `${frameNumber}`;
    const rightWidth = Math.round(ctx.measureText(rightTag).width);
    ctx.fillText(rightTag, Math.round(Math.max(marginX + ctx.measureText(leftTag).width + 8, width - rightWidth - marginX)), marginY);
  } else {
    // Ultra-Narrow Canvas Layout (< 300px): Clean 2-row telemetry so nothing ever clips
    const row1Left = `[${cctvTag}]`;
    const row1Right = `F:0234`;
    ctx.fillText(row1Left, marginX, marginY);
    const r1W = Math.round(ctx.measureText(row1Right).width);
    ctx.fillText(row1Right, Math.round(width - r1W - marginX), marginY);

    const row2Y = Math.round(marginY + fontSize + 3);
    const row2Left = `${confidence}`;
    const row2Right = `2030`;
    ctx.fillText(row2Left, marginX, row2Y);
    const r2W = Math.round(ctx.measureText(row2Right).width);
    ctx.fillText(row2Right, Math.round(width - r2W - marginX), row2Y);
  }

  // Bottom REC indicator safely inside viewport
  const bottomY = Math.round(height - marginY);
  const recDotRadius = Math.max(3, Math.min(Math.round(4 * S), Math.floor(width * 0.02)));

  ctx.fillStyle = '#FF3B30';
  ctx.beginPath();
  ctx.arc(Math.round(marginX + recDotRadius), Math.round(bottomY - recDotRadius / 2), recDotRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = themeColor;
  ctx.textBaseline = 'middle';
  ctx.fillText('REC', Math.round(marginX + recDotRadius * 2 + Math.max(4, Math.round(6 * S))), Math.round(bottomY - recDotRadius / 2));

  ctx.restore();
}
