const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.conf');
const Post = require('./post.model');
const Tag = require('./tag.model');

const PostTags = sequelize.define('PostTags', {
    /**
     * @swag
     * description: Tag name
     * methods: list, item, put, post
     */
    postId: {
        type: DataTypes.INTEGER,
        references: {
            model: Post,
            key: 'id',
        },
    },
    /**
     * @swag
     * description: Tag name
     * methods: list, item, put, post
     */
    tagId: {
        type: DataTypes.INTEGER,
        references: {
            model: Tag,
            key: 'id',
        },
    },
});

/**
 * @swag
 * relations: Tags
 */
Post.belongsToMany(Tag, { through: PostTags });
/**
 * @swag
 * relations: Posts
 */
Tag.belongsToMany(Post, { through: PostTags });

module.exports = PostTags;