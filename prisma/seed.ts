import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seedAdmins() {
  const admins = [
    { name: "Paripoorna", email: "paripoorna@example.com", username: "Paripoorna" },
    { name: "Nandan", email: "nandan@example.com", username: "Nandan" },
    { name: "Rahul", email: "rahul@example.com", username: "Rahul" },
    { name: "Admin One", email: "admin1@example.com", username: "admin1" },
    { name: "Admin Two", email: "admin2@example.com", username: "admin2" },
    { name: "Sampanna", email: "sampanna@example.com", username: "Sampanna" },
  ];

  // Hash the same password for all: 456456
  const hashedPassword = await bcrypt.hash("456456", 10);

  for (const admin of admins) {
    await prisma.user.upsert({
      where: { email: admin.email },
      update: {},
      create: {
        name: admin.name,
        email: admin.email,
        password: hashedPassword,
        // username field removed because it does not exist in User model
      },
    });
  }

  console.log("✅ Seeded 6 Admins with username + password 456456");
}

async function main() {
  await seedAdmins();
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
