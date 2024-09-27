const { DataTypes } = require('sequelize')
const sequelize = require('../database')

const Topic = require('./topicModel')

const Question = sequelize.define('question', {
    questionId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement:  true
    },
    topicId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Topic,
            key: 'topicId'
        }
    },
    text: {
        type: DataTypes.TEXT
    },
    imageURI: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    difficulty: {
        type: DataTypes.ENUM('easy', 'regular', 'hard' ),
        defaultValue: 'regular',
        allowNull: false
    },
}, {
    timestamps: true,
    tableName: 'question'
})

Question.belongsTo(Topic, { foreignKey: 'topicId', onDelete: 'CASCADE' })

module.exports = Question
