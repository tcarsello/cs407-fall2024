const express = require('express')
const requireAuth = require('../middleware/requireAuth')

const { createChallenge, updateChallenge, deleteChallenge, rejectChallenge, acceptChallenge } = require('../controllers/challengeController')

const router = express.Router()

router.post('/', requireAuth, createChallenge)
router.patch('/', requireAuth, updateChallenge)
router.delete('/', requireAuth, deleteChallenge)

router.post('/reject', requireAuth, rejectChallenge)
router.post('/accept', requireAuth, acceptChallenge)

module.exports = router
