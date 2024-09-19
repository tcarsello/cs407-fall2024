const CourseInvite = require('../models/courseInviteModel')
const Course = require('../models/courseModel')
const User = require('../models/userModel')

const createInvite = async (req, res) => {
    try {

        const { courseId } = req.params
        const { email } = req.body

        if (!email) throw "Invite email must be provided"

        const course = await Course.findOne({
            where: {
                courseId,
                coordinatorId: req.user.userId
            }
        })
        if (!course) throw "Course not found for such user"

        let invite = await CourseInvite.findOne({
            where: {
                courseId,
                email
            }
        })

        if (invite) throw 'Pending invite already exists for that user'

        try {
           invite = await CourseInvite.create({
                courseId,
                email
            })
        } catch (e) {}

        res.status(200).json({ invite })

    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const cancelInvite = async (req, res) => {
    try {

        const { courseId, email } = req.body

        if (!courseId) throw "Course Id must be provided"
        if (!email) throw "Email must be provided"

        const course = await Course.findOne({
            where: {
                courseId,
                coordinatorId: req.user.userId
            }
        })

        if (!course) throw "No access to this course"

        await CourseInvite.destroy({
            where: {
                courseId,
                email
            }
        })

        res.status(200).json({ message: "Invite canceled" })

    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

module.exports = { createInvite, cancelInvite }