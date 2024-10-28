const { DataTypes } = require('sequelize')
const sequelize = require('../database')

const Question = require('./questionModel')
const Round = require('./roundModel')

const RoundQuestion = sequelize.define('round_question', {
    questionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: Question,
            key: 'questionId'
        },
    },
    roundId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: Round,
            key: 'roundId'
        }
    },
    playerOneStatus: {
        type: DataTypes.ENUM('Unanswered', 'Correct', 'Incorrect'),
        allowNull: false,
        defaultValue: 'Unanswered',
    },
    playerTwoStatus: {
        type: DataTypes.ENUM('Unanswered', 'Correct', 'Incorrect'),
        allowNull: false,
        defaultValue: 'Unanswered',
    },

}, {
    tableName: 'round_question',
    timestamps: true
})

RoundQuestion.belongsTo(Question, { foreignKey: 'questionId', onDelete: 'CASCADE' })
RoundQuestion.belongsTo(Round, { foreignKey: 'roundId', onDelete: 'CASCADE' })

module.exports = RoundQuestion
