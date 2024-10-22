const { DataTypes } = require('sequelize')
const sequelize = require('../database')

const User = require('./userModel')
const Course = require('./courseModel')

const Challenge = sequelize.define('challenge', {
    courseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: Course,
            key: "courseId",
        }
    },
    contenderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: User,
            key: 'userId',
        }
    },
    challengerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: User,
            key: 'userId',
        }
    },
}, {
    tableName: 'challenge',
    timestamps: true
})

Challenge.belongsTo(User, { foreignKey: 'contenderId', onDelete: 'CASCADE' })
Challenge.belongsTo(User, { foreignKey: 'challengerId', onDelete: 'CASCADE' })
Challenge.belongsTo(Course, { foreignKey: 'courseId', onDelete: 'CASCADE' })

module.exports = Challenge
