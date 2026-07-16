const nodemailer = require("nodemailer");

const sendEmail = async (options) => {

  console.log(`Attempting to send email from: ${process.env.EMAIL_USER}`);

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("Email error: Missing EMAIL_USER or EMAIL_PASS in .env file!");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000,
  });

  const mailOptions = {
    from: "ByteLearn LMS <noreply@bytelearn.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
