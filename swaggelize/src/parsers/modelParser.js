const parser = require("@babel/parser");
const { default: traverse } = require("@babel/traverse");
const t = require("@babel/types");
const { returnRelations, processRelationArguments, createRelationObject, getTypeField, getDescriptionFromComment,
    getMethodsFromComment
} = require("../utils/utils");
const { SWAG_TAG, getValueFromNode } = require("../utils/constants");

/**
 * parse the js code
 * @param code
 * @returns babel parser AST structure
 */
function extractAst(code) {
    return parser.parse(code, {
        sourceType: 'module',
        plugins: ['jsx'],
    });
}

/**
 * traverse the AST to extract node, name and path
 * @param ast
 * @returns {*[]}
 */
function traverseAst(ast) {
    const modelDefinitions = [];

    traverse(ast, {
        CallExpression(path) {
            if (!t.isMemberExpression(path.node.callee)) return;
            if (path.node.callee.property.name !== 'define') return;

            const modelName = path.node.arguments[0]?.value;
            if (!modelName) return;

            modelDefinitions.push({
                node: path.node,
                name: modelName,
                astPath: path
            });
        }
    });

    return modelDefinitions;
}

/**
 * extract sequelize model name
 * @param modelDefinition
 * @returns string: the model name
 */
function extractModelName(modelDefinition) {
    return modelDefinition.node.arguments[0]?.value;
}

/**
 * extract all fields and information
 * @param modelDefinition
 * @returns {*[]}
 */
function extractFields(modelDefinition) {
    const fields = [];
    const fieldsNode = modelDefinition.node.arguments[1];

    if (!t.isObjectExpression(fieldsNode)) return fields;

    fieldsNode.properties.forEach(prop => {
        const fieldName = prop.key.name || prop.key.value;
        const fieldValue = getValueFromNode(prop.value);

        // Check for @swag comments
        const swagComment = prop.leadingComments?.find(c =>
            c.value.includes(SWAG_TAG)
        );

        if (swagComment) {
            const methods = getMethodsFromComment(swagComment.value.trim());
            const description = getDescriptionFromComment(swagComment.value.trim());

            fields.push({
                field: fieldName,
                type: 'field',
                object: fieldValue,
                methods: methods || [],
                description: description || ''
            });
        }
    });

    return fields;
}

/**
 * check if timestamps is set to true and return fields createdAt and updatedAt
 * @param modelDefinition
 * @returns {[]}
 */
function extractTimestampFields(modelDefinition) {
    const options = modelDefinition.node.arguments[2]
        ? getValueFromNode(modelDefinition.node.arguments[2])
        : {};

    if (!options.timestamps) return [];

    return [
        {
            field: 'createdAt',
            type: 'field',
            object: {
                type: 'DataTypes.DATE',
                allowNull: false
            },
            comment: {
                methods: ['item', 'list'],
                description: 'Date when the record was created'
            }
        },
        {
            field: 'updatedAt',
            type: 'field',
            object: {
                type: 'DataTypes.DATE',
                allowNull: false
            },
            comment: {
                methods: ['item', 'list'],
                description: 'Date when the record was last updated'
            }
        }
    ];
}

/**
 * extract sequelize relations
 * @param modelDefinition
 * @returns {{relations: []}}
 */
function extractRelations(modelDefinition) {
    const { relations, programNode, modelName } = returnRelations(modelDefinition);
    traverse(programNode, {
        ExpressionStatement(path) {
            if (!t.isCallExpression(path.node.expression)) return;

            const callExpr = path.node.expression;
            if (!t.isMemberExpression(callExpr.callee)) return;

            const memberExpr = callExpr.callee;
            if (!t.isIdentifier(memberExpr.property)) return;

            const relationTypes = ['hasOne', 'hasMany', 'belongsToMany'];
            if (!relationTypes.includes(memberExpr.property.name)) return;

            const source = memberExpr.object.name;
            const relationType = memberExpr.property.name;
            const target = callExpr.arguments[0]?.name || modelName;

            const { args, options } = processRelationArguments(callExpr.arguments);

            // Extract swag comment with relations
            const leadingComments = path.node.leadingComments;
            if (leadingComments) {
                const swagComment = leadingComments.find(comment =>
                    comment.value.includes('@swag') && comment.value.includes('relations:')
                );

                if (swagComment) {
                    const relationsMatch = swagComment.value.match(/relations:\s*(.*)/);
                    if (relationsMatch && relationsMatch[1]) {
                        options.association = relationsMatch[1].trim();
                    }
                }
            }

            const relation = createRelationObject(source, relationType, target, args, options);

            relations.push(relation);
        }
    });

    return { relations };
}

