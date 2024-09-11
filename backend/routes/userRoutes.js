const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const { createUser, loginUser, getUser, deleteUser, updateUser, resetUserPassword, getCoordinatingCourses } = require('../controllers/userController')

const router = express.Router()

// CRUD
router.post('/register', createUser)
router.get('/:userId', requireAuth, getUser)
router.patch('/:userId', requireAuth, updateUser)
router.delete('/:userId', requireAuth, deleteUser)

// User actions
router.post('/:userId/reset', requireAuth, resetUserPassword)
router.post('/login', loginUser)

router.get('/:userId/courses/coordinating', requireAuth, getCoordinatingCourses) // Get all courses user_id is coordinator of

module.exports = router