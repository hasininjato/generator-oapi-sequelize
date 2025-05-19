const {capitalizeFirstLetter} = require('./utils');
const {sequelizeValidationHandlers} = require('./constants');

/**
 * @param ref
 * @returns {{$ref: string}}
 */
function createResponseSchema(ref) {
    return {
        "$ref": `#/components/schemas/${ref}`
    };
}

/**
 * status code 200
 * @param obj
 * @param service
 * @param relation
 * @param schemas
 * @param customOutput
 * @param modelWithMethod
 * @param modelsName
 * @returns {{200: {description: (*|string), content: {"application/json": {schema: {$ref: string}}}}}}
 */
function response200(obj, service, relation, schemas, customOutput = null, modelWithMethod = null, modelsName = null) {
    const summary = service.summary || "";
    let ref = "";
    if (modelWithMethod) {
        ref = modelWithMethod;
    } else {
        if (obj) {
            const prefix = obj.prefix;
            const model = modelsName?.find(elt => elt === prefix);
            if (model) {
                ref = `${model}${capitalizeFirstLetter(obj?.suffix)}`;
            } else {
                ref = obj.pascalCase;
            }
        } else {
            ref = relation;
        }
    }

    if (customOutput?.custom) {
        const customRef = `Custom${service.customPath}`;
        let copyRef = {};
        let customType = "array";
        if (["string", "object"].includes(customOutput.custom.type)) {
            customType = "object";
        }
        if (ref !== undefined && ref !== null) {
            copyRef = JSON.parse(JSON.stringify(schemas[ref]));
        } else {
            schemas[customRef] = {
                type: customType,
                properties: {}
            };
        }

        const transform = (value) => {
            if (typeof value !== 'object' || value === null) return value;

            const {type, description = '', items, ...rest} = value;

            if (type === 'array' && items) {
                const properties = Object.fromEntries(
                    Object.entries(items).map(([k, v]) => [k, transform(v)])
                );
                return {
                    type: 'array',
                    description,
                    items: {
                        type: 'object',
                        properties
                    }
                };
            }

            if (items) {
                const properties = Object.fromEntries(
                    Object.entries(items).map(([k, v]) => [k, transform(v)])
                );
                return {
                    type: 'object',
                    description,
                    properties
                };
            }

            return {type, description, ...rest};
        };

        const transformed = Object.fromEntries(
            Object.entries(customOutput.custom)
                .filter(([key]) => key !== 'type')
                .map(([key, val]) => [key, transform(val)])
        );

        const isComplex = ['array', 'object'].includes(customOutput.custom.type);
        if (ref) {
            copyRef.properties = {
                ...copyRef.properties,
                ...(isComplex ? transformed.items || {} : transformed)
            };
            schemas[customRef] = copyRef;
        } else {
            schemas[customRef].properties = {
                ...(isComplex ? transformed.items || {} : transformed)
            }
        }

        ref = customRef;
    }

    return {
        200: {
            description: summary,
            content: {
                'application/json': {
                    schema: {$ref: `#/components/schemas/${ref}`}
                }
            }
        }
    };
}

/**
 * status code 201
 * @param obj
 * @param model
 * @param service
 * @param relation
 * @param modelWithMethod
 * @returns {{201: {description: string, content: {"application/json": {schema: {$ref: string}}}}}}
 */
function response201(obj, model, service, relation = null, modelWithMethod = null) {
    const description = model
        ? `${model} created successfully`
        : `${service.summary} successfully`;
    let componentName = "";
    if (modelWithMethod) {
        componentName = modelWithMethod;
    } else {
        componentName = obj ? obj.pascalCase : relation;
    }

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

/**
 * status code 204
 * @returns {{204: {description: string}}}
 */
function response204() {
    return {
        204: {
            description: "No content"
        }
    };
}

/**
 * status code 400
 * @param obj
 * @param models
 * @returns {{400: {description: string, content: {"application/json": {schema: {$ref: string}, example: {name: string, errors: *[]}}}}}}
 */
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

/**
 * status code 401
 * @returns {{401: {description: string}}}
 */
function response401() {
    return {
        401: {
            description: "Unauthorized"
        }
    };
}

/**
 * status code 403
 * @returns {{403: {description: string}}}
 */
function response403() {
    return {
        403: {
            description: "Forbidden"
        }
    };
}

/**
 * status code 404
 * @param paths
 * @returns {{404: {description: string}}|null}
 */
function response404(paths) {
    if (!paths) return null;

    const models = paths.map(path => path.lastStaticSegment).join(", ");
    return {
        404: {
            description: `${models} not found`
        }
    };
}

/**
 * status code 409
 * @param obj
 * @param models
 * @returns {{409: {description: string, content: {"application/json": {schema: {$ref: string}, example: {name: string, errors: *[]}}}}}}
 */
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

/**
 * status code 500
 * @returns {{500: {description: string}}}
 */
function response500() {
    return {
        500: {
            description: "Internal server error"
        }
    };
}

/**
 * parse Sequelize validation rules of fields
 * @param modelFields
 * @returns {*[]}
 */
function getValidationDetails(modelFields) {
    const details = [];

    modelFields?.forEach(field => {
        const {field: name, object: {validate}} = field;

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

/**
 * parse Sequelize unique constraints rules of fields
 * @param modelFields
 * @returns {*[]}
 */
function getUniqueConstraints(modelFields) {
    const details = [];

    modelFields?.forEach(field => {
        const {field: name, object: {unique}} = field;

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