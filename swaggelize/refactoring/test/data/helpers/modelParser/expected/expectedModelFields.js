const modelFieldsExpectedResult = [
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
]

module.exports = modelFieldsExpectedResult;