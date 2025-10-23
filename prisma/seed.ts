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

  // Create 55 booths
  console.log("Creating 55 booths...");
  const boothNames = [
    "Innovation Hub", "Tech Central", "Future Zone", "Digital Plaza", "Smart Space",
    "Creative Corner", "Business Bay", "Enterprise Center", "Startup Station", "Growth Gallery",
    "Success Spot", "Visionary Venue", "Pioneer Place", "Leader's Lodge", "Expert Exchange",
    "Professional Point", "Executive Edge", "Premier Position", "Elite Exhibit", "Superior Stand",
    "Excellence Area", "Quality Quarter", "Premium Pavilion", "Prestige Plaza", "Luxury Lane",
    "Grand Gallery", "Royal Row", "Imperial Isle", "Noble Nook", "Regal Room",
    "Majestic Market", "Sovereign Space", "Crown Corner", "Dynasty Display", "Monarch Mart",
    "Summit Station", "Apex Arena", "Peak Pavilion", "Pinnacle Place", "Zenith Zone",
    "Catalyst Corner", "Momentum Market", "Velocity Venue", "Accelerate Area", "Progress Point",
    "Transform Tower", "Evolve Exhibit", "Advance Arena", "Breakthrough Bay", "Frontier Forum",
    "Horizon Hall", "Discovery Den", "Explorer's Edge", "Venture Vista", "Quest Quarter",
  ];

  const boothDescriptions = [
    "Showcase your latest innovations and technologies",
    "Connect with industry leaders and partners",
    "Present cutting-edge solutions to visitors",
    "Display your products and services",
    "Network with potential customers",
  ];

  for (let i = 1; i <= 55; i++) {
    const existing = await prisma.booth.findUnique({
      where: { number: i },
    });

    if (!existing) {
      // Assign categories in a rotating pattern
      const categoryIndex = i % createdCategories.length;
      const category = createdCategories[categoryIndex];

      // Vary booth sizes
      const sizeVariation = Math.random() * 0.5;
      const width = category.dimensions.width + sizeVariation;
      const height = category.dimensions.height + sizeVariation;

      // Add some price variation
      const priceVariation = Math.random() * 500;
      const basePrice = category.priceWitouAddons + priceVariation;

      const booth = await prisma.booth.create({
        data: {
          name: boothNames[i - 1],
          description: boothDescriptions[Math.floor(Math.random() * boothDescriptions.length)],
          number: i,
          dimensions: {
            width: parseFloat(width.toFixed(1)),
            height: parseFloat(height.toFixed(1)),
          },
          priceWitouAddons: parseFloat(basePrice.toFixed(2)),
          finalPrice: parseFloat(basePrice.toFixed(2)),
          status: "Pending",
          categoryId: category.id,
          addons: [],
        },
      });
      console.log(`Created booth #${booth.number}: ${booth.name}`);
    } else {
      console.log(`Booth #${i} already exists`);
    }
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
