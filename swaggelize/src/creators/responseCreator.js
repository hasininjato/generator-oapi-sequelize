const {transformStr, getVariablesFromPath} = require("../utils/utils");

function createResponse(services, schemas) {
    for (const [index, service] of Object.entries(services)) {
        for (const [method, config] of Object.entries(service)) {
            if (config.output?.length === 1) {
                const obj = transformStr(config.output[0]);
                if (method === "post") {
                    services[index][method]["responses"] = {
                        ...response201(obj),
                        ...response400(),
                        ...response500()
                    }
                }
                const variables = getVariablesFromPath(index);
                if (!["post", "put", "patch"].includes(method)) {
                    services[index][method]["responses"] = {
                        // ...services[index][method]["responses"],
                        ...response404(variables),
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

function response201(obj) {
    return {
        201: {
            "description": `Created ${obj.prefix}`,
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