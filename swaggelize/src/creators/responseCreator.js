const {transformStr, getSingularPath, getVariablesFromPath} = require("../utils/utils");
const responses = require("../utils/statusCode");
const createRelations = require("./relationCreator");

function createResponse(services, schemas, models) {
    for (const [path, service] of Object.entries(services)) {
        for (const [method, config] of Object.entries(service)) {
            const pathVariables = getVariablesFromPath(path);
            // common responses are 401, 403 and 500 for each route
            const commonResponses = {
                ...responses.response401(),
                ...responses.response403(),
                ...responses.response500()
            };

            // first process when there is no relation in the output
            if (config.output?.length === 1) {
                const transformedObj = transformStr(config.output[0]); // parse the output value

                // for modification method
                if (["post", "put", "patch"].includes(method)) {
                    // for post, we return 201. for put or patch, we return 200 and 404.
                    const successResponse = method === "post"
                        ? responses.response201(transformedObj, getSingularPath(path), config)
                        : {...responses.response200(transformedObj, config), ...responses.response404(pathVariables)};

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
                        ...responses.response200(transformedObj, config),
                        ...commonResponses,
                        ...responses.response404(pathVariables)
                    };
                }
                delete services[path][method].output;
            } else {
                // if there is no output (for delete) or more than one (for relation)
                // @TODO: when there are more than one output
                if (method === "delete" || config.output?.length === undefined) {
                    services[path][method].responses = {
                        ...responses.response204(),
                        ...commonResponses,
                        ...responses.response404(pathVariables)
                    }
                } else {
                    const relation = createRelations(models, config, schemas);
                    if (["post", "put", "patch"].includes(method)) {
                        services[path][method].responses = {
                            ...commonResponses,
                            ...responses.response201(null, getSingularPath(path), config, relation)
                        };
                    } else if (method === "get") {
                        services[path][method].responses = {
                            ...commonResponses,
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