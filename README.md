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

## Déploiement Hostinger (Node.js + SQLite)

### Variables d'environnement (hPanel)

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-long-random-secret"
ADMIN_EMAIL="admin@aqf.ma"
ADMIN_PASSWORD="Admin@AQF2026"
```

Optionnel :

```env
SETUP_SECRET="your-setup-secret"
ADMIN_FORCE_RESET="true"
```

### Scripts automatiques

| Script | Quand | Action |
|--------|-------|--------|
| `postinstall` | après `npm install` | `prisma generate` (non-fatal) |
| `build` | déploiement Hostinger | `npx prisma generate && next build` |
| `postbuild` | après build (auto) | DB push + seed via `safe-lifecycle` (jamais bloquant) |
| `prestart` | avant `npm start` | même bootstrap DB (jamais bloquant) |
| `start` | démarrage Hostinger | `next start -H 0.0.0.0` (PORT via env) |
| `db:deploy` | manuel | schema push + seed idempotent |

Le seed est **automatique** au déploiement via `postbuild` / `prestart`, mais **idempotent** : il ne réécrit pas le contenu CMS si `SiteSettings` existe déjà.

### Réinitialiser l'admin en production

**Option A — variable d'environnement (recommandé)**

1. Définir `ADMIN_FORCE_RESET=true` dans hPanel
2. Redémarrer l'application (ou redeploy)
3. Se connecter avec `ADMIN_EMAIL` / `ADMIN_PASSWORD`
4. Remettre `ADMIN_FORCE_RESET=false`

**Option B — API bootstrap (sans SSH)**

```bash
curl -X POST https://aqf.ma/api/setup/bootstrap \
  -H "Authorization: Bearer YOUR_SETUP_SECRET" \
  -H "Content-Type: application/json" \
  -d "{\"forceReset\": true}"
```

**Option C — terminal Hostinger**

```bash
npm run admin:reset
# ou création admin + sync schéma :
npm run db:bootstrap
```

### Notes SQLite sur Hostinger

- Schema push utilise le CLI Prisma local, avec **fallback SQL** si le CLI est introuvable.
- `postbuild` / `prestart` ne font **jamais échouer** le déploiement Hostinger (exit code 0).
- Si besoin manuel : `npm run db:deploy` ou `POST /api/setup/fix-admin` (avec `SETUP_SECRET`).
- Hostinger : Build = **`npm run build`**, Start = **`npm start`**.
- Pour un site en production durable, migrez vers MySQL/PostgreSQL Hostinger quand possible.
