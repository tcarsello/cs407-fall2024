const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const { createReply, getReply, updateReply, deleteReply } = require('../controllers/replyController')

const router = express.Router()

// CRUD
router.post('/', requireAuth, createReply)
router.get('/:replyId', requireAuth, getReply)
router.patch('/:replyId', requireAuth, updateReply)
router.delete('/:replyId', requireAuth, deleteReply)

module.exports = router