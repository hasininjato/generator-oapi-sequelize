const {transformStr} = require("../utils/utils");
const createRelations = require("./relationCreator");

function createRequestBody(services, schemas, models) {
    for (const [index, service] of Object.entries(services)) {
        for (const [method, config] of Object.entries(service)) {
            if (config.input?.length === 1) {
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
                // delete the input key:value
                // delete services[index][method]["input"]
            } else if (config.input?.length > 1) {
                const relation = createRelations(models, config, schemas, true);
                services[index][method]["requestBody"] = {
                    content: {
                        "application/json": {
                            "schema": {
                                "$ref": `#/components/schemas/${relation}`
                            }
                        }
                    }
                }
            }
        }
    }
}

module.exports = createRequestBody;