import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sectors = await prisma.sector.findMany({
      orderBy: { order: "asc" },
      select: { slug: true, name: true },
    });
    return NextResponse.json(sectors);
  } catch {
    return NextResponse.json([]);
  }
}
