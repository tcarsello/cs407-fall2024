const Announcement = require("../models/announcementModel")
const Course = require('../models/courseModel')
const User = require('../models/userModel')

const sequelize = require('../database')
const { Sequelize, Op } = require('sequelize')
require('dotenv')

const nodemailer = require('nodemailer')

const sendNotifications = async (courseId, title, body, public) => {

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD_APP_EMAIL,
        },
        sendingRate: 1,
    });

    const course = await Course.findOne({
        where: { courseId }
    })

    const coordinator = await User.findOne({
        where: {
            userId: course.coordinatorId,
        }
    })

    const queryStringMembers = `
        SELECT
            u.email,
            u."announcementNotifications"
        FROM "user" u
            INNER JOIN course_members cs ON cs."userUserId"=u."userId"
        WHERE
            cs."courseCourseId"=:courseId
        ;
    `
    const queryStringAssistants = `
        SELECT
            u.email,
            u."announcementNotifications"
        FROM "user" u
            INNER JOIN assistant a ON a."userId"=u."userId"
        WHERE
            a."courseId"=:courseId
        ;
    `

    let userList = await sequelize.query(public ? queryStringMembers : queryStringAssistants, {
        replacements: {
            courseId
        },
        type: Sequelize.QueryTypes.SELECT
    })

    userList = [...userList, coordinator]
    userList.forEach(user => {
        if (!user.announcementNotifications) return

        const mailOptions = {
            from: process.env.EMAIL,
            to: user.email,
            subject: "Course Clash - New Announcement!",
            html: `<h1>${title}</h1>
            <p>${body}</p>
            `,
        };


        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Internal Server Error" });
            }

            res.status(200).send({ message: "Email sent successfully" });
        });
 
    })

}


const createAnnouncement = async (req, res) => {
    try {

        const { courseId, title, body, public } = req.body

        if (!courseId) throw 'Course ID must be provided'
        if (!title) throw 'Title must be provided'
        if (!body) throw 'Body must be provided'

        const announcement = await Announcement.create({
            courseId,
            title,
            body,
            public
        })

        setImmediate(() => {sendNotifications(courseId, title, body, public)})

        res.status(200).json({announcement})
    } catch (err) {
        console.error(err)
        res.status(400).json({error: err})
    }
}

const getAnnouncement = async (req, res) => {
    try {
        const { announcementId } = req.params

        const announcement = await Announcement.findOne({
            where: {
                announcementId
            }
        })

        if (!announcement) throw 'Not found'

        res.status(200).json({announcement})
    } catch (err) {
        console.error(err)
        res.status(400).json({error: err})
    }
}

const updateAnnouncement = async (req, res) => {
    try {
        const { annoucementId } = req.params
        const { title, body, public } = req.body

        const announcement = await Announcement.findOne({ where: { annoucementId } })
        if (!announcement) throw 'Announcement not found'

        await Announcement.update(
            { title, body, public },
            {
                where: {
                    annoucementId
                }
            }
        )

        res.status(200).json({ message: 'Announcement updated' })
    } catch (err) {
        console.error(err)
        res.status(400).json({error: err})
    }
}

const deleteAnnouncement = async (req, res) => {
    try {
        const { announcementId } = req.params

        await Announcement.destroy({
            where: {
                announcementId
            }
        })

        res.status(200).json({ message: 'Announcement deleted' })
    } catch (err) {
        console.error(err)
        res.status(400).json({error: err})
    }
}

module.exports = {
    createAnnouncement,
    getAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
}
