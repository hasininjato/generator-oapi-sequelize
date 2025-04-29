const {transformStr, capitalizeFirstLetter} = require("../utils/utils");

function createRelations(models, service, schemas) {
    const serviceOutput = service.output;
    let result = "";
    const parentModelValue = serviceOutput[0];
    const parentTransformedObj = transformStr(parentModelValue);
    const parentSchema = JSON.parse(JSON.stringify(schemas[parentTransformedObj.pascalCase]))
    let schemaName = capitalizeFirstLetter(parentTransformedObj.prefix);
    let item = {};
    if (serviceOutput) {
        for (let i = 1; i < serviceOutput.length; i++) {
            const relationTransformedObj = transformStr(serviceOutput[i]);
            const relationModelName = capitalizeFirstLetter(relationTransformedObj.prefix);
            const relationModel = models.find(elt => elt.sequelizeModel === relationModelName);
            const suffixRelation = relationTransformedObj.suffix;
            schemaName += capitalizeFirstLetter(relationTransformedObj.prefix);
            item[relationTransformedObj.prefix] = {
                ...schemas[relationTransformedObj.pascalCase]
            }
            console.log(item)
        }
        if (parentTransformedObj.suffix === "list") {
            result = `${schemaName}RelationList`;
            parentSchema.items.properties = {
                ...parentSchema.items.properties,
                ...item
            };
            schemas[result] = {
                ...parentSchema
            };
        } else {
            result = `${schemaName}RelationItem`;
            parentSchema.properties = {
                ...parentSchema.properties,
                ...item
            };
            schemas[result] = {
                ...parentSchema
            };
        }
    }
    return result;
}

function hasOneRelation(relation, schemas) {
    const source = relation.source;
    const target = relation.target;
    const foreignKey = relation.args[1].foreignKey.name || relation.args[1].foreignKey;
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

module.exports = createRelations;