const { query } = require('../../config/db');

const interpreter = {
    get: (__query__, callback) => {
        return query('interpreter', __query__, (err, results) => {
            if (err) return callback(err);
            return callback(null, results);
        });
    },
};

module.exports = interpreter;
