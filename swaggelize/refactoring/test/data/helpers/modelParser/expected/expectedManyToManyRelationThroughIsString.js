const modelManyToMannyRelationThroughIsStringExpectedResult = {
    "relations": [
        {
            "type": "relation",
            "relation": "belongsToMany",
            "source": "User",
            "target": "Instrument",
            "args": [
                "Instrument",
                {
                    "through": "InstrumentUsers",
                    "association": "Instruments",
                    "foreignKey": "instrumentId"
                }
            ]
        },
        {
            "type": "relation",
            "relation": "belongsToMany",
            "source": "Instrument",
            "target": "User",
            "args": [
                "User",
                {
                    "through": "InstrumentUsers",
                    "association": "Users",
                    "foreignKey": "userId"
                }
            ]
        }
    ]
}

module.exports = modelManyToMannyRelationThroughIsStringExpectedResult;