const { cacheData } = require('../../middleware/cache');
const { parseQuery } = require('../../modules/parseQuery');
const { cacheKey, formatResults } = require('../../utils');
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
                cacheData(
                    cacheKey('interpreter', query),
                    formatResults(results),
                    3600,
                );
                return res.json({
                    version: 0.1,
                    osm3s: {
                        copyright:
                            'The data included in this document is from www.openstreetmap.org. The data is made available under ODbL.',
                    },
                    elements: formatResults(results),
                });
            }
        });
    }
}

module.exports = new APIController();
