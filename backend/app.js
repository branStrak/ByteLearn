const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./db/connection');

dotenv.config();

connectDB();

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());


app.get('/', (req, res) => {
    res.json({ message: 'ByteLearn API is running...' });
});

const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const quizAttemptRoutes = require('./routes/quizAttemptRoutes');
const quizRoutes = require('./routes/quizRoutes');
const queryRoutes = require('./routes/queryRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const earningsRoutes = require('./routes/earningsRoutes');
const inviteRoutes = require('./routes/inviteRoutes');
const codeRoutes = require('./routes/codeRoutes');
const studentCommunicationRoutes = require('./routes/studentCommunicationRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/quiz-attempts', quizAttemptRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/queries', queryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/educator/earnings', earningsRoutes);
app.use('/api/invites', inviteRoutes);
app.use('/api/code', codeRoutes);
app.use('/api/communication', studentCommunicationRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
