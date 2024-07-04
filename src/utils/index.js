const cacheKey = (collectionName, query) =>
    `${collectionName}:${JSON.stringify(query)}`;

const parseQuery = (overpassQL) => {
    try {
        const conditionRegex = /(\w+)(\["(\w+)"="(\w+)"\])+/;
        const boundingBoxRegex = /\(([\d.]+),([\d.]+),([\d.]+),([\d.]+)\)/;

        const conditionMatch = overpassQL.match(conditionRegex);
        const boundingBoxMatch = overpassQL.match(boundingBoxRegex);

        if (!conditionMatch || !boundingBoxMatch) {
            throw new Error('Invalid Overpass QL query');
        }

        const elementType = conditionMatch[1]; // way, node, etc.

        // Extract key-value pairs
        const keyValues = [];
        const keyValueRegex = /\["(\w+)"="(\w+)"\]/g;
        let keyValueMatch;
        while ((keyValueMatch = keyValueRegex.exec(overpassQL)) !== null) {
            keyValues.push({ [keyValueMatch[1]]: keyValueMatch[2] });
        }

        const boundingBox = boundingBoxMatch.slice(1).map(Number); // [9.0, 102.0, 24.0, 110.0]
        const bottomLeft = [boundingBox[1], boundingBox[0]]; // [102.0, 9.0]
        const topRight = [boundingBox[3], boundingBox[2]]; // [110.0, 24.0]

        // Construct the MongoDB query
        const mongoQuery = {
            $and: [
                { type: elementType },
                {
                    geometry: {
                        $geoWithin: {
                            $geometry: {
                                type: 'Polygon',
                                coordinates: [
                                    [
                                        bottomLeft,
                                        [bottomLeft[0], topRight[1]],
                                        topRight,
                                        [topRight[0], bottomLeft[1]],
                                        bottomLeft,
                                    ],
                                ],
                            },
                        },
                    },
                },
                ...keyValues.map((kv) => {
                    const [key, value] = Object.entries(kv)[0];
                    return { [`properties.${key}`]: value };
                }),
            ],
        };

        return mongoQuery;
    } catch (err) {
        return { error: err.message };
    }
};

module.exports = { cacheKey, parseQuery };
