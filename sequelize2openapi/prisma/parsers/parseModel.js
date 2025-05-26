const {getSchema} = require('@mrleebo/prisma-ast');
const {parseComment} = require('./parseComment');
const {transformField} = require('./transformField');

function parseModel(source) {
    const {list: schemas} = getSchema(source);
    const models = [];

    const resultSet = new Set();

    for (const schema of Object.values(schemas)) {
        if (schema.type !== 'model') continue;

        const model = {
            sequelizeModel: schema.name,
            value: []
        };

        let pendingComment = null;

        for (const prop of schema.properties) {
            if (prop.type === 'comment') {
                pendingComment = parseComment(prop.text);
            } else if (prop.type === 'field') {
                const [field, extras] = transformField(prop, pendingComment, schema.name);
                if (field) model.value.push(field);
                extras.forEach(arg => resultSet.add(arg));
                pendingComment = null;
            }
        }

        models.push(model);
    }

    return models;
}

module.exports = parseModel;