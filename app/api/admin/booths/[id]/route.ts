import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET - Get booth by ID
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const booth = await prisma.booth.findUnique({
      where: { id },
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
    });

    if (!booth) {
      return NextResponse.json({ message: "Booth not found" }, { status: 404 });
    }

    return NextResponse.json(booth, { status: 200 });
  } catch (error) {
    console.error("Get booth by ID error:", error);
    return NextResponse.json(
      { message: "Failed to fetch booth" },
      { status: 500 },
    );
  }
}

// PATCH - Update booth
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const {
      name,
      description,
      number,
      dimensions,
      priceWitouAddons,
      finalPrice,
      status,
      addons,
      image,
      categoryId,
    } = body;

    const booth = await prisma.booth.findUnique({
      where: { id },
    });

    if (!booth) {
      return NextResponse.json({ message: "Booth not found" }, { status: 404 });
    }

    // Check if booth number is being changed and if it already exists
    if (number && number !== booth.number) {
      const existingBooth = await prisma.booth.findUnique({
        where: { number },
      });

      if (existingBooth) {
        return NextResponse.json(
          { message: "Booth number already exists" },
          { status: 400 },
        );
      }
    }

    const updatedBooth = await prisma.booth.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(number !== undefined && { number }),
        ...(dimensions && { dimensions }),
        ...(priceWitouAddons !== undefined && { priceWitouAddons }),
        ...(finalPrice !== undefined && { finalPrice }),
        ...(status && { status }),
        ...(addons && { addons }),
        ...(image !== undefined && { image }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
      },
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
    });

    return NextResponse.json(
      { message: "Booth updated successfully", booth: updatedBooth },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update booth error:", error);
    return NextResponse.json(
      { message: "Failed to update booth" },
      { status: 500 },
    );
  }
}

// DELETE - Delete booth
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const booth = await prisma.booth.findUnique({
      where: { id },
    });

    if (!booth) {
      return NextResponse.json({ message: "Booth not found" }, { status: 404 });
    }

    await prisma.booth.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Booth deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Delete booth error:", error);
    return NextResponse.json(
      { message: "Failed to delete booth" },
      { status: 500 },
    );
  }
}
