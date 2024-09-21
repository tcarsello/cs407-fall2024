const { DataTypes } = require('sequelize')
const sequelize = require('../database')

const Course = require('./courseModel')

const Topic = sequelize.define('topic', {
    topicId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    courseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Course,
            key: 'courseId'
        }
    },
    topicName: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'topic',
    timestamps: true
})

Topic.belongsTo(Course, { foreignKey: 'courseId' })

module.exports =  Topic