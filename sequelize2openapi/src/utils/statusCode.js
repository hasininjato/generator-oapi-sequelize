const { capitalizeFirstLetter } = require('./utils');
const { sequelizeValidationHandlers } = require('./constants');

function createResponseSchema(ref) {
    return {
        "$ref": `#/components/schemas/${ref}`
    };
}

function response200(obj, service, relation, schemas, customResponse = null) {
    const summary = service.summary || "";
    let ref = obj ? obj.pascalCase : relation;
    if (customResponse !== null) {
        const customRef = JSON.parse(JSON.stringify(schemas[ref]));
        Object.assign(customRef.properties, customResponse.custom);
        ref = `Custom${ref}`;
        // console.log(customRef);
        for (const [elt, index] of Object.entries(customResponse)) {
            console.log(elt, index)
        }
    }

    return {
        200: {
            description: summary,
            content: {
                "application/json": {
                    schema: createResponseSchema(ref)
                }
            }
        }
    };
}

function response201(obj, model, service, relation = null) {
    const description = model
        ? `${model} created successfully`
        : `${service.summary} successfully`;
    const componentName = obj ? obj.pascalCase : relation;

    return {
        201: {
            description,
            content: {
                "application/json": {
                    schema: createResponseSchema(componentName)
                }
            }
        }
    };
}

function response204() {
    return {
        204: {
            description: "No content"
        }
    };
}

function getValidationDetails(modelFields) {
    const details = [];

    modelFields?.forEach(field => {
        const { field: name, object: { validate } } = field;

        if (validate) {
            for (const [validationType, validationConfig] of Object.entries(validate)) {
                if (sequelizeValidationHandlers[validationType]) {
                    details.push(
                        sequelizeValidationHandlers[validationType](name, validationConfig)
                    );
                }
            }
        }
    });

    return details;
}

function response400(obj, models) {
    const modelName = capitalizeFirstLetter(obj.prefix);
    const findModel = models.find(model => model.sequelizeModel === modelName);
    const details = getValidationDetails(findModel?.value);

    return {
        400: {
            description: "Bad request (VALIDATION_ERROR)",
            content: {
                "application/json": {
                    schema: createResponseSchema("Response400Schema"),
                    example: {
                        name: "ValidationError",
                        errors: details
                    }
                }
            }
        }
    };
}

function response401() {
    return {
        401: {
            description: "Unauthorized"
        }
    };
}

function response403() {
    return {
        403: {
            description: "Forbidden"
        }
    };
}

function response404(paths) {
    if (!paths) return null;

    const models = paths.map(path => path.lastStaticSegment).join(", ");
    return {
        404: {
            description: `${models} not found`
        }
    };
}

function getUniqueConstraints(modelFields) {
    const details = [];

    modelFields?.forEach(field => {
        const { field: name, object: { unique } } = field;

        if (unique) {
            const message = typeof unique === "boolean"
                ? `Constraint violations on ${field.field}`
                : unique.msg;

            details.push({
                field: field.field,
                message
            });
        }
    });

    return details;
}

function response409(obj, models) {
    const modelName = capitalizeFirstLetter(obj.prefix);
    const findModel = models.find(model => model.sequelizeModel === modelName);
    const details = getUniqueConstraints(findModel?.value);

    return {
        409: {
            description: "Unique constraint errors",
            content: {
                "application/json": {
                    schema: createResponseSchema("Response409Schema"),
                    example: {
                        name: "UniqueConstraintError",
                        errors: details
                    }
                }
            }
        }
    };
}

function response500() {
    return {
        500: {
            description: "Internal server error"
        }
    };
}

module.exports = {
    response200,
    response201,
    response204,
    response400,
    response401,
    response403,
    response404,
    response409,
    response500
};