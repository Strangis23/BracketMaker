/** Convert Android density-independent pixels to CSS pixels in the WebView. */
export function dpToPx(dp: number): number {
  if (!Number.isFinite(dp) || dp <= 0) return 0;
  return Math.round(dp * (window.devicePixelRatio || 1));
}
