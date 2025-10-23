import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Get all categories
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { booths: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error("Get categories error:", error);
    return NextResponse.json(
      { message: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}

// POST - Create a new category
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, dimensions, priceWitouAddons, addons, image } =
      body;

    // Validate required fields
    if (!name || !description || !dimensions || priceWitouAddons === undefined) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if category with same name already exists
    const existingCategory = await prisma.category.findUnique({
      where: { name },
    });

    if (existingCategory) {
      return NextResponse.json(
        { message: "Category with this name already exists" },
        { status: 400 },
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
        dimensions,
        priceWitouAddons,
        addons: addons || [],
        image: image || null,
      },
    });

    return NextResponse.json(
      { message: "Category created successfully", category },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json(
      { message: "Failed to create category" },
      { status: 500 },
    );
  }
}
