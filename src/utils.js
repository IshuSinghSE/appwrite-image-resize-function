const parseBackground = (bg) => {
  if (!bg) return { r: 255, g: 255, b: 255, alpha: 1 };
  if (typeof bg === 'string') {
    // Hex string: #fff, #ffffff, #ffffffff
    let hex = bg.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
    if (hex.length === 6) hex += 'ff';
    if (hex.length === 8) {
      const r = parseInt(hex.slice(0,2), 16);
      const g = parseInt(hex.slice(2,4), 16);
      const b = parseInt(hex.slice(4,6), 16);
      const alpha = parseInt(hex.slice(6,8), 16) / 255;
      return { r, g, b, alpha };
    }
  }
  if (Array.isArray(bg) && (bg.length === 3 || bg.length === 4)) {
    const [r, g, b, a = 1] = bg;
    return { r, g, b, alpha: a };
  }
  if (typeof bg === 'object' && bg.r !== undefined && bg.g !== undefined && bg.b !== undefined) {
    return { r: bg.r, g: bg.g, b: bg.b, alpha: bg.alpha ?? 1 };
  }
  return { r: 255, g: 255, b: 255, alpha: 1 };
};

export default parseBackground;
