const express = require('express')
const requireAuth = require('../middleware/requireAuth')

const { getGame, updateGame, deleteGame } = require('../controllers/gameController')

const router = express.Router()

router.get('/:gameId', requireAuth, getGame)
router.patch('/:gameId', requireAuth, updateGame)
router.delete('/:gameId', requireAuth, deleteGame)

module.exports = router
