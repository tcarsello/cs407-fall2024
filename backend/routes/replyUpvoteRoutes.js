const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const { createReplyUpvote, getReplyUpvote, deleteReplyUpvote } = require('../controllers/replyUpvoteController')

const router = express.Router()

// CRUD
router.post('/', requireAuth, createReplyUpvote)
router.get('/', requireAuth, getReplyUpvote)
router.delete('/', requireAuth, deleteReplyUpvote)

module.exports = router