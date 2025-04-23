const twoModelsInOneFileExpectedResult = [
    {
        "sequelizeModel": "Post",
        "value": [
            {
                "field": "title",
                "type": "field",
                "object": "DataTypes.STRING",
                "comment": {
                    "methods": [
                        "list",
                        "item",
                        "put",
                        "post"
                    ],
                    "description": "Post title"
                }
            },
            {
                "field": "content",
                "type": "field",
                "object": "DataTypes.TEXT",
                "comment": {
                    "methods": [
                        "list",
                        "item",
                        "put",
                        "post"
                    ],
                    "description": "Post content"
                }
            }
        ],
        "relations": []
    },
    {
        "sequelizeModel": "Tag",
        "value": [
            {
                "field": "name",
                "type": "field",
                "object": "DataTypes.STRING",
                "comment": {
                    "methods": [
                        "list",
                        "item",
                        "put",
                        "post"
                    ],
                    "description": "Tag name"
                }
            }
        ],
        "relations": []
    }
]

module.exports = twoModelsInOneFileExpectedResult;