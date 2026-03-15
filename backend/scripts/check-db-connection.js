const prisma = require('../src/utils/prisma');


async function checkConnection() {
    try {
        console.log('Attempting to connect to the database...');
        await prisma.$connect();
        console.log('✅ Connection successful! The database is running and accessible.');

        const userCount = await prisma.user.count();
        console.log(`Current user count: ${userCount}`);

    } catch (error) {
        console.error('❌ Connection failed.');
        console.error('Error code:', error.code);
        console.error('Message:', error.message);
        console.log('\n--- TROUBLESHOOTING ---');
        console.log('1. Ensure the file "dev.db" is created.');
        console.log('2. Check permissions in the folder.');
    } finally {
        await prisma.$disconnect();
    }
}

checkConnection();
