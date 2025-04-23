const yaml = require("js-yaml");
const { getEndPointsApi, getVariablesIdFromPath, getVariablesFromPath } = require("../utils/utils");
const parseRouteParams = require("./routeParser");
const parseInput = require("./schemaParser");

/**
 * extract the model name from the service file
 * @param content
 * @returns {string[]}
 */
function getModelName(content) {
    return Object.keys(content)
}

function generateParameter(variableId, model) {
    return {
        "in": "path",
        "name": variableId,
        "schema": {
            "type": "number"
        },
        "required": true,
        "description": `${model} ID`
    }
}

/**
 * parse collection operations in service yaml file
 * @param service
 * @returns {{default: {}, custom: {}}|null}
 */
function parseCollectionOperations(service) {
    const operations = { default: {}, custom: {} };
    const [model] = getModelName(service);
    const modelNameLower = model.toLowerCase();
    const { collectionOperations } = service[model];
    if (collectionOperations) {
        Object.entries(collectionOperations)?.forEach(([method, details]) => {
            const routeData = {
                summary: details.openapi_context.summary,
                description: details.openapi_context.description,
                tags: details.tags ?? model,
                input: details.input,
                output: details.output
            };

            if (['post', 'get'].includes(method)) {
                const route = `/${modelNameLower}s`;
                if (!operations["default"][route]) {
                    operations["default"][route] = {};
                }
                operations["default"][route][method] = routeData;
            } else {
                const route = details.path;
                if (!operations["custom"][route]) {
                    operations["custom"][route] = {};
                }
                const customMethod = details.method.toLowerCase();
                operations["custom"][route][customMethod] = routeData;
            }
        });

        return operations;
    }
    return null;
}

function parseItemOperations(service, paths) {
    const operations = { default: {}, custom: {} };
    const [model] = getModelName(service);
    const modelNameLower = model.toLowerCase();
    const { itemOperations } = service[model];

    if (itemOperations) {
        Object.entries(itemOperations)?.forEach(([method, details]) => {
            const routeData = {
                summary: details.openapi_context.summary,
                description: details.openapi_context.description,
                tags: details.tags ?? model,
                input: details.input,
                output: details.output,
                parameters: []
            };
            // const variableId = "{" + getVariablesIdFromPath(paths, modelNameLower) + "}" ?? ""
            const variable = getVariablesIdFromPath(paths, modelNameLower);
            const variableId = variable ? "{" + getVariablesIdFromPath(paths, modelNameLower) + "}" : ""
            const params = parseRouteParams(details.path);
            if (params) {
                routeData.parameters.push(...params);
            }
            if (['put', 'get', 'delete'].includes(method)) {
                const route = `/${modelNameLower}s/${variableId}`;
                if (!operations["default"][route]) {
                    operations["default"][route] = {};
                }
                operations["default"][route][method] = routeData;

                const param = generateParameter(variable, model);

                routeData.parameters.push(param);
                operations["default"][route][method].parameters[variable] = param;
            } else {
                const route = details.path;
                if (!operations["custom"][route]) {
                    operations["custom"][route] = {};
                }
                const customMethod = details.method.toLowerCase();
                operations["custom"][route][customMethod] = routeData;
            }
        });

        return operations;
    }
    return null;
}

/**
 * parse service yaml file
 * @param content
 * @param routesVariable
 * @returns {{collectionOperations: {default: {}, custom: {}}, itemOperations: {default: {}, custom: {}}}}
 */
function serviceParser(content, routesVariable) {
    const parsedYaml = yaml.load(content);

    const paths = getEndPointsApi(routesVariable);
    const collectionOperations = parseCollectionOperations(parsedYaml);
    const itemOperations = parseItemOperations(parsedYaml, paths);
    return {
        collectionOperations,
        itemOperations
    };
}

module.exports = {
    serviceParser,
    parseCollectionOperations,
    getModelName,
    parseItemOperations
};