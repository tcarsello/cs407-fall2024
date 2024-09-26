const express = require('express')
const requireAuth = require('../middleware/requireAuth')

const { createQuestion, getQuestion, updateQuestion, deleteQuestion } = require('../controllers/questionController')

const router = express.Router()

router.post('/', requireAuth, createQuestion)
router.get('/:questionId', requireAuth, getQuestion)
router.patch('/:questionId', requireAuth, updateQuestion)
router.delete('/:questionId', requireAuth, deleteQuestion)

module.exports = router