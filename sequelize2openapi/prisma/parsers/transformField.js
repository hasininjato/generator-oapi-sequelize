const {capitalizeFirstLetter} = require("../../src/utils/utils");
const {prismaTypesScalars} = require("../constants");

function isCreatedField(field) {
    const dateFields = ['createdat', 'created_at'];
    return dateFields.includes(field.toLowerCase());
}

function transformField(field, comment, schemaName) {
    const capitalizedFieldName = capitalizeFirstLetter(field.name);
    const attributes = Array.isArray(field.attributes) ? field.attributes : [];
    const isRequired = !field.optional;
    const hasId = attributes.some(attr => attr.name === "id");
    const isRelation = attributes.some(attr => attr.name === "relation");

    const fieldObject = {
        field: field.name,
        type: "field",
        object: {
            type: field.fieldType,
            allowNull: field.optional
        }
    };

    if (comment) {
        fieldObject.comment = {...comment};
    }

    if (isRequired && !hasId) {
        if (isCreatedField(field.name)) {
            fieldObject.comment = {
                description: `${capitalizedFieldName} is automatically set by the system`,
                methods: ["list", "item"]
            };
        } else {
            fieldObject.object.validate = {
                notNull: {msg: `${capitalizedFieldName} is required`},
                notEmpty: {msg: `${capitalizedFieldName} cannot be empty`}
            };
        }
    }

    for (const attr of attributes) {
        if (attr.name === "default") {
            fieldObject.object.defaultValue = attr.args?.[0]?.value?.name ?? attr.args?.[0]?.value;
            delete fieldObject.object.validate;
        }

        if (attr.name === "unique") {
            fieldObject.object.unique = {
                name: `unique_${field.name}`,
                msg: `This ${field.name} is already in use`
            };
        }
    }
    if (!prismaTypesScalars.includes(fieldObject.object.type)) {
        return null;
    }

    return fieldObject;
}

module.exports = {transformField};
