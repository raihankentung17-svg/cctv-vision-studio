/**
 * CCTV Vision Style Presets
 * Reconfigures color palettes, detection modes, and parameters
 * without generating any placeholder/cartoon graphics.
 */

export const STYLE_PRESETS = [
  {
    id: 'tokyo_lavender',
    name: 'Tokyo Lavender (Fashion Editorial)',
    description: 'High-contrast shadow detection for dark blazers, streetwear, and structural portraits',
    colorName: 'Tokyo Lavender',
    themeColor: '#C4B5FD',
    detectionMode: 'dark',
    darkThreshold: 80,
    brightThreshold: 185,
    contrastThreshold: 45,
    blockSize: 16,
    density: 58,
    telemetryTag: 'CCTV_TOKYO_01'
  },
  {
    id: 'acid_yellow',
    name: 'Acid Yellow (Alpha CCTV Classic)',
    description: 'The iconic high-visibility tracking yellow seen on alpine landscapes and urban CCTV',
    colorName: 'Acid Yellow',
    themeColor: '#FFE600',
    detectionMode: 'bright',
    darkThreshold: 75,
    brightThreshold: 180,
    contrastThreshold: 40,
    blockSize: 14,
    density: 50,
    telemetryTag: 'CCTV_ALPHA_09'
  },
  {
    id: 'cyber_blue',
    name: 'Cyber Electric Blue (Machine Vision)',
    description: 'Aggressive edge-contrast and silhouette tracking with deep memory corruption blocks',
    colorName: 'Cyber Blue',
    themeColor: '#0022FF',
    detectionMode: 'combined',
    darkThreshold: 70,
    brightThreshold: 190,
    contrastThreshold: 50,
    blockSize: 12,
    density: 65,
    telemetryTag: 'CCTV_NEURAL_04'
  },
  {
    id: 'neon_magenta',
    name: 'Neon Magenta (Architectural & Botanics)',
    description: 'Fine-grained edge boundary scanning for interior spaces, plants, and complex contours',
    colorName: 'Neon Magenta',
    themeColor: '#FF1493',
    detectionMode: 'contrast',
    darkThreshold: 75,
    brightThreshold: 185,
    contrastThreshold: 45,
    blockSize: 16,
    density: 48,
    telemetryTag: 'CCTV_BOTANIC_02'
  },
  {
    id: 'toxic_lime',
    name: 'Toxic Lime (Digital Wireframe)',
    description: 'Vibrant lime tracking reticles and diagnostic memory dumps for close-up profiles',
    colorName: 'Toxic Lime',
    themeColor: '#39FF14',
    detectionMode: 'combined',
    darkThreshold: 80,
    brightThreshold: 180,
    contrastThreshold: 42,
    blockSize: 14,
    density: 52,
    telemetryTag: 'CCTV_MATRIX_07'
  },
  {
    id: 'terminal_white',
    name: 'Terminal Monochrome (Minimalist Clean)',
    description: 'Ultra-clean white bounding geometry and diagnostic hexadecimal memory traces',
    colorName: 'Terminal White',
    themeColor: '#FFFFFF',
    detectionMode: 'dark',
    darkThreshold: 85,
    brightThreshold: 185,
    contrastThreshold: 45,
    blockSize: 16,
    density: 50,
    telemetryTag: 'CCTV_MONO_00'
  }
];
