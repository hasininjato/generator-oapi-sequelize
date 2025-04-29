const {transformStr, capitalizeFirstLetter} = require("../utils/utils");

function createRelations(models, service, schemas) {
    const [parentModelValue, ...relationModels] = service.output;
    if (!parentModelValue) return "";

    const parentTransformed = transformStr(parentModelValue);
    const parentSchema = {...schemas[parentTransformed.pascalCase]};
    let schemaName = capitalizeFirstLetter(parentTransformed.prefix);
    const relations = {};

    for (const modelValue of relationModels) {
        const relationTransformed = transformStr(modelValue);
        const relationModelName = capitalizeFirstLetter(relationTransformed.prefix);
        const relationModel = models.find(m => m.sequelizeModel === relationModelName);

        schemaName += capitalizeFirstLetter(relationTransformed.prefix);
        const keyName = relationTransformed.suffix === "list"
            ? relationModel.relations[0]?.args[1].association
            : relationTransformed.prefix;

        relations[keyName] = {...schemas[relationTransformed.pascalCase]};
    }

    const isList = parentTransformed.suffix === "list";
    const result = `${schemaName}Relation${isList ? "List" : "Item"}`;
    const targetProperties = isList ? parentSchema.items.properties : parentSchema.properties;

    Object.assign(targetProperties, relations);
    schemas[result] = parentSchema;

    return result;
}

module.exports = createRelations;