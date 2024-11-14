const express = require('express')
const requireAuth = require('../middleware/requireAuth')

const { createAnnouncement, getAnnouncement, updateAnnouncement, deleteAnnouncement } = require('../controllers/announcementController')

const router = express.Router()

router.post('/', requireAuth, createAnnouncement)
router.get('/:announcementId', requireAuth, getAnnouncement)
router.patch('/:announcementId', requireAuth, updateAnnouncement)
router.delete('/:announcementId', requireAuth, deleteAnnouncement)

module.exports = router
