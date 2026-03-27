import { prisma } from './src/db/index';

async function run() {
  console.log("Donors:", await prisma.donor.findMany());
  console.log("Admins:", await prisma.admin.findMany());
  console.log("Gharims:", await prisma.gharim.findMany());
}

run().finally(() => prisma.$disconnect());
