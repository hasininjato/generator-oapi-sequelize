const { transformStr } = require("../utils/utils");

function createResponse(services, schemas) {
    for (const [index, service] of Object.entries(services)) {
        for (const [method, config] of Object.entries(service)) {
            if (config.input?.length == 1) {
                const obj = transformStr(config.input[0])
                services[index][method]["requestBody"] = {
                    content: {
                        "application/json": {
                            "schema": {
                                "$ref": `#/components/schemas/${obj.pascalCase}`
                            }
                        }
                    }
                }
            }
        }
    }
}

module.exports = createResponse;