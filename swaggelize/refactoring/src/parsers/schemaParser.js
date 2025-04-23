function parseInputOutput(collections) {
    const result = [];
    if (collections) {
        for (const group of Object.values(collections)) {
            for (const [route, methods] of Object.entries(group)) {
                for (const [method, config] of Object.entries(methods)) {
                    result.push({
                        method: method.toUpperCase(),
                        route,
                        input: config.input || [],
                        output: config.output || []
                    });
                }
            }
        }
    }
    return result;
}

module.exports = parseInputOutput;