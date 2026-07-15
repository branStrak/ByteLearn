const sendEmail = require('../utils/sendEmail');

// HTML email template builder - Formal Academic Correspondence
const buildEmailHTML = (studentName, type, grade, courseName, daysInactive) => {
  const templates = {
    top_performer: {
      headerColor: '#1e40af',
      headerBg: '#eff6ff',
      emoji: '⭐',
      headline: `Academic Achievement: ${studentName}`,
      body: `
        <p style="color:#334155;font-size:16px;line-height:1.7;">This email is to formally recognize your exceptional performance in <strong>${courseName}</strong>.</p>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:20px;border-radius:12px;margin:24px 0;text-align:center;">
          <p style="margin:0;color:#1e40af;font-weight:800;font-size:22px;">Current Grade: ${grade}%</p>
          <p style="margin:8px 0 0;color:#64748b;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Performance Status: Excellent</p>
        </div>
        <p style="color:#334155;font-size:16px;line-height:1.7;">Your consistent dedication to the course material and assignments has resulted in a high standard of achievement. We encourage you to maintain this level of commitment as you proceed through the remaining modules.</p>
        <p style="color:#334155;font-size:16px;line-height:1.7;">Thank you for your continued engagement with the platform.</p>
      `,
      cta: 'Access Course',
      ctaColor: '#1e40af',
      closing: 'Best regards,',
    },
    needs_attention: {
      headerColor: '#b45309',
      headerBg: '#fffbeb',
      emoji: '📝',
      headline: `Academic Progress Update: ${studentName}`,
      body: `
        <p style="color:#334155;font-size:16px;line-height:1.7;">We are writing to provide a standard update regarding your current standing in <strong>${courseName}</strong>.</p>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:20px;border-radius:12px;margin:24px 0;text-align:center;">
          <p style="margin:0;color:#b45309;font-weight:800;font-size:22px;">Current Grade: ${grade}%</p>
          <p style="margin:8px 0 0;color:#64748b;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Performance Status: Good</p>
        </div>
        <p style="color:#334155;font-size:16px;line-height:1.7;">Your current performance is satisfactory; however, there is significant potential for further improvement. We recommend reviewing recent course materials and ensuring all assignments are completed with full attention to detail to elevate your standing.</p>
        <p style="color:#334155;font-size:16px;line-height:1.7;">Please reach out if you require any clarification on specific topics.</p>
      `,
      cta: 'Review Materials',
      ctaColor: '#b45309',
      closing: 'Best regards,',
    },
    at_risk: {
      headerColor: '#b91c1c',
      headerBg: '#fef2f2',
      emoji: '⚠️',
      headline: `Urgent: Progress Notification for ${studentName}`,
      body: `
        <p style="color:#334155;font-size:16px;line-height:1.7;">This is a formal notification regarding your current academic standing in <strong>${courseName}</strong>.</p>
        <div style="background:#fef2f2;border:1px solid #fecaca;padding:20px;border-radius:12px;margin:24px 0;text-align:center;">
          <p style="margin:0;color:#b91c1c;font-weight:800;font-size:22px;">${grade !== null && grade !== undefined ? `Current Grade: ${grade}%` : 'Evaluation Required'}</p>
          <p style="margin:8px 0 0;color:#ef4444;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Performance Status: At Risk</p>
        </div>
        <p style="color:#334155;font-size:16px;line-height:1.7;">Your current progress has fallen below the expected threshold for successful course completion. It is imperative that you take immediate action to address outstanding work or areas of difficulty.</p>
        <p style="color:#334155;font-size:16px;line-height:1.7;">Please contact your educator immediately to discuss a plan for academic recovery. Failure to take action may impact your final course outcome.</p>
      `,
      cta: 'Take Action Now',
      ctaColor: '#b91c1c',
      closing: 'Regards,',
    },
    inactive: {
      headerColor: '#4338ca',
      headerBg: '#eef2ff',
      emoji: '🗓️',
      headline: `Course Participation Reminder: ${studentName}`,
      body: `
        <p style="color:#334155;font-size:16px;line-height:1.7;">Our records indicate that you have not accessed <strong>${courseName}</strong> for a period of <strong>${daysInactive} days</strong>.</p>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:20px;border-radius:12px;margin:24px 0;text-align:center;">
          <p style="margin:0;color:#4338ca;font-weight:800;font-size:18px;">Participation Required</p>
          <p style="margin:8px 0 0;color:#64748b;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Engagement Status: Inactive</p>
        </div>
        <p style="color:#334155;font-size:16px;line-height:1.7;">Regular participation is essential for maintaining academic momentum and achieving the learning objectives of this course. We encourage you to log in and resume your studies at your earliest convenience.</p>
        <p style="color:#334155;font-size:16px;line-height:1.7;">If you are experiencing technical difficulties or other constraints, please notify the support team.</p>
      `,
      cta: 'Resume Learning',
      ctaColor: '#4338ca',
      closing: 'Best regards,',
    },
  };

  const t = templates[type];

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
        <tr><td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            
            <!-- Header -->
            <tr>
              <td style="background:${t.headerBg};padding:40px;text-align:center;">
                <div style="font-size:48px;margin-bottom:16px;">${t.emoji}</div>
                <h1 style="margin:0;color:${t.headerColor};font-size:24px;font-weight:800;line-height:1.3;">${t.headline}</h1>
              </td>
            </tr>

            <!-- ByteLearn Brand Bar -->
            <tr>
              <td style="background:${t.headerColor};padding:12px;text-align:center;">
                <p style="margin:0;color:#ffffff;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">ByteLearn Academic Progress Update</p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:40px;">
                ${t.body}

                <!-- CTA Button -->
                <div style="text-align:center;margin:32px 0;">
                  <a href="http://localhost:5173" style="display:inline-block;background:${t.ctaColor};color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:12px;font-weight:800;font-size:15px;letter-spacing:0.5px;">${t.cta} →</a>
                </div>

                <!-- Closing -->
                <p style="color:#6b7280;font-size:15px;line-height:1.7;border-top:1px solid #f1f5f9;padding-top:24px;margin-top:32px;">
                  ${t.closing}<br/>
                  <strong style="color:#1e293b;">Your Educator</strong><br/>
                  <span style="color:#94a3b8;font-size:13px;">via ByteLearn Platform</span>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f8fafc;padding:24px;text-align:center;border-top:1px solid #e2e8f0;">
                <p style="margin:0;color:#94a3b8;font-size:12px;">This message was sent by your educator through the <strong>ByteLearn</strong> platform.</p>
                <p style="margin:8px 0 0;color:#cbd5e1;font-size:11px;">© 2026 ByteLearn. All rights reserved.</p>
              </td>
            </tr>

          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;
};

// POST /api/communication/send-progress-email
const sendProgressEmail = async (req, res) => {
  try {
    const { studentEmail, studentName, type, grade, courseName, daysInactive } = req.body;

    if (!studentEmail || !type) {
      return res.status(400).json({ success: false, message: 'studentEmail and type are required.' });
    }

    const subjectMap = {
      top_performer: `Academic Achievement: ${courseName}`,
      needs_attention: `Academic Progress Update: ${courseName}`,
      at_risk: `Urgent: Progress Notification for ${courseName}`,
      inactive: `Course Participation Reminder: ${courseName}`,
    };

    const html = buildEmailHTML(studentName, type, grade, courseName, daysInactive);
    const subject = subjectMap[type] || 'Academic Update from ByteLearn';

    await sendEmail({
      email: studentEmail,
      subject,
      html,
    });

    res.status(200).json({ success: true, message: `Communication email sent to ${studentEmail}` });
  } catch (err) {
    console.error('Communication email error:', err);
    res.status(500).json({ success: false, message: 'Failed to send email. Please try again.' });
  }
};

module.exports = { sendProgressEmail };
