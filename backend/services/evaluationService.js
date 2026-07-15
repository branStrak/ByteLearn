const Course = require('../model/Course');
const QuizAttempt = require('../model/QuizAttempt');
const Submission = require('../model/Submission');
const Certificate = require('../model/Certificate');
const User = require('../model/User');
const Enrollment = require('../model/Enrollment');
const { generateCertificatePdf } = require('../utils/certificateGenerator');
const sendEmail = require('../utils/sendEmail');
const { getCourseCompletionTemplate } = require('../utils/emailTemplates');

/**
 * Evaluates course completion and generates certificate if eligible
 * @param {String} studentId 
 * @param {String} courseId 
 */
const evaluateCourseCompletion = async (studentId, courseId) => {
    try {
        console.log(`[EvaluationEngine] >>> STARTING evaluation for student: ${studentId}, course: ${courseId}`);
        
        // 1. Identity Context Isolation & Gate 1: Progress Check
        const enrollment = await Enrollment.findOne({ studentId, courseId });
        if (!enrollment) {
            console.log(`[EvaluationEngine] FAILED: No enrollment found for student ${studentId} in course ${courseId}`);
            return false;
        }
        
        console.log(`[EvaluationEngine] Progress check: ${enrollment.progressPercentage}%`);
        if (enrollment.progressPercentage !== 100) {
            console.log(`[EvaluationEngine] ABORTED: Progress is not 100%. Current progress: ${enrollment.progressPercentage}%`);
            return false;
        }

        // 2. Gate 0: Immediate Duplicate Check
        const existingCert = await Certificate.findOne({ studentId, courseId });
        if (existingCert) {
            console.log(`[EvaluationEngine] ALREADY COMPLETED: Certificate ${existingCert.certificateId} exists.`);
            return existingCert;
        }

        // 2. Gate 2: Pending Assignments Check
        const pendingSubmissions = await Submission.countDocuments({ 
            studentId, 
            courseId, 
            status: 'submitted' 
        });

        if (pendingSubmissions > 0) {
            console.log(`[EvaluationEngine] ABORTED: ${pendingSubmissions} ungraded assignments still pending.`);
            return { success: false, message: "Pending educator review." };
        }

        // 1. Fetch Course and Configuration
        const course = await Course.findById(courseId).populate('educatorId', 'name email');
        if (!course) {
            console.log(`[EvaluationEngine] ERROR: Course ${courseId} not found in database.`);
            return false;
        }

        // Use default configuration if missing or disabled (to ensure it works "properly" for all courses)
        const config = {
            quizWeight: course.gradingConfiguration?.quizWeight ?? 50,
            assignmentWeight: course.gradingConfiguration?.assignmentWeight ?? 50,
            minGradeToPass: course.gradingConfiguration?.minGradeToPass ?? 70,
            isCertificationEnabled: course.gradingConfiguration?.isCertificationEnabled ?? true,
            gradingScale: course.gradingConfiguration?.gradingScale || []
        };

        if (!config.isCertificationEnabled) {
            console.log(`[EvaluationEngine] ABORTED: Certification is explicitly DISABLED for course: ${course.title}`);
            return false;
        }

        // 2. Fetch QuizAttempts and Submissions
        console.log(`[EvaluationEngine] Fetching quiz attempts and submissions...`);
        const [quizAttempts, submissions] = await Promise.all([
            QuizAttempt.find({ studentId, courseId, status: 'completed' }),
            Submission.find({ studentId, courseId, status: 'graded' }).populate('assignmentId', 'totalMarks')
        ]);

        // 3. Math - Quizzes
        let totalQuizScore = 0;
        let totalQuizMarksPossible = 0;
        quizAttempts.forEach(attempt => {
            totalQuizScore += (attempt.score || 0);
            totalQuizMarksPossible += (attempt.totalMarksPossible || 0);
        });

        const quizPercentage = totalQuizMarksPossible > 0 ? (totalQuizScore / totalQuizMarksPossible) * 100 : 100;

        // 4. Math - Assignments
        let totalAssignmentMarks = 0;
        let totalAssignmentMaxMarks = 0;
        submissions.forEach(sub => {
            totalAssignmentMarks += (sub.marksObtained || 0);
            totalAssignmentMaxMarks += (sub.assignmentId?.totalMarks || 0);
        });

        const assignmentPercentage = totalAssignmentMaxMarks > 0 ? (totalAssignmentMarks / totalAssignmentMaxMarks) * 100 : 100;

        // 5. Final Score Calculation
        const finalScore = (quizPercentage * (config.quizWeight / 100)) + (assignmentPercentage * (config.assignmentWeight / 100));
        const finalPercentage = Math.round(finalScore * 100) / 100;

        console.log(`[EvaluationEngine] CALCULATION: Quiz%=${quizPercentage.toFixed(2)}, Assignment%=${assignmentPercentage.toFixed(2)}, Final%=${finalPercentage}%`);

        // 6. Eligibility Check
        if (finalPercentage < config.minGradeToPass) {
            console.log(`[EvaluationEngine] FAILED: Final percentage ${finalPercentage}% is below passing grade ${config.minGradeToPass}%`);
            return false;
        }

        // 7. Mapping Grade Label
        let gradeLabel = "Passed";
        if (config.gradingScale && config.gradingScale.length > 0) {
            const sortedScale = [...config.gradingScale].sort((a, b) => b.minScore - a.minScore);
            const match = sortedScale.find(grade => finalPercentage >= grade.minScore);
            if (match) gradeLabel = match.label;
        }
        console.log(`[EvaluationEngine] GRADE ASSIGNED: ${gradeLabel}`);

        // 9. Fetch Student details
        const student = await User.findById(studentId);
        if (!student) {
            console.log(`[EvaluationEngine] ERROR: Student User object not found for ${studentId}`);
            return false;
        }

        // 10. Generate Certificate PDF
        const certId = `CERT-${Date.now()}-${studentId.toString().slice(-6)}`.toUpperCase();
        console.log(`[EvaluationEngine] GENERATING PDF for ${certId}...`);
        
        const pdfUrl = await generateCertificatePdf({
            studentName: student.name,
            courseName: course.title,
            grade: gradeLabel,
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            certId: certId,
            educatorName: course.educatorId?.name || "ByteLearn Instructor"
        });

        if (!pdfUrl) {
            console.log(`[EvaluationEngine] ERROR: pdfUrl returned NULL from generateCertificatePdf.`);
            return false;
        }
        console.log(`[EvaluationEngine] PDF UPLOADED: ${pdfUrl}`);

        // 11. Save Certificate
        const certificate = await Certificate.create({
            studentId,
            courseId,
            educatorId: course.educatorId?._id || course.educatorId,
            certificateId: certId,
            finalPercentage,
            gradeLabel,
            pdfUrl,
            issuedAt: Date.now()
        });
        console.log(`[EvaluationEngine] DATABASE: Certificate record created.`);

        // 12. Send Completion Email
        if (student.email) {
            try {
                console.log(`[EvaluationEngine] EMAIL: Dispatching to ${student.email}...`);
                await sendEmail({
                    email: student.email,
                    subject: `🎉 Congratulations! You've completed ${course.title}`,
                    message: `Congratulations ${student.name}! You have completed ${course.title} with a grade of ${gradeLabel} (${finalPercentage}%).`,
                    html: getCourseCompletionTemplate(
                        student.name,
                        course.title,
                        gradeLabel,
                        finalPercentage
                    )
                });
                console.log(`[EvaluationEngine] EMAIL: Successfully sent.`);
            } catch (emailError) {
                console.log(`[EvaluationEngine] EMAIL ERROR (Non-fatal): ${emailError.message}`);
            }
        } else {
            console.log(`[EvaluationEngine] EMAIL SKIPPED: No email found for student.`);
        }

        console.log(`[EvaluationEngine] >>> SUCCESS for ${certId}`);
        return certificate;

    } catch (error) {
        console.log(`[EvaluationEngine] CRITICAL FAILURE: ${error.message}`);
        console.error(error);
        return false;
    }
};

module.exports = { evaluateCourseCompletion };
