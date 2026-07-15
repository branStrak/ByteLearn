const getCourseCompletionTemplate = (studentName, courseName, grade, percentage) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #1e293b;
                margin: 0;
                padding: 0;
                background-color: #f8fafc;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                background: #ffffff;
                border-radius: 24px;
                overflow: hidden;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
                border: 1px solid #e2e8f0;
            }
            .header {
                background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
                padding: 40px 20px;
                text-align: center;
                color: #ffffff;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 800;
                letter-spacing: -0.5px;
            }
            .content {
                padding: 40px;
                text-align: center;
            }
            .trophy-icon {
                font-size: 64px;
                margin-bottom: 20px;
            }
            .congrats-text {
                font-size: 24px;
                font-weight: 700;
                color: #0f172a;
                margin-bottom: 10px;
            }
            .course-name {
                color: #2563eb;
                font-weight: 700;
            }
            .stats-container {
                background: #f1f5f9;
                border-radius: 20px;
                padding: 25px;
                margin: 30px 0;
                display: flex;
                justify-content: space-around;
                border: 1px solid #e2e8f0;
            }
            .stat-item {
                flex: 1;
            }
            .stat-label {
                font-size: 11px;
                font-weight: 800;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 5px;
            }
            .stat-value {
                font-size: 24px;
                font-weight: 800;
                color: #1e293b;
            }
            .button {
                display: inline-block;
                background: #f59e0b;
                color: #ffffff;
                padding: 16px 32px;
                border-radius: 16px;
                text-decoration: none;
                font-weight: 700;
                font-size: 16px;
                margin-top: 20px;
                box-shadow: 0 4px 10px rgba(245, 158, 11, 0.3);
            }
            .footer {
                padding: 30px;
                text-align: center;
                font-size: 13px;
                color: #94a3b8;
                border-top: 1px solid #f1f5f9;
            }
            .quote {
                font-style: italic;
                color: #64748b;
                margin-top: 20px;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>ByteLearn Achievement</h1>
            </div>
            <div class="content">
                <div class="trophy-icon">🎓</div>
                <div class="congrats-text">Congratulations, ${studentName}!</div>
                <p>You've successfully mastered the course:</p>
                <div class="course-name" style="font-size: 20px; margin: 10px 0;">${courseName}</div>
                
                <div class="stats-container">
                    <div class="stat-item">
                        <div class="stat-label">Final Grade</div>
                        <div class="stat-value">${grade}</div>
                    </div>
                    <div style="width: 1px; background: #cbd5e1; height: 40px; align-self: center;"></div>
                    <div class="stat-item">
                        <div class="stat-label">Percentage</div>
                        <div class="stat-value">${percentage}%</div>
                    </div>
                </div>

                <p style="color: #64748b; font-size: 15px;">Your hard work and dedication have paid off. Your certificate of completion is now available in your dashboard.</p>
                
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/certificates" class="button">View My Certificate</a>
                
                <p class="quote">"Education is the most powerful weapon which you can use to change the world."</p>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} ByteLearn LMS. All rights reserved.</p>
                <p>Empowering learners worldwide through quality education.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = {
    getCourseCompletionTemplate
};
