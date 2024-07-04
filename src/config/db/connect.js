const { MongoClient } = require('mongodb');
require('dotenv').config();

const mongoConfig = {
    url: process.env.MONGODB_CONNECT_URI,
    dbName: 'map_server',
};

let db = null;

const connectToMongo = async () => {
    if (db) {
        return db;
    }

    try {
        const client = await MongoClient.connect(mongoConfig.url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        db = client.db(mongoConfig.dbName);
        await db
            .collection('interpreter')
            .createIndex({ geometry: '2dsphere' });
        console.log('Connected to MongoDB');
        return db;
    } catch (err) {
        console.log('Failed to connect to the database. Error:', err);
        process.exit(1);
    }
};

module.exports = { connectToMongo };
