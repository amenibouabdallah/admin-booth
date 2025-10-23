import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("Deleting all categories...");

  const result = await prisma.category.deleteMany({});

  console.log(`Successfully deleted ${result.count} categories`);
}

main()
  .catch((e) => {
    console.error("Error deleting categories:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
