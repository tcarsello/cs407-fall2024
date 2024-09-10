require('dotenv').config()
const jwt = require('jsonwebtoken')

const createJWT = (id) => {
    return jwt.sign({ _id: id }, process.env.JWT_SECRET, { expiresIn: '1d' })
}

module.exports = { createJWT }