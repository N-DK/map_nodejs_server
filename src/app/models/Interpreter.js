const { query } = require('../../config/db/postgreSQLTool');

const interpreter = {
    get: (__query__, callback) => {
        return query('public.planet_osm_roads', __query__, (err, results) => {
            if (err) return callback(err);
            return callback(null, results);
        });
    },
};

module.exports = interpreter;
