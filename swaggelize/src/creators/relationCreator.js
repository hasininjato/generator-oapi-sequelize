const {transformStr, capitalizeFirstLetter} = require("../utils/utils");

function createRelations(models, service, schemas) {
    const output = service.output;
    let result = "";
    if (output) {
        output.forEach(element => {
            const transformedObj = transformStr(element)
            const modelName = capitalizeFirstLetter(transformedObj.prefix)
            const model = models.find(elt => elt.sequelizeModel === modelName);
            model.relations.forEach(relation => {
                if (relation.relation === "hasOne") {
                    result = hasOneRelation(relation, schemas);
                }
            })
        })
    }
    return result;
}

function hasOneRelation(relation, schemas, get=null) {
    const source = relation.source;
    const target = relation.target;
    const foreignKey = relation.args[1].foreignKey.name || relation.args[1].foreignKey;
    if(get) {
        const sourceItem = JSON.parse(JSON.stringify(schemas[`${source}Item`]));
        const targetItem = JSON.parse(JSON.stringify(schemas[`${target}Item`]));

        // Only embed target reference inside source, not both ways
        sourceItem.properties[target.toLowerCase()] = {
            type: "object",
            properties: {
                ...targetItem.properties
            }
        };

        // Embed only userId as a primitive reference in profile, not full user
        targetItem.properties[foreignKey] = {
            type: "integer",
            format: "int32",
            description: `Foreign key referencing ${source}`
        };

        if (!schemas[`${source}${target}Item`]) {
            schemas[`${source}${target}Item`] = sourceItem;
        }

        if (!schemas[`${target}${source}Item`]) {
            schemas[`${target}${source}Item`] = targetItem;
        }
        return `${source}${target}Item`;
    } else {
        const sourceItem = JSON.parse(JSON.stringify(schemas[`${source}Item`]));
        const targetItem = JSON.parse(JSON.stringify(schemas[`${target}Item`]));

        // Only embed target reference inside source, not both ways
        sourceItem.properties[target.toLowerCase()] = {
            type: "object",
            properties: {
                ...targetItem.properties
            }
        };

        // Embed only userId as a primitive reference in profile, not full user
        targetItem.properties[foreignKey] = {
            type: "integer",
            format: "int32",
            description: `Foreign key referencing ${source}`
        };

        if (!schemas[`${source}${target}Item`]) {
            schemas[`${source}${target}Item`] = sourceItem;
        }

        if (!schemas[`${target}${source}Item`]) {
            schemas[`${target}${source}Item`] = targetItem;
        }
        return `${source}${target}Item`;
    }
}

module.exports = createRelations;