const { DataTypes } = require('sequelize')
const sequelize = require('../database')

const User = require('./userModel')
const Post = require('./postModel')

const PostUpvote = sequelize.define('post_upvote', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'userId'
        },
        primaryKey: true,
    },
    postId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Post,
            key: 'postId'
        },
        primaryKey: true,
    }
}, {
    tableName: 'post_upvote',
    timestamps: true
})

PostUpvote.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' })
PostUpvote.belongsTo(Post, { foreignKey: 'postId', onDelete: 'CASCADE' })

module.exports = PostUpvote