const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const shops = await prisma.shop.findMany();
    console.log('Shops with types:');
    shops.forEach(s => {
        console.log(`Name: ${s.name}, isApproved: ${s.isApproved} (${typeof s.isApproved})`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
