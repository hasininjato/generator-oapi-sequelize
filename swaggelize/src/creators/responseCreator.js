const { transformStr, getVariablesFromPath, getSingularPath, capitalizeFirstLetter } = require("../utils/utils");

function createResponse(services, schemas, models) {
    for (const [index, service] of Object.entries(services)) {
        for (const [method, config] of Object.entries(service)) {
            if (config.output?.length === 1) {
                const obj = transformStr(config.output[0]);
                // responses for post: 201, 400, 401, 403, 409, 500
                if (method === "post") {
                    services[index][method]["responses"] = {
                        ...response201(obj, getSingularPath(index), config),
                        ...response400(obj, models, config),
                        ...response401(),
                        ...response403(),
                        ...response500()
                    }
                }
                // delete the output key:value
                // delete services[index][method]["output"]
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

/**
 * Validation error on fields based on Sequelize
 * @param {string} obj 
 * @param {string} model 
 * @param {object} models 
 * @param {object} service 
 * @returns 
 */
function response400(obj, models, service) {
    const modelName = capitalizeFirstLetter(obj.prefix);
    const findModel = models.find((model => model.sequelizeModel === modelName));

    const details = [];

    // Extract possible validation errors from each field
    // All possible Sequelize validations with their error messages
    const validationHandlers = {
        notNull: (fieldName, validation) => ({ field: fieldName, message: validation.msg }),
        notEmpty: (fieldName, validation) => ({ field: fieldName, message: validation.msg }),
        isDecimal: (fieldName, validation) => ({ field: fieldName, message: validation.msg }),
        min: (fieldName, validation) => ({ field: fieldName, message: validation.msg }),
        max: (fieldName, validation) => ({ field: fieldName, message: validation.msg }),
        len: (fieldName, validation) => ({ field: fieldName, message: validation.msg || `Must be between ${validation.args[0]} and ${validation.args[1]} characters` }),
        isEmail: (fieldName, validation) => ({ field: fieldName, message: validation.msg || 'Must be a valid email' }),
        isUrl: (fieldName, validation) => ({ field: fieldName, message: validation.msg || 'Must be a valid URL' }),
        isIP: (fieldName, validation) => ({ field: fieldName, message: validation.msg || 'Must be a valid IP address' }),
        isIPv4: (fieldName, validation) => ({ field: fieldName, message: validation.msg || 'Must be a valid IPv4 address' }),
        isIPv6: (fieldName, validation) => ({ field: fieldName, message: validation.msg || 'Must be a valid IPv6 address' }),
        isAlpha: (fieldName, validation) => ({ field: fieldName, message: validation.msg || 'Must contain only letters' }),
        isAlphanumeric: (fieldName, validation) => ({ field: fieldName, message: validation.msg || 'Must contain only letters and numbers' }),
        isNumeric: (fieldName, validation) => ({ field: fieldName, message: validation.msg || 'Must contain only numbers' }),
        isLowercase: (fieldName, validation) => ({ field: fieldName, message: validation.msg || 'Must be lowercase' }),
        isUppercase: (fieldName, validation) => ({ field: fieldName, message: validation.msg || 'Must be uppercase' }),
        equals: (fieldName, validation) => ({ field: fieldName, message: validation.msg || `Must equal ${validation.args[0]}` }),
        contains: (fieldName, validation) => ({ field: fieldName, message: validation.msg || `Must contain ${validation.args[0]}` }),
        notContains: (fieldName, validation) => ({ field: fieldName, message: validation.msg || `Must not contain ${validation.args[0]}` }),
        isIn: (fieldName, validation) => ({ field: fieldName, message: validation.msg || `Must be one of: ${validation.args[0].join(', ')}` }),
        notIn: (fieldName, validation) => ({ field: fieldName, message: validation.msg || `Must not be one of: ${validation.args[0].join(', ')}` }),
        isDate: (fieldName, validation) => ({ field: fieldName, message: validation.msg || 'Must be a valid date' }),
        isAfter: (fieldName, validation) => ({ field: fieldName, message: validation.msg || `Must be after ${validation.args[0]}` }),
        isBefore: (fieldName, validation) => ({ field: fieldName, message: validation.msg || `Must be before ${validation.args[0]}` }),
        isCreditCard: (fieldName, validation) => ({ field: fieldName, message: validation.msg || 'Must be a valid credit card number' }),
        isUUID: (fieldName, validation) => ({ field: fieldName, message: validation.msg || 'Must be a valid UUID' }),
        custom: (fieldName, validation) => ({ field: fieldName, message: validation.msg || 'Validation failed' })
    };
    findModel.value?.forEach(field => {
        const { field: name, object: { validate } } = field;

        if (validate) {
            for (const [validationType, validationConfig] of Object.entries(validate)) {
                if (validationHandlers[validationType]) {
                    details.push(validationHandlers[validationType](name, validationConfig));
                }
            }
        }
    });

    // Return the 400 response structure
    return {
        400: {
            "description": "Bad request (VALIDATION_ERROR)",
            "details": details
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