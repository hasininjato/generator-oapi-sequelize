const modelOneToMannyRelationExpectedResult = {
    "relations": [
        {
            "type": "relation",
            "relation": "hasMany",
            "source": "User",
            "target": "Post",
            "args": [
                "Post",
                {
                    "onDelete": "CASCADE",
                    "foreignKey": "postId",
                    "association": "Posts"
                }
            ]
        }
    ]
}

module.exports = modelOneToMannyRelationExpectedResult;