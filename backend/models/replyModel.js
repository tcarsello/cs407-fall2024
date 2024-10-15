const { DataTypes } = require('sequelize')
const sequelize = require('../database')

const User = require('./userModel')
const Post = require('./postModel')


const Reply = sequelize.define('reply', {
    replyId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'userId'
        }
    },
    postId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Post,
            key: 'postId'
        }
    },
    body: {
        type: DataTypes.TEXT,
        allowNull: false
    },
}, {
    tableName: 'reply',
    timestamps: true
})

Reply.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' })
Reply.belongsTo(Post, { foreignKey: 'postId', onDelete: 'CASCADE' })

module.exports = Reply