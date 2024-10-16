const Reply = require('../models/replyModel')
const User = require('../models/userModel')
const ReplyUpvote = require('../models/replyUpvoteModel')

const createReplyUpvote = async (req, res) => {
    try {
        
        const { replyId, userId } = req.body

        if (!replyId) throw 'No replyId provided'
        if (!userId) throw 'No user provided'

        const reply = await Reply.findOne({
            where: {
                replyid
            }
        })

        if (!reply) throw 'Post not found for this postId'

        const user = await User.findOne({
            where: {
                userId
            }
        })

        if (!user) throw 'User not found for this userId'

        const upvote = await ReplyUpvote.create({
            replyId,
            userId,
        })

        res.status(200).json({ upvote })
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const getReplyUpvote = async (req, res) => {
    try {     

        const { replyId, userId } = req.body

        if (!replyId) throw 'No replyId provided'
        if (!userId) throw 'No user provided'

        const replyUpvote = await ReplyUpvote.findOne({
            where: { postId, userId }
        })

        res.status(200).json({ replyUpvote })
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const deleteReplyUpvote = async (req, res) => {
    try {
         
        const { replyId, userId } = req.body

        if (!replyId) throw 'No replyId provided'
        if (!userId) throw 'No user provided'

        await ReplyUpvote.destroy({
            where: {
                replyId,
                userId
            }
        })

        res.status(200).json({ message: 'Reply upvote deleted' })
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

module.exports = {
    createReplyUpvote,
    getReplyUpvote,
    deleteReplyUpvote
}