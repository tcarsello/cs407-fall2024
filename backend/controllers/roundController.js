const Game = require("../models/gameModel")
const Topic = require("../models/topicModel")
const Round = require("../models/roundModel")

const createRound = async (req, res) => {
    try {
        
        const { gameId, topicId, } = req.body

        const topic = await Topic.findOne({
            where: {
                topicId
            }
        })
        const game = await Game.findOne({
            where: {
                gameId
            }
        })
        if (!topic) throw 'topic not found'

        if (!game) throw 'game not found'

        const round = await Topic.create({
            roundId,
            gameId
        })

        res.status(200).json({ round })
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const getRound = async (req, res) => {
    try {
         
        const { roundId } = req.params

        const round = await Round.findOne({
            where: { roundId }
        })

        res.status(200).json({ round })
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const deleteRound = async (req, res) => {
    try {
         
        const { roundId } = req.params

        let round = await Round.findOne({
            where: { roundId }
        })

        if (!round) throw 'Round not found'

        await Round.destroy({
            where: { roundId }
        })

        res.status(200).json({ message: 'Round deleted' })
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

module.exports = {
    createRound,
    getRound,
    deleteRound
}