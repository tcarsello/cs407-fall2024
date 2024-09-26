
const User = require('../models/userModel')
const Course = require('../models/courseModel')
const Topic = require('../models/topicModel')
const Question = require('../models/questionModel')
const Answer = require('../models/answerModel')

const sequelize = require('../database')
const { Sequelize } = require('sequelize')

const validateCoordinator = async (userId, topicId) => {

    const queryString = `
        SELECT
            *
        FROM
            topic t
            INNER JOIN course c ON c."courseId"=t."courseId"
            INNER JOIN "user" u ON u."userId"=c."coordinatorId"
        WHERE
            u."userId"=:userId
            AND t."topicId"=:topicId
        ;
    `
    const results = await sequelize.query(queryString, {
        replacements: {
            userId,
            topicId
        },
        type: Sequelize.QueryTypes.SELECT
    })

    return results.length > 0

}

const createQuestion = async (req, res) => {
    try {

        const { topicId, text, imageBase64, imageMimeType, answerList } = req.body

        if (!(text || (imageBase64 && imageMimeType))) throw 'Question text and/or image must be provided'
        if (!answerList || answerList.length < 1) throw 'Answer choices must be provided'

        if (!answerList.find(answer => answer.isCorrect)) throw 'Answer list must have a correct answer'

        const valid = await validateCoordinator(req.user.userId, topicId)
        if (!valid) throw 'No access to this topic'

        const question = await Question.create({
            text,
            topicId
        })

        // Make answers
        await Promise.all(answerList.map(answer => Answer.create({ ...answer, questionId: question.questionId })))

        res.status(200).json({question})
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const getQuestion = async (req, res) => {
    try {

        res.status(200).json()
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const updateQuestion = async (req, res) => {
    try {

        res.status(200).json()
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const deleteQuestion = async (req, res) => {

    try {

        const { questionId } = req.params

        const question = await Question.findOne({ where: { questionId} })
        if (!question) throw 'Question not found'

        const valid = await validateCoordinator(req.user.userId, question.topicId)
        if (!valid) throw 'No access to this topic'

        await Question.destroy({
            where: {
                questionId
            }
        })

        res.status(200).json({ message: 'Question removed' })
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const getQuestionAnswers = async (req, res) => {
    try {

        const { questionId } = req.params

        const answers = await Answer.findAll({
            where: {
                questionId
            }
        })

        res.status(200).json({answers})

    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

module.exports = {
    createQuestion,
    getQuestion,
    updateQuestion,
    deleteQuestion,
    getQuestionAnswers
}