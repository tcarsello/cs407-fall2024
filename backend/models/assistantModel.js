const { DataTypes } = require('sequelize')
const sequelize = require('../database')

const Course = require('./courseModel')
const User = require('./userModel')

const Assistant = sequelize.define('assistant', {
    courseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: Course,
            key: 'courseId'
        }
    },
    userId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
            model: User,
            key: 'userId'
        }
    }
}, {
    tableName: 'assistant',
    timestamps: true
})

Assistant.belongsTo(Course, { foreignKey: 'courseId', onDelete: 'CASCADE' })
Assistant.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' })

module.exports = Assistant
