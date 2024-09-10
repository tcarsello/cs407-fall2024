const jwt = require('jsonwebtoken')
const User = require('../models/userModel')

const requireAuth = async (req, res, next) => {

    const { authorization } = req.headers

    try {

        if (!authorization) throw "No authorization header"
        const token = authorization.split(' ')[1]

        const { _id } = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({
            where: {
                userId: _id
            }
        })

        req.user = user.toJSON()
        next()

    } catch (err) {
        console.log('Request not authorized: ', err)
        res.status(401).json({error: 'Unauthorized'})
    }

}

module.exports = requireAuth