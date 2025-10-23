import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET - Get category by ID
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        booths: {
          select: {
            id: true,
            name: true,
            number: true,
            status: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(category, { status: 200 });
  } catch (error) {
    console.error("Get category by ID error:", error);
    return NextResponse.json(
      { message: "Failed to fetch category" },
      { status: 500 },
    );
  }
}

// PATCH - Update category
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { name, description, dimensions, priceWitouAddons, addons, image } =
      body;

    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 },
      );
    }

    // Check if category name is being changed and if it already exists
    if (name && name !== category.name) {
      const existingCategory = await prisma.category.findUnique({
        where: { name },
      });

      if (existingCategory) {
        return NextResponse.json(
          { message: "Category name already exists" },
          { status: 400 },
        );
      }
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(dimensions && { dimensions }),
        ...(priceWitouAddons !== undefined && { priceWitouAddons }),
        ...(addons && { addons }),
        ...(image !== undefined && { image }),
      },
      include: {
        _count: {
          select: { booths: true },
        },
      },
    });

    return NextResponse.json(
      { message: "Category updated successfully", category: updatedCategory },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update category error:", error);
    return NextResponse.json(
      { message: "Failed to update category" },
      { status: 500 },
    );
  }
}

// DELETE - Delete category
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { booths: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 },
      );
    }

    // Check if category has booths assigned
    if (category._count.booths > 0) {
      return NextResponse.json(
        {
          message: `Cannot delete category. ${category._count.booths} booth(s) are assigned to this category.`,
        },
        { status: 400 },
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Category deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json(
      { message: "Failed to delete category" },
      { status: 500 },
    );
  }
}
