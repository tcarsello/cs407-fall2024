const { DataTypes } = require('sequelize')
const sequelize = require('../database')

const Question = require('./questionModel')

const Answer = sequelize.define('answer', {
    answerId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    questionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Question,
            key: 'questionId'
        },
    },
    text: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    isCorrect: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    tableName: 'answer',
    timestamps: true
})

Answer.belongsTo(Question, { foreignKey: 'questionId', onDelete: 'CASCADE' })
Question.hasMany(Answer, { foreignKey: 'questionId' })

module.exports = Answer