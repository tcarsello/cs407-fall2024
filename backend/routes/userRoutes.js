const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const { createUser, loginUser, getUser, deleteUser, updateUser, resetUserPassword } = require('../controllers/userController')

const router = express.Router()

// CRUD
router.post('/', createUser)
router.get('/:userId', requireAuth, getUser)
router.patch('/:userId', requireAuth, updateUser)
router.delete('/:userId', requireAuth, deleteUser)

// User actions
router.post('/:userId/reset', requireAuth, resetUserPassword)
router.post('/login', loginUser)

module.exports = router