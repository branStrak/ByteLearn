const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../model/Payment');
const Course = require('../model/Course');
const Enrollment = require('../model/Enrollment');
const User = require('../model/User');
const Transaction = require('../model/Transaction');
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');

// API A: createOrder (POST /api/payment/checkout)
const createOrder = asyncHandler(async (req, res) => {
    const { courseId } = req.body;
    const studentId = req.user._id;

    if (!courseId) {
        return res.status(400).json({ success: false, message: "courseId is required" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
        return res.status(404).json({ success: false, message: "Course not found" });
    }

    const instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const options = {
        amount: course.price * 100, // paise
        currency: "INR",
        receipt: "receipt_order_" + Date.now()
    };

    const order = await instance.orders.create(options);

    await Payment.create({
        studentId,
        courseId,
        razorpay_order_id: order.id,
        amount: course.price,
        status: 'pending'
    });

    res.status(201).json({
        success: true,
        order
    });
});

// API B: verifyPayment (POST /api/payment/verify)
const verifyPayment = asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const studentId = req.user._id;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Find the payment record
            const payment = await Payment.findOne({ razorpay_order_id }).session(session);
            if (!payment) {
                await session.abortTransaction();
                return res.status(404).json({ success: false, message: "Payment record not found" });
            }

            payment.razorpay_payment_id = razorpay_payment_id;
            payment.razorpay_signature = razorpay_signature;
            payment.status = 'success';
            payment.paidAt = Date.now();
            await payment.save({ session });

            // Find Course to get educatorId and co-instructors
            const course = await Course.findById(payment.courseId)
                .populate('coInstructors.userId', 'name')
                .session(session);
            if (course) {
                const totalEducatorShare = payment.amount * 0.80; // 80% total to instructors

                // Build list of all instructors: primary owner + co-instructors
                const allInstructors = [
                    { id: course.educatorId, label: 'Primary Educator' },
                    ...(course.coInstructors || []).map(c => ({ id: c.userId, label: 'Co-Instructor' }))
                ];

                const perInstructorShare = totalEducatorShare / allInstructors.length;
                const sharePercent = Math.round(80 / allInstructors.length);

                for (const instructor of allInstructors) {
                    // Atomically update walletBalance and totalEarnings for each instructor
                    await User.findByIdAndUpdate(
                        instructor.id,
                        { 
                            $inc: { 
                                walletBalance: perInstructorShare,
                                totalEarnings: perInstructorShare
                            } 
                        },
                        { session }
                    );

                    // Create Credit Transaction for each instructor
                    await Transaction.create([{
                        educatorId: instructor.id,
                        paymentId: payment._id,
                        amount: perInstructorShare,
                        type: 'credit',
                        status: 'completed',
                        description: `Sale of course: ${course.title} (${sharePercent}% Revenue Share — ${instructor.label})`
                    }], { session });
                }
            }

            // Find or Create Enrollment
            let enrollment = await Enrollment.findOne({ studentId, courseId: payment.courseId }).session(session);

            if (!enrollment) {
                enrollment = await Enrollment.create([{
                    studentId,
                    courseId: payment.courseId,
                    status: 'active',
                    enrolledAt: Date.now()
                }], { session });

                // Increment enrolled students count on Course
                await Course.findByIdAndUpdate(payment.courseId, { $inc: { enrolledStudents: 1 } }).session(session);
            } else {
                enrollment.status = 'active';
                await enrollment.save({ session });
            }

            await session.commitTransaction();
            session.endSession();

            res.status(200).json({
                success: true,
                message: "Payment verified successfully"
            });
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            console.error("Payment verification failed:", error);
            res.status(500).json({
                success: false,
                message: "Failed to process payment and earnings."
            });
        }
    } else {
        await Payment.findOneAndUpdate(
            { razorpay_order_id },
            { status: 'failed' }
        );
        res.status(400).json({
            success: false,
            message: "Invalid signature"
        });
    }
});

module.exports = {
    createOrder,
    verifyPayment
};
