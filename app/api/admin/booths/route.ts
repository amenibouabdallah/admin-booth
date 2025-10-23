import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - Create a new booth
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      description,
      number,
      dimensions,
      priceWitouAddons,
      finalPrice,
      addons,
      image,
    } = body;

    // Validate required fields
    if (
      !name ||
      !description ||
      number === undefined ||
      !dimensions ||
      priceWitouAddons === undefined ||
      finalPrice === undefined
    ) {
      return NextResponse.json(
        {
          message:
            "Missing required fields: name, description, number, dimensions, priceWitouAddons, finalPrice",
        },
        { status: 400 },
      );
    }

    // Check if booth number already exists
    const existingBooth = await prisma.booth.findUnique({
      where: { number },
    });

    if (existingBooth) {
      return NextResponse.json(
        { message: "Booth number already exists" },
        { status: 400 },
      );
    }

    const booth = await prisma.booth.create({
      data: {
        name,
        description,
        number,
        dimensions,
        priceWitouAddons,
        finalPrice,
        addons: addons || [],
        image,
      },
    });

    return NextResponse.json(
      { message: "Booth created successfully", booth },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create booth error:", error);
    return NextResponse.json(
      { message: "Failed to create booth" },
      { status: 500 },
    );
  }
}

// GET - Get all booths (admin view)
export async function GET() {
  try {
    const booths = await prisma.booth.findMany({
      include: {
        enterprise: {
          select: {
            companyName: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
      orderBy: {
        number: "asc",
      },
    });

    return NextResponse.json(booths, { status: 200 });
  } catch (error) {
    console.error("Get all booths error:", error);
    return NextResponse.json(
      { message: "Failed to fetch booths" },
      { status: 500 },
    );
  }
}
