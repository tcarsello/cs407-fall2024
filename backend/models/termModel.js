const { DataTypes } = require('sequelize')
const sequelize = require('../database')

const Topic = require('./topicModel')

const Term = sequelize.define('term', {
    termId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    topicId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Topic,
            key: 'topicId'
        }
    },
    termName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    termDefinition: {
        type: DataTypes.TEXT,
        allowNull: false
    },
}, {
    tableName: 'term',
    timestamps: true
})

Term.belongsTo(Topic, { foreignKey: 'topicId', onDelete: 'CASCADE' })

module.exports = Term