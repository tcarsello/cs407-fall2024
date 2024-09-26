const express = require('express')
const requireAuth = require('../middleware/requireAuth')

const { createQuestion, getQuestion, updateQuestion, deleteQuestion, getQuestionAnswers,
    getQuestionPicture } = require('../controllers/questionController')

const router = express.Router()

// CRUD
router.post('/', requireAuth, createQuestion)
router.get('/:questionId', requireAuth, getQuestion)
router.patch('/:questionId', requireAuth, updateQuestion)
router.delete('/:questionId', requireAuth, deleteQuestion)

// Actions

router.get('/:questionId/answers', requireAuth, getQuestionAnswers)
router.get('/:questionId/picture', requireAuth, getQuestionPicture)

module.exports = router