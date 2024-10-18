const Post = require('../models/postModel')
const Reply = require('../models/replyModel')
const User = require('../models/userModel')
const Course = require('../models/courseModel')

const sequelize = require('../database')
const { Sequelize } = require('sequelize')

const createPost = async (req, res) => {
    try {
        
        const { courseId, userId, title, body, tag } = req.body

        if (!courseId) throw 'No courseId provided'
        if (!userId) throw 'No user provided'
        if (!title) throw 'Not title provided'
        if (!body) throw 'No post body provided'

        const course = await Course.findOne({
            where: {
                courseId
            }
        })

        if (!course) throw 'Course not found for this courseId'

        const user = await User.findOne({
            where: {
                userId
            }
        })

        if (!user) throw 'User not found for this userId'

        const post = await Post.create({
            userId,
            courseId,
            title,
            body,
            tag
        })

        res.status(200).json({ post })
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const getPost = async (req, res) => {
    try {      
        const { postId } = req.params

        const post = await Post.findOne({
            where: { postId }
        })

        res.status(200).json({ post })
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const updatePost = async (req, res) => {
    try {
        
        const { postId } = req.params
        const { title, body } = req.body

        let post = await Post.findOne({
            where: { postId }
        })

        if (!post) throw 'Topic not found'

        await Post.update(
            { title, body },
            {
                where: { postId }
            }
        )

        res.status(200).json({ message: 'Post updated' })
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const deletePost = async (req, res) => {
    try {
         
        const { postId } = req.params

        let post = await Post.findOne({
            where: { postId }
        })

        if (!post) throw 'Post not found'

        await Post.destroy({
            where: {
                postId
            }
        })

        res.status(200).json({ message: 'Post deleted' })
    } catch (err) {
        console.error(err)
        res.status(400).json({ error: err })
    }
}

const getReplies = async (req, res) => {

    try {

        const { postId } = req.params

        const queryString = `
            SELECT
                r.*,
                u."firstName",
                u."lastName"
            FROM
                reply r
                INNER JOIN "user" u ON u."userId"=r."userId"
            WHERE
                r."postId"=:postId
            ORDER BY
                r."createdAt" DESC
            ;
        `

        const replies = await sequelize.query(queryString, {
            replacements: {
                postId
            },
            type: Sequelize.QueryTypes.SELECT
        })

        res.status(200).json({ replies })

    } catch (err) {
        console.error(err)
        res.status(400).json({error: err})
    }

}

module.exports = {
    createPost,
    getPost,
    updatePost,
    deletePost,
    getReplies,
}
