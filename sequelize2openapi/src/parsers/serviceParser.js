const yaml = require("js-yaml");
const {getEndPointsApi, toPascalCase} = require("../utils/utils");
const {getVariablesFromPath, capitalizeFirstLetter} = require("../utils/utils");

/**
 * get the model name from the parsed yaml
 * @param {object} content
 * @returns string[]
 */
function getModelName(content) {
    return Object.keys(content)
}

/**
 * make plural the model name
 * @param {string} singular
 * @returns
 */
function pluralize(singular) {
    if (singular.endsWith('y')) {
        return singular.slice(0, -1) + 'ies';
    }
    return singular + 's';
}

/**
 * get default path & methods from express app routes
 * @param {string} model
 * @param {object} routesVariable
 * @param {string} routePrefix
 * @param {Boolean} isCollection
 * @returns
 */
function getDefaultPath(model, routesVariable, routePrefix, isCollection) {
    const paths = getEndPointsApi(routesVariable);
    const singular = model.toLowerCase();
    const plural = pluralize(singular);

    return paths.find(path => {
        const pathParts = path.path.split('/').filter(Boolean); // Remove empty strings

        // Must start with 'api' and may have a version segment
        if (pathParts[0] !== routePrefix.replace("/", "")) return false;

        // Determine position of model name based on whether there's a version
        const hasVersion = pathParts.length > 1 && pathParts[1].startsWith('v');
        const modelIndex = hasVersion ? 2 : 1;

        // Check if we have enough parts
        if (modelIndex >= pathParts.length) return false;

        // Check base cases (just model name)
        if (isCollection && modelIndex === pathParts.length - 1) {
            // Matches /api/users or /api/v1/users
            return pathParts[modelIndex] === singular || pathParts[modelIndex] === plural;
        }

        // Check parameter case (model name followed by parameter)
        if (!isCollection && modelIndex === pathParts.length - 2 && pathParts[modelIndex + 1].startsWith(':')) {
            return pathParts[modelIndex] === singular || pathParts[modelIndex] === plural;
        }

        return false;
    });
}

function getParameters(path) {
    const variables = getVariablesFromPath(path);
    let parameters = [];
    if (variables) {
        variables.forEach((variable) => {
            const key = `${variable.lastStaticSegment}${capitalizeFirstLetter(variable.param)}`;
            const parameter = {
                $ref: `#/components/parameters/${key}`
            }
            parameters.push(parameter);
        })
        return parameters;
    }
    return null;
}

/**
 * parse services operations (collection & item) and return OpenAPI specs
 * @param {object} operations
 * @param {object} routesVariable
 * @param {string} routePrefix
 * @param {string} model
 * @param {Boolean} isCollection
 * @returns
 */
function parseOperations(operations, routesVariable, routePrefix, model, isCollection) {
    const operationsResult = {};
    if (operations) {
        for (const [operationName, operation] of Object.entries(operations)) {
            const summary = operation.openapi_context?.summary || "";
            const description = operation.openapi_context?.description || "";
            const method = operation.method || operationName.toUpperCase(); // default to key if method not present
            let path = operation.path || getDefaultPath(model, routesVariable, routePrefix, isCollection)?.path; // path is not provided => default path
            if (path) {
                path = path.replace(routePrefix, "");
            } else {
                path = "";
            }

            // Skip if we couldn't determine a path
            if (!path) continue;

            // remove : and wrap param in {}
            const updatePath = path.replace(/:([a-zA-Z0-9_]+)/g, '{$1}');

            // Initialize the path object if it doesn't exist
            if (!operationsResult[updatePath]) {
                operationsResult[updatePath] = {};
            }
            const tags = operation.tags ? [operation.tags] : [model];
            // const parameter = getParameters(path, model);
            const parameter = getParameters(updatePath);

            // Add the method operation
            // add the custom path name to further processing
            let customOperation = {};
            customOperation = {
                customPath: toPascalCase(operationName),
            };
            operationsResult[updatePath][method.toLowerCase()] = {
                summary,
                description,
                tags,
                input: operation.input,
                output: operation.output,
                responses: operation.responses,
                filterableFields: operation.filterableFields,
                model: model,
                ...customOperation
            };
            if (method === "POST") {
                operationsResult[updatePath][method.toLowerCase()].isCreation = operation.isCreation ?? (operationName === "post" || true);
            }
            if (parameter) {
                operationsResult[updatePath][method.toLowerCase()]["parameters"] = [
                    ...parameter
                ]
            }
        }
    }

    return operationsResult;
}

/**
 * main parser for the service to call in index.js
 * @param {string} content
 * @param {string} routesVariable
 * @param {string} routePrefix
 */
function serviceParser(content, routesVariable, routePrefix) {
    let operationsResult = {};
    const parsedYaml = yaml.load(content);
    const [model] = getModelName(parsedYaml);
    const {collectionOperations, itemOperations} = parsedYaml[model];
    operationsResult = {
        ...parseOperations(collectionOperations, routesVariable, routePrefix, model, true),
        ...parseOperations(itemOperations, routesVariable, routePrefix, model, false)
    };
    return operationsResult
}

module.exports = serviceParser;