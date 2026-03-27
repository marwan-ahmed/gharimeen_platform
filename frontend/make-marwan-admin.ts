import { prisma } from './src/db/index';

async function run() {
  // Found UID from list-users output representing marwan.ahmed87
  const uid = 'Qmy6dNyjYpPtcrhIOQsZqnvEcAC2';
  const email = 'marwan.ahmed87@outlook.com';
  
  const existing = await prisma.admin.findUnique({ where: { id: uid }});
  
  if(!existing) {
    await prisma.admin.create({
        data: {
        id: uid,
        email: email,
        name: 'Marwan Admin',
        role: 'super_admin'
        }
    });
    console.log("Successfully added Marwan Admin.");
  } else {
      console.log("Already an admin!");
  }
}

run().catch(e => console.log("Already exist or error:", e)).finally(() => prisma.$disconnect());
