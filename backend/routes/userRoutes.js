const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const { createUser, loginUser, getUser, deleteUser, updateUser, queryUsers, resetUserPassword } = require('../controllers/userController')

const router = express.Router()

// Query
router.get('/', queryUsers)

// CRUD
router.post('/', createUser)
router.get('/:user_id', requireAuth, getUser)
router.patch('/:user_id', requireAuth, updateUser)
router.delete('/:user_id', requireAuth, deleteUser)

// User actions
router.post('/:user_id/reset', requireAuth, resetUserPassword)
router.post('/login', loginUser)

module.exports = router