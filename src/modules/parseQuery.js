const parseQuery = (overpassQL) => {
    try {
        const conditionRegex = /(\w+)(?:\((\d+)\))?\["(\w+)"="(\w+)"\]/;
        const idPatternRegex = /(\w+)\((\d+)\)/;

        const conditionMatch = overpassQL.match(conditionRegex);
        const idPatternMatch = overpassQL.match(idPatternRegex);

        if (!idPatternMatch && !conditionMatch) {
            return {
                error: `parse error: Unknown output format: ${overpassQL}`,
            };
        }

        if (idPatternMatch && !conditionMatch) {
            const elementType = idPatternMatch[1];
            const elementId = idPatternMatch[2];

            return {
                elementType,
                conditions: {
                    osm_id: elementId,
                },
            };
        }

        const elementType = conditionMatch[1];
        const elementId = conditionMatch[2] || null;

        if (!conditionMatch) {
            throw new Error('Invalid Overpass QL query');
        }

        const keyValues = {};
        const keyValueRegex = /\["(\w+)"="(\w+)"\]/g;
        let keyValueMatch;
        while ((keyValueMatch = keyValueRegex.exec(overpassQL)) !== null) {
            const key = keyValueMatch[1];
            const value = keyValueMatch[2];
            keyValues[key] = value;
        }

        return {
            elementType,
            conditions: {
                ...keyValues,
                ...(elementId && { osm_id: elementId }),
            },
        };
    } catch (err) {
        return { error: err.message };
    }
};

module.exports = { parseQuery };
