const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const { createRound, getRound, deleteRound } = require('../controllers/roundController')

const router = express.Router()

// CRUD
router.post('/', requireAuth, createRound)
router.get('/:roundId', requireAuth, getRound)
router.delete('/:roundId', requireAuth, deleteRound)



module.exports = router