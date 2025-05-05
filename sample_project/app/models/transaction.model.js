const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.conf');
const User = require('./user.model');

const Transaction = sequelize.define('Transaction', {
    /**
     * @swag
     * methods: item, list
     * description: Id of the transaction
     */
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    /**
     * @swag
     * methods: item, list, put, post
     * description: Amount of the transaction
     */
    amount: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        unique: false,
        validate: {
            notNull: { msg: "Amount is required" },
            isDecimal: { msg: "Amount must be a valid decimal number" },
            notEmpty: { msg: "Amount cannot be empty" },
            min: {
                args: [0.01],
                msg: "Amount must be greater than 0"
            }
        }
    },
    /**
     * @swag
     * methods: item, list, put, post
     * description: Description of the transaction
     */
    description: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
        validate: {
            notNull: { msg: "Description is required" },
            notEmpty: { msg: "Description cannot be empty" }
        }
    },
    /**
     * @swag
     * methods: item, list
     */
    date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    timestamps: true
});

/**
 * @swag
 * relations: Transactions
 */
User.hasMany(Transaction, {
    foreignKey: {
        name: 'userId',
    }
});
Transaction.belongsTo(User, { foreignKey: 'userId' });

module.exports = Transaction;
