const { connectToPostgres } = require('./connectPostgreSQL');

let pool;

const initializeDB = async () => {
    pool = await connectToPostgres();
};

const query = async (tableName, queryObject, options = {}, callback) => {
    try {
        const keys = Object.keys(queryObject);
        const values = Object.values(queryObject);

        const whereClause = keys.length
            ? `WHERE ${keys
                  .map((key, i) => `${key} = $${i + 1}`)
                  .join(' AND ')}`
            : '';
        const columns = options.columns ? options.columns.join(', ') : '*';
        const orderBy = options.orderBy ? `ORDER BY ${options.orderBy}` : '';
        const limit = options.limit ? `LIMIT ${options.limit}` : '';
        const offset = options.offset ? `OFFSET ${options.offset}` : '';
        const text = `SELECT ${columns} FROM ${tableName} ${whereClause} ${orderBy} ${limit} ${offset}`;
        const res = await pool.query(text, values);
        callback(null, res.rows);
    } catch (err) {
        console.log(err);
        callback(err);
    }
};

module.exports = { query, initializeDB };
