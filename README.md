# AQF — Académie de Qualité et de Formation

Site web professionnel et tableau de bord d'administration pour AQF.

## Stack

- **Next.js 15** (App Router)
- **Tailwind CSS 4**
- **SQLite** via `node:sqlite` (Node 22+) ou `better-sqlite3`
- Pas de Prisma, pas de CDN d'images

## Démarrage rapide

```bash
npm install
cp .env.example .env
npm run db:init
npm run dev
```

- **Site public:** http://localhost:3000
- **Admin:** http://localhost:3000/admin/login

**Identifiants:** `ADMIN_EMAIL` / `ADMIN_PASSWORD` (défaut `admin@aqf.ma` / `Admin@AQF2026`)

Le schéma SQLite et le contenu par défaut sont créés au premier `readyDb()` — aucun CLI de base de données au démarrage.

## Pages

| Page | URL |
|------|-----|
| Accueil | `/` |
| À propos | `/a-propos` |
| Services | `/services` |
| Accompagnement | `/services/accompagnement` |
| Formation Qualité | `/services/formation` |
| Audit | `/services/audit` |
| Produits & GED | `/services/produits` |
| Secteurs | `/secteurs` |
| Actualités | `/actualites` |
| Carrières | `/carrieres` |
| Admin | `/admin` |

## Déploiement Hostinger (Node.js + SQLite)

Variables hPanel :

```env
JWT_SECRET="your-long-random-secret"
ADMIN_EMAIL="admin@aqf.ma"
ADMIN_PASSWORD="Admin@AQF2026"
```

Optionnel : `DATABASE_PATH="/home/u784461488/domains/aqf.ma/data/aqf.sqlite"` (chemin absolu persistant — ne pas utiliser `./data/aqf.sqlite` sur Hostinger), `SETUP_SECRET`, `ADMIN_FORCE_RESET=true`.

Si un ancien fichier `prisma/production.db` existe déjà, il est réutilisé automatiquement.

| Commande Hostinger | Script |
|--------------------|--------|
| Build | `npm run build` (`next build`) |
| Start | `npm start` (`next start -H 0.0.0.0`) |

Après chaque déploiement : **hPanel → Cache → Clear cache** (et CDN si activé).

Pas de `postinstall` Prisma. La base s'ouvre et se crée à la première requête.

Réinitialiser l'admin :

```bash
npm run admin:reset
```

ou `POST /api/setup/bootstrap` avec `Authorization: Bearer SETUP_SECRET`.
