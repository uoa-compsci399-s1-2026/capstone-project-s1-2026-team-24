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

## Languages & translation (English / 中文)

The navbar has a language toggle (top-right) that switches between English and
Simplified Chinese. There are **three kinds of text**, handled differently:

| Text | Examples | How it translates |
|------|----------|--------------------|
| **Fixed interface text** | nav, footer, buttons, form labels, the Collaborations / Studies / Contact / Team section copy | Built-in dictionary (`src/messages/en.ts` & `zh.ts`). **Always works — no setup needed.** |
| **Admin-authored page copy** | hero titles, info-card & callout text, the body of Home / About / Research / etc., study-card titles | **Machine-translated and cached.** Needs translation turned on (below). Until then it **falls back to English.** |
| **Individual study pages** | a study's description, eligibility, compensation on `/studies/<name>` | **Manual, board-approved translations** entered in the admin console. **Never machine-translated** (ethics requirement). |

### "Why is most of the page (e.g. the heroes) still English when I switch to 中文?"

Because **machine translation isn't turned on yet.** Hero titles and most page-body
text are *admin-authored content* (middle row above). They're translated by a
service and cached in the database — but only once you add an API key and warm the
cache. With no key they correctly fall back to English, while the fixed nav / footer
/ forms still switch to Chinese.

### Turning on machine translation

1. **Get a free API key.** The default provider is **Microsoft Azure AI Translator**
   (free tier: ~2,000,000 characters/month — far more than this site needs, because
   translations are cached). Google Cloud Translation and DeepL are also supported.

2. **Add to `.env.local`:**

   ```bash
   TRANSLATE_PROVIDER="azure"        # azure (default) | google | deepl
   TRANSLATE_API_KEY="your-key-here"
   TRANSLATE_REGION="australiaeast"  # Azure only — your resource's region (omit for a "Global" resource)
   ```

3. **Warm the cache** (translates the whole site in one command):

   ```bash
   npm run warm:translations
   ```

   Now switching to 中文 shows Chinese everywhere. You only need to re-run this when
   you **change** English text — and publishing a page in the admin already warms its
   translations automatically, so in normal use you rarely run it by hand.

### How the cache works (and why it's safe for markers / production)

- Translation happens at **publish / warm time**, never on a normal page view. The
  public site only **reads** cached translations, so it renders Chinese instantly and
  **works even with no API key present at runtime** (e.g. when someone else runs it).
- A translation is reused until its English source changes — the API is called once
  per unique string, not per visit, so usage stays tiny.
- Switching providers is a one-line change to `TRANSLATE_PROVIDER`.

> The three legacy study pages `/studies/nz-synergy`, `/studies/food-beverage` and
> `/studies/ferdinand` are hand-built pages of study content, so — like all study
> content — they are **not** machine-translated.

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
