const modelOneToOneRelationExpectedResult = {
    "relations": [
        {
            "type": "relation",
            "relation": "hasOne",
            "source": "User",
            "target": "Profile",
            "args": [
                "Profile",
                {
                    "foreignKey": "profileId"
                }
            ]
        }
    ]
}

module.exports = modelOneToOneRelationExpectedResult;