const { Pool } = require('pg');
require('dotenv').config();

const pgConfig = {
    connectionString: process.env.POSTGRES_CONNECT_URI,
};

const pool = new Pool(pgConfig);

const connectToPostgres = async () => {
    try {
        await pool.connect();
        console.log('Connected to PostgreSQL');
        return pool;
    } catch (err) {
        console.log('Failed to connect to the database. Error:', err);
        process.exit(1);
    }
};

module.exports = { connectToPostgres };
