const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Generates a JWT containing the hashed OTP and user email.
 * This makes OTP verification stateless.
 */
const generateOtpToken = (email, otp) => {
    // Hash the OTP so it's not plain text inside the token payload
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
    
    return jwt.sign(
        { email, hashedOtp }, 
        process.env.JWT_SECRET, 
        { expiresIn: '10m' } // OTP valid for 10 minutes
    );
};

/**
 * Verifies the OTP token and compares it with the provided OTP.
 */
const verifyOtpToken = (token, email, otp) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (decoded.email !== email) return false;
        
        const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
        return hashedOtp === decoded.hashedOtp;
    } catch (error) {
        return false;
    }
};

module.exports = { generateOtpToken, verifyOtpToken };
