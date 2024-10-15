const { DataTypes } = require('sequelize')
const sequelize = require('../database')

const User = require('./userModel')
const Reply = require('./replyModel')

const ReplyUpVote = sequelize.define('reply_upvote', {
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
            model: Reply,
            key: 'replyId'
        },
        primaryKey: true,
    }
}, {
    tableName: 'reply_upvote',
    timestamps: true
})

ReplyUpVote.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' })
ReplyUpVote.belongsTo(Reply, { foreignKey: 'postId', onDelete: 'CASCADE' })

module.exports = ReplyUpVote