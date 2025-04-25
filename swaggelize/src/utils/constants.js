const RELATION_METHODS = new Set(["hasOne", "hasMany", "belongsTo", "belongsToMany"]);
const SEQUELIZE_DEFINE_PATTERN = /(?:const\s+(\w+)\s*=\s*)?sequelize\.define\(\s*['"](\w+)['"]/;
const SWAG_TAG = '@swag';

/**
 * from AST node, extract value
 * @param node
 * @returns {*|null}
 */
function getValueFromNode(node) {
    if (!node) return null;
    const handler = NODE_HANDLERS[node.type];
    return handler ? handler(node) : null;
}

/**
 * predefined node handlers to extract value based on type
 * @type {{Identifier: (function(*): *), StringLiteral: (function(*): *), BooleanLiteral: (function(*): *), NumericLiteral: (function(*): *), MemberExpression: (function(*): string), ObjectExpression: (function(*): {}), ArrayExpression: (function(*): (*|null)[])}}
 */
const NODE_HANDLERS = {
    Identifier: node => node.name,
    StringLiteral: node => node.value,
    BooleanLiteral: node => node.value,
    NumericLiteral: node => node.value,
    MemberExpression: node => `${node.object.name}.${node.property.name}`,
    ObjectExpression: node => node.properties.reduce((obj, prop) => {
        const key = prop.key.name || prop.key.value;
        obj[key] = getValueFromNode(prop.value);
        return obj;
    }, {}),
    ArrayExpression: node => node.elements.map(getValueFromNode)
};

/**
 * map Sequelize types into OpenAPI specs types
 * @type {{STRING: {type: string}, TEXT: {type: string}, INTEGER: {type: string, format: string}, BIGINT: {type: string, format: string}, FLOAT: {type: string, format: string}, DOUBLE: {type: string, format: string}, DECIMAL: {type: string}, BOOLEAN: {type: string}, DATE: {type: string, format: string}, DATEONLY: {type: string, format: string}, TIME: {type: string}, UUID: {type: string, format: string}, JSON: {type: string}, JSONB: {type: string}, ENUM: {type: string}, ARRAY: {type: string}, BLOB: {type: string, format: string}, GEOMETRY: {type: string}, RANGE: {type: string}}}
 */
const TYPE_MAP_SEQUELIZE_TO_OPENAPI = {
    STRING: {type: 'string'},
    TEXT: {type: 'string'},
    INTEGER: {type: 'integer', format: 'int32'},
    BIGINT: {type: 'integer', format: 'int64'},
    FLOAT: {type: 'number', format: 'float'},
    DOUBLE: {type: 'number', format: 'double'},
    DECIMAL: {type: 'string'}, // usually represented as string in OpenAPI
    BOOLEAN: {type: 'boolean'},
    DATE: {type: 'string', format: 'date-time'},
    DATEONLY: {type: 'string', format: 'date'},
    TIME: {type: 'string'},
    UUID: {type: 'string', format: 'uuid'},
    JSON: {type: 'object'},
    JSONB: {type: 'object'},
    ENUM: {type: 'string'},
    ARRAY: {type: 'array'},
    BLOB: {type: 'string', format: 'binary'},
    GEOMETRY: {type: 'object'},
    RANGE: {type: 'array'}
};

// All possible Sequelize validations with their error messages
const sequelizeValidationHandlers = {
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

module.exports = {
    RELATION_METHODS,
    SEQUELIZE_DEFINE_PATTERN,
    SWAG_TAG,
    NODE_HANDLERS,
    TYPE_MAP_SEQUELIZE_TO_OPENAPI,
    getValueFromNode,
    sequelizeValidationHandlers
};