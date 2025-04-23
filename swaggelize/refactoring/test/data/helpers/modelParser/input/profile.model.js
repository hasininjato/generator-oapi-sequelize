const profile = `
const Profile = sequelize.define('Profile', {
    /**
     * @swag
     * description: Profile ID
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
     * description: Profile bio
     * methods: list, item, put, post
     */
    bio: DataTypes.TEXT
}, {
    timestamps: true
});

User.hasOne(Profile);
Profile.belongsTo(User);
`

module.exports = profile;