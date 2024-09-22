const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const { createTopic, getTopic, updateTopic, deleteTopic } = require('../controllers/topicController')

const router = express.Router()

// CRUD
router.post('/', requireAuth, createTopic)
router.get('/:topicId', requireAuth, getTopic)
router.patch('/:topicId', requireAuth, updateTopic)
router.delete('/:topicId', requireAuth, deleteTopic)

module.exports = router