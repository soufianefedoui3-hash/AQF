import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const applications = await prisma.jobApplication.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(applications);
}

export async function PATCH(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id, status } = await request.json();
  await prisma.jobApplication.update({ where: { id }, data: { status } });

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await request.json();
  await prisma.jobApplication.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
