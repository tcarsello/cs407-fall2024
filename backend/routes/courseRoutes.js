const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const { createCourse, getCourse, deleteCourse, updateCourse } = require('../controllers/courseController')

const router = express.Router()

router.post('/', requireAuth, createCourse)
router.get('/:courseId', requireAuth, getCourse)
router.delete('/:courseId', requireAuth, deleteCourse)
router.patch('/:courseId', requireAuth, updateCourse)

module.exports = router