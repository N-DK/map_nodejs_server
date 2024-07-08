const { cacheData } = require('../../middleware/cache');
const { parseQuery } = require('../../modules/parseQuery');
const {
    cacheKey,
    checkQueryValidity,
    handleError,
    formatOutput,
} = require('../../utils');
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

        const error = checkQueryValidity(query);
        if (error) {
            return handleError(res, error);
        }

        interpreter.get(query, (err, results) => {
            if (err) {
                return res.json({ result: 0, error: err });
            } else {
                if (results.length > 50000) {
                    return res.json({
                        version: 0.1,
                        osm3s: {
                            timestamp_osm_base: new Date().toISOString(),
                            copyright:
                                'The data included in this document is from www.openstreetmap.org. The data is made available under ODbL.',
                        },
                        elements: [],
                        remark: 'runtime error: Query run out of memory using about 2048 MB of RAM.',
                    });
                }
                results = results.map((res) => ({
                    ...res,
                    type: query.elementType,
                }));
                cacheData(
                    cacheKey('interpreter', query),
                    formatOutput(results),
                    3600,
                );
                return res.json({
                    version: 0.1,
                    osm3s: {
                        timestamp_osm_base: new Date().toISOString(),
                        copyright:
                            'The data included in this document is from www.openstreetmap.org. The data is made available under ODbL.',
                    },
                    elements: formatOutput(results),
                });
            }
        });
    }

    // [POST] interpreter/create
    createInterpreter(req, res, next) {
        const data = req?.body;
        if (!data) return res.json({ result: 0 });

        interpreter.create(data, (err, results) => {
            if (err) {
                return res.json({ result: 0, error: err });
            } else {
                return res.json({ result: 1, data: results });
            }
        });
    }

    // [PUT] interpreter/update
    updateInterpreter(req, res, next) {
        const data = req?.body;
        if (!data) return res.json({ result: 0 });

        interpreter.update(data, (err, results) => {
            if (err) {
                return res.json({ result: 0, error: err });
            } else {
                return res.json({ result: 1, data: results });
            }
        });
    }
}

module.exports = new APIController();
