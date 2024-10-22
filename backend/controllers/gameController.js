const Game = require('../models/gameModel')

const getGame = async (req, res) => {
    try {

        res.status(200).json()
    } catch (err) {
        console.error(err)
        res.status(400).json({error: err})
    }
}

const updateGame = async (req, res) => {
    try {

        res.status(200).json()
    } catch (err) {
        console.error(err)
        res.status(400).json({error: err})
    }
}

const deleteGame = async (req, res) => {
    try {

        res.status(200).json()
    } catch (err) {
        console.error(err)
        res.status(400).json({error: err})
    }
}

module.exports = {
    getGame,
    updateGame,
    deleteGame
}
