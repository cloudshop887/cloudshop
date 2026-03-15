const prisma = require('../src/utils/prisma');
const bcrypt = require('bcryptjs');
require('dotenv').config();



async function createAdminUser() {
    try {
        // Check if admin already exists
        const existingAdmin = await prisma.user.findUnique({
            where: { email: 'admin@shop.com' }
        });

        if (existingAdmin) {
            // Update existing user to admin
            const updatedUser = await prisma.user.update({
                where: { email: 'admin@shop.com' },
                data: { role: 'ADMIN' }
            });
            console.log('✅ Updated existing user to ADMIN role');
            console.log('Email:', updatedUser.email);
            console.log('Role:', updatedUser.role);
        } else {
            // Create new admin user
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);

            const admin = await prisma.user.create({
                data: {
                    fullName: 'Admin User',
                    email: 'admin@shop.com',
                    phone: '1234567890',
                    password: hashedPassword,
                    role: 'ADMIN'
                }
            });

            console.log('✅ Admin user created successfully!');
            console.log('Email:', admin.email);
            console.log('Password: admin123');
            console.log('Role:', admin.role);
        }

        console.log('\n🔐 Admin Login Details:');
        console.log('URL: http://localhost:5173/admin/login');
        console.log('Email: admin@shop.com');
        console.log('Password: admin123');

    } catch (error) {
        console.error('❌ Error creating admin user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdminUser();
