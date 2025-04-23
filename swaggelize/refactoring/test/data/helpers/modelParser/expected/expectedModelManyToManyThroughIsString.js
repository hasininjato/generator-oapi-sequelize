const modelManyToManyThroughIsStringExpectedResult = [
    {
        "sequelizeModel": "Instrument",
        "value": [
            {
                "field": "id",
                "type": "field",
                "object": {
                    "allowNull": false,
                    "autoIncrement": true,
                    "primaryKey": true,
                    "type": "DataTypes.INTEGER"
                },
                "comment": {
                    "methods": [
                        "list",
                        "item",
                        "put",
                        "post"
                    ],
                    "description": ""
                }
            },
            {
                "field": "type",
                "type": "field",
                "object": {
                    "allowNull": false,
                    "type": "DataTypes.STRING"
                },
                "comment": {
                    "methods": [
                        "list",
                        "item",
                        "put",
                        "post"
                    ],
                    "description": "type of the instrument"
                }
            },
            {
                "field": "purchaseDate",
                "type": "field",
                "object": {
                    "allowNull": false,
                    "type": "DataTypes.DATE"
                },
                "comment": {
                    "methods": [
                        "list",
                        "item"
                    ],
                    "description": ""
                }
            }
        ],
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
    },
    {
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
]

module.exports = modelManyToManyThroughIsStringExpectedResult