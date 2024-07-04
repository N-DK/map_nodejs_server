const redisClient = require('../services/redis');
const { parseQuery, cacheKey } = require('../utils');

async function cache(req, res, next) {
    const key = cacheKey('interpreter', parseQuery(req?.query?.data));
    try {
        const data = await redisClient.get(key);
        if (data !== null) {
            return res.json({
                result: 1,
                data: JSON.parse(data),
                from_data: 'cache',
            });
        } else {
            next();
        }
    } catch (error) {
        console.error('Redis cache error:', error);
        next();
    }
}

function cacheData(cacheKey, data, expirationInSeconds = 3600) {
    console.log('Caching data');
    redisClient.set(cacheKey, JSON.stringify(data), 'EX', expirationInSeconds);
}

module.exports = { cache, cacheData };
