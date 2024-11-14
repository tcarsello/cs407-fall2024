const express = require('express')
const requireAuth = require('../middleware/requireAuth')

const { promoteAssistant, demoteAssistant } = require('../controllers/assistantController')

const router = express.Router()

router.post('/promote', requireAuth, promoteAssistant)
router.post('/demote', requireAuth, demoteAssistant)

module.exports = router
