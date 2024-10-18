const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const { createPost, getPost, updatePost, deletePost, getReplies, upvotePost, unupvotePost } = require('../controllers/postController')

const router = express.Router()

// CRUD
router.post('/', requireAuth, createPost)
router.get('/:postId', requireAuth, getPost)
router.patch('/:postId', requireAuth, updatePost)
router.delete('/:postId', requireAuth, deletePost)

router.post('/:postId/upvote', requireAuth, upvotePost)
router.post('/:postId/unupvote', requireAuth, unupvotePost)

router.get('/:postId/replies', requireAuth, getReplies)

module.exports = router
