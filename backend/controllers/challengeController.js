const Challenge = require('../models/challengeModel')
const User = require('../models/userModel')
const Course = require('../models/courseModel')
const Game = require('../models/gameModel')

const createChallenge = async (req, res) => {

    try {

        const { courseId, contenderId, challengerId } = req.body

        if (!courseId) throw 'Course ID must be provided'
        if (!contenderId) throw 'Contender ID must be provided'
        if (!challengerId) throw 'Challenger ID must be provided'

        const course = await Course.findOne({
            where: {
                courseId
            }
        })
        if (!course) throw 'Course not found'

        const contender = await User.findOne({
            where: {
                userId: contenderId
            }
        })
        if (!contender) throw 'Contender not found'

        const challenger = await User.findOne({
            where: {
                userId: challengerId
            }
        })
        if (!challenger) throw 'Challenger not found'

        const challenge = await Challenge.create({
            courseId,
            contenderId,
            challengerId,
        }).catch(err => { throw 'Challenge already exists with this user' })

        res.status(200).json({challenge})
    } catch (err){
        console.log({error: String(err)})
        res.status(400).json({error: String(err)})
    }

}

const updateChallenge = async (req, res) => {

    try {

        res.status(200).json()
    } catch (err){
        console.error(err)
        res.status(400).json({error: err})
    }

}

const deleteChallenge = async (req, res) => {

    try {

        const { courseId, contenderId, challengerId } = req.body

        if (!courseId) throw 'Course ID must be provided'
        if (!contenderId) throw 'Contender ID must be provided'
        if (!challengerId) throw 'Challenger ID must be provided'
       
        await Challenge.destroy({
            where: {
                courseId,
                contenderId,
                challengerId,
            }
        })

        res.status(200).json()
    } catch (err){
        console.error(err)
        res.status(400).json({error: err})
    }

}

const rejectChallenge = async (req, res) => {
    try {

        const { courseId, contenderId, challengerId } = req.body

        if (!courseId) throw 'Course ID must be provided'
        if (!contenderId) throw 'Contender ID must be provided'
        if (!challengerId) throw 'Challenger ID must be provided'

        if (req.user.userId !== challengerId) throw 'You may only reject a challenge from the receiving end'

        await Challenge.destroy({
            where: {
                courseId,
                contenderId,
                challengerId,
            }
        })

        res.status(200).json({message: 'Challenge Rejected'})
    } catch (err) {
        console.error(err)
        res.status(400).json({error: err})
    }

}

const acceptChallenge = async (req, res) => {
    try {

        const { courseId, contenderId, challengerId } = req.body

        if (!courseId) throw 'Course ID must be provided'
        if (!contenderId) throw 'Contender ID must be provided'
        if (!challengerId) throw 'Challenger ID must be provided'

        if (req.user.userId !== challengerId) throw 'You may only accept a challenge from the receiving end'

        await Challenge.destroy({
            where: {
                courseId,
                contenderId,
                challengerId,
            }
        })

        const game = await Game.create({
            courseId,
            playerOneId: challengerId,
            playerTwoId: contenderId,

        })

        res.status(200).json({game, message: 'Challenge Accepted'})
    } catch (err) {
        console.error(err)
        res.status(400).json({error: err})
    }

}

module.exports = { createChallenge, updateChallenge, deleteChallenge, rejectChallenge, acceptChallenge }
