const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Check if SMTP is configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
        console.log('⚠️  SMTP not configured. Email would have been sent to:', options.email);
        console.log('Subject:', options.subject);
        console.log('---');
        throw new Error('SMTP configuration is missing');
    }

    try {
        console.log('📧 Attempting to send email to:', options.email);
        console.log('Subject:', options.subject);

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD
            }
        });

        const message = {
            from: `${process.env.FROM_NAME || 'CloudShop'} <${process.env.FROM_EMAIL || process.env.SMTP_EMAIL}>`,
            to: options.email,
            subject: options.subject,
            text: options.message
        };

        const info = await transporter.sendMail(message);

        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);

        // For Ethereal, log preview URL
        if (process.env.SMTP_HOST && process.env.SMTP_HOST.includes('ethereal')) {
            const previewUrl = nodemailer.getTestMessageUrl(info);
            console.log('📬 Preview URL:', previewUrl);
            console.log('👉 Go to https://ethereal.email/ and login to view the email');

            // Write to file for easy access
            const fs = require('fs');
            const path = require('path');
            const logPath = path.join(__dirname, '../../latest_email_preview.txt');
            fs.writeFileSync(logPath, `Latest Email Preview URL: ${previewUrl}\n\nSent at: ${new Date().toLocaleString()}`);
            console.log('📝 Preview URL saved to:', logPath);
        }

        return info;
    } catch (error) {
        console.error('❌ Error sending email:', error.message);
        console.error('Full error:', error);
        throw error;
    }
};

module.exports = sendEmail;
