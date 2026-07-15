const express = require('express');
const router = express.Router();
const { protect, approvedEducator } = require('../middleware/authMiddleware');
const {
    sendInvite,
    getInviteByToken,
    acceptInvite,
    declineInvite,
    getCourseInvites,
    revokeInvite,
    removeCoInstructor,
    getMyInvites
} = require('../controller/inviteController');

// Get invites sent to me
router.get('/my-invites', protect, approvedEducator, getMyInvites);

// Owner sends invite
router.post('/send', protect, approvedEducator, sendInvite);

// Public — fetch invite details by token (for invite landing page)
router.get('/:token', getInviteByToken);

// Authenticated educator accepts/declines
router.patch('/:token/accept', protect, approvedEducator, acceptInvite);
router.patch('/:token/decline', protect, approvedEducator, declineInvite);

// Owner lists invites for a course
router.get('/course/:courseId', protect, approvedEducator, getCourseInvites);

// Owner revokes a pending invite
router.delete('/:inviteId', protect, approvedEducator, revokeInvite);

// Owner removes an accepted co-instructor
router.delete('/course/:courseId/co-instructor/:userId', protect, approvedEducator, removeCoInstructor);

module.exports = router;
