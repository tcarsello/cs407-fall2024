const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const { createCourse, getCourse, deleteCourse, updateCourse,
    getCourseInvites, joinCourse, leaveCourse,
    removeUserFromCourse, declineInvite, getMembers,
    putSettings, getSettingsAdmin, joinCourseByCode,
    uploadCoursePicture, getCoursePicture, getCourseTopics, createTerm,
    getCourseTerms, getCourseQuestions } = require('../controllers/courseController')
const { createInvite } = require('../controllers/courseInviteController')

const router = express.Router()

// CRUD
router.post('/', requireAuth, createCourse)
router.get('/:courseId', requireAuth, getCourse)
router.delete('/:courseId', requireAuth, deleteCourse)
router.patch('/:courseId', requireAuth, updateCourse)

// Actions
router.post('/join', requireAuth, joinCourseByCode)
router.post('/:courseId/invite', requireAuth, createInvite)
router.post('/:courseId/decline', requireAuth, declineInvite)
router.post('/:courseId/join', requireAuth, joinCourse)
router.post('/:courseId/leave', requireAuth, leaveCourse)
router.post('/:courseId/remove', requireAuth, removeUserFromCourse)
router.post('/:courseId/picture', requireAuth, uploadCoursePicture)
router.post('/:courseId/topics/:topicId/terms', requireAuth, createTerm);
router.put('/:courseId/settings', requireAuth, putSettings)

router.get('/:courseId/invites', requireAuth, getCourseInvites)
router.get('/:courseId/members', requireAuth, getMembers)
router.get('/:courseId/settings', requireAuth, getSettingsAdmin)
router.get('/:courseId/picture', getCoursePicture) // No auth required
router.get('/:courseId/topics', requireAuth, getCourseTopics)
router.get('/:courseId/terms', requireAuth, getCourseTerms)
router.get('/:courseId/questions', requireAuth, getCourseQuestions)

module.exports = router