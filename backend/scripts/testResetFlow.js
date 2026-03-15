require('dotenv').config();
const prisma = require('../src/utils/prisma');
const crypto = require('crypto');



async function testResetFlow() {
    try {
        // Step 1: Find a user
        const user = await prisma.user.findFirst();
        if (!user) {
            console.log('No users found in database');
            return;
        }

        console.log('Testing with user:', user.email);

        // Step 2: Generate token (same as forgot password)
        const resetToken = crypto.randomBytes(20).toString('hex');
        console.log('\n1. Plain reset token:', resetToken);

        // Step 3: Hash it
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        console.log('2. Hashed token (stored in DB):', resetPasswordToken);

        // Step 4: Save to database
        const resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);
        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken,
                resetPasswordExpire
            }
        });

        console.log('3. Token saved to database');
        console.log('4. Reset URL would be: http://localhost:5173/reset-password/' + resetToken);

        // Step 5: Verify we can find the user with the token
        const foundUser = await prisma.user.findFirst({
            where: {
                resetPasswordToken,
                resetPasswordExpire: {
                    gt: new Date()
                }
            }
        });

        if (foundUser) {
            console.log('✅ SUCCESS: User can be found with the token');
        } else {
            console.log('❌ ERROR: User cannot be found with the token');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testResetFlow();
