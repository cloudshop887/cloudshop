const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const shops = await prisma.shop.findMany({
        include: { owner: true }
    });
    console.log('Total Shops:', shops.length);
    shops.forEach(s => {
        console.log(`Shop: ${s.name}, Approved: ${s.isApproved}, Owner: ${s.owner?.email}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
