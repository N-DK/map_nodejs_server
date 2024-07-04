const { connectToPostgres } = require('./connectPostgreSQL');

let pool;

const initializeDB = async () => {
    pool = await connectToPostgres();
};

const query = async (tableName, queryObject, callback) => {
    try {
        const keys = Object.keys(queryObject);
        const values = Object.values(queryObject);
        const whereClause = keys
            .map((key, i) => `${key} = $${i + 1}`)
            .join(' AND ');
        const text = `SELECT * FROM ${tableName} WHERE ${whereClause}`;
        const res = await pool.query(text, values);
        callback(null, res.rows);
    } catch (err) {
        console.log(err);
        callback(err);
    }
};

module.exports = { query, initializeDB };
