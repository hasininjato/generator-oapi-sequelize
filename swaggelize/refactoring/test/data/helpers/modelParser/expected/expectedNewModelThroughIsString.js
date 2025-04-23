const newModelThroughIsString = {
    "sequelizeModel": "InstrumentUsers",
    "value": [
        {
            "field": "userId",
            "type": "field",
            "object": {
                "type": "DataTypes.INTEGER",
                "references": {
                    "model": "User"
                }
            },
            "comment": {
                "methods": [
                    "list",
                    "item"
                ],
                "description": "User ID"
            }
        },
        {
            "field": "instrumentId",
            "type": "field",
            "object": {
                "type": "DataTypes.INTEGER",
                "references": {
                    "model": "Instrument"
                }
            },
            "comment": {
                "methods": [
                    "list",
                    "item"
                ],
                "description": "Instrument ID"
            }
        }
    ],
    "relations": [
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
}

module.exports = newModelThroughIsString;