/**
 * extract many-to-many relations
 * @param ast
 * @returns {*[]}
 */
function extractRelationsManyToManyThroughString(ast) {
    const relations = [];

    traverse(ast, {
        ExpressionStatement(path) {
            const node = path.node;
            const expr = node.expression;

            if (
                t.isCallExpression(expr) &&
                t.isMemberExpression(expr.callee) &&
                t.isIdentifier(expr.callee.property, { name: 'belongsToMany' })
            ) {
                const source = expr.callee.object.name;
                const target = expr.arguments[0]?.name;
                const secondArg = expr.arguments[1];

                let through = null;
                if (t.isObjectExpression(secondArg)) {
                    const throughProp = secondArg.properties.find(
                        (p) =>
                            t.isIdentifier(p.key, { name: 'through' }) &&
                            t.isStringLiteral(p.value)
                    );
                    if (throughProp) {
                        through = throughProp.value.value;
                    }
                }

                // extract alias from comments (relations:)
                let alias = null;
                if (node.leadingComments) {
                    for (const comment of node.leadingComments) {
                        const match = comment.value.match(/relations:\s*(\w+)/);
                        if (match) {
                            alias = match[1];
                            break;
                        }
                    }
                }

                if (source && target && through) {
                    relations.push({
                        type: 'relation',
                        relation: 'belongsToMany',
                        source,
                        target,
                        through,
                        args: [
                            target,
                            {
                                through,
                                alias: alias
                            }
                        ]
                    });
                }
            }
        }
    });

    return relations;
}

function addRelationManyToManyToEachModel(models) {
    for (const [index, model] of Object.entries(models)) {
        if (model.relations.length > 1) {
            // console.log(JSON.stringify(model, null, 2));
        }
        if(["Tag", "Post"].includes(model.sequelizeModel)) {
            console.log(model);
        }
    }
}

/**
 * create the model for the many-to-many relationship using through if it is string. relations parameter is from the function extractRelationsManyToManyThroughString
 * @param relations
 * @returns {{sequelizeModel: (*|string), value: *[], relations}}
 */
function createModelManyToManyThroughString(relations) {
    const sequelizeModelName = relations[0].through;
    let values = [];
    relations.forEach((relation) => {
        const id = `${relation.source.toLowerCase()}Id`;
        const value = {
            field: id,
            type: "field",
            object: {
                type: 'DataTypes.INTEGER',
                references: {
                    model: relation.source
                }
            },
            comment: {
                methods: ["list", "item", "put", "post"],
                description: `${relation.source} ID`
            }
        };
        values.push(value);
    })
    return {
        sequelizeModel: sequelizeModelName,
        value: values,
        relations: relations
    }
}

function getFieldsWithMethod(models) {
    const modelMethod = {};

    models.forEach(({ sequelizeModel, value }) => {
        if (!modelMethod[sequelizeModel]) {
            modelMethod[sequelizeModel] = {};
        }

        value.forEach(({ field, type, object, methods, description }) => {
            methods?.forEach((method) => {
                if (!modelMethod[sequelizeModel][method]) {
                    modelMethod[sequelizeModel][method] = [];
                }

                modelMethod[sequelizeModel][method].push({
                    field,
                    description: description,
                    type: getTypeField(object)
                });
            });
        });
    });
}

function modelParser(code) {
    const ast = extractAst(code);
    const modelDefinitions = traverseAst(ast);
    const models = [];

    modelDefinitions.forEach(modelDef => {
        const modelName = extractModelName(modelDef);
        const fields = extractFields(modelDef);
        const relations = extractRelations(modelDef);
        const timestampFields = extractTimestampFields(modelDef);

        models.push({
            sequelizeModel: modelName,
            value: [...fields, ...timestampFields],
            relations: relations.relations
        });
    });
    const relations = extractRelationsManyToManyThroughString(ast);
    let manyToManyThroughStringModels = [];
    addRelationManyToManyToEachModel(models);
    if (relations && relations.length > 0) {
        manyToManyThroughStringModels = createModelManyToManyThroughString(relations);
        return [...models, manyToManyThroughStringModels];
    }

    getFieldsWithMethod(models);

    return [...models];
}

module.exports = {
    modelParser,
    extractAst,
    traverseAst,
    extractModelName,
    extractFields,
    extractTimestampFields,
    extractRelations,
    extractRelationsManyToManyThroughString,
    createModelManyToManyThroughString
};