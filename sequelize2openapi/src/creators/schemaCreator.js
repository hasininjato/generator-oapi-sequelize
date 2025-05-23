const { getTypeField } = require("../utils/utils");

function createSchemas(models, methodsToProcess) {
    const result = {};
    models.forEach((model) => {
        methodsToProcess.forEach(method => {
            const schemaName = `${model.sequelizeModel}${method.charAt(0).toUpperCase() + method.slice(1)}`;
            if (method === "list") {
                result[schemaName] = {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {},
                    }
                };
            } else {
                result[schemaName] = {
                    type: "object",
                    properties: {}
                };
            }
            if (["post", "put", "patch"].includes(method)) {
                result[schemaName]["required"] = []
            }

            const schema = result[schemaName];

            model.value.forEach(field => {
                // Get methods for this field (either from methods or comment)
                const fieldMethods = field.methods || (field.comment && field.comment.methods) || [];

                // Only include if this field should be in the current method schema
                if (fieldMethods.includes(method)) {
                    // Add to properties
                    if (method === "list") {
                        schema.items.properties[field.field] = {
                            ...getTypeField(field.object.type),
                            description: field.description || (field.comment && field.comment.description) || ""
                        };
                    } else {
                        schema.properties[field.field] = {
                            ...getTypeField(field.object.type),
                            description: field.description || (field.comment && field.comment.description) || ""
                        };
                    }

                    // Add to required if allowNull is false and creation method
                    if (field.object.allowNull === false && ["post", "put", "patch"].includes(method)) {
                        schema.required.push(field.field);
                    }
                }
            });

            // If no required fields, remove the required array
            if (schema?.required?.length === 0) {
                delete schema.required;
            }
        });
    })

    return result;
}

module.exports = createSchemas;