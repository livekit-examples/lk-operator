/**
 * Convert normalized browser coordinates (0-1) to pixel position
 * within a video element, accounting for object-fit: contain letterboxing.
 */
export function browserToScreenCoords(
  normalizedX: number,
  normalizedY: number,
  videoEl: HTMLVideoElement
): { x: number; y: number } | null {
  if (!videoEl.videoWidth || !videoEl.videoHeight) return null;

  const rect = videoEl.getBoundingClientRect();
  const videoAspect = videoEl.videoWidth / videoEl.videoHeight;
  const elemAspect = rect.width / rect.height;

  let renderW: number, renderH: number, offsetX: number, offsetY: number;

  if (videoAspect > elemAspect) {
    // Video wider than container: letterbox top/bottom
    renderW = rect.width;
    renderH = rect.width / videoAspect;
    offsetX = 0;
    offsetY = (rect.height - renderH) / 2;
  } else {
    // Video taller than container: letterbox left/right
    renderH = rect.height;
    renderW = rect.height * videoAspect;
    offsetX = (rect.width - renderW) / 2;
    offsetY = 0;
  }

  return {
    x: offsetX + normalizedX * renderW,
    y: offsetY + normalizedY * renderH,
  };
}
