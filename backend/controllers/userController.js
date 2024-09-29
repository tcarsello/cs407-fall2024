require('dotenv').config()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const Buffer = require('buffer').Buffer
const path = require('path')

const sequelize = require('../database')
const s3 = require('../objectstore')
const { Sequelize } = require('sequelize')

const User = require('../models/userModel')
const Course = require('../models/courseModel')
const CourseInvite = require('../models/courseInviteModel')

const { createJWT } = require('../utils')

const genSalt = async () => {
    const salt = await bcrypt.genSalt(5)
    return salt
}

const createUser = async (req, res) => {
    try {

        const { email, firstName, lastName, password } = req.body

        if (!email) throw "Email must be provided"
        if (!firstName) throw "First Name must be provided"
        if (!lastName) throw "Last Name must be provided"
        if (!password) throw "Password must be provided"

        if (password.length < 6) throw "Password must be at least 6 characers"

        const queryUser = await User.findOne({
            where: {
                email
            }
        })
        if (queryUser) throw "A user already exists with that email address"

        const salt = await genSalt()
        const passwordHash = await bcrypt.hash(password, salt)

        const user = await User.create({
            email,
            firstName,
            lastName,
            passwordHash,
        })
        const token = createJWT(user.dataValues.userId)

        res.status(200).json({
            ...user.dataValues,
            token,
        })

    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const forgotPassword = async (req, res) => {
	try {
		const { email } = req.body;

		if (!email) throw "Email must be provided";
		const user = await User.findOne({
			where: {
				email,
			},
		});
		if (!user) throw "Email not found";

		const token = jwt.sign({ _id: user.dataValues.userId }, process.env.JWT_SECRET, { expiresIn: "15m" });

		const transporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: process.env.EMAIL,
				pass: process.env.PASSWORD_APP_EMAIL,
			},
			sendingRate: 1,
		});

		// TODO: Make link correct if hosted anywhere other than localhost
		const link = `http://localhost:3000/reset-password/${token}`;
		const mailOptions = {
			from: process.env.EMAIL,
			to: email,
			subject: "Course Clash - Reset Password",
			html: `<h1>Course Clash Password Reset</h1>
            <p>Hello ${user.firstName}. Please click the following link to reset your Course Clash password:</p>
            <a href="${link}">${link}</a>
            <p>The link will expire in 15 minutes.</p>`,
		};

		transporter.sendMail(mailOptions, (err, info) => {
			if (err) {
				console.error(err);
				return res.status(500).json({ error: "Internal Server Error" });
			}

			res.status(200).send({ message: "Email sent successfully" });
		});
	} catch (err) {
		console.error(err);
		res.status(400).json({ error: JSON.stringify(err) });
	}
};

