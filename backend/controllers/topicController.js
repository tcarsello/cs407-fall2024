
const Topic = require('../models/topicModel')
const Course = require('../models/courseModel')

const createTopic = async (req, res) => {
    try {
        
        const { courseId, topicName } = req.body

        const course = await Course.findOne({
            where: {
                courseId,
                coordinatorId: req.user.userId
            }
        })

        if (!course) throw 'Course not found for this user'

        const topic = await Topic.create({
            courseId,
            topicName
        })

        res.status(200).json({ topic })
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const getTopic = async (req, res) => {
    try {
         
        const { topicId } = req.params

        const topic = await Topic.findOne({
            where: { topicId }
        })

        res.status(200).json({ topic })
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const updateTopic = async (req, res) => {
    try {
        
        const { topicId } = req.params
        const { topicName } = req.body

        let topic = await Topic.findOne({
            where: { topicId }
        })

        if (!topic) throw 'Topic not found'

        let course = await Course.findOne({
            where: {
                courseId: topic.courseId,
                coordinatorId: req.user.userId
            }
        })

        if (!course) throw 'No access for this topic'

        await Topic.update(
            { topicName },
            {
                where: { topicId }
            }
        )

        res.status(200).json({ message: 'Topic updated' })
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const deleteTopic = async (req, res) => {
    try {
         
        const { topicId } = req.params

        let topic = await Topic.findOne({
            where: { topicId }
        })

        if (!topic) throw 'Topic not found'

        let course = await Course.findOne({
            where: {
                courseId: topic.courseId,
                coordinatorId: req.user.userId
            }
        })

        if (!course) throw 'No access foro this topic'

        await Topic.destroy({
            where: {
                topicId
            }
        })

        res.status(200).json({ message: 'Topic deleted' })
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

module.exports = {
    createTopic,
    getTopic,
    updateTopic,
    deleteTopic
}