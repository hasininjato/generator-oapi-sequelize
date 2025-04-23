const modelParserNoAssociationOneModelExpectedResult = [{
    "sequelizeModel": "User",
    "value": [
        {
            "field": "id",
            "type": "field",
            "object": {
                "type": "DataTypes.INTEGER",
                "primaryKey": true,
                "autoIncrement": true,
                "allowNull": false
            },
            "comment": {
                "methods": [
                    "item",
                    "list",
                    "post",
                    "put"
                ],
                "description": "Id of the user"
            }
        },
        {
            "field": "fullname",
            "type": "field",
            "object": {
                "type": "DataTypes.STRING",
                "allowNull": false,
                "unique": false,
                "validate": {
                    "notNull": {
                        "msg": "Full name is required"
                    },
                    "notEmpty": {
                        "msg": "Full name cannot be empty"
                    }
                }
            },
            "comment": {
                "methods": [
                    "item",
                    "list",
                    "put",
                    "post"
                ],
                "description": ""
            }
        },
        {
            "field": "email",
            "type": "field",
            "object": {
                "type": "DataTypes.STRING",
                "allowNull": false,
                "unique": {
                    "name": "unique_email",
                    "msg": "This email is already in use"
                },
                "validate": {
                    "notNull": {
                        "msg": "Email is required"
                    },
                    "notEmpty": {
                        "msg": "Email cannot be empty"
                    },
                    "isEmail": {
                        "msg": "Invalid email"
                    }
                }
            },
            "comment": {
                "methods": [
                    "item",
                    "list",
                    "put",
                    "post"
                ],
                "description": ""
            }
        },
        {
            "field": "password",
            "type": "field",
            "object": {
                "type": "DataTypes.STRING",
                "allowNull": false,
                "validate": {
                    "notNull": {
                        "msg": "Password is required"
                    },
                    "notEmpty": {
                        "msg": "Password cannot be empty"
                    }
                }
            },
            "comment": {
                "methods": [
                    "put",
                    "post"
                ],
                "description": ""
            }
        },
        {
            "field": "createdAt",
            "type": "field",
            "object": {
                "type": "DataTypes.DATE",
                "allowNull": false
            },
            "comment": {
                "methods": [
                    "item",
                    "list"
                ],
                "description": "Date when the record was created"
            }
        },
        {
            "field": "updatedAt",
            "type": "field",
            "object": {
                "type": "DataTypes.DATE",
                "allowNull": false
            },
            "comment": {
                "methods": [
                    "item",
                    "list"
                ],
                "description": "Date when the record was last updated"
            }
        }
    ],
    "relations": []
}]

module.exports = modelParserNoAssociationOneModelExpectedResult;