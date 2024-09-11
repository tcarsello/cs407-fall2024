const { DataTypes } = require('sequelize')
const sequelize = require('../database')

const User = require('./userModel')

const Course = sequelize.define('course', {
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

Course.belongsToMany(User, { through: 'course_members' })
User.belongsToMany(Course, { through: 'course_members' })

module.exports = Course