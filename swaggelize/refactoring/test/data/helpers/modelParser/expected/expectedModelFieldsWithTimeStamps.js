const modelFieldsWithTimeStampsExpectedResult = [
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
]

module.exports = modelFieldsWithTimeStampsExpectedResult;