const { transformStr, getSingularPath, getVariablesFromPath } = require("../utils/utils");
const {
    response200,
    response201,
    response204,
    response400,
    response401,
    response403,
    response404,
    response409,
    response500
} = require("../utils/statusCode");


function createResponse(services, schemas, models) {
    for (const [index, service] of Object.entries(services)) {
        for (const [method, config] of Object.entries(service)) {
            const paths = getVariablesFromPath(index)
            if (config.output?.length === 1) {
                const obj = transformStr(config.output[0]);
                // responses for post: 201, 400, 401, 403, 409, 500
                if (["post", "put", "patch"].includes(method)) {
                    let returnResponse = {};
                    if (method === "post") {
                        returnResponse = { ...response201(obj, getSingularPath(index), config) }
                    } else {
                        returnResponse = { ...response200(obj, config), ...response404(paths) }
                    }
                    services[index][method]["responses"] = {
                        // ...response201(obj, getSingularPath(index), config),
                        ...returnResponse,
                        ...response400(obj, models, config),
                        ...response401(),
                        ...response403(),
                        ...response409(obj, models),
                        ...response500()
                    }
                } else if (method === "get") {
                    services[index][method]["responses"] = {
                        ...response200(obj, config),
                        ...response401(),
                        ...response403(),
                        ...response404(paths),
                        ...response500()
                    }
                }
                // delete the output key:value
                // delete services[index][method]["output"]
            } else {
                // responses for delete: 204, 401, 403, 404, 500
                if (method === "delete") {
                    services[index][method]["responses"] = {
                        ...response204(),
                        ...response401(),
                        ...response403(),
                        ...response404(paths),
                        ...response500()
                    }
                } else {
                    services[index][method]["responses"] = {
                        ...response500()
                    }
                }
            }
        }
    }
}

module.exports = createResponse;