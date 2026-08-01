import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPrismaQuery } from "@/lib/prisma-safe";
import { DEFAULT_ADMIN_CONTENT } from "@/lib/seed-data";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const data = await withPrismaQuery(async () => {
    const [about, team, sectors, careers, settings, pages, ged] = await Promise.all([
      prisma.aboutSection.findMany(),
      prisma.teamMember.findMany({ orderBy: { order: "asc" } }),
      prisma.sector.findMany({ orderBy: { order: "asc" } }),
      prisma.careersSettings.findUnique({ where: { id: "default" } }),
      prisma.siteSettings.findUnique({ where: { id: "default" } }),
      prisma.pageContent.findMany(),
      prisma.gedService.findUnique({ where: { id: "default" } }),
    ]);

    return { about, team, sectors, careers, settings, pages, ged };
  }, DEFAULT_ADMIN_CONTENT);

  return NextResponse.json(data);
}

export async function PUT(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { section, data } = body;

    switch (section) {
      case "about": {
        await prisma.aboutSection.upsert({
          where: { key: data.key },
          update: { title: data.title, content: data.content },
          create: { key: data.key, title: data.title, content: data.content },
        });
        break;
      }
      case "team": {
        if (data.id) {
          await prisma.teamMember.update({
            where: { id: data.id },
            data: {
              name: data.name,
              role: data.role,
              skills: data.skills,
              imageUrl: data.imageUrl,
              order: data.order,
            },
          });
        } else {
          await prisma.teamMember.create({
            data: {
              name: data.name,
              role: data.role,
              skills: data.skills,
              imageUrl: data.imageUrl,
              order: data.order || 0,
            },
          });
        }
        break;
      }
      case "team-delete": {
        await prisma.teamMember.delete({ where: { id: data.id } });
        break;
      }
      case "sector": {
        await prisma.sector.update({
          where: { id: data.id },
          data: {
            name: data.name,
            description: data.description,
            imageUrl: data.imageUrl,
            order: data.order,
          },
        });
        break;
      }
      case "careers": {
        await prisma.careersSettings.upsert({
          where: { id: "default" },
          update: {
            title: data.title,
            content: data.content,
            email: data.email,
            phone: data.phone,
          },
          create: {
            id: "default",
            title: data.title,
            content: data.content,
            email: data.email,
            phone: data.phone,
          },
        });
        break;
      }
      case "settings": {
        await prisma.siteSettings.upsert({
          where: { id: "default" },
          update: {
            whatsappNumber: data.whatsappNumber,
            contactEmail: data.contactEmail,
            contactPhone: data.contactPhone,
            address: data.address,
          },
          create: {
            id: "default",
            whatsappNumber: data.whatsappNumber,
            contactEmail: data.contactEmail,
            contactPhone: data.contactPhone,
            address: data.address,
          },
        });
        break;
      }
      case "page": {
        await prisma.pageContent.upsert({
          where: { key: data.key },
          update: { title: data.title, content: data.content },
          create: { key: data.key, title: data.title, content: data.content },
        });
        break;
      }
      case "ged": {
        await prisma.gedService.upsert({
          where: { id: "default" },
          update: {
            title: data.title,
            description: data.description,
            imageUrl: data.imageUrl,
          },
          create: {
            id: "default",
            title: data.title,
            description: data.description,
            imageUrl: data.imageUrl,
          },
        });
        break;
      }
      default:
        return NextResponse.json({ error: "Section invalide" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Content update error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
