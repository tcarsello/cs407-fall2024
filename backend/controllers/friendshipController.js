const Friendship = require('../models/friendshipModel')
const User = require('../models/userModel')

const sequelize = require('../database')
const { Sequelize } = require('sequelize')

const createFriendship = async (req, res) => {
    try {

        const { friendId } = req.params

        if (!friendId) throw 'Friend ID must be provided'

        const friend = await User.findOne({
            where: {
                userId: friendId
            },
            attributes: ['userId', 'firstName', 'lastName']
        })
        if (!friend) throw 'User not found'

        const friendship = await Friendship.findOrCreate({
            where: {
                userId: req.user.userId,
                friendId
            }
        })

        res.status(200).json({ friend })
    } catch (err) {
        console.error(err)
        res.status(400).json({error: err})
    }
}

const removeFriendship = async (req, res) => {
    try {

        const { friendId } = req.params

        if (!friendId) throw 'Friend ID must be provided'

        await Friendship.destroy({
            where: {
                userId: req.user.userId,
                friendId
            }
        })

        res.status(200).json({message: 'Friendship removed'})
    } catch (err) {
        console.error(err)
        res.status(400).json({error: err})
    }
}

const getFriends = async (req, res) => {
    try {

        const queryString = `
            SELECT
                u."userId",
                u."firstName",
                u."lastName"
            FROM
                "user" u
                INNER JOIN friendship f
                    ON f."friendId" = u."userId"
            WHERE
                f."userId" = :userId
            ;
        `

        const friends = await sequelize.query(queryString, {
            replacements: {
                userId: req.user.userId
            },
            type: Sequelize.QueryTypes.SELECT
        })
        
        res.status(200).json({ friends })
    } catch (err) {
        console.error(err)
        res.status(400).json({error: err})
    }
}

module.exports = { createFriendship, removeFriendship, getFriends }
