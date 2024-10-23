const { DataTypes } = require('sequelize')
const sequelize = require('../database')

const User = require('./userModel')

const Friendship = sequelize.define('friendship', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: User,
            key: 'userId',
        }
    },
    friendId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: User,
            key: 'userId',
        }
    },
}, {
    tableName: 'friendship',
    timestamps: true
})

Friendship.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' })
Friendship.belongsTo(User, { foreignKey: 'friendId', onDelete: 'CASCADE' })

module.exports = Friendship
