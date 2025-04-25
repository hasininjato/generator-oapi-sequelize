const { transformStr, getVariablesFromPath, getSingularPath } = require("../utils/utils");

function createResponse(services, schemas, models) {
    for (const [index, service] of Object.entries(services)) {
        for (const [method, config] of Object.entries(service)) {
            if (config.output?.length === 1) {
                const obj = transformStr(config.output[0]);
                // responses for post: 201, 400, 401, 403, 409, 500
                if (method === "post") {
                    services[index][method]["responses"] = {
                        ...response201(obj, getSingularPath(index), config),
                        ...response400(),
                        ...response401(),
                        ...response403(),
                        ...response500()
                    }
                }
                // delete the output key:value
                delete services[index][method]["output"]
            } else {
                services[index][method]["responses"] = {
                    ...response500()
                }
            }
        }
    }
}

function response201(obj, model, service) {
    let description = "";
    if (model) {
        description = `${obj.prefix} created successfully`;
        console.log("model is null", service)
    } else {
        description = `${service.summary} successfully`
    }
    return {
        201: {
            "description": description,
            "content": {
                "application/json": {
                    "schema": {
                        "$ref": `#/components/schemas/${obj.pascalCase}`
                    }
                }
            }
        }
    }
}

function response400() {
    return {
        "400": {
            "description": "Bad request"
        }
    }
}

function response401() {
    return {
        401: {
            "description": "Unauthorized"
        }
    }
}

function response403() {
    return {
        401: {
            "description": "Forbidden"
        }
    }
}

function response404(variables) {
    if (variables) {
        let models = "";
        for (const variable of variables) {
            models += variable.lastStaticSegment + ", ";
        }
        return {
            404: {
                "description": `${models.slice(0, -2)} not found`,
            }
        }
    }
    return null;
}

function response500() {
    return {
        "500": {
            "description": "Internal server error"
        }
    }
}

module.exports = createResponse;