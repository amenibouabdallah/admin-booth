import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// POST - Book a booth (enterprise operation)
// Note: In a real implementation, you would get the enterpriseId from the authenticated user session
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id: boothId } = await context.params;

    // In a real app, this would come from the authenticated user session
    // For example: const enterpriseId = req.user._id;
    const enterpriseId = req.headers.get("x-enterprise-id");

    if (!enterpriseId) {
      return NextResponse.json(
        { message: "Enterprise ID is required" },
        { status: 401 },
      );
    }

    // Check if enterprise already has a booth reservation
    const existingBooth = await prisma.booth.findFirst({
      where: { enterpriseId },
    });

    if (existingBooth) {
      return NextResponse.json(
        { message: "Enterprise already has a booth reservation" },
        { status: 400 },
      );
    }

    // Check if booth exists and is available
    const booth = await prisma.booth.findUnique({
      where: { id: boothId },
    });

    if (!booth) {
      return NextResponse.json({ message: "Booth not found" }, { status: 404 });
    }

    if (booth.enterpriseId && booth.status !== "Rejected") {
      return NextResponse.json(
        { message: "Booth is already reserved" },
        { status: 400 },
      );
    }

    // Reserve the booth
    const updatedBooth = await prisma.booth.update({
      where: { id: boothId },
      data: {
        enterpriseId,
        status: "Pending",
      },
      include: {
        enterprise: {
          select: {
            companyName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Booth reservation request submitted successfully",
        booth: updatedBooth,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Book booth error:", error);
    return NextResponse.json(
      { message: "Failed to book booth" },
      { status: 500 },
    );
  }
}
