/**
 * Built-in Sample Image Presets
 * Procedurally generates high-quality photographic-style base canvases
 * matching the exact scenes from the reference video.
 */

export const SAMPLE_PRESETS = [
  {
    id: 'fashion_model',
    name: 'Fashion Blazer Model (Tokyo Lavender)',
    description: 'High-contrast editorial portrait with dark blazer and structural pose',
    defaultColor: '#C4B5FD', // Tokyo Lavender
    defaultMode: 'dark',     // Shadows on blazer
    defaultDensity: 58,
    defaultBlockSize: 16,
    generate: (w = 640, h = 800) => createFashionModelPreset(w, h)
  },
  {
    id: 'alpine_mountain',
    name: 'Dolomites Alpine Peak (Acid Yellow)',
    description: 'Craggy mountain spires with sunny slopes and foreground wildflowers',
    defaultColor: '#FFE600', // Acid Yellow
    defaultMode: 'bright',   // Sunny peaks & snow
    defaultDensity: 50,
    defaultBlockSize: 14,
    generate: (w = 800, h = 600) => createMountainPreset(w, h)
  },
  {
    id: 'sunglasses_profile',
    name: 'Cyber Sunglasses Profile (Electric Blue)',
    description: 'Close-up side profile portrait with metallic sunglasses and neck shadows',
    defaultColor: '#0022FF', // Electric Blue
    defaultMode: 'combined', // High contrast edges & dark shadows
    defaultDensity: 65,
    defaultBlockSize: 12,
    generate: (w = 640, h = 780) => createProfilePreset(w, h)
  },
  {
    id: 'indoor_plant',
    name: 'Architectural Staircase & Pothos (Neon Magenta)',
    description: 'Warm wood staircase with cascading potted plant foliage and direct sunbeams',
    defaultColor: '#FF1493', // Neon Magenta
    defaultMode: 'contrast', // Leaf outlines & stair edges
    defaultDensity: 48,
    defaultBlockSize: 18,
    generate: (w = 640, h = 780) => createInteriorPreset(w, h)
  }
];

