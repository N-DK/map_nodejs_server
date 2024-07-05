const proj4 = require('proj4');
const wkx = require('wkx');

proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');

const parseGeometry = (wkbString) => {
    const geom = wkx.Geometry.parse(Buffer.from(wkbString, 'hex'));
    if (geom.toGeoJSON().type === 'Point') {
        const [longitude, latitude] = proj4(
            'EPSG:3857',
            'EPSG:4326',
            geom.toGeoJSON().coordinates,
        );
        return {
            coordinates: [
                {
                    lat: Number(latitude.toFixed(7)),
                    lon: Number(longitude.toFixed(7)),
                },
            ],
        };
    }

    const coordinates = geom.toGeoJSON().coordinates.map((coord) => {
        const [longitude, latitude] = proj4('EPSG:3857', 'EPSG:4326', coord);
        return {
            lat: Number(latitude.toFixed(7)),
            lon: Number(longitude.toFixed(7)),
        };
    });

    const bounds = {
        minlat: Math.min(...coordinates.map((coord) => coord.lat)),
        minlon: Math.min(...coordinates.map((coord) => coord.lon)),
        maxlat: Math.max(...coordinates.map((coord) => coord.lat)),
        maxlon: Math.max(...coordinates.map((coord) => coord.lon)),
    };

    return { coordinates, bounds };
};

module.exports = { parseGeometry };
