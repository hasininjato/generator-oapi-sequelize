const { transformStr, getSingularPath, getVariablesFromPath } = require("../utils/utils");
const responses = require("../utils/statusCode");
const createRelations = require("./relationCreator");

function isCustomOutput(output) {
    if (output) {
        for (const obj of output) {
            if (typeof obj === "object") {
                return true;
            }
        }
        return false;
    }
    return false;
}

function createResponse(services, schemas, models) {
    // common responses are 401, 403 and 500 for each route
    const commonResponses = {
        ...responses.response401(),
        ...responses.response403(),
        ...responses.response500()
    };
    for (const [path, service] of Object.entries(services)) {
        const pathVariables = getVariablesFromPath(path);

        for (const [method, config] of Object.entries(service)) {
            // first process when there is no relation in the output
            if (config.output?.length === 1) {
                let transformedObj = null;
                if (isCustomOutput(config.output)) {
                    const customIndex = config.output.findIndex(item => typeof item === 'object' && item.custom);

                    // Extract and remove
                    if (customIndex !== -1) {
                        transformedObj = config.output[customIndex];
                        config.output.splice(customIndex, 1);
                    }
                } else {
                    transformedObj = transformStr(config.output[0]); // parse the output value
                }

                // for modification method
                if (["post", "put", "patch"].includes(method)) {
                    let responseOk = null;
                    if (method === "post") {
                        if (config.isCreation) {
                            responseOk = responses.response201(transformedObj, getSingularPath(path), config);
                        } else {
                            responseOk = responses.response200(transformedObj, config, null, null);
                        }
                    }
                    // for post, we return 201. for put or patch, we return 200 and 404.
                    const successResponse = method === "post"
                        ? responseOk
                        : { ...responses.response200(transformedObj, config, null, null), ...responses.response404(pathVariables) };

                    // we add responses
                    services[path][method].responses = {
                        ...successResponse,
                        ...responses.response400(transformedObj, models),
                        ...commonResponses,
                        ...responses.response409(transformedObj, models)
                    };
                } else if (method === "get") {
                    // for get method
                    services[path][method].responses = {
                        ...responses.response200(transformedObj, config, null, schemas, transformedObj),
                        ...commonResponses,
                        ...responses.response404(pathVariables)
                    };
                }
                delete services[path][method].output;
            } else {
                // if there is no output (for delete) or more than one (for relation)
                // @TODO: when there are more than one output
                let customResponse = null;
                if (isCustomOutput(config.output)) {
                    const customIndex = config.output.findIndex(item => typeof item === 'object' && item.custom);

                    // Extract and remove
                    if (customIndex !== -1) {
                        customResponse = config.output[customIndex];
                        config.output.splice(customIndex, 1);
                    }
                }
                if (method === "delete" || config.output?.length === undefined) {
                    services[path][method].responses = {
                        ...responses.response204(),
                        ...commonResponses,
                        ...responses.response404(pathVariables)
                    }
                } else {
                    const relation = createRelations(models, config, schemas);
                    let responseOk = null;
                    if (method === "post") {
                        if (config.isCreation) {
                            responseOk = responses.response201(null, getSingularPath(path), config, relation);
                        } else {
                            responseOk = responses.response200(null, config, relation, schemas, customResponse);
                        }
                    }
                    if (["post", "put", "patch"].includes(method)) {
                        const firstOutput = config.output[0];
                        const transformedObj = transformStr(firstOutput); // parse the output value
                        services[path][method].responses = {
                            ...commonResponses,
                            ...responseOk,
                            ...responses.response404(pathVariables),
                            ...responses.response400(transformedObj, models),
                            ...responses.response409(transformedObj, models)
                        };
                    } else {
                        services[path][method].responses = {
                            ...commonResponses,
                            ...responses.response200(null, config, relation, schemas, customResponse),
                            ...responses.response404(pathVariables)
                        }
                    }
                }
            }

            // Optional: Remove output key if needed
            // to delete services[path][method].output;
        }
    }
}

module.exports = createResponse;