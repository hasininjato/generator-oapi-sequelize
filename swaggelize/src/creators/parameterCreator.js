const { getEndPointsApi } = require("../utils/utils");
const { getVariablesFromPath, capitalizeFirstLetter } = require("../utils/utils");

/**
 * Create all parameters
 * @param {object} routesVariable 
 * @returns 
 */
function createParameters(routesVariable) {
    const paths = getEndPointsApi(routesVariable);
    const parameters = {};

    // First pass: Collect all unique parameters
    const seenParams = new Set();

    for (const path of Object.values(paths)) {
        const variables = getVariablesFromPath(path.path);
        if (!variables) continue;

        for (const variable of variables) {
            const key = `${variable.lastStaticSegment}:${variable.param}`;

            if (!seenParams.has(key)) {
                seenParams.add(key);

                const componentName = `${variable.lastStaticSegment}${capitalizeFirstLetter(variable.param)}`;
                parameters[componentName] = {
                    name: variable.param,
                    in: "path",
                    schema: {
                        type: "string"
                    },
                    required: true,
                    description: `${variable.lastStaticSegment} ${variable.param}`
                };
            }
        }
    }

    return parameters;
}

module.exports = createParameters;