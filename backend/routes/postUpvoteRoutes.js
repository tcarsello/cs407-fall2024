const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const { createPostUpvote, getPostUpvote, deletePostUpvote } = require('../controllers/postUpvoteController')

const router = express.Router()

// CRUD
router.post('/', requireAuth, createPostUpvote)
router.get('/', requireAuth, getPostUpvote)
router.delete('/', requireAuth, deletePostUpvote)

module.exports = router