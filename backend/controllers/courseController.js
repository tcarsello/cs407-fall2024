const Course = require('../models/courseModel')
const User = require('../models/userModel')
const CourseInvite = require('../models/courseInviteModel')

const sequelize = require('../database')
const { Sequelize } = require('sequelize')

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

        const queryString = `
            SELECT
                unionq."userId",
                unionq."courseId"
            FROM (
                SELECT
                    u."userId",
                    c."courseId"
                FROM
                    course c
                    INNER JOIN "user" u
                        ON u."userId"=c."coordinatorId"
                
                UNION
                
                SELECT
                    u."userId",
                    c."courseId"
                FROM
                    course c
                    INNER JOIN course_members cm
                        ON c."courseId"=cm."courseCourseId"
                    INNER JOIN "user" u
                        ON u."userId"=cm."userUserId"
                
                ) unionq
            WHERE
                unionq."userId"= :userId
                AND unionq."courseId"= :courseId
            LIMIT 1;
        `

        const results = await sequelize.query(queryString, {
            replacements:{
                courseId,
                userId: req.user.userId
            },
            type: Sequelize.QueryTypes.SELECT
        })
        
        if (results.length <= 0) throw 'Course not found for such user'

        const course = await Course.findOne({
            where: {
                courseId: results[0].courseId
            }
        })

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

const joinCourse = async (req, res) => {
    try {

        const { courseId } = req.params

        const invite = await CourseInvite.findOne({
            where: {
                courseId,
                email: req.user.email
            }
        })
        if (!invite) throw "Not invited to this course"

        const course = await Course.findOne({
            where: {
                courseId
            }
        })

        const user = await User.findOne({
            where: {
                userId: req.user.userId
            }
        })

        if (!user) throw "User does not exist"
        if (!course) throw "Course does not exist"

        user.addCourse(course)

        res.status(200).json({ message: 'Joined course' })

    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const leaveCourse = async (req, res) => {
    try {

        const { courseId } = req.params

        const user = await User.findOne({
            where: {
                userId: req.user.userId
            }
        })
        if (!user) throw "User not found"

        const course = await Course.findOne({ where: { courseId } } )
        if (!course) throw "Course not found"

        user.removeCourse(course)

        res.status(200).json({ message: "Left course" })

    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const removeUserFromCourse = async (req, res) => {
    try {

        const { courseId } = req.params
        const { userId, email } = req.body

        const course = await Course.findOne({
            where: { courseId }
        })
        if (!course) throw "Course not found"
        if (req.user.userId != course.coordinatorId) throw "Must be course coordinator"

        let userQuery = {}
        if (userId) userQuery.userId = userId
        if (email) userQuery.email = email

        const user = await User.findOne({
            where: { ...userQuery }
        })
        if (!user) throw "User not found"

        user.removeCourse(course)
        await CourseInvite.destroy({
            where: {
                courseId,
                email: user.email
            }
        })

        res.status(200).json({ message: "User removed from course" })

    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

module.exports = {
    createCourse,
    getCourse,
    deleteCourse,
    updateCourse,
    getCourseInvites,
    joinCourse,
    leaveCourse,
    removeUserFromCourse
}