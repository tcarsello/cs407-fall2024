require('dotenv').config()

const Course = require('../models/courseModel')
const User = require('../models/userModel')
const CourseInvite = require('../models/courseInviteModel')
const Topic = require('../models/topicModel')
const Term = require('../models/termModel')
const Question = require('../models/questionModel')
const Post = require('../models/postModel')

const Buffer = require('buffer').Buffer
const path = require('path')

const sequelize = require('../database')
const s3 = require('../objectstore')
const { Sequelize } = require('sequelize')

const { generateJoinCode } = require('../utils')

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
        res.status(400).json({ error: err })
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
                
                UNION

                SELECT
                    u."userId",
                    c."courseId"
                FROM
                    course c
                    INNER JOIN course_invite ci
                        ON ci."courseId"=c."courseId"
                    INNER JOIN "user" u
                        ON u.email=ci.email
                
                ) unionq
            WHERE
                unionq."userId"= :userId
                AND unionq."courseId"= :courseId
            LIMIT 1;
        `

        const results = await sequelize.query(queryString, {
            replacements: {
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
        res.status(400).json({ error: err })
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
        res.status(400).json({ error: err })
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
        res.status(400).json({ error: err })
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

        await CourseInvite.destroy({
            where: {
                courseId,
                email: user.email
            }
        })

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

        const course = await Course.findOne({ where: { courseId } })
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

const declineInvite = async (req, res) => {
    try {

        const { courseId } = req.params

        const user = await User.findOne({
            where: {
                userId: req.user.userId
            }
        })

        await CourseInvite.destroy({
            where: {
                courseId,
                email: user.email
            }
        })

        res.status(200).json({ message: "Invitation declined" })

    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const getMembers = async (req, res) => {
    try {

        const { courseId } = req.params

        const queryString = `
            SELECT
                u."userId",
                u."firstName",
                u."lastName"
            FROM
                "user" u
                INNER JOIN course_members cm
                    ON cm."userUserId"=u."userId"
                INNER JOIN course c
                    ON c."courseId"=cm."courseCourseId"
            WHERE
                c."courseId"=:courseId
            
            UNION

            SELECT
                u."userId",
                u."firstName",
                u."lastName"
            FROM
                "user" u
                INNER JOIN course c
                    ON c."coordinatorId"=u."userId"
            WHERE
                c."courseId"=:courseId
        `

        const members = await sequelize.query(queryString, {
            replacements: {
                courseId
            },
            type: Sequelize.QueryTypes.SELECT
        })

        res.status(200).json({ members })

    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const putSettings = async (req, res) => {
    try {

        const { courseId } = req.params
        let { accessType, gameLimit } = req.body

        console.log(accessType)

        const course = await Course.findOne({
            where: {
                courseId,
                coordinatorId: req.user.userId
            }
        })

        if (!course) throw 'Course not found for this user'

        let joinCode = null;
        if (accessType === 'code') {
            joinCode = await generateJoinCode()
        }

        if (!gameLimit) gameLimit = 10

        await Course.update(
            {
                joinCode,
                gameLimit
            },
            {
                where: {
                    courseId,
                    coordinatorId: req.user.userId
                }
            }
        )

        res.status(200).json({ joinCode })
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: 'Invalid settings' })
    }
}

const getSettingsAdmin = async (req, res) => {
    try {

        const { courseId } = req.params

        const course = await Course.findOne({
            where: {
                courseId,
                coordinatorId: req.user.userId
            }
        })

        if (!course) throw 'Course not found for this user'

        const settings = {
            joinCode: course.joinCode,
            gameLimit: course.gameLimit,
        }

        res.status(200).json(settings)
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const joinCourseByCode = async (req, res) => {
    try {

        const { joinCode } = req.body

        const user = await User.findOne({
            where: {
                userId: req.user.userId
            }
        })

        if (!user) throw 'No user found'

        const course = await Course.findOne({
            where: {
                joinCode
            }
        })

        if (!course) throw 'Invalid code'

        user.addCourse(course)

        res.status(200).json(course)
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const uploadCoursePicture = async (req, res) => {
    try {

        const { courseId } = req.params
        const { mimeType, imageBase64 } = req.body

        if (!mimeType) throw "Mime type must be provided"
        if (!imageBase64) throw 'Image base64 must be provided'

        const course = await Course.findOne({
            where: {
                courseId,
                coordinatorId: req.user.userId
            }
        })
        if (!course) throw "Course not found for this user"

        let fileExt = mimeType.split('/')[1].toLowerCase()

        if (fileExt === 'jpg') fileExt = 'jpeg'
        if (!['jpeg', 'png'].includes(fileExt)) throw "File extension must be jpeg or png"

        const buffer = Buffer.from(imageBase64, 'base64')

        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: `course_pictures/${courseId}_cp.${fileExt}`,
            Body: buffer,
            ContentType: mimeType
        }
        const data = await s3.upload(params).promise()

        await Course.update(
            {
                pfpFileType: fileExt
            },
            {
                where: {
                    courseId
                }
            }
        )

        res.status(200).json({
            message: 'Profile picture uploaded successfully',
            imageUrl: data.Location
        })
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const getCoursePicture = async (req, res) => {
    try {

        const { courseId } = req.params

        const course = await Course.findOne({
            where: {
                courseId
            }
        })
        if (!course) throw "Course not found"

        if (!course.pfpFileType) {

            const defaultImagePath = path.join(__dirname, '../static/default-pfp.jpeg')
            res.sendFile(defaultImagePath)
            return

        }

        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: `course_pictures/${courseId}_cp.${course.pfpFileType}`
        }

        const data = await s3.getObject(params).promise()

        res.setHeader('Content-Type', data.ContentType || `image/${course.pfpFileType}`)
        res.send(data.Body)
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const getCourseTopics = async (req, res) => {
    try {

        const { courseId } = req.params
        
        const topics = await Topic.findAll({
            where: {
                courseId
            }
        })

        res.status(200).json({ topics })
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}
const createTerm = async (req, res) => {
    const { courseId, topicId } = req.params;
    const { termName, termDefinition } = req.body;

    try {
        const topic = await Topic.findOne({ where: { topicId, courseId } });
        if (!topic) {
            return res.status(404).json({ error: 'Topic not found for this course' });
        }

        const newTerm = await Term.create({
            topicId: topic.topicId,
            termName,
            termDefinition
        });

        res.status(201).json(newTerm);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create the term' });
    }
};

const getCourseTerms = async (req, res) => {

    const { courseId } = req.params;

    try {

        const queryString = `
            SELECT
                t.*
            FROM term t
                INNER JOIN topic ON topic."topicId"=t."topicId"
                INNER JOIN course c ON c."courseId"=topic."courseId"
            WHERE
                c."courseId"=:courseId
            ORDER BY
                t."termId"
            ;
        `
        const terms = await sequelize.query(queryString, {
            replacements: {
                courseId
            },
            type: Sequelize.QueryTypes.SELECT
        })

        res.status(200).json({ terms })

    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }

}

const getCourseQuestions = async (req, res) => {
    try {

        const { courseId } = req.params

        const queryString = `
            SELECT
                q.*
            FROM
                question q
                INNER JOIN topic t ON t."topicId"=q."topicId"
                INNER JOIN course c ON c."courseId"=t."courseId"
            WHERE
                c."courseId" = :courseId
            ;
        `
        const questions = await sequelize.query(queryString, {
            replacements: {
                courseId
            },
            type: Sequelize.QueryTypes.SELECT
        })

        res.status(200).json({ questions })

    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const getCoursePosts = async (req, res) => {

    try {

        const { courseId } = req.params 

        const queryString = `
            SELECT
                p.*,
                u."firstName",
                u."lastName"
            FROM
                post p
                INNER JOIN "user" u ON u."userId"=p."userId"
            WHERE
                p."courseId"=:courseId
            ORDER BY
                p."createdAt" DESC
            ;
        `

        const posts = await sequelize.query(queryString, {
            replacements: {
                courseId
            },
            type: Sequelize.QueryTypes.SELECT
        })

        res.status(200).json({ posts })
    } catch (err) {
        res.status(err).json({error: err})
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
    removeUserFromCourse,
    declineInvite,
    getMembers,
    putSettings,
    getSettingsAdmin,
    joinCourseByCode,
    uploadCoursePicture,
    getCoursePicture,
    getCourseTopics,
    createTerm,
    getCourseTerms,
    getCourseQuestions,
    getCoursePosts
}
