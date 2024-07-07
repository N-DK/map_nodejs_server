const express = require('express');
const route = require('./routes');
const redisClient = require('./services/redis');
const { initializeDB } = require('./config/db/postgreSQLTool');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;

var bodyParser = require('body-parser');
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Connect Redis && MongoDB
const connect = async () => {
    try {
        await initializeDB();
        await redisClient.connect();
    } catch (error) {
        console.log(error);
    }
};

connect();

route(app);

app.listen(port, () => {
    console.log(`App listening on port =>> ${port}`);
});
