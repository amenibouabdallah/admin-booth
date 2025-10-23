import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Get all available booths (for enterprise to view and book)
export async function GET() {
  try {
    const booths = await prisma.booth.findMany({
      where: {
        OR: [
          { enterpriseId: null },
          { status: "Rejected" },
        ],
      },
      orderBy: {
        number: "asc",
      },
    });

    return NextResponse.json(booths, { status: 200 });
  } catch (error) {
    console.error("Get available booths error:", error);
    return NextResponse.json(
      { message: "Failed to fetch available booths" },
      { status: 500 }
    );
  }
}
