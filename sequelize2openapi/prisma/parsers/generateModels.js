const { getSchema } = require('@mrleebo/prisma-ast');
const { parseComment } = require('./parseComment');
const { transformField } = require('./transformField');

function generateModels(source) {
    const schemas = getSchema(source);
    const models = [];

    for (const schema of Object.values(schemas.list)) {
        if (schema.type !== "model") continue;

        const model = {
            sequelizeModel: schema.name,
            value: []
        };

        let pendingComment = null;

        for (const prop of schema.properties) {
            if (prop.type === "comment") {
                pendingComment = parseComment(prop.text);
            }

            if (prop.type === "field") {
                const field = transformField(prop, pendingComment);
                model.value.push(field);
                pendingComment = null;
            }
        }

        models.push(model);
    }

    return { schemas, models };
}

module.exports = { generateModels };
