import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH - Bulk update booths
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { boothIds, categoryId } = body;

    // Validate required fields
    if (!boothIds || !Array.isArray(boothIds) || boothIds.length === 0) {
      return NextResponse.json(
        { message: "Invalid or empty boothIds array" },
        { status: 400 },
      );
    }

    // Validate categoryId if provided (null is valid to remove category)
    if (categoryId !== null && categoryId !== undefined) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!categoryExists) {
        return NextResponse.json(
          { message: "Category not found" },
          { status: 404 },
        );
      }
    }

    // Update all booths in the array
    const updateResult = await prisma.booth.updateMany({
      where: {
        id: {
          in: boothIds,
        },
      },
      data: {
        categoryId: categoryId === null ? null : categoryId,
      },
    });

    return NextResponse.json(
      {
        message: `Successfully updated ${updateResult.count} booth${updateResult.count !== 1 ? "s" : ""}`,
        count: updateResult.count,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Bulk update booths error:", error);
    return NextResponse.json(
      { message: "Failed to update booths" },
      { status: 500 },
    );
  }
}
