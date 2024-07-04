const { cacheData } = require('../../middleware/cache');
const { parseQuery, cacheKey } = require('../../utils');
const interpreter = require('../models/Interpreter');

class APIController {
    // [GET] /
    index(req, res, next) {
        res.json({ message: 'Hello World!' });
    }

    // [GET] interpreter/?data=<type>["key"="value"](south, west, north, east)
    getInterpreter(req, res, next) {
        const data = req?.query?.data;
        if (!data) return res.json({ result: 0 });
        const query = parseQuery(data);
        interpreter.get(query, (err, results) => {
            if (err) {
                return res.json({ result: 0, error: err });
            } else {
                cacheData(cacheKey('interpreter', query), results, 3600);
                return res.json({ result: 1, data: results });
            }
        });
    }
}

module.exports = new APIController();
