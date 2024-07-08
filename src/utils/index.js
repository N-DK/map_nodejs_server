const { parseGeometry } = require('../modules/geometryParser');

const cacheKey = (collectionName, query) =>
    `${collectionName}:${JSON.stringify(query)}`;

const formatOutput = (results) => {
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

function handleError(res, message) {
    return res.send(`
        <div>
            <h4 style="color: red; display: inline;">Error:</h4>
            <span>${message}</span>
        </div>
    `);
}

function checkQueryValidity(query) {
    if (query.error) {
        return query.error;
    }
    if (query.elementType !== 'node' && query.elementType !== 'way') {
        return `Unknown type "${query.elementType}". Static error: For the attribute "type" of the element "query" the only allowed values are "node", "way"`;
    }
    return null;
}

module.exports = { cacheKey, formatOutput, handleError, checkQueryValidity };
