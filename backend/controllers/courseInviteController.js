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

        try {
            await CourseInvite.create({
                courseId,
                email
            })
        } catch (e) {}

        res.status(200).json({ message: 'Invite sent' })

    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

module.exports = { createInvite }