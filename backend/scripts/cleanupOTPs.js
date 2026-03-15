const { cleanupExpiredOTPs } = require('../src/services/otpService');
const prisma = require('../src/utils/prisma');

async function runCleanup() {
    console.log('🧹 Starting cleanup of expired OTPs...');
    try {
        const count = await cleanupExpiredOTPs();
        console.log(`✅ Cleanup complete. Deleted ${count} expired/used OTP records.`);
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
    } finally {
        await prisma.$disconnect();
    }
}

runCleanup();
