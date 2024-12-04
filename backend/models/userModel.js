const { DataTypes } = require('sequelize')
const sequelize = require('../database')

const User = sequelize.define('user', {
    userId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    passwordHash: {
        type: DataTypes.STRING,
        allowNull: false
    },
    pfpFileType: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    lightMode: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    challengeNotifications: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    inviteNotifications: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    announcementNotifications: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },

}, {
    tableName: 'user',
    timestamps: true,
})

module.exports = User
