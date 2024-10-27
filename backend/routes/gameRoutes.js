const express = require('express')
const requireAuth = require('../middleware/requireAuth')

const { getGame, updateGame, deleteGame, resignGame } = require('../controllers/gameController')

const router = express.Router()

router.get('/:gameId', requireAuth, getGame)
router.patch('/:gameId', requireAuth, updateGame)
router.delete('/:gameId', requireAuth, deleteGame)

router.post('/:gameId/resign', requireAuth, resignGame);

module.exports = router
