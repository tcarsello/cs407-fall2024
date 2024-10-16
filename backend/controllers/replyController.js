const Post = require('../models/postModel')
const Reply = require('../models/replyModel')
const User = require('../models/userModel')


const createReply = async (req, res) => {
    try {
        
        const { postId, userId, body } = req.body

        if (!postId) throw 'No postId not provided'
        if (!userId) throw 'No user provided'
        if (!body) throw 'No post body provided'

        const post = await Post.findOne({
            where: {
                postId
            }
        })

        if (!post) throw 'Post not found for this postId'

        const user = await User.findOne({
            where: {
                userId
            }
        })

        if (!user) throw 'User not found for this userId'

        const reply = await Reply.create({
            postId,
            userId,
            body,
        })

        res.status(200).json({ reply })
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const getReply = async (req, res) => {
    try {      
        const { replyId } = req.params

        const reply = await Reply.findOne({
            where: { replyId }
        })

        res.status(200).json({ reply })
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const updateReply = async (req, res) => {
    try {
        
        const { replyId } = req.params
        const { body } = req.body

        if (!body) throw "Body not provided"

        let reply = await Post.findOne({
            where: { replyId }
        })

        if (!reply) throw 'Reply not found'

        await Reply.update(
            { body },
            {
                where: { replyId }
            }
        )

        res.status(200).json({ message: 'Reply updated' })
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const deleteReply = async (req, res) => {
    try {
         
        const { replyId } = req.params

        let reply = await Reply.findOne({
            where: { replyId }
        })

        if (!reply) throw 'Reply not found'

        await Post.destroy({
            where: {
                replyId
            }
        })

        res.status(200).json({ message: 'Reply deleted' })
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

module.exports = {
    createReply,
    getReply,
    updateReply,
    deleteReply
}