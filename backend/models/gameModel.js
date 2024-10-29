const { DataTypes } = require('sequelize')
const sequelize = require('../database')

const Course = require('./courseModel')
const User = require('./userModel')

const Game = sequelize.define('game', {
    gameId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    courseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Course,
            key: 'courseId'
        }
    },
    playerOneId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'userId'
        }
    },
    playerTwoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'userId'
        }
    },
    status: {
        type: DataTypes.ENUM('New', 'In Progress', 'Player One Win', 'Player Two Win', 'Tie'),
        allowNull: false,
        defaultValue: 'New'
    },
    maxRounds: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }

}, {
    tableName: 'game',
    timestamps: true
})

Game.belongsTo(Course, { foreignKey: 'courseId', onDelete: 'CASCADE' })
Game.belongsTo(User, { foreignKey: 'playerOneId', onDelete: 'CASCADE' })
Game.belongsTo(User, { foreignKey: 'playerTwoId', onDelete: 'CASCADE' })

module.exports = Game
