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

const processGeometry = (geom) => {
    let geometry;

    if (geom instanceof Array) {
        const transformedPoints = geom.map((point) => {
            const lonLat = proj4('EPSG:4326', 'EPSG:3857', [
                point.lon,
                point.lat,
            ]);
            return { lon: lonLat[0], lat: lonLat[1] };
        });

        geometry = `LINESTRING(${transformedPoints
            .map((point) => `${point.lon} ${point.lat}`)
            .join(', ')})`;
    } else {
        const lonLat = proj4('EPSG:4326', 'EPSG:3857', [geom.lon, geom.lat]);
        geometry = `POINT(${lonLat[0]} ${lonLat[1]})`;
    }

    return wkx.Geometry.parse(geometry).toWkt();
};

const insertOrUpdate = async (tableName, data, queryObject, callback) => {
    try {
        const keys = Object.keys(data);
        const queryKeys = Object.keys(queryObject);
        const queryValues = Object.values(queryObject);
        const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
        const whereClause = queryKeys.length
            ? `WHERE ${queryKeys
                  .map((key, i) => `${key} = $${keys.length + i + 1}`)
                  .join(' AND ')}`
            : '';

        data['way'] = processGeometry(data['way']);

        const values = Object.values(data);
        const text =
            queryKeys.length > 0
                ? `UPDATE ${tableName} SET ${setClause} ${whereClause} RETURNING *`
                : `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${keys
                      .map((_, i) => `$${i + 1}`)
                      .join(', ')}) RETURNING *`;

        const res = await pool.query(text, [...values, ...queryValues]);
        callback(null, res.rows);
    } catch (err) {
        console.error('Error:', err);
        callback(err);
    }
};

module.exports = { query, initializeDB, insertOrUpdate };
