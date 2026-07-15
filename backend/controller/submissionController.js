const Submission = require('../model/Submission');
const Enrollment = require('../model/Enrollment');
const Course = require('../model/Course');
const { evaluateCourseCompletion } = require('../services/evaluationService');
const { uploadOnCloudinary } = require('../utils/cloudinary');
const fs = require('fs');

const submitAssignment = async (req, res) => {
    try {
        const { assignmentId, courseId } = req.body;
        const studentId = req.user._id;

        if (!req.file) {
            return res.status(400).json({ message: "Please upload a file" });
        }

        if (!assignmentId || !courseId) {
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: "Assignment ID and Course ID are required" });
        }

        const existingSubmission = await Submission.findOne({ studentId, assignmentId });
        if (existingSubmission) {
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: "Assignment already submitted" });
        }

        const uploadedFile = await uploadOnCloudinary(req.file.path);
        
        if (!uploadedFile) {
            return res.status(500).json({ message: "Error uploading file to Cloudinary" });
        }
        const submission = await Submission.create({
            studentId,
            assignmentId,
            courseId,
            fileUrl: uploadedFile.secure_url
        });

        const updatedEnrollment = await Enrollment.findOneAndUpdate(
            { studentId, courseId },
            { $addToSet: { completedAssignments: assignmentId } },
            { new: true }
        );

        if (updatedEnrollment) {
            const course = await Course.findById(courseId).populate({
                path: 'modules',
                populate: ['lessons', 'quizzes', 'assignments']
            });

            if (course) {
                let totalItems = 0;
                course.modules.forEach(m => {
                    totalItems += (m.lessons?.length || 0) + (m.quizzes?.length || 0) + (m.assignments?.length || 0);
                });

                const completedCount = updatedEnrollment.completedLessons.length + 
                                       updatedEnrollment.completedQuizzes.length + 
                                       updatedEnrollment.completedAssignments.length;
                
                    updatedEnrollment.progressPercentage = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;
                    
                    if (updatedEnrollment.progressPercentage === 100) {
                        updatedEnrollment.status = 'completed';
                        updatedEnrollment.completedAt = new Date();
                    }
                    await updatedEnrollment.save();
                }
            }

        res.status(201).json({ success: true, data: submission, progress: updatedEnrollment });

    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        if (error.code === 11000) {
            return res.status(400).json({ message: "Assignment already submitted" });
        }

        res.status(500).json({ message: error.message });
    }
};

