const Course = require('../models/courseModel')
const User = require('../models/userModel')
const CourseInvite = require('../models/courseInviteModel')

const createCourse = async (req, res) => {
    try {

        const { courseName, courseDescription } = req.body

        if (!courseName) throw "Course Name is required"

        const course = await Course.create({
            coordinatorId: req.user.userId,
            courseName,
            courseDescription
        })

        res.status(200).json(course.dataValues)

    } catch (err) {
        console.error(err)
        res.status(400).json({error: err})
    }
}

const getCourse = async (req, res) => {
    try {

        const { courseId } = req.params

        const course = await Course.findOne({
            where: {
                courseId,
                coordinatorId: req.user.userId
            }
        })
        if (!course) throw "Course not found for such user"

        res.status(200).json(course.dataValues)

    } catch (err) {
        console.error(err)
        res.status(400).json({error: err})
    }
}

const deleteCourse = async (req, res) => {
    try {

        const { courseId } = req.params

        const deletedCount = await Course.destroy({
            where: {
                courseId,
                coordinatorId: req.user.userId
            }
        })
        if (deletedCount === 0) throw "Course not found for such user"

        res.status(200).json({
            message: "Course deleted"
        })

    } catch (err) {
        console.error(err)
        res.status(400).json({error: err})
    }
}

const updateCourse = async (req, res) => {
    try {

        const { courseId } = req.params
        const { courseName, courseDescription } = req.body

        const [updatedCount] = await Course.update(
            {
                courseName,
                courseDescription
            },
            {
                where: {
                    courseId,
                    coordinatorId: req.user.userId
                }
            }
        )
        if (updatedCount === 0) throw "No course updated"

        res.status(200).json({
            message: "Course updated"
        })

    } catch (err) {
        console.error(err)
        res.status(400).json({error: err})
    }
}

const getCourseInvites = async (req, res) => {
    try {

        const { courseId } = req.params

        const invites = await CourseInvite.findAll({
            where: {
                courseId: courseId
            },
            include: [
                {
                    model: Course,
                    where: {
                        coordinatorId: req.user.userId
                    },
                    attributes: []
                }
            ]
        })

        res.status(200).json({ invites })

    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

module.exports = { createCourse, getCourse, deleteCourse, updateCourse, getCourseInvites }