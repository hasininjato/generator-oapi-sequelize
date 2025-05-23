const fs = require('fs');
const path = require("path");
const t = require('@babel/types');
const listEndpoints = require("express-list-endpoints");

const getEndPointsApi = (app) => {
    return listEndpoints(app)
}

const readFileContent = (filePath) => {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (err) {
        console.error("Error reading file:", err.message);
        return null;
    }
}

const getFileInDirectory = (directoryPath) => {
    try {
        return fs.readdirSync(directoryPath)
            .filter(file => {
                const fullPath = path.join(directoryPath, file);
                return fs.statSync(fullPath).isFile() && file !== 'index.js';
            });
    } catch (err) {
        return [];
    }
};

const getMethodsFromComment = (comment) => {
    const match = comment.match(/methods:\s*(.+)/);
    return match
        ? match[1].split(',').map(method => method.trim())
        : [];
}

const getDescriptionFromComment = (comment) => {
    const match = comment.match(/description:\s*(.+)/);
    return match ? match[1] : "";
}

const getRelationsFromComment = (comment) => {
    // Clean up the comment
    const cleanedComment = comment
        .replace(/^\s*\*\s*/gm, '')  // Remove leading asterisks and spaces
        .replace(/@swag/g, '')  // Remove the @swag annotation
        .trim();  // Trim leading/trailing spaces

    const relationsLine = cleanedComment
        .split('\n')  // Split by lines
        .find(line => line.toLowerCase().includes('relations'));  // Find the line with 'description'

    let relations = "";
    if (relationsLine !== undefined) {
        relations = relationsLine
            .replace('relations:', '')  // Remove the 'description:' prefix
            .trim();  // Trim spaces
    }

    return relations;
}

const capitalizeFirstLetter = (str) => {
    if (!str) return str; // Handle empty string or null/undefined
    return str.charAt(0).toUpperCase() + str.slice(1);
}

const transformStr = (input) => {
    const [prefix, suffix] = input.split(':');
    const pascalPrefix = prefix.charAt(0).toUpperCase() + prefix.slice(1);
    const pascalCase = suffix
        ? pascalPrefix + suffix.charAt(0).toUpperCase() + suffix.slice(1)
        : pascalPrefix;

    return {pascalCase, suffix, prefix};
}

const processValueNode = (node) => {
    if (t.isStringLiteral(node)) return node.value;
    if (t.isNumericLiteral(node)) return node.value;
    if (t.isBooleanLiteral(node)) return node.value;
    if (t.isNullLiteral(node)) return null;
    if (t.isIdentifier(node)) return node.name;
    return undefined;
};

const processObjectExpression = (objectExpression) => {
    return objectExpression.properties.reduce((result, prop) => {
        const key = t.isIdentifier(prop.key) ? prop.key.name :
            t.isStringLiteral(prop.key) ? prop.key.value : null;

        if (!key) return result;

        if (t.isObjectExpression(prop.value)) {
            result[key] = processObjectExpression(prop.value);
        } else {
            const value = processValueNode(prop.value);
            if (value !== undefined) result[key] = value;
        }

        return result;
    }, {});
};

const generateDefaultForeignKey = (sourceName) => {
    return `${sourceName.toLowerCase()}Id`;
};

const hasForeignKey = (options) => {
    if (!options) return false;
    if (options.foreignKey) return true;

    return Object.values(options).some(
        val => typeof val === 'object' && val !== null && hasForeignKey(val)
    );
};

const processRelationArguments = (argsNodes) => {
    const args = [];
    let options = {};

    argsNodes.forEach(arg => {
        if (t.isIdentifier(arg)) {
            args.push(arg.name);
        } else if (t.isStringLiteral(arg)) {
            args.push(arg.value);
        } else if (t.isObjectExpression(arg)) {
            options = processObjectExpression(arg);
            args.push(options);
        }
    });

    return {args, options};
};

const createRelationObject = (source, relationType, target, args, options) => {
    if (!hasForeignKey(options)) {
        const defaultForeignKey = generateDefaultForeignKey(source);
        options = {...options, foreignKey: defaultForeignKey};

        if (args.length > 1 && typeof args[1] === 'object') {
            args[1] = options;
        } else {
            args.push(options);
        }
    }

    return {
        type: "relation",
        relation: relationType,
        source,
        target,
        args
    };
};

