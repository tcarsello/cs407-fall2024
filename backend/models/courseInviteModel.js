const { DataTypes } = require('sequelize')
const sequelize = require('../database')

const Course = require('./courseModel')

const CourseInvite = sequelize.define('CourseInvite', {
    courseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: Course,
            key: 'courseId'
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        validate: {
            isEmail: true
        }
    }
}, {
    tableName: 'course_invite',
    timestamps: true
})

CourseInvite.belongsTo(Course, { foreignKey: 'courseId' })

module.exports = CourseInvite