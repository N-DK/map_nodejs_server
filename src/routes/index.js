const apiRouter = require('../routes/api');

function route(app) {
    app.use('/api/v1', apiRouter);
}

module.exports = route;
