const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const { createRound, getRound, deleteRound, submitAnswer, fetchQuestion} = require('../controllers/roundController')

const router = express.Router()

// CRUD
router.post('/', requireAuth, createRound)
router.get('/:roundId', requireAuth, getRound)
router.delete('/:roundId', requireAuth, deleteRound)

router.post('/:roundId/submitAnswer', requireAuth, submitAnswer)
router.get('/:roundId/fetchQuestion', requireAuth, fetchQuestion)

module.exports = router
