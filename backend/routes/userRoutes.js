const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const { createUser, forgotPassword, loginUser, verifyToken, getUser, deleteUser, updateUser,
    resetUserPassword, getCoordinatingCourses, getInvites,
    getJoinedCourses, uploadProfilePicture, getProfilePicture,
    getUserPublicInfo } = require('../controllers/userController')

const router = express.Router()

// CRUD
router.post('/register', createUser)
router.get('/:userId', requireAuth, getUser)
router.patch('/:userId', requireAuth, updateUser)
router.delete('/:userId', requireAuth, deleteUser)

// User actions
router.post('/reset', resetUserPassword)
router.post('/login', loginUser)
router.post('/verify-token', verifyToken)
router.post('/forgot-password', forgotPassword)
router.post('/:userId/picture', requireAuth, uploadProfilePicture)

router.get('/:userId/public', getUserPublicInfo)
router.get('/:userId/courses/coordinating', requireAuth, getCoordinatingCourses) // Get all courses userId is coordinator of
router.get('/:userId/courses/joined', requireAuth, getJoinedCourses) // Get all courses userId is a student of
router.get('/:userId/invites', requireAuth, getInvites) // Get all invites send to userId's email
router.get('/:userId/picture', getProfilePicture) // Get profile picture by userId (no auth required - will be used to get others' pictures)

module.exports = router