# AQF — Académie de Qualité et de Formation

Site web professionnel multi-pages et tableau de bord d'administration pour AQF.

## Stack technique

- **Next.js 15** (App Router)
- **Tailwind CSS 4**
- **Lucide React**
- **Prisma + SQLite** (PostgreSQL compatible en production)

## Démarrage rapide

```bash
npm install
cp .env.example .env
npm run db:push
npm run db:seed
npm run dev
```

- **Site public:** http://localhost:3000
- **Admin:** http://localhost:3000/admin

**Identifiants admin:** `admin@aqf.ma` / `Admin@AQF2026`

## Structure du site

| Page | URL |
|------|-----|
| Accueil (minimal) | `/` |
| À propos | `/a-propos` |
| Services | `/services` |
| Accompagnement | `/services/accompagnement` |
| Formation Qualité | `/services/formation` |
| Audit | `/services/audit` |
| Produits & GED | `/services/produits` |
| Secteurs | `/secteurs` |
| Détail secteur | `/secteurs/[slug]` |
| Actualités | `/actualites` |
| Carrières | `/carrieres` |

## Admin (`/admin`)

- Tableau de bord & statistiques
- Gestion des leads (Accompagnement, Audit, Formation, GED)
- CMS : Accueil, Formation, GED, À propos, Équipe, Secteurs, Carrières
- Actualités (CRUD + images)
- Candidatures (CV / lettres téléchargeables)

## Production (PostgreSQL)

Modifiez `prisma/schema.prisma` :

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Puis `npm run db:push && npm run db:seed && npm run build && npm start`.
