This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Setup (do this once after cloning)

### 1. Install dependencies

```bash
npm install
```

### 2. Set up your environment variables

Copy the example env file and fill it in:

```bash
# macOS / Linux
cp .env.example .env

# Windows PowerShell
copy .env.example .env
```

Open `.env` (or `.env.local`) and set the values:

- `DATABASE_URL` — leave as `file:./dev.db` unless you have a reason to change it
- `ADMIN_PASSWORD` — any password you want to use to log in to the admin panel locally
- `ADMIN_SESSION_SECRET` — any long random string (used to sign cookies)
- `NEXT_PUBLIC_SITE_URL` — leave blank for local development

### 3. Create and seed the database

This creates your local `dev.db` file and populates it with the study and team data:

```bash
npx prisma migrate dev
npx prisma generate
npm run seed
```

> **If the site loads but study pages show a 404**, it almost always means this step was skipped. Run the commands above and restart the dev server.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the site.

---

## Getting Started

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy this app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
