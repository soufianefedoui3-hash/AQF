import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPrismaQuery, runPrismaMutation } from "@/lib/prisma-safe";
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

    return {
      about: about.length > 0 ? about : DEFAULT_ADMIN_CONTENT.about,
      team,
      sectors: sectors.length > 0 ? sectors : DEFAULT_ADMIN_CONTENT.sectors,
      careers: careers || DEFAULT_ADMIN_CONTENT.careers,
      settings: settings || DEFAULT_ADMIN_CONTENT.settings,
      pages: pages.length > 0 ? pages : DEFAULT_ADMIN_CONTENT.pages,
      ged: ged || DEFAULT_ADMIN_CONTENT.ged,
    };
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

    if (!section || !data || typeof data !== "object") {
      return NextResponse.json(
        { error: "section et data sont requis" },
        { status: 400 }
      );
    }

    const result = await runPrismaMutation(async () => {
      switch (section) {
        case "about": {
          if (!data.key) throw new Error("Clé de section requise");
          return prisma.aboutSection.upsert({
            where: { key: data.key },
            update: { title: data.title || "", content: data.content || "" },
            create: {
              key: data.key,
              title: data.title || "",
              content: data.content || "",
            },
          });
        }
        case "team": {
          if (data.id) {
            return prisma.teamMember.update({
              where: { id: data.id },
              data: {
                name: data.name,
                role: data.role,
                skills: data.skills,
                imageUrl: data.imageUrl ?? null,
                order: data.order ?? 0,
              },
            });
          }
          return prisma.teamMember.create({
            data: {
              name: data.name || "Nouveau membre",
              role: data.role || "Rôle",
              skills: data.skills || "",
              imageUrl: data.imageUrl ?? null,
              order: data.order || 0,
            },
          });
        }
        case "team-delete": {
          if (!data.id) throw new Error("ID requis");
          return prisma.teamMember.delete({ where: { id: data.id } });
        }
        case "sector": {
          const payload = {
            name: data.name || "",
            description: data.description || "",
            imageUrl: data.imageUrl ?? null,
            order: typeof data.order === "number" ? data.order : 0,
          };

          if (data.slug) {
            return prisma.sector.upsert({
              where: { slug: data.slug },
              update: payload,
              create: { slug: data.slug, ...payload },
            });
          }

          if (data.id && !String(data.id).startsWith("default-")) {
            return prisma.sector.update({
              where: { id: data.id },
              data: payload,
            });
          }

          throw new Error("slug ou id de secteur valide requis");
        }
        case "careers": {
          return prisma.careersSettings.upsert({
            where: { id: "default" },
            update: {
              title: data.title || "",
              content: data.content || "",
              email: data.email || "",
              phone: data.phone || "",
            },
            create: {
              id: "default",
              title: data.title || "",
              content: data.content || "",
              email: data.email || "",
              phone: data.phone || "",
            },
          });
        }
        case "settings": {
          return prisma.siteSettings.upsert({
            where: { id: "default" },
            update: {
              whatsappNumber: data.whatsappNumber || "",
              contactEmail: data.contactEmail || "",
              contactPhone: data.contactPhone || "",
              address: data.address || "",
            },
            create: {
              id: "default",
              whatsappNumber: data.whatsappNumber || "",
              contactEmail: data.contactEmail || "",
              contactPhone: data.contactPhone || "",
              address: data.address || "",
            },
          });
        }
        case "page": {
          if (!data.key) throw new Error("Clé de page requise");
          return prisma.pageContent.upsert({
            where: { key: data.key },
            update: { title: data.title, content: data.content || "" },
            create: {
              key: data.key,
              title: data.title,
              content: data.content || "",
            },
          });
        }
        case "ged": {
          return prisma.gedService.upsert({
            where: { id: "default" },
            update: {
              title: data.title || "",
              description: data.description || "",
              imageUrl: data.imageUrl ?? null,
            },
            create: {
              id: "default",
              title: data.title || "",
              description: data.description || "",
              imageUrl: data.imageUrl ?? null,
            },
          });
        }
        default:
          return { __invalidSection: true };
      }
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    if (
      result.data &&
      typeof result.data === "object" &&
      "__invalidSection" in result.data
    ) {
      return NextResponse.json({ error: "Section invalide" }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("Content update error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Erreur serveur",
      },
      { status: 500 }
    );
  }
}
