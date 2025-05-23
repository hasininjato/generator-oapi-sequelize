const { capitalizeFirstLetter } = require("../../src/utils/utils");

function isCreatedOrUpdated(field) {
    const dateFields = ['createdat', 'updatedat', 'created_at', 'updated_at'];
    return dateFields.includes(field.toLowerCase());
}

function transformField(field, comment) {
    const fieldObject = {
        field: field.name,
        type: "field",
        object: {
            type: field.fieldType,
            allowNull: field.optional
        }
    };

    if (comment) {
        fieldObject.comment = { ...comment };
    }

    const hasAttributes = Array.isArray(field.attributes);
    const isRequired = !field.optional;
    let hasId = false;

    if (hasAttributes) {
        for (const attr of field.attributes) {
            if (attr.name === "id") {
                hasId = true;
                break;
            }
        }
    }

    // Only add validate if required AND not an ID
    if (isRequired && !hasId) {
        if (!isCreatedOrUpdated(field.name)) {
            fieldObject.object.validate = {
                notNull: { msg: `${capitalizeFirstLetter(field.name)} is required` },
                notEmpty: { msg: `${capitalizeFirstLetter(field.name)} cannot be empty` }
            };
        }
    }

    if (hasAttributes) {
        for (const attr of field.attributes) {
            // default value
            if (attr.name === "default") {
                fieldObject.object.defaultValue = attr.args[0]?.value?.name ?? attr.args[0]?.value;
                // we dont't need validate if default value is set
                delete fieldObject.object.validate;
            }

            // unique
            if (attr.name === "unique") {
                fieldObject.object.unique = {
                    name: `unique_${field.name}`,
                    msg: `This ${field.name} is already in use`
                };
            }
        }
    }

    return fieldObject;
}

module.exports = { transformField };