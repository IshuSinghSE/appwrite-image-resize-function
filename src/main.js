import Busboy from 'busboy';
import resizeImage from './resizeImage.js';
// import NodeCache from 'node-cache';

// const cache = new NodeCache({ stdTTL: 3600, checkperiod: 120 }); // 1 hour TTL

// This Appwrite function will be executed every time your function is triggered
export default async ({ req, res, log, error }) => {
  if (req.path === '/ping') {
    return res.json({ message: 'Pong' });
  }

  if (req.path === '/resize') {
    if (req.method === 'POST') {
      // Parse multipart form-data from req.bodyText
      const contentType =
        req.headers['content-type'] || req.headers['Content-Type'] || '';
      if (contentType.startsWith('multipart/form-data')) {
        // Minimal multipart parser (no external deps)
        const boundaryMatch = contentType.match(/boundary=(.*)$/);
        if (!boundaryMatch) return res.text('Missing multipart boundary');
        const boundary = boundaryMatch[1];
        const parts = req.bodyText.split('--' + boundary);
        let fields = {};
        let buffer = null;
        for (const part of parts) {
          if (part.includes('Content-Disposition')) {
            // Extract name
            const nameMatch = part.match(/name="([^"]+)"/);
            const name = nameMatch ? nameMatch[1] : null;
            // Extract filename (if file)
            const filenameMatch = part.match(/filename="([^"]+)"/);
            // Extract value or file
            const splitIndex = part.indexOf('\r\n\r\n');
            if (splitIndex !== -1 && name) {
              let value = part.slice(splitIndex + 4);
              // Remove only the trailing boundary if present, but do not trim \r\n from file data
              if (filenameMatch) {
                // File upload
                // Remove trailing boundary marker if present
                const boundaryMarker = `\r\n--${boundary}`;
                if (value.endsWith(boundaryMarker)) {
                  value = value.slice(0, -boundaryMarker.length);
                }
                buffer = Buffer.from(value, 'latin1');
              } else {
                // For fields, trim trailing newlines
                value = value.replace(/\r\n--$/, '').replace(/\r\n$/, '');
                fields[name] = value;
              }
            }
          }
        }
        const { url, width, height, format = 'webp', quality = 80 } = fields;
        if (!buffer && !url) {
          return res.text('Missing image URL or file upload');
        }
        try {
          const outputBuffer = await resizeImage({
            url: url || null,
            width,
            height,
            format,
            quality,
            buffer,
          });
          return res.binary(outputBuffer, `image/${format}`);
        } catch (err) {
          error('Image resize error: ' + err.message);
          return res.text('Error: ' + err.message);
        }
      } else if (contentType.startsWith('application/json')) {
        // Parse JSON body
        let body;
        try {
          body = JSON.parse(req.bodyText);
        } catch (err) {
          return res.text('Invalid JSON');
        }
        const { url, width, height, format = 'webp', quality = 80 } = body;
        if (!url) return res.text('Missing image URL');
        try {
          const outputBuffer = await resizeImage({
            url,
            width,
            height,
            format,
            quality,
          });
          return res.binary(outputBuffer, `image/${format}`);
        } catch (err) {
          error('Image resize error: ' + err.message);
          return res.text('Error: ' + err.message);
        }
      } else {
        return res.text('Unsupported content-type');
      }
    }

    const {
      url,
      width,
      height,
      format = 'webp',
      quality = 80,
    } = req.query || {};
    if (!url) return res.text('Missing image URL');

    // Use filename as cache key (for local files) or hash of url+params for remote
    // let cacheKey;
    // if (/^https?:\/\//i.test(url)) {
    //   // Remote: hash url+params
    //   cacheKey = `${url}|${width}|${height}|${format}|${quality}`;
    // } else {
    //   // Local: use filename+params
    //   cacheKey = `${url}|${width}|${height}|${format}|${quality}`;
    // }

    // const cached = cache.get(cacheKey);
    // if (cached) {
    //   log(`Cache hit for ${cacheKey}`);
    //   return res.binary(cached, `image/${format}`);
    // }

    try {
      const outputBuffer = await resizeImage({
        url,
        width,
        height,
        format,
        quality,
      });
      // cache.set(cacheKey, outputBuffer);
      // log(`Cache set for ${cacheKey}`);
      return res.binary(outputBuffer, `image/${format}`);
    } catch (err) {
      error('Image resize error: ' + err.message);
      return res.text('Error: ' + err.message);
    }
  }

  return res.json({
    message: 'Welcome to the Appwrite Function!',
  });
};
