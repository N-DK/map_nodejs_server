const { query } = require('../../config/db/postgreSQLTool');

const interpreter = {
    get: (__query__, callback) => {
        return query(
            `public.planet_osm_${__query__.elementType}`,
            __query__.conditions,
            {
                columns: [
                    'osm_id',
                    'way',
                    'highway',
                    'name',
                    'minspeed',
                    'maxspeed',
                    'ref',
                ],
            },
            (err, results) => {
                if (err) return callback(err);
                return callback(null, results);
            },
        );
    },
};

module.exports = interpreter;
