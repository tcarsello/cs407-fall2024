const Assistant = require('../models/assistantModel')

const promoteAssistant = async (req, res) => {
    try {
        const { courseId, userId } = req.body

        const assistant = await Assistant.findOne({
            where: {
                courseId,
                userId,
            }
        })
        if (!assistant) await Assistant.create({ courseId, userId })

        res.status(200).json({messsage: 'User Promoted'})
    } catch (err) {
        console.error(err)
        res.status(400).json({error: err})
    }
}

const demoteAssistant = async (req, res) => {
    try {
        const { courseId, userId } = req.body

        const assistant = await Assistant.findOne({
            where: {
                courseId,
                userId,
            }
        })
        if (assistant) {
            await Assistant.destroy({
                where: { courseId, userId }
            })
        }

        res.status(200).json({messsage: 'User Promoted'})
    } catch (err) {
        console.error(err)
        res.status(400).json({error: err})
    }
}



module.exports = {
    promoteAssistant,
    demoteAssistant,
}
