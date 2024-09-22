const Term = require('../models/termModel')
const Topic = require('../models/topicModel')
const Course = require('../models/courseModel')

const sequelize = require('../database')
const { Sequelize } = require('sequelize')

const validateAccess = async (termId, userId) => {

    const queryString = `
        SELECT
            *
        FROM
            term t
            INNER JOIN topic top ON t."topicId"=top."topicId"
            INNER JOIN course c ON top."courseId"=c."courseId"
            LEFT JOIN "user" u ON u."userId"=c."coordinatorId"
            LEFT JOIN course_members cm
                ON cm."userUserId"=u."userId" AND cm."courseCourseId"=c."courseId"
        WHERE
            t."termId"=:termId
            AND u."userId"=:userId
    `
    const results = await sequelize.query(queryString, {
        replacements: {
            termId,
            userId
        },
        type: Sequelize.QueryTypes.SELECT
    })

    return results.length > 0

}

const createTerm = async (req, res) => {
    try {

        const { topicId, termName, termDefinition } = req.body

        const topic = await Topic.findOne({
            where: { topicId }
        })

        if (!topic) throw 'Topic not found'

        const course = await Course.findOne({
            where: {
                courseId: topic.courseId,
                coordinatorId: req.user.userId
            }
        })

        if (!course) throw 'Course not found'

        const term = await Term.create({
            topicId,
            termName,
            termDefinition
        })

        res.status(200).json({ term })
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const getTerm = async (req, res) => {
    try {

        const { termId } = req.params

        const access = await validateAccess(termId, req.user.userId)
        if (!access) throw 'No access'

        const term = await Term.findOne({
            where: { termId }
        })

        res.status(200).json({ term })
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const updateTerm = async (req, res) => {
    try {

        const { termId } = req.params
        const { termName, termDefinition } = req.body

        const access = await validateAccess(termId, req.user.userId)
        if (!access) throw 'No access'

        await Term.update(
            {
                termName,
                termDefinition
            },
            {
                where: {
                    termId
                }
            }
        )

        res.status(200).json({ message: 'Term updated' })
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const deleteTerm = async (req, res) => {
    try {

        const { termId } = req.params

        const access = await validateAccess(termId, req.user.userId)
        if (!access) throw 'No access'

        await Term.destroy(
            {
                where: {
                    termId
                }
            }
        )

        res.status(200).json({ message: 'Term deleted' })
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

module.exports = {
    createTerm,
    getTerm,
    updateTerm,
    deleteTerm
}