const getEducatorSubmissions = async (req, res) => {
    try {
        const educatorId = req.user._id;

        // Include courses where educator is owner OR co-instructor
        const educatorCourses = await Course.find({
            $or: [
                { educatorId },
                { 'coInstructors.userId': educatorId }
            ]
        }).select('_id');
        const courseIds = educatorCourses.map(c => c._id);

        if (courseIds.length === 0) {
            return res.status(200).json([]);
        }

        const submissions = await Submission.find({ 
            courseId: { $in: courseIds },
            status: 'submitted' 
        })
        .populate('studentId', 'name email')
        .populate('courseId', 'title')
        .populate('assignmentId', 'title totalMarks')
        .sort({ submittedAt: 1 }) 
        .lean();

        res.status(200).json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const gradeSubmission = async (req, res) => {
    try {
        const { marksObtained, feedback } = req.body;
        const { submissionId } = req.params;

        const submission = await Submission.findById(submissionId)
            .populate('studentId', 'name email')
            .populate({ path: 'courseId', select: 'title educatorId coInstructors', populate: { path: 'educatorId', select: 'name' } })
            .populate('assignmentId', 'title totalMarks');

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        // Check authorization: owner OR co-instructor
        const userId = req.user._id.toString();
        const isOwner = submission.courseId.educatorId._id.toString() === userId;
        const isCo = submission.courseId.coInstructors?.some(c => c.userId.toString() === userId);
        if (!isOwner && !isCo) {
            return res.status(403).json({ message: 'Not authorized to grade this submission' });
        }

        // First-come-first-serve lock: reject if already graded
        if (submission.status === 'graded') {
            return res.status(409).json({ message: 'This submission has already been graded by another instructor.' });
        }

        submission.marksObtained = marksObtained;
        submission.feedback = feedback;
        submission.status = 'graded';
        submission.gradedBy = req.user._id;
        await submission.save();

        try {
            const sendEmail = require('../utils/sendEmail');
            const mailMessage = `Your assignment "${submission.assignmentId.title}" in "${submission.courseId.title}" has been graded. Score: ${marksObtained}/${submission.assignmentId.totalMarks}. Feedback: ${feedback}`;
            
            const htmlTemplate = `
                <div style="background-color: #f8fafc; padding: 40px 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                        <!-- Header -->
                        <tr>
                            <td align="center" style="background-color: #4f46e5; padding: 40px 20px;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">ByteLearn Mastery</h1>
                                <p style="color: #c7d2fe; margin: 10px 0 0 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Assignment Evaluation Complete</p>
                            </td>
                        </tr>
                        
                        <!-- Body -->
                        <tr>
                            <td style="padding: 40px;">
                                <p style="font-size: 16px; color: #1e293b; margin: 0;">Hello <span style="font-weight: 700;">${submission.studentId.name}</span>,</p>
                                <p style="font-size: 15px; color: #64748b; line-height: 24px; margin: 16px 0 0 0;">
                                    Your evaluation for <span style="color: #1e293b; font-weight: 600;">"${submission.assignmentId.title}"</span> in the course <span style="color: #1e293b; font-weight: 600;">"${submission.courseId.title}"</span> has been released. 
                                </p>

                                <!-- Score Card -->
                                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 32px 0; background-color: #f1f5f9; border-radius: 12px; border: 1px solid #e2e8f0;">
                                    <tr>
                                        <td align="center" style="padding: 32px;">
                                            <p style="margin: 0; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px;">Performance Result</p>
                                            <h2 style="margin: 8px 0 0 0; font-size: 48px; font-weight: 900; color: #4f46e5;">${marksObtained} <span style="font-size: 20px; color: #94a3b8; font-weight: 600;">/ ${submission.assignmentId.totalMarks}</span></h2>
                                            <p style="margin: 4px 0 0 0; font-size: 13px; font-weight: 600; color: #64748b;">Achievement Level: ${((marksObtained / submission.assignmentId.totalMarks) * 100).toFixed(0)}%</p>
                                        </td>
                                    </tr>
                                </table>

                                ${feedback ? `
                                <!-- Facilitator Feedback -->
                                <div style="margin-top: 32px; padding: 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-left: 4px solid #4f46e5; border-radius: 8px;">
                                    <h3 style="margin: 0 0 12px 0; font-size: 12px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 1px;">Facilitator Mentorship</h3>
                                    <p style="margin: 0; font-size: 14px; color: #334155; line-height: 1.6; font-style: italic;">"${feedback}"</p>
                                </div>
                                ` : ''}

                                <!-- CTA -->
                                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 40px;">
                                    <tr>
                                        <td align="center">
                                            <a href="${process.env.FRONTEND_URL}/student-dashboard" style="display: inline-block; background-color: #1e293b; color: #ffffff; padding: 16px 32px; border-radius: 12px; font-size: 14px; font-weight: 700; text-decoration: none; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">Explore Detailed Feedback</a>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td align="center" style="padding: 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
                                <p style="margin: 0; font-size: 12px; color: #94a3b8;">This is an automated notification from the ByteLearn Academy platform.</p>
                                <p style="margin: 8px 0 0 0; font-size: 12px; font-weight: 600; color: #64748b;">&copy; 2026 ByteLearn Education Inc.</p>
                            </td>
                        </tr>
                    </table>
                </div>
            `;

            await sendEmail({
                email: submission.studentId.email,
                subject: `Result: ${submission.assignmentId.title} - Graded`,
                message: mailMessage,
                html: htmlTemplate
            });
        } catch (mailError) {
            console.error("Mail Error (Non-blocking):", mailError);
        }

        res.status(200).json({ success: true, data: submission });
        
        // Trigger Evaluation Engine in background (Educator Trigger)
        // Passes studentId from submission to isolate context (Step 2)
        // The service layer handles Step 3 (Dual-Verification) and Step 4 (Storage)
        
        const enrollment = await Enrollment.findOne({ 
            studentId: submission.studentId._id, 
            courseId: submission.courseId._id 
        });

        if (enrollment) {
            // Update enrollment status if progress is 100% (Safety check)
            if (enrollment.progressPercentage === 100 && enrollment.status !== 'completed') {
                enrollment.status = 'completed';
                enrollment.completedAt = new Date();
                await enrollment.save();
            }

            if (enrollment.progressPercentage === 100) {
                const stillPending = await Submission.exists({
                    studentId: submission.studentId._id,
                    courseId: submission.courseId._id,
                    status: 'submitted'
                });

                if (!stillPending) {
                    evaluateCourseCompletion(submission.studentId._id, submission.courseId._id)
                        .catch(err => console.error("[EvaluationEngine] Background Trigger Error:", err));
                }
            }
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getSubmissionById = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const submission = await Submission.findById(submissionId)
            .populate('studentId', 'name email profilePicture')
            .populate({ path: 'courseId', select: 'title educatorId coInstructors' })
            .populate('assignmentId', 'title totalMarks instructions')
            .populate('gradedBy', 'name');

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        // Verify ownership — owner OR co-instructor
        const userId = req.user._id.toString();
        const isOwner = submission.courseId.educatorId.toString() === userId;
        const isCo = submission.courseId.coInstructors?.some(c => c.userId.toString() === userId);
        if (!isOwner && !isCo) {
            return res.status(403).json({ message: 'Not authorized to view this submission' });
        }

        res.status(200).json(submission);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMySubmissions = async (req, res) => {
    try {
        const studentId = req.user._id;
        const submissions = await Submission.find({ studentId })
            .populate('assignmentId', 'title totalMarks dueDate')
            .populate('courseId', 'title thumbnail')
            .sort({ createdAt: -1 });

        res.status(200).json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { submitAssignment, getEducatorSubmissions, gradeSubmission, getSubmissionById, getMySubmissions };
