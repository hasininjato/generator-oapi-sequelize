const { capitalizeFirstLetter } = require("../../src/utils/utils");
const { prismaTypesScalars } = require("../constants");

function isCreatedOrUpdatedField(field) {
    return ['createdat', 'created_at', 'updatedat', 'updated_at'].includes(field.toLowerCase());
}

/**
 * Transforms a property into a structured field object.
 * @param {Object} property
 * @param {Object} comment
 * @param {string} schemaName
 * @returns {[Object|null, string[]]}
 */
function transformField(property, comment, schemaName) {
    const attrAssociationFields = [];
    const { name, fieldType, optional, attributes = [] } = property;

    const capitalizedName = capitalizeFirstLetter(name);
    const isRequired = !optional;
    const hasId = attributes.some(attr => attr.name === "id");

    const field = {
        field: name,
        type: "field",
        object: {
            type: fieldType,
            allowNull: optional
        }
    };

    if (comment) {
        field.comment = { ...comment };
    }

    if (isRequired && !hasId) {
        if (isCreatedOrUpdatedField(name)) {
            field.comment = {
                description: `${capitalizedName} is automatically set by the system`,
                methods: ["list", "item"]
            };
        } else {
            field.object.validate = {
                notNull: { msg: `${capitalizedName} is required` },
                notEmpty: { msg: `${capitalizedName} cannot be empty` }
            };
        }
    }

    for (const attr of attributes) {
        const { name: attrName, args = [] } = attr;

        switch (attrName) {
            case "default":
                field.object.defaultValue = args[0]?.value?.name ?? args[0]?.value;
                delete field.object.validate;
                break;

            case "unique":
                field.object.unique = {
                    name: `unique_${name}`,
                    msg: `This ${name} is already in use`
                };
                break;

            case "relation":
                const fieldsArg = args.find(arg => arg.value?.key === "fields");
                const relatedFields = fieldsArg?.value?.value?.args;
                if (Array.isArray(relatedFields)) {
                    attrAssociationFields.push(...relatedFields);
                }
                break;
        }
    }

    if (!prismaTypesScalars.includes(field.object.type)) {
        return [null, attrAssociationFields];
    }

    return [field, attrAssociationFields];
}

module.exports = { transformField };
