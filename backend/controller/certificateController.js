const Certificate = require('../model/Certificate');

/**
 * Get all certificates for the currently logged in student
 * @route GET /api/certificates/me
 * @access Private/Student
 */
const getMyCertificates = async (req, res) => {
    try {
        const certificates = await Certificate.find({ studentId: req.user._id })
            .populate('courseId', 'title thumbnail educatorId')
            .populate('educatorId', 'name')
            .sort({ issuedAt: -1 });

        res.status(200).json({
            success: true,
            count: certificates.length,
            data: certificates
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get a specific certificate by courseId for the student
 * Useful for the course dashboard "Success" state
 * @route GET /api/certificates/course/:courseId
 * @access Private/Student
 */
const getMyCertificateByCourse = async (req, res) => {
    try {
        const certificate = await Certificate.findOne({ 
            studentId: req.user._id, 
            courseId: req.params.courseId 
        })
        .populate('courseId', 'title thumbnail educatorId')
        .populate('educatorId', 'name');

        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: "Certificate not found for this course"
            });
        }

        res.status(200).json({
            success: true,
            data: certificate
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getMyCertificates,
    getMyCertificateByCourse
};
