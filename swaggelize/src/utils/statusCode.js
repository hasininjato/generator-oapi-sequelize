const {capitalizeFirstLetter} = require('./utils');
const {sequelizeValidationHandlers} = require('./constants');

/**
 *
 * @param obj
 * @param {*} service
 * @returns
 */
function response200(obj, service) {
    return {
        200: {
            "description": service.summary || "",
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

/**
 *
 * @param {Object} obj
 * @param model
 * @param {*} service
 * @param relation
 * @returns
 */
function response201(obj, model, service, relation = null) {
    let description = "";
    let componentName = "";
    if (model) {
        description = `${model} created successfully`;
    } else {
        description = `${service.summary} successfully`
    }
    if (obj) {
        componentName = `${obj.pascalCase}`;
    } else {
        componentName = relation;
    }
    return {
        201: {
            "description": description,
            "content": {
                "application/json": {
                    "schema": {
                        "$ref": `#/components/schemas/${componentName}`,
                    }
                }
            }
        }
    }
}

function response204() {
    return {
        "204": {
            "description": "No content"
        }
    }
}

/**
 * Validation error on fields based on Sequelize
 * @param {Object} obj
 * @param {Object} models
 * @returns
 */
function response400(obj, models) {
    const modelName = capitalizeFirstLetter(obj.prefix);
    const findModel = models.find((model => model.sequelizeModel === modelName));

    const details = [];

    // Extract possible validation errors from each field
    findModel.value?.forEach(field => {
        const {field: name, object: {validate}} = field;

        if (validate) {
            for (const [validationType, validationConfig] of Object.entries(validate)) {
                if (sequelizeValidationHandlers[validationType]) {
                    details.push(sequelizeValidationHandlers[validationType](name, validationConfig));
                }
            }
        }
    });

    // Return the 400 response structure
    return {
        400: {
            description: "Bad request (VALIDATION_ERROR)",
            content: {
                "application/json": {
                    schema: {
                        "$ref": "#/components/schemas/Response400Schema"
                    },
                    example: {
                        details: [...details]
                    }
                }
            }
        }
    };
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

function response404(paths) {
    if (paths) {
        let models = "";
        for (const path of paths) {
            models += path.lastStaticSegment + ", ";
        }
        return {
            404: {
                "description": `${models.slice(0, -2)} not found`,
            }
        }
    }
    return null;
}

function response409(obj, models) {
    const modelName = capitalizeFirstLetter(obj.prefix);
    const findModel = models.find((model => model.sequelizeModel === modelName));

    const details = [];
    // extract unique validation message from each field
    findModel.value?.forEach(field => {
        const {field: name, object: {unique}} = field;
        if (unique) {
            let message = "";
            if (typeof unique === "boolean") {
                message = `Constraint violations on ${field.field}`;
            } else {
                message = unique.msg;
            }
            details.push({
                field: field.field,
                message: message
            })
        }
    })
    return {
        409: {
            description: "Unique constraint errors",
            content: {
                "application/json": {
                    schema: {
                        "$ref": "#/components/schemas/Response409Schema"
                    },
                    example: {
                        details: [...details]
                    }
                }
            }
        }
    }
}

function response500() {
    return {
        "500": {
            "description": "Internal server error"
        }
    }
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