require('dotenv').config();
const sendEmail = require('../src/utils/sendEmail');

async function testEmailConfig() {
    console.log('=== Email Configuration Test ===\n');

    try {
        await sendEmail({
            email: 'test@example.com', // Use a valid email format
            subject: 'Test Email from CloudShop (via Utility)',
            message: 'This is a test email to verify the sendEmail utility and file logging.'
        });

        console.log('\n✅ Test completed successfully!');
    } catch (error) {
        console.log('❌ ERROR sending email:');
        console.log(error.message);
    }
}

testEmailConfig();
