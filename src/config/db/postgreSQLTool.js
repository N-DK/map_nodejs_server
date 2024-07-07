const { connectToPostgres } = require('./connectPostgreSQL');
const proj4 = require('proj4');
const wkx = require('wkx');

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

const insert = async (tableName, data, callback) => {
    try {
        const keys = Object.keys(data);

        switch (tableName) {
            case 'public.planet_osm_node': {
                const geom = data['way'];
                const lonLat = proj4('EPSG:4326', 'EPSG:3857', [
                    geom.lon,
                    geom.lat,
                ]);

                const pointWKT = `POINT(${lonLat[0]} ${lonLat[1]})`;
                const geometry = wkx.Geometry.parse(pointWKT).toWkt();

                data['way'] = geometry;

                break;
            }

            case 'public.planet_osm_way': {
                const geom = data['way'];

                const transformedPoints = geom.map((point) => {
                    const lonLat = proj4('EPSG:4326', 'EPSG:3857', [
                        point.lon,
                        point.lat,
                    ]);
                    return { lon: lonLat[0], lat: lonLat[1] };
                });

                const lineStringWKT = `LINESTRING(${transformedPoints
                    .map((point) => `${point.lon} ${point.lat}`)
                    .join(', ')})`;

                const geometry = wkx.Geometry.parse(lineStringWKT).toWkt();

                data['way'] = geometry;
                break;
            }
        }

        const values = Object.values(data);
        const text = `INSERT INTO ${tableName} (${keys.join(
            ', ',
        )}) VALUES (${keys.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *`;
        const res = await pool.query(text, values);
        callback(null, res.rows);
    } catch (err) {
        console.error('Error:', err);
        callback(err);
    }
};

const update = async (tableName, queryObject, data, callback) => {
    try {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const queryKeys = Object.keys(queryObject);
        const queryValues = Object.values(queryObject);
        const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
        const whereClause = queryKeys.length
            ? `WHERE ${queryKeys
                  .map((key, i) => `${key} = $${keys.length + i + 1}`)
                  .join(' AND ')}`
            : '';
        const text = `UPDATE ${tableName} SET ${setClause} ${whereClause} RETURNING *`;
        const res = await pool.query(text, [...values, ...queryValues]);
        callback(null, res.rows);
    } catch (err) {
        console.log(err);
        callback(err);
    }
};

module.exports = { query, initializeDB, insert, update };
