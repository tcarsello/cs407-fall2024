const Game = require("../models/gameModel")
const Topic = require("../models/topicModel")
const Round = require("../models/roundModel")
const RoundQuestion = require('../models/roundQuestionModel')
const Answer = require('../models/answerModel')
const Question = require('../models/questionModel')
const GameStats = require("../models/gameStatsModel")

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

        const topics = await Topic.findAll({
            where: {
                courseId: game.courseId
            }
        })

        if (!topics) throw 'Course topics not found'

        const question = await Question.findOne({
            where: {
                questionId: roundQuestion.questionId
            }
        })

        if (!topics) throw 'Course topics not found'

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
            correctId: correctAnswer.answerId,
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

        const gameStats = (
					await GameStats.findOrCreate({
						where: { userId: req.user.userId, courseId: game.courseId },
					})
				)[0];

		await Promise.all([
            Question.increment(
                {
                    totalAnswers: 1,
                    correctAnswers: response.isCorrect ? 1 : 0,
                },
                {
                    where: {
                        questionId,
                    },
                }
            ),
            gameStats.increment({ questionsAnswered: 1, questionsCorrect: response.isCorrect ? 1 : 0 }),
        ]);
        
        var newStats = gameStats.topicStats;
        if (gameStats.topicStats == "" || gameStats.topicStats == "0") {
            var newStats = "";
             for (const topic of topics) {
                newStats += topic.topicName
                newStats += ": "
                newStats += "0/0"
                newStats += ", "
            }
        }

        for (const topic of topics) {
            if (topic.topicId == question.topicId) {
                var ratio
                if (newStats.split(topic.topicName).length == 1) {
                    ratio = newStats.split(topic.topicName)[0].split(": ")[1].split(",")[0]
                } else {
                    ratio = newStats.split(topic.topicName)[1].split(": ")[1].split(",")[0]
                }
                
                var correct = ratio.split("/")[0]
                var total = ratio.split("/")[1]

                var inc = 0

                if (response.isCorrect == true) {
                    inc = 1
                }

                const newCorrect = Number(correct) + inc 
                const newTotal = Number(total) + 1

                const newTopicStat = topic.topicName + ": " + newCorrect + "/" + newTotal + ", "

                var preFix = newStats.split(topic.topicName + ": " + ratio + ",")[0]

                if (!preFix || preFix == null) {
                    preFix = ""
                } 

                var postFix = newStats.split(topic.topicName + ": " + ratio + ",")[1]

                if (!postFix || postFix == null) {
                    postFix = ""
                } 

                newStats = preFix + newTopicStat + postFix

                gameStats.update({topicStats: newStats})
                break
            }
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

        res.status(200).json({ question, answers, found: true })
    } catch (err) {
        if (err === 'No round question found') {
            res.status(200).json({ found: false})
        } else {
            console.error(err)
            res.status(400).json({error: err})
        }
    }
}

module.exports = {
    createRound,
    getRound,
    deleteRound,
    submitAnswer,
    fetchQuestion,
}
