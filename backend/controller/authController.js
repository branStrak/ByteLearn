const User = require('../model/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const { uploadOnCloudinary } = require('../utils/cloudinary');
const { OAuth2Client } = require('google-auth-library');
const { generateOtpToken, verifyOtpToken } = require('../utils/otpToken');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();


const registerStudent = async (req, res) => {
    try {
        const { 
            name, 
            email, 
            password,
            gender,
            dateOfBirth,
            educationLevel,
            phone
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please add all required fields (name, email, password)' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const otp = generateOTP();
        const otpExpires = Date.now() + 10 * 60 * 1000;

        let profilePictureUrl = "default-profile.jpg";
        if (req.file) {
            const uploadResult = await uploadOnCloudinary(req.file.path);
            if (uploadResult && uploadResult.url) {
                profilePictureUrl = uploadResult.url;
            }
        } else if (req.body.profilePicture) {
            profilePictureUrl = req.body.profilePicture;
        }

        const user = await User.create({ 
            name, 
            email, 
            password, 
            role: 'student', 
            gender,
            dateOfBirth,
            educationLevel,
            phone,
            profilePicture: profilePictureUrl
        });

        const otpToken = generateOtpToken(email, otp);

        try {
            await sendEmail({
                email: user.email,
                subject: 'Verify your ByteLearn Account',
                message: `Your OTP is ${otp}. It will expire in 10 minutes.`
            });
            res.status(201).json({ 
                message: 'Registration successful. Please verify OTP sent to email.',
                otpToken 
            });
        } catch (err) {
            // Email failed — auto-verify and return token so user isn't blocked
            console.error('OTP email failed, auto-verifying user:', err.message);
            user.isVerified = true;
            user.lastLogin = Date.now();
            await user.save();
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: true,
                profilePicture: user.profilePicture,
                token: generateToken(user._id),
                message: 'Registration successful. Email verification skipped.'
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const registerEducator = async (req, res) => {
    try {
        const { name, email, password, qualifications, experience, gender, dateOfBirth, phone, supportingCredentials } = req.body;
        if (!name || !email || !password || !qualifications || !experience) {
            return res.status(400).json({ message: 'Please add all required fields' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const otp = generateOTP();
        const otpExpires = Date.now() + 10 * 60 * 1000;

        let profilePictureUrl = "default-profile.jpg";
        if (req.files && req.files.profilePicture) {
            const localPath = req.files.profilePicture[0].path;
            const uploadResult = await uploadOnCloudinary(localPath);
            if (uploadResult && uploadResult.url) {
                profilePictureUrl = uploadResult.url;
            }
        } else if (req.body.profilePicture) {
            profilePictureUrl = req.body.profilePicture;
        }

        let credentialsArray = [];
        if (req.files && req.files.supportingCredentials) {
            // Upload all supporting credentials to Cloudinary in parallel
            const uploadPromises = req.files.supportingCredentials.map(file => uploadOnCloudinary(file.path));
            const uploadResults = await Promise.all(uploadPromises);
            
            credentialsArray = uploadResults
                .filter(res => res !== null)
                .map(res => res.url);
        } else if (req.body.supportingCredentials) {
            credentialsArray = Array.isArray(req.body.supportingCredentials) 
                ? req.body.supportingCredentials 
                : [req.body.supportingCredentials];
        }

        const user = await User.create({
            name, email, password, role: 'educator',
            ...(gender && { gender }),
            ...(dateOfBirth && { dateOfBirth }),
            ...(phone && { phone }),
            profilePicture: profilePictureUrl,
            educatorApplication: {
                qualifications, 
                experience, 
                supportingCredentials: credentialsArray,
                status: 'pending', 
                appliedAt: new Date()
            }
        });

        const otpToken = generateOtpToken(email, otp);

        try {
            await sendEmail({
                email: user.email,
                subject: 'Verify your ByteLearn Educator Account',
                message: `Your OTP is ${otp}. It will expire in 10 minutes.`
            });
            res.status(201).json({ 
                message: 'Registration successful. Please verify OTP sent to email.',
                otpToken
            });
        } catch (err) {
            // Email failed — auto-verify and return token so user isn't blocked
            console.error('OTP email failed, auto-verifying educator:', err.message);
            user.isVerified = true;
            user.lastLogin = Date.now();
            await user.save();
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: true,
                profilePicture: user.profilePicture,
                educatorApplication: user.educatorApplication,
                token: generateToken(user._id),
                message: 'Registration successful. Email verification skipped.'
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            if (!user.isVerified) {
                // Automatically generate and send a new OTP
                const otp = generateOTP();
                const otpToken = generateOtpToken(user.email, otp);

                try {
                    await sendEmail({
                        email: user.email,
                        subject: 'Verify your ByteLearn Account',
                        message: `Your new OTP is ${otp}. It will expire in 10 minutes.`
                    });
                    return res.status(403).json({ 
                        message: 'Account not verified. A new OTP has been sent to your email.',
                        otpToken 
                    });
                } catch (err) {
                    // Email failed — auto-verify and let user in
                    console.error('OTP email failed on login, auto-verifying:', err.message);
                    user.isVerified = true;
                    user.lastLogin = Date.now();
                    await user.save();
                }
            }
            if (user.isBlocked) {
                return res.status(403).json({ message: 'Your account has been blocked. To request an unblock appeal, contact support@bytelearn.com' });
            }

            user.lastLogin = Date.now();
            await user.save();

            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                profilePicture: user.profilePicture,
                educatorApplication: user.educatorApplication,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                educatorApplication: user.educatorApplication,
                profilePicture: user.profilePicture,
                gender: user.gender,
                dateOfBirth: user.dateOfBirth,
                educationLevel: user.educationLevel,
                phone: user.phone,
                bankDetails: user.bankDetails,
                lastLogin: user.lastLogin,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        //
        if (req.body.email && req.body.email !== user.email) {
            const emailTaken = await User.findOne({ email: req.body.email });
            if (emailTaken) {
                return res.status(400).json({ message: 'Email already in use by another account' });
            }
            user.email = req.body.email;
            user.isVerified = false;

            const otp = generateOTP();
            const otpToken = generateOtpToken(user.email, otp);
            req.otpToken = otpToken; // Attach to req so it can be sent in response

            try {
                await sendEmail({
                    email: user.email,
                    subject: 'Verify your new ByteLearn email',
                    message: `Your OTP to verify your new email is ${otp}. It expires in 10 minutes.`
                });
            } catch (err) {
                return res.status(500).json({ message: 'Failed to send verification email. Email not updated.' });
            }
        }

        user.name = req.body.name || user.name;
        user.gender = req.body.gender || user.gender;
        user.dateOfBirth = req.body.dateOfBirth || user.dateOfBirth;
        user.educationLevel = req.body.educationLevel || user.educationLevel;
        user.phone = req.body.phone || user.phone;

        if (req.file) {
            const uploadResult = await uploadOnCloudinary(req.file.path);
            if (uploadResult && uploadResult.url) {
                user.profilePicture = uploadResult.url;
            }
        } else if (req.body.removeProfilePicture === 'true' || req.body.profilePicture === '') {
            user.profilePicture = "default-profile.jpg";
        } else if (req.body.profilePicture) {
            user.profilePicture = req.body.profilePicture;
        }

        if (req.body.bankDetails) {
            user.bankDetails = {
                ...user.bankDetails,
                ...req.body.bankDetails
            };
        }

        if (req.body.password) {
            return res.status(400).json({ message: 'Use change-password to update your password.' });
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            isVerified: updatedUser.isVerified,
            phone: updatedUser.phone,
            educationLevel: updatedUser.educationLevel,
            gender: updatedUser.gender,
            dateOfBirth: updatedUser.dateOfBirth,
            profilePicture: updatedUser.profilePicture,
            ...(updatedUser.isVerified === false && { 
                message: 'Email updated. Please verify your new email with the OTP sent.',
                otpToken: req.otpToken
            })
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: 'Please provide both old and new password' });
        }

        const user = await User.findById(req.user._id).select('+password');
        if (user && (await user.matchPassword(oldPassword))) {
            user.password = newPassword;
            user.passwordChangedAt = Date.now();
            await user.save();
            res.json({ message: 'Password changed successfully' });
        } else {
            res.status(401).json({ message: 'Invalid old password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllEducators = async (req, res) => {
    try {
        const status = req.query.status;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = { role: 'educator' };
        if (status) filter['educatorApplication.status'] = status;

        const total = await User.countDocuments(filter);
        const educators = await User.find(filter)
            .select('-password')
            .skip(skip)
            .limit(limit);

        res.json({
            page,
            totalPages: Math.ceil(total / limit),
            totalEducators: total,
            educators
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const updateEducatorStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!status || !['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Must be "approved" or "rejected".' });
        }

        const user = await User.findById(req.params.id);
        if (!user || user.role !== 'educator') {
            return res.status(404).json({ message: 'Educator not found' });
        }

        user.educatorApplication.status = status;
        await user.save();

        const subject = status === 'approved'
            ? '🎉 Your ByteLearn Educator Application is Approved!'
            : 'Update on your ByteLearn Educator Application';

        const message = status === 'approved'
            ? `Hi ${user.name}, congratulations! Your educator application has been approved. You can now log in and start creating courses.`
            : `Hi ${user.name}, after review, your educator application was not approved at this time. You may re-apply with updated credentials.`;

        try {
            await sendEmail({ email: user.email, subject, message });
        } catch (err) {
            console.error('Notification email failed:', err.message);
        }


        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            educatorApplication: {
                status: user.educatorApplication.status,
                appliedAt: user.educatorApplication.appliedAt
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const verifyOtp = async (req, res) => {
    try {
        const { email, otp, otpToken } = req.body;
        if (!email || !otp || !otpToken) {
            return res.status(400).json({ message: 'Please provide email, OTP and token' });
        }

        const isValid = verifyOtpToken(otpToken, email, otp);
        if (!isValid) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.isVerified = true;
        user.lastLogin = Date.now();
        await user.save();

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Please provide email' });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.isVerified) return res.status(400).json({ message: 'User already verified' });

        const otp = generateOTP();
        const otpToken = generateOtpToken(email, otp);

        try {
            await sendEmail({
                email: user.email,
                subject: 'Your New OTP for ByteLearn',
                message: `Your new OTP is ${otp}. It will expire in 10 minutes.`
            });
        } catch (err) {
            console.error('Email send failed:', err.message);
        }

        res.json({ message: 'New OTP sent to email', otpToken });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const googleLogin = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ message: 'No Google ID token provided' });
        }

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { email, name, picture } = payload;

        let user = await User.findOne({ email });

        if (!user) {
            // Create new student user if they don't exist
            const tempPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
            user = await User.create({
                name,
                email,
                password: tempPassword,
                role: 'student',
                isVerified: true, // Google accounts are verified
                profilePicture: picture || "default-profile.jpg",
                lastLogin: Date.now()
            });
        } else {
            if (user.isBlocked) {
                return res.status(403).json({ message: 'Your account has been blocked. To request an unblock appeal, contact support@bytelearn.com' });
            }
            user.lastLogin = Date.now();
            await user.save();
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            profilePicture: user.profilePicture,
            educatorApplication: user.educatorApplication,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error('Google login error:', error);
        res.status(500).json({ message: 'Google login verification failed' });
    }
};

module.exports = {
    registerStudent,
    registerEducator,
    loginUser,
    getUserProfile,
    updateUserProfile,
    changePassword,
    getAllEducators,
    updateEducatorStatus,
    verifyOtp,
    resendOtp,
    googleLogin
};
