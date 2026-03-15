const nodemailer = require('nodemailer');

async function main() {
    let testAccount = await nodemailer.createTestAccount();

    console.log('Credentials generated:');
    console.log(`SMTP_HOST=smtp.ethereal.email`);
    console.log(`SMTP_PORT=587`);
    console.log(`SMTP_EMAIL=${testAccount.user}`);
    console.log(`SMTP_PASSWORD=${testAccount.pass}`);
}

main().catch(console.error);
