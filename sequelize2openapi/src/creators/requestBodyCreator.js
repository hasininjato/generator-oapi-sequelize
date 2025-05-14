const {transformStr, capitalizeFirstLetter} = require("../utils/utils");
const createRelations = require("./relationCreator");

function createRequestBody(services, schemas, models, modelsName) {
    for (const [index, service] of Object.entries(services)) {
        for (const [method, config] of Object.entries(service)) {
            if (config.input?.length === 1) {
                const obj = transformStr(config.input[0])
                let pascalCase = obj.pascalCase;
                if (modelsName.includes(obj.prefix)) {
                    pascalCase = `${obj.prefix}${capitalizeFirstLetter(obj.suffix)}`;
                }
                services[index][method]["requestBody"] = {
                    content: {
                        "application/json": {
                            "schema": {
                                "$ref": `#/components/schemas/${pascalCase}`
                            }
                        }
                    }
                }
                // delete the input key:value
                // delete services[index][method]["input"]
            } else if (config.input?.length > 1) {
                const relation = createRelations(models, config, schemas, true, modelsName);
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