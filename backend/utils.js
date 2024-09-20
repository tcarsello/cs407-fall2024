require('dotenv').config()
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const Course = require('./models/courseModel')

const createJWT = (id) => {
    return jwt.sign({ _id: id }, process.env.JWT_SECRET, { expiresIn: '1d' })
}

const generateJoinCode = async () => {

    const codeLength = 10

    let code;
    let course;
    do {

        code = crypto.randomBytes(Math.ceil(codeLength / 2))
            .toString('hex')
            .slice(0, codeLength)
            .toUpperCase()
        
        course = await Course.findOne({
            where: {
                joinCode: code
            }
        })

    } while (course)

    return code

}

module.exports = { createJWT, generateJoinCode }