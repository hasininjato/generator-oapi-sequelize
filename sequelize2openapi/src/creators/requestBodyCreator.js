const {transformStr, capitalizeFirstLetter, getTypeField} = require("../utils/utils");
const createRelations = require("./relationCreator");

/**
 * create request body of a request
 * @param services
 * @param schemas
 * @param models
 * @param modelsName
 * @param components
 */
function createRequestBody(services, schemas, models, modelsName, components) {
    for (const [index, service] of Object.entries(services)) {
        for (const [method, config] of Object.entries(service)) {
            // filterable fields
            let customFilterRequest, customFilter = null;
            let arrayFilters = [];
            if (config.filterableFields) {
                let model = null;
                for(const field of config.filterableFields) {
                    model = models.find(elt => elt.sequelizeModel === config.model);
                }
                config.filterableFields.forEach(filterableField => {
                    const field = model.value.find(elt => elt.field === filterableField);
                    customFilter = `${config.model}${capitalizeFirstLetter(filterableField)}Filter`
                    customFilterRequest = {
                        name: filterableField,
                        in: "query",
                        schema: getTypeField(field.object.type),
                        required: false,
                        description: field.description,
                    }
                    arrayFilters.push({
                        "$ref": `#/components/parameters/${customFilter}`
                    });
                    components.components.parameters[customFilter] = customFilterRequest;
                })

                services[index][method] = {
                    ...services[index][method],
                    parameters: [],
                }
                services[index][method]["parameters"] = arrayFilters;
            }

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