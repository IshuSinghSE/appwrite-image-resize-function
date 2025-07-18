import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';
/**
 * Resize an image from a local file or remote URL using sharp.
 *
 * @param {Object} options - Resize options
 * @param {string} options.url - Local file path or remote image URL
 * @param {number|string} options.width - Target width
 * @param {number|string} options.height - Target height
 * @param {string} [options.format='webp'] - Output format: webp, jpeg, png
 * @param {number|string} [options.quality=80] - Output quality (1-100)
 * @param {string} [options.fit='inside'] - Resize fit: cover, contain, fill, inside, outside
 * @param {string} [options.position='centre'] - Position for fit modes
 * @param {string|object|array} [options.background] - Background color (hex, rgb[a], or object)
 * @param {number} [options.rotate=0] - Degrees to rotate
 * @param {boolean} [options.crop=false] - Crop to exact size
 * @param {boolean} [options.progressive=true] - Progressive output for jpeg/webp
 * @param {boolean} [options.withMetadata=false] - Preserve image metadata
 * @returns {Promise<Buffer>} - Resized image buffer
 * @throws {Error} - On invalid input or processing failure
 */

const SUPPORTED_FORMATS = ['webp', 'jpeg', 'png'];

const isLocalPath = (url) => !/^https?:\/\//i.test(url);

const resizeImage = async ({
  url,
  width,
  height,
  format = 'webp',
  quality = 80,
  fit = 'inside',
  position = 'centre',
  background = { r: 255, g: 255, b: 255, alpha: 1 },
  rotate = 0,
  crop = false,
  progressive = true,
  withMetadata = false
}) => {
  // Input validation
  if (!url) throw new Error('Missing image URL');
  if (!width || !height || isNaN(width) || isNaN(height)) throw new Error('Invalid width or height');
  if (!SUPPORTED_FORMATS.includes(format)) throw new Error(`Unsupported format: ${format}`);
  if (isNaN(quality) || quality < 1 || quality > 100) throw new Error('Quality must be between 1 and 100');
  if (typeof rotate !== 'number') throw new Error('Rotate must be a number');
  if (typeof progressive !== 'boolean') throw new Error('Progressive must be boolean');
  if (typeof withMetadata !== 'boolean') throw new Error('withMetadata must be boolean');

  let buffer;
  if (isLocalPath(url)) {
    buffer = await fs.readFile(path.resolve(url));
  } else {
    // Fetch image with timeout
    let response;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
    } catch (err) {
      throw new Error(`Failed to fetch image: ${err.message}`);
    }
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);

    try {
      buffer = await response.arrayBuffer();
    } catch (err) {
      throw new Error('Failed to read image buffer');
    }
  }

  try {
    let image = sharp(buffer);
    if (rotate) image = image.rotate(rotate);
    const bgObj = parseBackground(background);
    image = image.resize(Number(width), Number(height), {
      fit,
      position,
      background: bgObj,
      withoutEnlargement: true
    });
    if (crop) image = image.extract({ left: 0, top: 0, width: Number(width), height: Number(height) });
    if (format === 'webp') {
      image = image.webp({ quality: Number(quality), alphaQuality: Number(quality), force: true, smartSubsample: true, nearLossless: false, lossless: false, effort: 4, progressive });
    } else if (format === 'jpeg') {
      image = image.jpeg({ quality: Number(quality), progressive, force: true });
    } else if (format === 'png') {
      image = image.png({ compressionLevel: 9, force: true });
    }
    if (withMetadata) image = image.withMetadata();
    return await image.toBuffer();
  } catch (err) {
    throw new Error(`Image processing error: ${err.message}`);
  }
};

export default resizeImage;