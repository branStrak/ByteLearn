const puppeteer = require('puppeteer');
require('./cloudinary'); // Ensure cloudinary is configured
const cloudinary = require('cloudinary').v2;

/**
 * Generates a certificate PDF and uploads it to Cloudinary
 * @param {Object} data - { studentName, courseName, grade, date, certId, educatorName }
 * @returns {Promise<String>} - Secure Cloudinary URL
 */
const generateCertificatePdf = async (data) => {
    let browser;
    try {
        const { studentName, courseName, grade, date, certId, educatorName } = data;
        console.log(`[PdfGenerator] Starting PDF generation for ${studentName} - ${courseName}`);

        const htmlTemplate = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Playfair+Display:ital,wght@0,700;1,700&display=swap" rel="stylesheet">
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    font-family: 'Inter', sans-serif;
                    background-color: #f4f4f4;
                }
                .certificate-container {
                    width: 1120px;
                    height: 790px;
                    background: white;
                    border: 1px solid #d1d5db;
                    position: relative;
                    margin: 0 auto;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    box-sizing: border-box;
                }
                /* Top-left dark navy angled shape */
                .shape-top-left {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 350px;
                    height: 350px;
                    background: #001f3f;
                    clip-path: polygon(0 0, 100% 0, 0 100%);
                    z-index: 1;
                }
                /* Top-right gold angled shape */
                .shape-top-right {
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 200px;
                    height: 200px;
                    background: #d4af37;
                    clip-path: polygon(0 0, 100% 0, 100% 100%);
                    z-index: 1;
                }
                /* Bottom-left gold angled shape */
                .shape-bottom-left {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 200px;
                    height: 200px;
                    background: #d4af37;
                    clip-path: polygon(0 0, 0 100%, 100% 100%);
                    z-index: 1;
                }
                .content {
                    position: relative;
                    z-index: 10;
                    text-align: center;
                    width: 80%;
                }
                .logo {
                    font-size: 38px;
                    font-weight: 800;
                    color: #001f3f;
                    margin-bottom: 20px;
                    letter-spacing: -1px;
                }
                .title {
                    font-size: 48px;
                    font-weight: 900;
                    color: #001f3f;
                    margin: 0;
                    text-transform: uppercase;
                }
                .subtitle {
                    font-size: 18px;
                    color: #f97316;
                    font-weight: 600;
                    margin-top: 5px;
                    margin-bottom: 40px;
                    letter-spacing: 2px;
                }
                .presented-to {
                    font-size: 16px;
                    color: #4b5563;
                    margin-bottom: 10px;
                }
                .student-name {
                    font-family: 'Playfair Display', serif;
                    font-size: 56px;
                    color: #111827;
                    margin: 20px 0;
                    padding: 15px 0;
                    border-top: 2px solid #001f3f;
                    border-bottom: 2px solid #001f3f;
                    display: inline-block;
                    min-width: 60%;
                }
                .course-info {
                    font-size: 22px;
                    color: #374151;
                    margin-top: 20px;
                }
                .grade-info {
                    font-size: 18px;
                    font-weight: 700;
                    color: #001f3f;
                    margin-top: 10px;
                }
                .footer {
                    display: flex;
                    justify-content: space-between;
                    width: 100%;
                    margin-top: 60px;
                    padding: 0 40px;
                    box-sizing: border-box;
                }
                .footer-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .signature-line {
                    width: 200px;
                    border-top: 1px solid #9ca3af;
                    margin-bottom: 8px;
                }
                .footer-label {
                    font-size: 14px;
                    color: #6b7280;
                }
                .footer-value {
                    font-weight: 700;
                    color: #111827;
                    margin-bottom: 4px;
                }
                .cert-id {
                    position: absolute;
                    bottom: 20px;
                    right: 40px;
                    font-size: 10px;
                    color: #9ca3af;
                    z-index: 10;
                }
            </style>
        </head>
        <body>
            <div class="certificate-container">
                <div class="shape-top-left"></div>
                <div class="shape-top-right"></div>
                <div class="shape-bottom-left"></div>
                
                <div class="content">
                    <div class="logo">ByteLearn</div>
                    <div class="title">Certificate of Achievement</div>
                    <div class="subtitle">THIS ACKNOWLEDGES THAT</div>
                    
                    <div class="presented-to">is proudly presented to</div>
                    <div class="student-name">${studentName}</div>
                    
                    <div class="course-info">For completing the course <strong>"${courseName}"</strong></div>
                    <div class="grade-info">With a final grade of: ${grade}</div>
                    
                    <div class="footer">
                        <div class="footer-item">
                            <div class="footer-value">${date}</div>
                            <div class="signature-line"></div>
                            <div class="footer-label">DATE ISSUED</div>
                        </div>
                        <div class="footer-item">
                            <div class="footer-value">${educatorName}</div>
                            <div class="signature-line"></div>
                            <div class="footer-label">EDUCATOR SIGNATURE</div>
                        </div>
                    </div>
                </div>
                
                <div class="cert-id">Serial ID: ${certId}</div>
            </div>
        </body>
        </html>
        `;

        // 1. Launch Puppeteer
        console.log(`[PdfGenerator] Launching Puppeteer...`);
        browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: true
        });
        const page = await browser.newPage();
        
        console.log(`[PdfGenerator] Setting HTML content...`);
        await page.setContent(htmlTemplate, { waitUntil: 'networkidle0' });

        // 2. Generate PDF Buffer
        console.log(`[PdfGenerator] Creating PDF buffer...`);
        const pdfBuffer = await page.pdf({
            format: 'A4',
            landscape: true,
            printBackground: true
        });

        await browser.close();
        browser = null;
        console.log(`[PdfGenerator] PDF buffer created. Size: ${pdfBuffer.length} bytes.`);

        // 3. Upload to Cloudinary using Stream
        console.log(`[PdfGenerator] Uploading to Cloudinary...`);
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "bytelearn_certificates",
                    resource_type: "raw", // PDFs should be "raw" in Cloudinary or "image" if you want to use transformations
                    public_id: certId,
                    format: "pdf"
                },
                (error, result) => {
                    if (error) {
                        console.error("[PdfGenerator] Cloudinary Upload Error:", error);
                        reject(error);
                    } else {
                        console.log(`[PdfGenerator] Cloudinary Upload Success: ${result.secure_url}`);
                        resolve(result.secure_url);
                    }
                }
            );
            uploadStream.end(pdfBuffer);
        });

    } catch (error) {
        if (browser) await browser.close();
        console.error("[PdfGenerator] CRITICAL ERROR:", error);
        return null;
    }
};

module.exports = { generateCertificatePdf };
