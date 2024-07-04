const { parseGeometry } = require('../modules/geometryParser');

const cacheKey = (collectionName, query) =>
    `${collectionName}:${JSON.stringify(query)}`;

const formatResults = (results) => {
    return results.map((result) => ({
        type: result.type || 'way',
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
    }));
};

module.exports = { cacheKey, formatResults };

// /!\         // only vietnam regions
// const boundingBoxRegex = /\(([\d.]+),([\d.]+),([\d.]+),([\d.]+)\)/;
// const boundingBoxMatch = overpassQL.match(boundingBoxRegex);
// Extract bounding box
// const boundingBox = boundingBoxMatch.slice(1).map(Number);
