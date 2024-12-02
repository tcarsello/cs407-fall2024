const express = require('express')
const requireAuth = require('../middleware/requireAuth')

const { createQuestion, getQuestion, updateQuestion, deleteQuestion, getQuestionAnswers,
    getQuestionPicture, submitFeedback, 
    getFeedback} = require('../controllers/questionController')

const router = express.Router()

// CRUD
router.post('/', requireAuth, createQuestion)
router.get('/:questionId', requireAuth, getQuestion)
router.patch('/:questionId', requireAuth, updateQuestion)
router.delete('/:questionId', requireAuth, deleteQuestion)

// Actions

router.get('/:questionId/answers', requireAuth, getQuestionAnswers)
router.get('/:questionId/picture', requireAuth, getQuestionPicture)
router.post('/:questionId/submitFeedback', requireAuth, submitFeedback);
router.get('/:questionId/feedback', requireAuth, getFeedback);

module.exports = router