const CourseInvite = require('../models/courseInviteModel')
const Course = require('../models/courseModel')
const User = require('../models/userModel')

const nodemailer = require('nodemailer')

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
        } catch (e) { }

        const user = await User.findOne({
            where: {
                email
            }
        })

        if (user && user.inviteNotifications) {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PASSWORD_APP_EMAIL,
                },
                sendingRate: 1,
            });

            // TODO: Make link correct if hosted anywhere other than localhost
            const mailOptions = {
                from: process.env.EMAIL,
                to: email,
                subject: "Course Clash - You've been invited to a course!",
                html: `<h1>You have been invited to join: ${course.courseName}</h1>
                <p>${req.user.firstName} ${req.user.lastName} invites you to join the course.</p>
                `,
            };

            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: "Internal Server Error" });
                }

            });

        }

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
