/**
 * Generates the authentic "Alpha Prompt" from the reference video,
 * populated with the user's active color, labels, and parameters.
 */

export function generateAlphaPrompt({
  colorName = 'yellow',
  colorHex = '#FFE600',
  labels = ['subject_track', 'head', 'torso'],
  detectionMode = 'combined'
}) {
  const labelList = labels.length > 0 ? labels.join(', ') : 'subject_track, head, torso';

  return `Use the attached image as the exact base image. Preserve its original colours, subject, pose, composition, camera angle, lighting, and environment. Add a combined computer-vision tracking and memory-corruption effect.

Overlay thin ${colorName} (${colorHex}) detection boxes around the main subject and its recognizable parts. Use nested and slightly overlapping boxes where appropriate, precisely aligned to the shapes in the image. Add small technical labels such as ${labelList}, plus a frame number and confidence value. Place a few tiny red tracking crosses at key points. The overlay should look like a machine-vision system analysing this specific image.

Within selected areas of the tracked subject, introduce memory corruption: irregular ${colorName} blocks that replace portions of the image as though visual data has failed to load. Mix sharp pixelated edges with a few fragmented silhouettes and tiny rows of white diagnostic code embedded in the corrupted areas. Let some fragments interrupt the subject’s outline, while keeping the subject clearly recognizable.

Make the two effects interact. Concentrate the corruption around tracked areas (${detectionMode} regions), and allow a few detection boxes to be partially obscured by corrupted data. Keep the rest of the original image intact, including its colour and natural texture.

Keep the tracking geometry crisp and the corruption deliberately irregular. Avoid generic glitch streaks, cyberpunk glow, holographic panels, or large blocks of unrelated text. 

Output one finished image in the original aspect ratio.`;
}
