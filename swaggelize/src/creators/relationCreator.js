const {transformStr, capitalizeFirstLetter} = require("../utils/utils");

function createRelations(models, service, schemas, isBody = false) {
    let parentModelValue, relationModels;
    if (isBody) {
        [parentModelValue, ...relationModels] = service.input;
    } else {
        [parentModelValue, ...relationModels] = service.output;
    }
    if (!parentModelValue) return "";

    const parentTransformed = transformStr(parentModelValue);
    // Create a deep clone of the parent schema to avoid modifying the original
    const parentSchema = JSON.parse(JSON.stringify(schemas[parentTransformed.pascalCase]));
    let schemaName = capitalizeFirstLetter(parentTransformed.prefix);
    const relations = {};

    for (const modelValue of relationModels) {
        const relationTransformed = transformStr(modelValue);
        const relationModelName = capitalizeFirstLetter(relationTransformed.prefix);
        const relationModel = models.find(m => m.sequelizeModel === relationModelName);

        schemaName += capitalizeFirstLetter(relationTransformed.prefix);
        let keyName = "";
        if (relationTransformed.suffix === "list") {
            let modelFound = relationModel.relations.find(m => m.target === capitalizeFirstLetter(relationTransformed.prefix));
            if (modelFound === undefined) {
                modelFound = relationModel.relations.find(m => m.source === capitalizeFirstLetter(relationTransformed.prefix));
            }
            keyName = modelFound.args[1].association;
        } else {
            keyName = relationTransformed.prefix;
        }

        // Create a deep clone of the relation schema
        relations[keyName] = JSON.parse(JSON.stringify(schemas[relationTransformed.pascalCase]));
    }
    let suffix = "";
    if (isBody) {
        suffix = "Post";
    } else {
        suffix = "Item";
    }

    const isList = parentTransformed.suffix === "list";
    const result = `${schemaName}Relation${isList ? "List" : suffix}`;
    const targetProperties = isList ? parentSchema.items.properties : parentSchema.properties;

    // Safely merge the relations into the cloned schema
    Object.assign(targetProperties, relations);

    // Assign the modified clone to the schemas object
    schemas[result] = parentSchema;

    return result;
}

module.exports = createRelations;