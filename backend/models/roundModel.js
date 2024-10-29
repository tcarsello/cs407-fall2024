const { DataTypes } = require('sequelize')
const sequelize = require('../database')

const Topic = require('./topicModel')
const Game = require('./gameModel')

const Round = sequelize.define('round', {
    roundId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    topicId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Topic,
            key: 'topicId'
        }
    },
    gameId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Game,
            key: 'gameId'
        }
    }
}, {
    tableName: 'round',
    timestamps: true
})

Round.belongsTo(Game, { foreignKey: 'gameId' })

module.exports = Round;
