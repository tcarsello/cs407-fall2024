const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const { createPost, getPost, updatePost, deletePost } = require('../controllers/postController')

const router = express.Router()

// CRUD
router.post('/', requireAuth, createPost)
router.get('/:postId', requireAuth, getPost)
router.patch('/:postId', requireAuth, updatePost)
router.delete('/:postId', requireAuth, deletePost)

module.exports = router