const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.conf');

const User = sequelize.define('user', {
    /**
     * @swag
     * methods: item, list, login
     * description: Id of the user
     */
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    /**
     * @swag
     * methods: item, list, put, post, login
     * description: User fullname
     */
    fullname: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
        validate: {
            notNull: { msg: "Full name is required" },
            notEmpty: { msg: "Full name cannot be empty" }
        }
    },
    /**
     * @swag
     * methods: item, list, put, post, login
     * description: Email user
     */
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
            name: "unique_email",
            msg: "This email is already in use"
        },
        validate: {
            notNull: { msg: "Email is required" },
            notEmpty: { msg: "Email cannot be empty" },
            isEmail: {
                msg: "Invalid email"
            }
        }
    },
    /**
     * @swag
     * methods: put, post
     */
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: "Password is required" },
            notEmpty: { msg: "Password cannot be empty" }
        }
    },
}, {
    timestamps: true
});

module.exports = User;
