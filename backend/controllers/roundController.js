const Game = require("../models/gameModel")
const Topic = require("../models/topicModel")
const Round = require("../models/roundModel")
const RoundQuestion = require('../models/roundQuestionModel')
const Answer = require('../models/answerModel')
const Question = require('../models/questionModel')

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

const submitAnswer = async (req, res) => {
    try {

        const { roundId } = req.params
        const { questionId, answerId } = req.body

        if (!questionId) throw 'Question ID must be provided'
        if (!answerId) throw 'Answer ID must be provided'

        const round = await Round.findOne({
            where: {
                roundId,
            }
        })

        if (!round) throw 'Round not found'

        const roundQuestion = await RoundQuestion.findOne({
            where: {
                roundId,
                questionId,
            }
        })

        if (!roundQuestion) throw 'Round Question not found'

        const game = await Game.findOne({
            where: {
                gameId: round.gameId,
            }
        })

        if (!game) throw 'Game not found'

        const answer = await Answer.findOne({
            where: {
                questionId,
                answerId,
            }
        })

        const correctAnswer =  await Answer.findOne({
            where: {
                questionId,
                isCorrect: true,
            }
        })

        if (!answer) throw 'Answer not found'

        let response = {
            isCorrect: answer.isCorrect,
            correctText: correctAnswer.text,
        }

        const updatedStatus = response.isCorrect ? 'Correct' : 'Incorrect'
        if (game.playerOneId === req.user.userId) {
            await RoundQuestion.update(
                {
                    playerOneStatus: updatedStatus
                },
                {
                    where: {
                        roundId,
                        questionId,
                    }
                }
            )
        } else {
            await RoundQuestion.update(
                {
                    playerTwoStatus: updatedStatus
                },
                {
                    where: {
                        roundId,
                        questionId,
                    }
                }
            )

        }

        res.status(200).json(response)
    } catch (err) {
        console.error(err)
        res.status(400).json({error: err})
    }
}

const fetchQuestion = async (req, res) => {
    try {

        const { roundId } = req.params

        const round = await Round.findOne({ where: { roundId } })
        if (!round) throw 'Round not found'

        const game = await Game.findOne({ where: { gameId: round.gameId }})
        if (!game) throw 'Game not found'

        const queryObj = {
            roundId,
        }

        if (game.playerOneId == req.user.userId) {
            queryObj.playerOneStatus = 'Unanswered'
        } else {
            queryObj.playerTwoStatus = 'Unanswered'
        }

        const roundQuestion = await RoundQuestion.findOne({ where: queryObj })
        if (!roundQuestion) throw 'No round question found'

        const question = await Question.findOne({where: { questionId: roundQuestion.questionId }})
        if (!question) throw 'NO question found'

        const answers = await Answer.findAll({ where: { questionId: question.questionId }})

        res.status(200).json({ question, answers })
    } catch (err) {
        console.error(err)
        res.status(400).json({error: err})
    }
}

module.exports = {
    createRound,
    getRound,
    deleteRound,
    submitAnswer,
    fetchQuestion,
}
