const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const { createUser, loginUser, getUser, deleteUser, updateUser,
    resetUserPassword, getCoordinatingCourses, getInvites,
    getJoinedCourses } = require('../controllers/userController')

const router = express.Router()

// CRUD
router.post('/register', createUser)
router.get('/:userId', requireAuth, getUser)
router.patch('/:userId', requireAuth, updateUser)
router.delete('/:userId', requireAuth, deleteUser)

// User actions
router.post('/:userId/reset', requireAuth, resetUserPassword)
router.post('/login', loginUser)

router.get('/:userId/courses/coordinating', requireAuth, getCoordinatingCourses) // Get all courses userId is coordinator of
router.get('/:userId/courses/joined', requireAuth, getJoinedCourses) // Get all courses userId is a student of
router.get('/:userId/invites', requireAuth, getInvites) // Get all invites send to userId's email

module.exports = router