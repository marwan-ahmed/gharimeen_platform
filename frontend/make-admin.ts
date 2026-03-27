import { prisma } from './src/db/index';

async function main() {
  const email = 'marwan.ahmed87@outlook.com';
  
  let user = await prisma.donor.findUnique({ where: { email } });
  
  let uid;
  if (user) {
    uid = user.id;
    console.log('Found as Donor with UID: ' + uid);
    
    // Create admin
    const admin = await prisma.admin.upsert({
      where: { id: uid },
      update: {
        email: email,
        role: 'super_admin'
      },
      create: {
        id: uid,
        email: email,
        name: 'Marwan Admin',
        role: 'super_admin'
      }
    });

    console.log('Successfully upgraded to Admin!', admin);

    // Optional: Delete from Donor so there is no role conflict
    await prisma.donor.delete({ where: { id: uid } });
    console.log('Removed from Donor table to avoid conflict.');

  } else {
    // try to see if admin already exists
    let existingAdmin = await prisma.admin.findUnique({ where: { email } });
    if(existingAdmin) {
       console.log('User is already an Admin:', existingAdmin);
    } else {
       console.log('User not found in Donor table by email. Have you registered an account with this email as a donor yet?');
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
