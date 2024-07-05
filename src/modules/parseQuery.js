const parseQuery = (overpassQL) => {
    try {
        const conditionRegex = /(\w+)\["(\w+)"="(\w+)"\]/;

        const conditionMatch = overpassQL.match(conditionRegex);

        if (!conditionMatch) {
            throw new Error('Invalid Overpass QL query');
        }

        const elementType = conditionMatch[1];

        const keyValues = {};
        const keyValueRegex = /\["(\w+)"="(\w+)"\]/g;
        let keyValueMatch;
        while ((keyValueMatch = keyValueRegex.exec(overpassQL)) !== null) {
            const key = keyValueMatch[1];
            const value = keyValueMatch[2];
            keyValues[key] = value;
        }

        const queryObject = {};

        Object.entries(keyValues).forEach(([key, value]) => {
            queryObject[`${key}`] = value;
        });

        return queryObject;
    } catch (err) {
        return { error: err.message };
    }
};

module.exports = { parseQuery };
