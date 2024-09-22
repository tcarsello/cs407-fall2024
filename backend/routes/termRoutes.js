const express = require('express')
const requireAuth = require('../middleware/requireAuth')

const { createTerm, getTerm, updateTerm, deleteTerm } = require('../controllers/termController')

const router = express.Router()

// CRUD
router.post('/', requireAuth, createTerm)
router.get('/:termId', requireAuth, getTerm)
router.patch('/:termId', requireAuth, updateTerm)
router.delete('/:termId', requireAuth, deleteTerm)

module.exports = router