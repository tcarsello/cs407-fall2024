const express = require('express')
const requireAuth = require('../middleware/requireAuth')

const { createFriendship, removeFriendship, getFriends } = require('../controllers/friendshipController')

const router = express.Router()

router.put('/:friendId', requireAuth, createFriendship)
router.delete('/:friendId', requireAuth, removeFriendship)
router.get('/all', requireAuth, getFriends)

module.exports = router
