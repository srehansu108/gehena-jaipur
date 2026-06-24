const cacheService = require('../services/cacheService');

const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `route:${req.originalUrl}`;
    
    try {
      const cachedData = await cacheService.get(key);
      
      if (cachedData) {
        return res.json(cachedData);
      }
      
      // Store original send function
      const originalSend = res.json.bind(res);
      
      // Override send function to cache response
      res.json = function(data) {
        // Cache successful responses
        if (data.success !== false) {
          cacheService.set(key, data, duration);
        }
        return originalSend(data);
      };
      
      next();
    } catch (error) {
      next();
    }
  };
};

module.exports = cacheMiddleware;