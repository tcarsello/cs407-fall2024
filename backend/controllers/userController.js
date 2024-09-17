const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const sequelize = require('../database')
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
        const { email, firstName, lastName, password } = req.body

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
                passwordHash
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

        res.status(200).json({...user.dataValues, token})

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

        const invites = await CourseInvite.findAll({
            where: {
                email: user.email
            }
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

module.exports = {
    createUser,
    loginUser,
    getUser,
    deleteUser,
    updateUser,
    resetUserPassword,
    getCoordinatingCourses,
    getInvites,
    getJoinedCourses
}