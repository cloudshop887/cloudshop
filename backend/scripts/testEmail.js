require('dotenv').config();
const nodemailer = require('nodemailer');

const sendTestEmail = async () => {
    console.log('Attempting to send email with config:');
    console.log('HOST:', process.env.SMTP_HOST);
    console.log('PORT:', process.env.SMTP_PORT);
    console.log('USER:', process.env.SMTP_EMAIL);
    // Do not log password

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        }
    });

    const message = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to: 'test@example.com', // Test recipient
        subject: 'Test Email',
        text: 'This is a test email to verify SMTP configuration.'
    };

    try {
        const info = await transporter.sendMail(message);
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('Error sending email:');
        console.error(error);
    }
};

sendTestEmail();
