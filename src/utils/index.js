const { parseGeometry } = require('../modules/geometryParser');

const cacheKey = (collectionName, query) =>
    `${collectionName}:${JSON.stringify(query)}`;

const formatResults = (results) => {
    return results.map((result) => {
        switch (result.type) {
            case 'node': {
                let tags = {};
                Object.keys(result).forEach((key) => {
                    if (
                        result[key] !== null &&
                        key !== 'type' &&
                        key !== 'osm_id' &&
                        key !== 'way' &&
                        key !== 'osm_type'
                    ) {
                        tags[key] = result[key];
                    }
                });
                return {
                    type: result.type,
                    id: result.osm_id,
                    lat: parseGeometry(result.way).coordinates[0].lat,
                    lon: parseGeometry(result.way).coordinates[0].lon,
                    tags,
                };
            }

            case 'way': {
                return {
                    type: result.type,
                    id: result.osm_id,
                    bounds: parseGeometry(result.way).bounds,
                    geometry: parseGeometry(result.way).coordinates,
                    tags: {
                        highway: result.highway,
                        name: result.name,
                        minspeed: result.minspeed,
                        maxspeed: result.maxspeed,
                        ref: result.ref,
                    },
                };
            }

            default: {
                throw new Error('Invalid result type');
            }
        }
    });
};

module.exports = { cacheKey, formatResults };
