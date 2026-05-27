# Admin / CMS internals

A developer-side guide to the admin console (`/admin/*`): its routes, the page-builder components, the draft/publish model, media usage tracking, and translation-on-publish. For the *user-facing* "how do I edit a page" view, see [content-editing.md](./content-editing.md). For the rendering side, see [architecture.md](./architecture.md).

## Access & auth

The admin area is gated by `src/middleware.ts` (matcher: `/admin/:path*` and `/api/admin/:path*`). A request needs a valid `admin_session` cookie — a jose JWT signed with `ADMIN_SESSION_SECRET`, issued by `POST /api/admin/auth/login` after the password matches `ADMIN_PASSWORD`. `/admin/login` and `/api/admin/auth/*` are exempt. Full flow: [architecture.md](./architecture.md#auth-admin).

## Admin routes

Verified against `src/app/admin/` and `src/app/api/admin/`.

| Page route | Purpose |
|------------|---------|
| `/admin` | Dashboard (stats overview). |
| `/admin/login` | Password login (renders outside the admin shell). |
| `/admin/pages`, `/admin/pages/[slug]` | Page list → the **page editor** for a page's blocks. |
| `/admin/media` | Media library (upload, edit metadata, replace, usage, delete). |
| `/admin/studies`, `/admin/studies/[id]`, `/admin/studies/new` | Study CRUD. |
| `/admin/studies/[id]/layout` | Per-study **layout builder** (custom study page arrangement). |
| `/admin/studies/template` | The shared **study template** builder (applies to studies without an override). |
| `/admin/team`, `/admin/team/[id]`, `/admin/team/new` | Team member CRUD. |
| `/admin/publications`, `/admin/publications/[id]` | Publications list + ORCID sync; per-publication edit/review. |
| `/admin/contacts` | Contact-form submissions (read-only list). |
| `/admin/contact-recipients` | Per-category notification email recipients. |
| `/admin/preview/[slug]` | Bare public render of a page's **draft** blocks, shown in the editor's preview iframe (renders outside the admin shell). |

The matching `/api/admin/*` route handlers back these pages (auth, pages/blocks, studies + PDFs, team, publications + sync, media + usage/replace, contacts, contact-recipients, study-layouts, stats). Note that route handlers receive `params` as a **Promise** (Next 16) — e.g. `src/app/api/admin/pages/[slug]/route.ts`.

### Sidebar navigation

The sidebar (`src/app/admin/layout.tsx`, `NAV_LINKS`) lists, in order:

**Dashboard · Pages · Media · Studies · Team · Publications · Contact Submissions · Contact Recipients**

> **Partners are not in the sidebar.** The `/admin/partners` pages still exist in the tree, but they are intentionally retired from the nav (they only fed deleted carousels). Academic / Industry partner logos are now edited as **page-builder image blocks** on the Academic/Industry Partners pages. The `PartnerLogo` model and its API are kept — they're still read by the media-usage scan. (See the comment in `layout.tsx` and GitHub issue #142.)

The admin shell wraps everything except `/admin/login` and `/admin/preview/*`. Its `<main>` is `overflow-x-auto`; the page editor accounts for this with portal-based popover menus and a bounded-height layout (see below).

## The page editor

The page-builder UI lives in **`src/components/admin/page-editor/`**:

| Component | Role |
|-----------|------|
| `PageEditor.tsx` | The whole editor: block list, drag-reorder, add/save/delete/duplicate, toolbar, publish/history bar, live preview. Reused by pages **and** study layouts. |
| `PageEditorLoader.tsx` | Client loader/bootstrap wrapper. |
| `SortableBlock.tsx` | One block card: drag handle, summary, Edit toggle, and a "more actions" menu (Duplicate / Hide / Delete). |
| `BlockEditForm.tsx`, `fields.tsx`, `RichTextField.tsx` | The per-block field form; renders inputs per the registry's `fields` (incl. the TipTap rich-text editor). |
| `RowEditor.tsx` | Editor for `row` blocks (1–3 columns of nested child blocks). |
| `AddBlockButton.tsx` | The "+ Add block" menu, grouped by category and filtered by scope. |
| `PopoverMenu.tsx` | Portal-rendered popover (so menus aren't clipped by the shell's `overflow`). |
| `PreviewPane.tsx` | The live-preview iframe (points at `/admin/preview/<slug>`; reloads on each change). |
| `StudyLayoutEditor.tsx`, `StudyTemplateEditor.tsx` | Wrap `PageEditor` for the per-study and shared-template study builders. |

**Block model.** `PageEditor` holds the blocks in React state and persists each mutation to `/api/admin/pages/<slug>/blocks*`:

- **Add** → `POST .../blocks` (seeds `defaultContent` from the registry).
- **Edit** → `PATCH .../blocks/<id>` with `{ content }`.
- **Reorder** (dnd-kit drag) → `PATCH .../blocks/reorder` with the new id order.
- **Hide/show** → `PATCH .../blocks/<id>` with `{ isVisible }`.
- **Duplicate** → `POST .../blocks/<id>/duplicate`.
- **Delete** → `DELETE .../blocks/<id>`.

Drag-and-drop uses **dnd-kit** (`@dnd-kit/core` + `sortable`). Each block card knows its registry definition via `getBlockDefinition(type)` — only `editable: true` blocks show an Edit button; content-frozen blocks can still be reordered/hidden/deleted.

## Draft / publish model

A `Page` has two layers:

- **Draft** — the live `PageBlock` rows. Editing changes these immediately, but they are *not* what the public site shows.
- **Published** — `Page.publishedContent`, a JSON snapshot of the visible blocks. This is what `renderPageBlocks()` serves to the public (a page that has *never* been published falls back to its live blocks so it renders before the first publish).

The helpers are pure functions in `src/lib/page-publish.ts`:

- `snapshotBlocks(blocks)` — serialise visible, ordered blocks to the snapshot string.
- `parsePublishedSnapshot(json)` — tolerant parse back to `[{ type, content }]`.
- `hasUnpublishedChanges(publishedContent, liveBlocks)` — drives the "● Unpublished changes" vs "✓ Published" badge.

**Lifecycle (from `PageEditor`):**

- **Publish** → `POST /api/admin/pages/<slug>/publish`. Copies the draft into `publishedContent`, records a **`PageRevision`** snapshot, and warms translations (below).
- **History / Restore** → `GET .../revisions` lists snapshots; `POST .../revisions/<id>/restore` loads a past version back into the draft (you then review and Publish to make it live).
- **Discard** → `POST .../discard` reverts the draft to the published version.

`PageRevision` rows are the point-in-time history (pruned to the most recent few). One may be labelled `"Original"`.

### Study layouts (a special case of the page editor)

Study detail pages can use a custom block layout instead of the default `StudyContent`. These are stored as `Page` rows under reserved slugs (`studylayout-<slug>` per study; `studylayout-__default__` for the shared template — `src/components/blocks/study/study-slugs.ts`). `StudyLayoutEditor` reuses `PageEditor` (`scope="study"`, so only study-scoped blocks are offered) and adds three actions wired to `/api/admin/study-layouts/<slug>`:

- **Save as template** (`POST`) — apply this arrangement to every study without its own override.
- **Reset to shared template** (`DELETE`) — clear this study's blocks so it follows the template.
- **Reset to original default** (`POST .../reset-original`) — restore the built-in design, even if the template changed.

At render time `resolveStudyLayoutBlocks(slug)` (`src/components/blocks/study/resolve-study-layout.ts`) prefers a per-study override, then the template, else `null` (page falls back to `StudyContent`). Study layout blocks render their **live** study data and are sanitized at resolve time (they render client-side).

## Media library & "where is this used"

Media is the `MediaAsset` model; files live under `public/uploads/media`. The admin UI (`src/components/admin/media/`: `MediaLibrary.tsx`, `MediaPicker.tsx`, `useMediaResolver.ts`) lists assets, lets you upload/replace/edit metadata, and shows where each asset is referenced before allowing deletion.

That usage list is computed by **`findAssetUsage()`** in `src/lib/media-resolve.ts`, which searches:

- **`PageBlock.content`** for the asset by `media:{id}` ref **or** raw file path (then confirms a real match — `contains` can over-match `media:42` inside `media:420`).
- **`Study.imagePath`**, **`TeamMember.photoPath`**, **`PartnerLogo.logoPath`** (DB-field consumers that store a raw path, never a `media:{id}` ref).

> **Caveat (documented in the code):** an image referenced only by a **hardcoded path in component source** (`.tsx`) cannot be detected — that knowledge lives in code, not the database. When repointing/replacing such an asset, grep the components too.

Replacing an asset's file (`POST /api/admin/media/[id]/replace`) also runs `migrateRawPathInBlocks()` so blocks that stored a raw path keep working; `media:{id}` refs need no migration because they resolve to the asset's current `filePath`.

To pull existing `/public` images into the library, run `npm run catalog:media` (`prisma/catalog-public-media.ts`).

## Translation on publish

Admin-authored page copy is machine-translated to 中文 on a **write path** (publish/save), then cached in the DB so the **read path** never calls the translation API. The block-aware logic is `src/lib/translate/blocks.ts`:

- `warmBlockTranslations(blocks)` (called on publish) collects every translatable string and caches translations in `TranslationCache`. Field selection is driven by the registry (`text`/`textarea`/`richText`/`paragraphArray`/`studyCards`/`updatesList` translate; `image`/`url`/`enum`/`boolean` don't), with structural handling for rows, study cards, and updates.
- `localizeBlockContents(blocks)` (called from `renderPageBlocks` when lang is ZH) swaps in cached translations; a cache miss falls back to English (never a live API call).

This needs `TRANSLATE_API_KEY` (Azure by default) — without it, publish still works and ZH simply renders English for authored copy. The fixed UI strings (`src/messages/en.ts`/`zh.ts`) always work. **Study-detail content is never routed through here** — it uses manual, board-approved translations. See [environment.md](./environment.md#machine-translation) and the README's language section.

You can also pre-warm the whole site offline: `npm run warm:translations`.

## Other admin features (briefly)

- **Publications** — synced from ORCID (`src/lib/orcid.ts`) with per-paper affiliation data from OpenAlex (`src/lib/openalex.ts`) and an admin-editable relevance filter (`PublicationFilterSetting`, parsed by `src/lib/publication-filter.ts`). Sync never overwrites a manually reviewed `status`.
- **Contact form** — submissions are saved (`ContactSubmission`) and an email is sent via Resend (`src/lib/email.ts`) to the per-category recipient (`ContactRecipient`); when `RESEND_API_KEY` is unset the email is logged and skipped.

## Related docs

- [content-editing.md](./content-editing.md) — editing sections (admin vs code) and adding block types.
- [architecture.md](./architecture.md) — rendering pipeline, folder map, auth.
- [database.md](./database.md) — the models behind all of the above.
- [environment.md](./environment.md) — keys for translation and email.
