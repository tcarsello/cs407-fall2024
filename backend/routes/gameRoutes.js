const express = require('express')
const requireAuth = require('../middleware/requireAuth')

const { getGame, updateGame, deleteGame, resignGame, getGameRounds } = require('../controllers/gameController')

const router = express.Router()

router.get('/:gameId', requireAuth, getGame)
router.patch('/:gameId', requireAuth, updateGame)
router.delete('/:gameId', requireAuth, deleteGame)

router.post('/:gameId/resign', requireAuth, resignGame);

router.get('/:gameId/rounds', requireAuth, getGameRounds)

module.exports = router
