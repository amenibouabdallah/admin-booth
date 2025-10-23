import { type NextRequest, NextResponse } from "next/server";
import type { BoothStatus } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// PATCH - Update booth status (Accept/Reject reservation)
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { status } = body;

    if (!["Accepted", "Rejected", "Pending"].includes(status)) {
      return NextResponse.json(
        {
          message:
            "Invalid status. Must be 'Accepted', 'Rejected', or 'Pending'",
        },
        { status: 400 },
      );
    }

    const booth = await prisma.booth.findUnique({
      where: { id },
    });

    if (!booth) {
      return NextResponse.json({ message: "Booth not found" }, { status: 404 });
    }

    const updateData: {
      status: BoothStatus;
      reservationAcceptedAt?: Date;
    } = { status: status as BoothStatus };

    // If accepting the reservation, set the reservationAcceptedAt date
    if (status === "Accepted") {
      updateData.reservationAcceptedAt = new Date();
    }

    const updatedBooth = await prisma.booth.update({
      where: { id },
      data: updateData,
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
        message: `Booth ${status.toLowerCase()} successfully`,
        booth: updatedBooth,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update booth status error:", error);
    return NextResponse.json(
      { message: "Failed to update booth status" },
      { status: 500 },
    );
  }
}
