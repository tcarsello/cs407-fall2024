const express = require('express')
const requireAuth = require('../middleware/requireAuth')

const { createQuestion, getQuestion, updateQuestion, deleteQuestion, getQuestionAnswers } = require('../controllers/questionController')

const router = express.Router()

// CRUD
router.post('/', requireAuth, createQuestion)
router.get('/:questionId', requireAuth, getQuestion)
router.patch('/:questionId', requireAuth, updateQuestion)
router.delete('/:questionId', requireAuth, deleteQuestion)

// Actions

router.get('/:questionId/answers', requireAuth, getQuestionAnswers)

module.exports = router