const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const User = require('../model/User');
const Transaction = require('../model/Transaction');
const Payment = require('../model/Payment');
const Course = require('../model/Course');


const getEarningsDashboard = asyncHandler(async (req, res) => {
    const educatorId = req.user._id;

    // 1. Get stats from user profile
    const user = await User.findById(educatorId).select('walletBalance totalEarnings');
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    // 2. Get total sales count
    const totalSales = await Transaction.countDocuments({ educatorId, type: 'credit', status: 'completed' });

    // 3. Get transactions history
    const transactions = await Transaction.find({ educatorId })
        .sort({ createdAt: -1 })
        .limit(50); // recent 50

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyStats = await Transaction.aggregate([
        {
            $match: {
                educatorId: new mongoose.Types.ObjectId(educatorId),
                type: 'credit',
                status: 'completed',
                createdAt: { $gte: thirtyDaysAgo }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                amount: { $sum: "$amount" }
            }
        },
        { $sort: { "_id": 1 } }
    ]);

    // Format chart date to match Recharts expected input
    const chartData = dailyStats.map(stat => ({
        date: new Date(stat._id).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        amount: stat.amount
    }));

    res.status(200).json({
        success: true,
        stats: {
            walletBalance: user.walletBalance || 0,
            totalEarnings: user.totalEarnings || 0,
            totalSales
        },
        transactions,
        chartData
    });
});

// @desc    Request a withdrawal / payout
// @route   POST /api/educator/earnings/withdraw
// @access  Private (Educator)
const requestWithdrawal = asyncHandler(async (req, res) => {
    const { amount } = req.body;
    const educatorId = req.user._id;

    if (!amount || amount <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid payout amount' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Find educator WITH lock/session
        const user = await User.findById(educatorId).session(session);

        if (!user) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Validate bank details exist
        if (!user.bankDetails || !user.bankDetails.accountNumber || !user.bankDetails.bankName) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: 'Please configure your Bank Details in Profile Settings first.' });
        }

        // Validate wallet balance
        if (amount > user.walletBalance) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
        }

        // Deduct from wallet immediately
        await User.findByIdAndUpdate(
            educatorId,
            { $inc: { walletBalance: -amount } },
            { session }
        );

        // Create a 'debit' transaction marked as 'completed'
        const withdrawTx = await Transaction.create([{
            educatorId,
            amount: amount,
            type: 'debit',
            status: 'completed',
            description: 'Payout successfully processed to bank account'
        }], { session });

        await session.commitTransaction();

        res.status(200).json({
            success: true,
            message: 'Payout successfully processed',
            transaction: withdrawTx[0]
        });

    } catch (error) {
        await session.abortTransaction();
        console.error("Payout error:", error);
        res.status(500).json({ success: false, message: 'Payout request failed' });
    } finally {
        session.endSession();
    }
});

const getAdminEarnings = asyncHandler(async (req, res) => {
    const ADMIN_COMMISSION_PERCENT = 0.20;

    // 1. Total Earnings (Admin's 20% Cut)
    const totalEarningsData = await Payment.aggregate([
        { $match: { status: 'success' } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const grossRevenue = totalEarningsData.length > 0 ? totalEarningsData[0].total : 0;
    const totalEarnings = grossRevenue * ADMIN_COMMISSION_PERCENT;

    // 2. Earnings from each course (Admin's 20% Cut)
    const courseEarnings = await Payment.aggregate([
        { $match: { status: 'success' } },
        {
            $group: {
                _id: "$courseId",
                totalGross: { $sum: "$amount" },
                enrollmentCount: { $sum: 1 }
            }
        },
        {
            $lookup: {
                from: "courses",
                localField: "_id",
                foreignField: "_id",
                as: "courseInfo"
            }
        },
        { $unwind: "$courseInfo" },
        {
            $project: {
                courseTitle: "$courseInfo.title",
                totalEarned: { $multiply: ["$totalGross", ADMIN_COMMISSION_PERCENT] },
                enrollmentCount: 1
            }
        },
        { $sort: { totalEarned: -1 } }
    ]);

    // 3. Individual earnings (recent enrollments - showing admin's cut)
    const rawEnrollments = await Payment.find({ status: 'success' })
        .populate('studentId', 'name email')
        .populate('courseId', 'title')
        .sort({ paidAt: -1 })
        .limit(100);
    
    const recentEnrollments = rawEnrollments.map(payment => {
        const p = payment.toObject();
        return {
            ...p,
            amount: p.amount * ADMIN_COMMISSION_PERCENT // show only admin's cut
        };
    });

    // 4. Monthly earnings graph (Admin's 20% Cut)
    const monthlyStats = await Payment.aggregate([
        { $match: { status: 'success' } },
        {
            $group: {
                _id: {
                    month: { $month: "$paidAt" },
                    year: { $year: "$paidAt" }
                },
                amount: { $sum: "$amount" }
            }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const chartData = monthlyStats.map(stat => ({
        month: new Date(stat._id.year, stat._id.month - 1).toLocaleString('en-US', { month: 'short', year: 'numeric' }),
        amount: stat.amount * ADMIN_COMMISSION_PERCENT
    }));

    res.status(200).json({
        success: true,
        grossRevenue,
        totalEarnings,
        courseEarnings,
        recentEnrollments,
        chartData
    });
});

module.exports = {
    getEarningsDashboard,
    requestWithdrawal,
    getAdminEarnings
};
