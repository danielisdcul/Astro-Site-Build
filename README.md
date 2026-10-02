# Daniel Culley — Portfolio

This is an Astro site that builds into static HTML and CSS. Edit the files in
`src/`; Astro assembles them into the finished website in `dist/`.

## Where to edit

| What you want to change | File |
| --- | --- |
| Shared name, brand, email, social links, navigation, or default metadata | [`src/data/site.ts`](src/data/site.ts) |
| Home-page wording and portrait | [`src/data/pages/home.ts`](src/data/pages/home.ts) |
| Work-page heading and introduction | [`src/data/pages/work.ts`](src/data/pages/work.ts) |
| About-page wording and sections | [`src/data/pages/about.ts`](src/data/pages/about.ts) |
| Contact-page wording | [`src/data/pages/contact.ts`](src/data/pages/contact.ts) |
| Selah Coffee card and case study | [`src/data/projects/selah-coffee.ts`](src/data/projects/selah-coffee.ts) |
| Vita Terra card and case study | [`src/data/projects/vita-terra.ts`](src/data/projects/vita-terra.ts) |
| Hum card and case study | [`src/data/projects/hum.ts`](src/data/projects/hum.ts) |
| Which projects appear, and their order | [`src/data/projects/index.ts`](src/data/projects/index.ts) |
| Fonts, typography, colors, spacing, or responsive styles | [`src/styles/global.css`](src/styles/global.css) |
| A page's HTML structure | [`src/pages/`](src/pages/) |
| Header, footer, card, or case-study markup | [`src/components/`](src/components/) |
| Shared document shell, metadata tags, and global CSS import | [`src/layouts/BaseLayout.astro`](src/layouts/BaseLayout.astro) |

The `metadata` fields in the About and Contact content files control their browser
titles and search descriptions. Their `title` fields control the visible page headings.
The home page uses the shared title from `site.ts` and its own intro as its description.
Project pages use each project's title and summary for metadata.

## Folder structure

```text
src/
├── data/
│   ├── site.ts                   Shared site settings only
│   ├── pages/
│   │   ├── home.ts               Home-page content
│   │   ├── work.ts               Work-page content
│   │   ├── about.ts              About-page content
│   │   └── contact.ts            Contact-page content
│   └── projects/
│       ├── index.ts              Imports projects and sets their order
│       ├── types.ts              Defines the fields a project can contain
│       ├── selah-coffee.ts        One complete project
│       ├── vita-terra.ts
│       └── hum.ts
├── pages/
│   ├── index.astro               /
│   ├── work.astro                /work/
│   ├── about.astro               /about/
│   ├── contact.astro             /contact/
│   └── projects/[slug].astro     Generates /projects/<slug>/ for each project
├── components/
│   ├── Header.astro
│   ├── Footer.astro
│   ├── ProjectCard.astro         Home-page project preview
│   └── ProjectCaseStudy.astro    Full project-page structure
├── layouts/BaseLayout.astro     Shared page shell
└── styles/global.css            Indexed stylesheet

public/
├── fonts/
└── images/portfolio/
```

For example, changing `home.title` in `src/data/pages/home.ts` changes the heading
rendered by `{home.title}` in `src/pages/index.astro`. That page is inserted into
the `<slot />` in `BaseLayout.astro`, alongside the shared header and footer.

## Editing and adding projects

Each project file holds both its home-page preview (`cardTitle`, `cardSummary`,
`cardImages`, and related fields) and its full case study (`summary`, `details`,
and `sections`). The title and slug can differ: `title` is visible text, while
`slug` determines the URL, such as `/projects/selah-coffee/`.

The display settings near the top of each project file are explicit:

```ts
featured: true,
showOnHome: true,
galleryLayout: 'wide-top',
```

- `featured: true` displays a full-width card above the regular project grid.
  Featured cards use the existing single-image layout. Keep one card image for
  a featured project.
- `featured: false` places the card in the regular grid. Existing regular cards
  use three images.
- `showOnHome: true` includes the project in the landing page's selected work.
- `showOnHome: false` keeps it on the full Work page without adding it to the
  landing page.
- `galleryLayout: 'wide-top'` makes the first image in a regular card span both columns.
- `galleryLayout: 'wide-bottom'` makes the last image span both columns instead.

The order in `projects/index.ts` controls the full Work page and the order within
each landing-page group. `cardLabel` is authored text, so update its displayed
number if you reorder projects. The gallery layout does not depend on the
project's slug. On the Work page, every project uses the regular two-column card
layout, including projects marked as featured on the landing page.

To add a project:

1. Copy a project file into `src/data/projects/` with a new filename.
2. Give its exported variable a new name and its `slug` a unique value.
3. Replace the content and image paths, then choose `featured`, `showOnHome`,
   and `galleryLayout`.
4. Import that variable in `src/data/projects/index.ts` and add it to `projects`.
5. Run a build. The shared `[slug].astro` template creates its case-study page.

Keep projects imported through the `projects` array; a new file alone does not
publish a page. The `types.ts` file describes the available fields and optional
section content. Most content edits do not require changing it.

Sections appear in their array order. A section can contain a `lead`,
`paragraphs`, a `list`, `details`, and a `link`. Set `listBeforeParagraphs: true`
when the list should appear before the paragraphs.

## Shared settings and assets

Edit the email address once in `site.ts`. The `emailLink` export builds its
`mailto:` URL from that address, and the home page uses the same address as its
visible link text. Social links are shared by Contact and the footer.

Files in `public/` are available from the site root. For example:

```text
public/images/portfolio/new-project.png → /images/portfolio/new-project.png
```

Use the path on the right in project data. Keep the indexed stylesheet in
`src/styles/global.css`; refresh its index line references when adding or removing
lines. Avoid editing `dist/`, which is replaced when Astro builds.

## Local development and builds

Run commands from the `Static Portfolio Build` folder. Use Node.js 22.12 or newer.
The dependency lockfile is managed with pnpm; use `pnpm install --frozen-lockfile`
when installing the project's dependencies.

| Task | Command |
| --- | --- |
| Start the local server in background mode | `npm run dev -- --background` |
| Check the development server | `npm run astro -- dev status` |
| Read development server logs | `npm run astro -- dev logs` |
| Stop the development server | `npm run astro -- dev stop` |
| Build the static site into `dist/` | `npm run build` |
| Preview the most recent build | `npm run preview` |

The development server updates as you save source files. A production preview
shows the last build, so rebuild after making changes you want to preview there.

Reference: [Astro project structure](https://docs.astro.build/en/basics/project-structure/)
and [Astro routing](https://docs.astro.build/en/guides/routing/).
