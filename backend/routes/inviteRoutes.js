const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const { cancelInvite } = require('../controllers/courseInviteController')

const router = express.Router()

router.delete('/', requireAuth, cancelInvite)

module.exports = router