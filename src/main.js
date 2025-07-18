import resizeImage from './resizeImage.js';
// import NodeCache from 'node-cache';

// const cache = new NodeCache({ stdTTL: 3600, checkperiod: 120 }); // 1 hour TTL

// This Appwrite function will be executed every time your function is triggered
export default async ({ req, res, log, error }) => {

  if (req.path === '/ping') {
    return res.json({ message: 'Pong' });
  }

  if (req.path === '/resize') {
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
      cache.set(cacheKey, outputBuffer);
      log(`Cache set for ${cacheKey}`);
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
