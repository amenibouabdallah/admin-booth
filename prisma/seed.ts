import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Create sample categories first
  const categories = [
    {
      name: "Standard",
      description: "Standard booth with basic amenities",
      dimensions: { width: 3, height: 3 },
      priceWitouAddons: 1000,
      addons: [
        { name: "Extra Table", description: "Additional display table", price: 50 },
        { name: "Extra Chair", description: "Additional seating", price: 25 },
      ],
    },
    {
      name: "Premium",
      description: "Premium booth with enhanced features",
      dimensions: { width: 4, height: 4 },
      priceWitouAddons: 2000,
      addons: [
        { name: "LED Display", description: "Digital display screen", price: 200 },
        { name: "Premium Lighting", description: "Enhanced lighting setup", price: 150 },
      ],
    },
    {
      name: "Deluxe",
      description: "Deluxe booth with all amenities",
      dimensions: { width: 5, height: 5 },
      priceWitouAddons: 3500,
      addons: [
        { name: "Conference Room", description: "Private meeting space", price: 500 },
        { name: "Catering Service", description: "Food and beverage service", price: 300 },
      ],
    },
    {
      name: "Corner",
      description: "Corner booth with double exposure",
      dimensions: { width: 4, height: 4 },
      priceWitouAddons: 2500,
      addons: [
        { name: "Double Signage", description: "Two-sided signage", price: 100 },
        { name: "Extra Storage", description: "Additional storage space", price: 75 },
      ],
    },
  ];

  console.log("Creating categories...");
  const createdCategories = [];
  for (const category of categories) {
    const existing = await prisma.category.findUnique({
      where: { name: category.name },
    });

    if (!existing) {
      const created = await prisma.category.create({
        data: category,
      });
      createdCategories.push(created);
      console.log(`Created category: ${created.name}`);
    } else {
      createdCategories.push(existing);
      console.log(`Category already exists: ${existing.name}`);
    }
  }

  // Remove all existing booths
  console.log("Removing existing booths...");
  const deletedBooths = await prisma.booth.deleteMany({});
  console.log(`Deleted ${deletedBooths.count} existing booths`);

  // Create 55 booths
  console.log("Creating 55 booths...");
  const defaultDimensions = { width: 3, height: 3 };
  const defaultPrice = 1000;

  for (let i = 1; i <= 55; i++) {
    const booth = await prisma.booth.create({
      data: {
        name: `Booth ${i}`,
        description: `Exhibition booth number ${i}`,
        number: i,
        dimensions: defaultDimensions,
        priceWitouAddons: defaultPrice,
        finalPrice: defaultPrice,
        status: "Pending",
        addons: [],
      },
    });
    console.log(`Created booth #${booth.number}: ${booth.name}`);
  }

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