const loginUser = async (req, res) => {
    try {

        const { email, password } = req.body

        if (!email) throw "Email must be provided"
        if (!password) throw "Password must be provided"

        const user = await User.findOne({
            where: {
                email
            }
        })
        if (!user) throw "Invalid credentials"

        const match = await bcrypt.compare(password, user.dataValues.passwordHash)
        if (!match) throw "Invalid credentials"

        const token = createJWT(user.dataValues.userId)

        res.status(200).json({
            ...user.dataValues,
            token,
        })

    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const getUser = async (req, res) => {
    try {

        const { userId } = req.params

        if (userId != req.user.userId) throw "Wrong user"

        const user = await User.findOne({
            where: {
                userId
            }
        })

        res.status(200).json(user.dataValues)

    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const deleteUser = async (req, res) => {
    try {

        const { userId } = req.params

        if (userId != req.user.userId) throw "Wrong user"

        await User.destroy({
            where: {
                userId
            }
        })

        res.status(200).json({
            message: "User deleted"
        })

    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const updateUser = async (req, res) => {
    try {

        const { userId } = req.params
        const { email, firstName, lastName, password, lightMode } = req.body

        if (userId != req.user.userId) throw "Wrong user"

        let passwordHash = undefined
        if (password) {
            if (password.length < 6) throw 'Password must be at least 6 characters!'
            const salt = await genSalt()
            passwordHash = await bcrypt.hash(password, salt)
        }

        await User.update(
            {
                email,
                firstName,
                lastName,
                passwordHash,
                lightMode
            },
            {
                where: {
                    userId
                }
            }
        )

        const user = await User.findOne({
            where: {
                userId
            }
        })
        if (!user) throw "User not found"

        const token = createJWT(user.dataValues.userId)

        res.status(200).json({ ...user.dataValues, token })

    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const resetUserPassword = async (req, res) => {
    try {

        res.status(200).json()

    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const getCoordinatingCourses = async (req, res) => {
    try {

        const { userId } = req.params

        if (userId != req.user.userId) throw "Wrong user"

        const courses = await Course.findAll({
            where: {
                coordinatorId: req.user.userId
            },
            order: [['createdAt', 'DESC']]
        })

        res.status(200).json({ courses })

    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const getInvites = async (req, res) => {
    try {

        const { userId } = req.params

        if (userId != req.user.userId) throw "Wrong user"

        const user = await User.findOne({
            where: {
                userId
            }
        })
        if (!user) throw "User does not exist"

        const queryString = `
            SELECT
                c.*,
                ci.*
            FROM
                course c
                INNER JOIN course_invite ci
                    ON c."courseId"=ci."courseId"
                INNER JOIN "user" u
                    ON u.email=ci.email
            WHERE
                u.email=:email
            ;
        `

        const invites = await sequelize.query(queryString, {
            replacements: {
                email: user.email
            },
            type: Sequelize.QueryTypes.SELECT
        })

        res.status(200).json({ invites })

    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const getJoinedCourses = async (req, res) => {
    try {

        const { userId } = req.params

        const user = await User.findOne({ where: { userId } })
        if (!user) throw "User does not exist"

        const courses = await user.getCourses()

        res.status(200).json({ courses })

    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const uploadProfilePicture = async (req, res) => {
    try {

        const { userId } = req.params
        const { mimeType, imageBase64 } = req.body

        if (!mimeType) throw "Mime type must be provided"
        if (!imageBase64) throw 'Image base64 must be provided'

        let fileExt = mimeType.split('/')[1].toLowerCase()

        if (fileExt === 'jpg') fileExt = 'jpeg'
        if (!['jpeg', 'png'].includes(fileExt)) throw "File extension must be jpeg or png"

        const buffer = Buffer.from(imageBase64, 'base64')

        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: `profile_pictures/${userId}_pfp.${fileExt}`,
            Body: buffer,
            ContentType: mimeType
        }
        const data = await s3.upload(params).promise()

        await User.update(
            {
                pfpFileType: fileExt
            },
            {
                where: {
                    userId
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

const getProfilePicture = async (req, res) => {
    try {

        const { userId } = req.params

        const user = await User.findOne({
            where: {
                userId
            }
        })
        if (!user) throw "User not found"

        if (!user.pfpFileType) {

            const defaultImagePath = path.join(__dirname, '../static/default-pfp.jpeg')
            res.sendFile(defaultImagePath)
            return

        }

        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: `profile_pictures/${userId}_pfp.${user.pfpFileType}`
        }

        const data = await s3.getObject(params).promise()

        res.setHeader('Content-Type', data.ContentType || `image/${user.pfpFileType}`)
        res.send(data.Body)

    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const getUserPublicInfo = async (req, res) => {
    try {

        const { userId } = req.params

        const user = await User.findOne({
            where: { userId }
        })

        if (!user) throw "User not found"

        res.status(200).json({
            userId: user.userId,
            firstName: user.firstName,
            lastName: user.lastName
        })

    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

module.exports = {
    createUser,
    loginUser,
    getUser,
    deleteUser,
    updateUser,
    resetUserPassword,
    getCoordinatingCourses,
    getInvites,
    getJoinedCourses,
    uploadProfilePicture,
    getProfilePicture,
    getUserPublicInfo
}