function createFashionModelPreset(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');

  // Neutral studio warm-grey backdrop
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, '#535760');
  bgGrad.addColorStop(1, '#2f3238');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Soft studio key light
  const lightGrad = ctx.createRadialGradient(w * 0.45, h * 0.25, 20, w * 0.45, h * 0.25, w * 0.7);
  lightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
  lightGrad.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
  ctx.fillStyle = lightGrad;
  ctx.fillRect(0, 0, w, h);

  // Model Head / Neck
  const skinTone = '#f0c7a8';
  const shadowSkin = '#a8785e';
  
  // Head oval
  ctx.fillStyle = skinTone;
  ctx.beginPath();
  ctx.ellipse(w * 0.48, h * 0.17, w * 0.11, h * 0.10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Face shadow
  ctx.fillStyle = shadowSkin;
  ctx.beginPath();
  ctx.ellipse(w * 0.52, h * 0.18, w * 0.06, h * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();

  // Neck
  ctx.fillStyle = shadowSkin;
  ctx.fillRect(w * 0.44, h * 0.24, w * 0.08, h * 0.08);

  // Oversized Boxy Blazer (Deep black/charcoal with angular shoulders)
  ctx.fillStyle = '#111216';
  ctx.beginPath();
  ctx.moveTo(w * 0.15, h * 0.28); // Left shoulder point
  ctx.lineTo(w * 0.82, h * 0.27); // Right shoulder point
  ctx.lineTo(w * 0.72, h * 0.65); // Right torso waist
  ctx.lineTo(w * 0.24, h * 0.65); // Left torso waist
  ctx.closePath();
  ctx.fill();

  // Blazer Lapels & Fold Shadows
  ctx.fillStyle = '#1d2027';
  ctx.beginPath();
  ctx.moveTo(w * 0.38, h * 0.30);
  ctx.lineTo(w * 0.48, h * 0.48);
  ctx.lineTo(w * 0.42, h * 0.62);
  ctx.lineTo(w * 0.34, h * 0.42);
  ctx.closePath();
  ctx.fill();

  // Legs in cross-legged seated pose
  ctx.fillStyle = skinTone;
  // Left Knee/Thigh
  ctx.beginPath();
  ctx.ellipse(w * 0.24, h * 0.72, w * 0.14, h * 0.08, -0.2, 0, Math.PI * 2);
  ctx.fill();
  // Right Knee/Thigh
  ctx.beginPath();
  ctx.ellipse(w * 0.74, h * 0.72, w * 0.14, h * 0.08, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Knee Shadow Creases
  ctx.fillStyle = shadowSkin;
  ctx.beginPath();
  ctx.ellipse(w * 0.26, h * 0.74, w * 0.08, h * 0.04, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(w * 0.72, h * 0.74, w * 0.08, h * 0.04, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Floor Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.88, w * 0.45, h * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();

  return c.toDataURL('image/png');
}

function createMountainPreset(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');

  // Alpine Sky
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.45);
  skyGrad.addColorStop(0, '#537d99');
  skyGrad.addColorStop(1, '#93b6ce');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  // Distant Mountain Ridges (Slate Blue)
  ctx.fillStyle = '#617482';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.38);
  ctx.lineTo(w * 0.25, h * 0.25);
  ctx.lineTo(w * 0.5, h * 0.32);
  ctx.lineTo(w * 0.8, h * 0.20);
  ctx.lineTo(w, h * 0.34);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // Main Dolomite Spire (Foreground Giant Peak)
  ctx.fillStyle = '#3c4b57';
  ctx.beginPath();
  ctx.moveTo(w * 0.35, h * 0.55);
  ctx.lineTo(w * 0.52, h * 0.12); // Sharp Peak Summit
  ctx.lineTo(w * 0.65, h * 0.24);
  ctx.lineTo(w * 0.72, h * 0.18);
  ctx.lineTo(w * 0.82, h * 0.58);
  ctx.closePath();
  ctx.fill();

  // Sunlit Cliff Face (High Contrast Bright)
  ctx.fillStyle = '#c7d2da';
  ctx.beginPath();
  ctx.moveTo(w * 0.52, h * 0.12);
  ctx.lineTo(w * 0.62, h * 0.14);
  ctx.lineTo(w * 0.60, h * 0.45);
  ctx.lineTo(w * 0.50, h * 0.48);
  ctx.closePath();
  ctx.fill();

  // Scree Snow Slope (Pure Bright White)
  ctx.fillStyle = '#eaeef1';
  ctx.beginPath();
  ctx.moveTo(w * 0.1, h * 0.62);
  ctx.lineTo(w * 0.35, h * 0.46);
  ctx.lineTo(w * 0.45, h * 0.62);
  ctx.closePath();
  ctx.fill();

  // Foreground Alpine Flower Field (Green with White dots)
  const grassGrad = ctx.createLinearGradient(0, h * 0.55, 0, h);
  grassGrad.addColorStop(0, '#4b643a');
  grassGrad.addColorStop(1, '#2c4220');
  ctx.fillStyle = grassGrad;
  ctx.fillRect(0, h * 0.58, w, h * 0.42);

  // Tiny Chamomile / Daisies
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 350; i++) {
    const fx = Math.random() * w;
    const fy = h * 0.62 + Math.random() * (h * 0.36);
    const rad = 1 + (fy / h) * 2.5;
    ctx.beginPath();
    ctx.arc(fx, fy, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  return c.toDataURL('image/png');
}

function createProfilePreset(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');

  // Cool industrial wall background
  ctx.fillStyle = '#8f969b';
  ctx.fillRect(0, 0, w, h);

  // Spiky Hair Profile
  ctx.fillStyle = '#d2ad66';
  ctx.beginPath();
  ctx.moveTo(w * 0.15, h * 0.22);
  ctx.lineTo(w * 0.08, h * 0.12);
  ctx.lineTo(w * 0.22, h * 0.18);
  ctx.lineTo(w * 0.20, h * 0.08);
  ctx.lineTo(w * 0.34, h * 0.15);
  ctx.lineTo(w * 0.35, h * 0.05);
  ctx.lineTo(w * 0.46, h * 0.14);
  ctx.lineTo(w * 0.50, h * 0.25);
  ctx.lineTo(w * 0.30, h * 0.38);
  ctx.closePath();
  ctx.fill();

  // Head Silhouette Profile
  ctx.fillStyle = '#f5c6a5';
  ctx.beginPath();
  ctx.moveTo(w * 0.35, h * 0.25);
  ctx.lineTo(w * 0.58, h * 0.28); // Forehead
  ctx.lineTo(w * 0.64, h * 0.36); // Brow
  ctx.lineTo(w * 0.70, h * 0.46); // Nose Tip
  ctx.lineTo(w * 0.60, h * 0.49); // Philtrum
  ctx.lineTo(w * 0.64, h * 0.54); // Lips
  ctx.lineTo(w * 0.60, h * 0.60); // Chin
  ctx.lineTo(w * 0.42, h * 0.64); // Jawline
  ctx.lineTo(w * 0.38, h * 0.85); // Neck Base
  ctx.lineTo(w * 0.20, h * 0.85); // Back of neck
  ctx.lineTo(w * 0.22, h * 0.45); // Behind ear
  ctx.closePath();
  ctx.fill();

  // Deep Neck Shadow (Target for blue glitch!)
  ctx.fillStyle = '#7a513b';
  ctx.beginPath();
  ctx.moveTo(w * 0.38, h * 0.52);
  ctx.lineTo(w * 0.44, h * 0.64);
  ctx.lineTo(w * 0.36, h * 0.82);
  ctx.lineTo(w * 0.24, h * 0.82);
  ctx.lineTo(w * 0.26, h * 0.56);
  ctx.closePath();
  ctx.fill();

  // Retro Oval Metallic Sunglasses
  ctx.fillStyle = '#1c1c1f';
  ctx.beginPath();
  ctx.ellipse(w * 0.55, h * 0.41, w * 0.12, h * 0.05, 0.08, 0, Math.PI * 2);
  ctx.fill();

  // Sunglass Specular Reflection
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(w * 0.52, h * 0.40, w * 0.05, h * 0.015, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Cell Phone held to ear
  ctx.fillStyle = '#222328';
  ctx.fillRect(w * 0.65, h * 0.48, w * 0.08, h * 0.25);

  return c.toDataURL('image/png');
}

function createInteriorPreset(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');

  // Warm Wooden Wall
  const wallGrad = ctx.createLinearGradient(0, 0, w, h);
  wallGrad.addColorStop(0, '#caa278');
  wallGrad.addColorStop(1, '#855e39');
  ctx.fillStyle = wallGrad;
  ctx.fillRect(0, 0, w, h);

  // Sunlight beam diagonally across
  ctx.fillStyle = 'rgba(255, 245, 220, 0.35)';
  ctx.beginPath();
  ctx.moveTo(w * 0.1, 0);
  ctx.lineTo(w * 0.8, 0);
  ctx.lineTo(w, h * 0.7);
  ctx.lineTo(0, h * 0.9);
  ctx.closePath();
  ctx.fill();

  // Modern Floating Wooden Stairs
  for (let i = 0; i < 5; i++) {
    const sy = h * (0.55 + i * 0.08);
    const sx = w * (0.12 + i * 0.06);
    const sw = w * 0.65;
    const sh = 18;

    // Tread
    ctx.fillStyle = '#5c3922';
    ctx.fillRect(sx, sy, sw, sh);

    // Tread Highlight
    ctx.fillStyle = '#deb887';
    ctx.fillRect(sx, sy, sw, 3);
  }

  // Pothos Houseplant Leaves (Deep green cascading)
  ctx.fillStyle = '#224d26';
  for (let i = 0; i < 40; i++) {
    const lx = w * 0.45 + (Math.random() - 0.5) * (w * 0.35);
    const ly = h * 0.25 + Math.random() * (h * 0.4);
    const rot = (Math.random() - 0.5) * Math.PI;

    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(rot);
    ctx.beginPath();
    ctx.ellipse(0, 0, 20, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  return c.toDataURL('image/png');
}
