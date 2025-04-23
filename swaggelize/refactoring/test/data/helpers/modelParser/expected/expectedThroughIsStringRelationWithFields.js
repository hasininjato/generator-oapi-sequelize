const manyToMannyRelationThroughIsStringExpectedResult = [
    {
        "type": "relation",
        "relation": "belongsToMany",
        "source": "User",
        "target": "Instrument",
        "through": "InstrumentUsers",
        "args": [
            "Instrument",
            {
                "through": "InstrumentUsers",
                "alias": "Instruments"
            }
        ]
    },
    {
        "type": "relation",
        "relation": "belongsToMany",
        "source": "Instrument",
        "target": "User",
        "through": "InstrumentUsers",
        "args": [
            "User",
            {
                "through": "InstrumentUsers",
                "alias": "Users"
            }
        ]
    }
]

module.exports = manyToMannyRelationThroughIsStringExpectedResult;