const returnRelations = (modelDefinition) => {
    const relations = [];
    const modelName = modelDefinition.name;

    const programNode = modelDefinition.astPath.findParent(path =>
        path.isProgram()
    )?.node;

    if (!programNode) return {relations, programNode, modelName};
    return {relations, programNode, modelName};
}

function getVariablesFromPath(fullPath) {
    if (typeof fullPath !== 'string') return null;

    const segments = fullPath.split('/').filter(Boolean); // Remove empty segments
    const result = [];

    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        // if (segment.startsWith('{') && segment.endsWith('}')) {
        if (segment.startsWith(':')) {
            let lastStaticSegment = segments[i - 1]; // Get segment before {param}
            if (lastStaticSegment) {
                // Remove trailing 's' if it exists (e.g., "transactions" → "transaction")
                lastStaticSegment = lastStaticSegment.replace(/s$/, '');
                lastStaticSegment = capitalizeFirstLetter(lastStaticSegment);
                result.push({
                    lastStaticSegment,
                    param: segment.replace(":", ""),
                });
            }
        } else if (segment.startsWith('{') && segment.endsWith('}')) {
            let lastStaticSegment = segments[i - 1]; // Get segment before {param}
            if (lastStaticSegment) {
                // Remove trailing 's' if it exists (e.g., "transactions" → "transaction")
                lastStaticSegment = lastStaticSegment.replace(/s$/, '');
                lastStaticSegment = capitalizeFirstLetter(lastStaticSegment);
                result.push({
                    lastStaticSegment,
                    param: segment.slice(1, -1),
                });
            }
        }
    }

    return result.length ? result : null;
}

/**
 * Map Sequelize types into SQL types
 * @param sequelizeType
 */
function getTypeField(sequelizeType) {
    const typeMap = {
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
    let typeKey = '';

    if (typeof sequelizeType === 'string') {
        // If string like "DataTypes.STRING" or "STRING"
        const match = sequelizeType.match(/(?:DataTypes\.)?([A-Z]+)/);
        typeKey = match ? match[1] : 'STRING';
    } else if (typeof sequelizeType === 'object' && sequelizeType !== null) {
        // If actual Sequelize DataType object
        typeKey = sequelizeType.key || sequelizeType.constructor.name.toUpperCase();
    }

    return typeMap[typeKey] || {type: 'string'};
}

/**
 * return path based on model
 * @param {string} path
 * @returns
 */
function getSingularPath(path) {
    const parts = path.split('/').filter(Boolean);
    if (parts.length === 1 && parts[0].endsWith('s')) {
        return capitalizeFirstLetter(parts[0].slice(0, -1)); // Remove last 's'
    }
    return null; // Or return original path if preferred
}

function removeKeyDeep(obj, keyToRemove) {
    if (Array.isArray(obj)) {
        return obj.map(item => removeKeyDeep(item, keyToRemove));
    } else if (typeof obj === 'object' && obj !== null) {
        const newObj = {};
        for (const [key, value] of Object.entries(obj)) {
            if (key !== keyToRemove) {
                newObj[key] = removeKeyDeep(value, keyToRemove);
            }
        }
        return newObj;
    }
    return obj;
}

function toPascalCase(str) {
    return str
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
}

function isCustomOutput(output) {
    if (output) {
        for (const obj of output) {
            if (typeof obj === "object") {
                return true;
            }
        }
        return false;
    }
    return false;
}

function applyCustomResponses(responses, customResponses) {
    // Remove responses based on 'omit'
    (customResponses?.omit || []).forEach(status => {
        delete responses[status];
    });
    // Add or override responses from 'custom'
    (customResponses?.custom || []).forEach(entry => {
        Object.entries(entry).forEach(([status, response]) => {
            // change description
            responses[status]?.description = response.message;
        });
    });
}

module.exports = {
    readFileContent,
    getFileInDirectory,
    capitalizeFirstLetter,
    transformStr,
    getRelationsFromComment,
    getMethodsFromComment,
    getDescriptionFromComment,
    processValueNode,
    processObjectExpression,
    processRelationArguments,
    createRelationObject,
    generateDefaultForeignKey,
    hasForeignKey,
    returnRelations,
    getEndPointsApi,
    getVariablesFromPath,
    getTypeField,
    getSingularPath,
    removeKeyDeep,
    toPascalCase,
    isCustomOutput,
    applyCustomResponses
}