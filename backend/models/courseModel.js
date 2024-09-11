const { DataTypes } = require('sequelize')
const sequelize = require('../database')

const User = require('./userModel')

const Course = sequelize.define('Course', {
    courseId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    coordinatorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'userId'
        }
    },
    courseName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    courseDescription: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'course',
    timestamps: true
})

Course.belongsTo(User, { foreignKey: 'coordinatorId' })

module.exports = Course