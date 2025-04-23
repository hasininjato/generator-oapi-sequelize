const instrument = `
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.conf');
const User = require('./user.model');

const Instrument = sequelize.define('Instrument', {
    /**
     * @swag
     * methods: list, item, put, post
     */
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
    /**
     * @swag
     * methods: list, item, put, post
     * description: type of the instrument
     */
    type: {
        allowNull: false,
        type: DataTypes.STRING,
    },
    /**
     * @swag
     * methods: list, item
     */
    purchaseDate: {
        allowNull: false,
        type: DataTypes.DATE
    }
});

/**
 * @swag
 * relations: Instruments
 */
User.belongsToMany(Instrument, { through: 'InstrumentUsers' });
/**
 * @swag
 * relations: Users
 */
Instrument.belongsToMany(User, { through: 'InstrumentUsers' });

module.exports = Instrument;
`

module.exports = instrument;