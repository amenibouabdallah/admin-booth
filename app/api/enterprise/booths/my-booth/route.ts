import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Get enterprise's booth reservation
// Note: In a real implementation, you would get the enterpriseId from the authenticated user session
// For now, we'll expect it to be passed as a query parameter or header
export async function GET(req: NextRequest) {
  try {
    // In a real app, this would come from the authenticated user session
    // For example: const enterpriseId = req.user._id;
    const enterpriseId = req.headers.get("x-enterprise-id");

    if (!enterpriseId) {
      return NextResponse.json(
        { message: "Enterprise ID is required" },
        { status: 401 },
      );
    }

    const booth = await prisma.booth.findFirst({
      where: { enterpriseId },
      include: {
        enterprise: {
          select: {
            companyName: true,
            email: true,
          },
        },
      },
    });

    if (!booth) {
      return NextResponse.json(
        { message: "No booth reservation found for this enterprise" },
        { status: 404 },
      );
    }

    return NextResponse.json(booth, { status: 200 });
  } catch (error) {
    console.error("Get enterprise booth error:", error);
    return NextResponse.json(
      { message: "Failed to fetch enterprise booth" },
      { status: 500 },
    );
  }
}
