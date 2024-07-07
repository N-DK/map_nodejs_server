const { parseQuery } = require('../modules/parseQuery');
const redisClient = require('../services/redis');
const { cacheKey } = require('../utils');

async function cache(req, res, next) {
    const key = cacheKey('interpreter', parseQuery(req?.query?.data));
    if (!redisClient.isReady) {
        return next();
    }
    try {
        const data = await redisClient.get(key);
        if (data !== null) {
            return res.json({
                version: 0.1,
                osm3s: {
                    copyright:
                        'The data included in this document is from www.openstreetmap.org. The data is made available under ODbL.',
                },
                element: JSON.parse(data),
                data_from: 'cache',
            });
        } else {
            next();
        }
    } catch (error) {
        console.log('Redis cache error:', error);
        next();
    }
}

function cacheData(cacheKey, data, expirationInSeconds = 3600) {
    if (redisClient.isReady) {
        redisClient.setEx(cacheKey, expirationInSeconds, JSON.stringify(data));
    }
}

module.exports = { cache, cacheData };
