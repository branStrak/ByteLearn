const crypto = require('crypto');
const CourseInvite = require('../model/CourseInvite');
const Course = require('../model/Course');
const User = require('../model/User');
const sendEmail = require('../utils/sendEmail');

/**
 * @desc   Send a collaboration invite to an educator via email (owner only)
 * @route  POST /api/invites
 * @access Private (Approved Educator — owner of course)
 */
const sendInvite = async (req, res) => {
    try {
        const { courseId, email } = req.body;
        const senderId = req.user._id;

        if (!courseId || !email) {
            return res.status(400).json({ success: false, message: 'courseId and email are required' });
        }

        const course = await Course.findById(courseId).populate('educatorId', 'name');
        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

        // Only the primary owner can send invites
        if (course.educatorId._id.toString() !== senderId.toString()) {
            return res.status(403).json({ success: false, message: 'Only the course owner can invite co-instructors' });
        }

        // Prevent inviting yourself
        if (req.user.email.toLowerCase() === email.toLowerCase()) {
            return res.status(400).json({ success: false, message: 'You cannot invite yourself' });
        }

        // Verify the invited email belongs to an approved educator
        const invitedUser = await User.findOne({ email: email.toLowerCase() });
        if (!invitedUser) {
            return res.status(404).json({ success: false, message: 'No ByteLearn account found with this email' });
        }
        if (invitedUser.role !== 'educator' || invitedUser.educatorApplication?.status !== 'approved') {
            return res.status(400).json({ success: false, message: 'The invited user must be an approved educator on ByteLearn' });
        }

        // Check if already a co-instructor
        const alreadyCo = course.coInstructors?.some(c => c.userId.toString() === invitedUser._id.toString());
        if (alreadyCo) {
            return res.status(409).json({ success: false, message: 'This educator is already a co-instructor on this course' });
        }

        // Check for existing pending invite to this email for this course
        const existingInvite = await CourseInvite.findOne({
            courseId,
            invitedEmail: email.toLowerCase(),
            status: 'pending'
        });
        if (existingInvite) {
            return res.status(409).json({ success: false, message: 'A pending invite already exists for this email' });
        }

        // Generate unique token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

        const invite = await CourseInvite.create({
            courseId,
            invitedBy: senderId,
            invitedEmail: email.toLowerCase(),
            invitedUserId: invitedUser._id,
            token,
            expiresAt
        });

        // Send email
        const inviteUrl = `${process.env.FRONTEND_URL}/educator/courses`; // Now pointing to course dashboard
        const htmlTemplate = `
            <div style="background-color: #f8fafc; padding: 40px 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                    <tr>
                        <td align="center" style="background: linear-gradient(135deg, #1d4ed8, #3b82f6); padding: 40px 20px;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">ByteLearn</h1>
                            <p style="color: #bfdbfe; margin: 10px 0 0 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Collaboration Invitation</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px;">
                            <p style="font-size: 16px; color: #1e293b; margin: 0;">Hello <strong>${invitedUser.name}</strong>,</p>
                            <p style="font-size: 15px; color: #64748b; line-height: 26px; margin: 16px 0 0 0;">
                                <strong>${course.educatorId.name}</strong> has invited you to co-instruct the course:
                            </p>
                            <div style="margin: 24px 0; padding: 20px 24px; background: #eff6ff; border-radius: 12px; border-left: 4px solid #2563eb;">
                                <p style="margin: 0; font-size: 20px; font-weight: 800; color: #1e3a8a;">${course.title}</p>
                            </div>
                            <p style="font-size: 14px; color: #64748b; line-height: 24px;">
                                You can now accept or decline this invitation directly from your <strong>Educator Dashboard</strong> under the new "Invitations" tab.
                            </p>
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 32px;">
                                <tr>
                                    <td align="center">
                                        <a href="${inviteUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 16px 40px; border-radius: 12px; font-size: 15px; font-weight: 800; text-decoration: none; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">
                                            Go to Dashboard
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 24px; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0; font-size: 12px; color: #94a3b8;">© 2026 ByteLearn Education Inc. — This is an automated notification.</p>
                        </td>
                    </tr>
                </table>
            </div>
        `;

        await sendEmail({
            email: invitedUser.email,
            subject: `You're invited to co-instruct "${course.title}" on ByteLearn`,
            message: `${course.educatorId.name} has invited you to co-instruct "${course.title}". Visit your dashboard at ${inviteUrl} to respond.`,
            html: htmlTemplate
        });

        res.status(201).json({
            success: true,
            message: `Invite sent to ${email}`,
            data: { inviteId: invite._id, expiresAt }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc   Get invite info from token (public — for the invite page)
 * @route  GET /api/invites/:token
 * @access Public
 */
const getInviteByToken = async (req, res) => {
    try {
        const invite = await CourseInvite.findOne({ token: req.params.token })
            .populate('courseId', 'title thumbnail category')
            .populate('invitedBy', 'name profilePicture')
            .populate('invitedUserId', 'name');

        if (!invite) {
            return res.status(404).json({ success: false, message: 'Invite not found or expired' });
        }

        res.status(200).json({ success: true, data: invite });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc   Accept a collaboration invite
 * @route  PATCH /api/invites/:token/accept
 * @access Private (the invited educator)
 */
const acceptInvite = async (req, res) => {
    try {
        const invite = await CourseInvite.findOne({ token: req.params.token });

        if (!invite) {
            return res.status(404).json({ success: false, message: 'Invite not found or has expired' });
        }

        if (invite.status !== 'pending') {
            return res.status(409).json({ success: false, message: `This invite has already been ${invite.status}` });
        }

        if (new Date() > invite.expiresAt) {
            return res.status(410).json({ success: false, message: 'This invite has expired' });
        }

        // Ensure the logged-in user is the intended recipient
        if (req.user._id.toString() !== invite.invitedUserId.toString()) {
            return res.status(403).json({ success: false, message: `This invite was sent to ${invite.invitedEmail}. Please switch to that account to accept.` });
        }

        // Add co-instructor to course
        await Course.findByIdAndUpdate(
            invite.courseId,
            {
                $addToSet: {
                    coInstructors: { userId: req.user._id, acceptedAt: new Date() }
                }
            }
        );

        invite.status = 'accepted';
        await invite.save();

        res.status(200).json({ success: true, message: 'You have joined the course as a co-instructor!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc   Decline a collaboration invite
 * @route  PATCH /api/invites/:token/decline
 * @access Private (the invited educator)
 */
const declineInvite = async (req, res) => {
    try {
        const invite = await CourseInvite.findOne({ token: req.params.token });

        if (!invite) {
            return res.status(404).json({ success: false, message: 'Invite not found or has expired' });
        }

        if (invite.status !== 'pending') {
            return res.status(409).json({ success: false, message: `This invite has already been ${invite.status}` });
        }

        invite.status = 'declined';
        await invite.save();

        res.status(200).json({ success: true, message: 'Invite declined.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc   List all pending invites for a course (owner only)
 * @route  GET /api/invites/course/:courseId
 * @access Private (course owner)
 */
const getCourseInvites = async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await Course.findById(courseId).select('educatorId');
        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

        if (course.educatorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Only the course owner can view invites' });
        }

        const invites = await CourseInvite.find({ courseId })
            .populate('invitedUserId', 'name profilePicture')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: invites });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc   Revoke a pending invite (owner only)
 * @route  DELETE /api/invites/:inviteId
 * @access Private (course owner)
 */
const revokeInvite = async (req, res) => {
    try {
        const invite = await CourseInvite.findById(req.params.inviteId).populate('courseId', 'educatorId');

        if (!invite) return res.status(404).json({ success: false, message: 'Invite not found' });

        if (invite.courseId.educatorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Only the course owner can revoke invites' });
        }

        if (invite.status !== 'pending') {
            return res.status(409).json({ success: false, message: 'Only pending invites can be revoked' });
        }

        await invite.deleteOne();
        res.status(200).json({ success: true, message: 'Invite revoked successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc   Remove a co-instructor from a course (owner only)
 * @route  DELETE /api/invites/course/:courseId/co-instructor/:userId
 * @access Private (course owner)
 */
const removeCoInstructor = async (req, res) => {
    try {
        const { courseId, userId } = req.params;
        const course = await Course.findById(courseId).select('educatorId coInstructors');

        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

        if (course.educatorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Only the course owner can remove co-instructors' });
        }

        await Course.findByIdAndUpdate(courseId, {
            $pull: { coInstructors: { userId } }
        });

        res.status(200).json({ success: true, message: 'Co-instructor removed from course' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc   Get all pending invites for the logged-in educator
 * @route  GET /api/invites/my-invites
 * @access Private (Educator)
 */
const getMyInvites = async (req, res) => {
    try {
        const invites = await CourseInvite.find({
            invitedUserId: req.user._id,
            status: 'pending'
        })
        .populate('courseId', 'title thumbnail category')
        .populate('invitedBy', 'name profilePicture')
        .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: invites });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { sendInvite, getInviteByToken, acceptInvite, declineInvite, getCourseInvites, revokeInvite, removeCoInstructor, getMyInvites };
