/** Original transparent identity masks, shared by UI and print. External launcher assets stay separate. */
export const brandArtwork = {
  full: {
    source: require('../../../assets/branding/kodax-full-purple-transparent.png'),
    box: { left: 458, top: 210, width: 1132, height: 382, imageW: 2032, imageH: 774 },
  },
  symbol: {
    source: require('../../../assets/branding/kodax-symbol-purple-transparent.png'),
    box: { left: 234, top: 223, width: 757, height: 810, imageW: 1254, imageH: 1254 },
  },
} as const;

/** HTML printing cannot use RN tintColor; a color matrix preserves the same source alpha. */
export function brandPrintSVG(uri: string, width = 220, light = false) {
  const b = brandArtwork.full.box;
  const color = light ? [49 / 255, 30 / 255, 66 / 255] : [1, 1, 1];
  const matrix = `0 0 0 0 ${color[0]} 0 0 0 0 ${color[1]} 0 0 0 0 ${color[2]} 0 0 0 1 0`;
  const safeUri = uri.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  const filterId = light ? 'kodax-purple' : 'kodax-white';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${width * b.height / b.width}" viewBox="${b.left} ${b.top} ${b.width} ${b.height}" role="img" aria-label="Kodax"><defs><filter id="${filterId}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="${matrix}"/></filter></defs><image href="${safeUri}" width="${b.imageW}" height="${b.imageH}" filter="url(#${filterId})"/></svg>`;
}
