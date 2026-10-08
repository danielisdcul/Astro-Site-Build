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
| CSS location index and imports | [`src/styles/global.css`](src/styles/global.css) |
| Fonts, typography, colors, and spacing | [`src/styles/foundations.css`](src/styles/foundations.css) |
| Component, page, and responsive styles | Feature modules in [`src/styles/`](src/styles/) |
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
│   ├── ProgressiveImage.astro    Shared preview-first image rendering
│   └── ProjectCaseStudy.astro    Full project-page structure
├── layouts/BaseLayout.astro     Shared page shell
└── styles/
    ├── global.css                CSS location index and ordered imports
    ├── foundations.css           Fonts, tokens, defaults, and typography
    ├── layout.css                Shared layout, links, and footer
    ├── navigation.css            Header, mobile menu, and section tracker
    ├── home.css                  Home-page sections and animations
    ├── project-cards.css         Card layouts and project grid
    ├── pages.css                 Work, About, and Contact
    ├── case-study.css            Project details and case-study content
    ├── gallery.css               Image galleries and dialog viewer
    └── accessibility.css         Reduced-motion overrides

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
cardLayout: 'wide-top',
```

- `featured: true` displays a full-width card above the regular project grid.
  Featured cards use the existing single-image layout. Keep one card image for
  a featured project.
- `featured: false` places the card in the regular grid. Existing regular cards
  use three images.
- `showOnHome: true` includes the project in the landing page's selected work.
- `showOnHome: false` keeps it on the full Work page without adding it to the
  landing page.
- `cardLayout: 'wide-top'` makes the first image in a regular card span both columns.
- `cardLayout: 'wide-bottom'` makes the last image span both columns instead.

The order in `projects/index.ts` controls the full Work page and the order within
each landing-page group. `cardLabel` is authored text, so update its displayed
number if you reorder projects. The gallery layout does not depend on the
project's slug. On the Work page, every project uses the regular two-column card
layout, including projects marked as featured on the landing page.

To add a project:

1. Copy a project file into `src/data/projects/` with a new filename.
2. Give its exported variable a new name and its `slug` a unique value.
3. Replace the content and image paths, then choose `featured`, `showOnHome`,
   and `cardLayout`.
4. Import that variable in `src/data/projects/index.ts` and add it to `projects`.
5. Run a build. The shared `[slug].astro` template creates its case-study page.

Keep projects imported through the `projects` array; a new file alone does not
publish a page. The `types.ts` file describes the available fields and optional
section content. Most content edits do not require changing it.

Sections appear in their array order. A section can contain a `lead`,
`paragraphs`, a `list`, `details`, and a `link`. Set `listBeforeParagraphs: true`
when the list should appear before the paragraphs.

Every page supplies section links to the shared layout. Case studies generate their
hierarchy from section titles; `navigationLevel: 1` or `2` overrides a section's level.
On desktop the rail expands on hover when space is limited. On mobile it sits opposite
the main menu, opens with a tap or inward swipe, and slides away while that menu is open.
The current section highlights as you scroll, and anchor IDs follow the section data.

Sections can also include a `gallery` using the same options as the main project
image gallery. Related images sit in the right-hand margin alongside their section’s
text on desktop, then stack below the text at 800px and narrower. Section images stay
uncropped and retain the shared image viewer and progressive loading.

Add a `videos` array of objects with `src`, `poster`, `alt`, `width`, `height`, and `caption`
for recordings with native playback controls. Paired recordings sit side by side
on desktop and stack at 800px and narrower. Selecting a video opens the shared
viewer and attempts playback; browser autoplay restrictions can require a tap.
Selah Coffee's six infographics and walkthrough posters are in
`public/images/portfolio/selah-coffee/`; its desktop and mobile recordings are in
`public/videos/`.

Add an optional `links` array to a project to show a **Project links** section
below its opening details and above the gallery. Use it for websites, prototypes,
repositories, or other project resources:

```ts
links: [
  { label: 'View the website', href: 'https://example.com' },
  { label: 'View the prototype', href: 'https://www.figma.com/...' },
],
```

Projects with no links omit this section.

## Reusable image galleries

Every project page uses `src/components/Gallery.astro`. Edit a project's `gallery`
in `src/data/projects/` to adjust its case-study images independently of `cardImages`.
If `gallery` is omitted, the page uses its card images and `cardLayout`.

```ts
gallery: {
  layout: 'wide-top',
  columns: 2,
  lightbox: true,
  images: [
    {
      src: '/images/portfolio/new-project.png',
      alt: 'Description of the image',
      caption: 'Optional visible caption',
      width: 1600,
      height: 1066,
    },
  ],
},
```

Layouts are `grid`, `wide-top` (first item spans the row), `wide-bottom` (last
item spans the row), and `stack`. `columns` accepts 1–4 and defaults to 2;
galleries use two-column tiles on mobile by default. Set `mobileLayout: 'stack'`
to keep a mixed gallery's order and show each item at its natural proportions. An
odd final image fills the last row in the default mobile grid. The lightbox retains
each image's original proportions. Captions and dimensions are optional; use actual
image dimensions to reserve space while loading.

Mixed galleries can set `order` on images and videos to control their shared tile
and viewer sequence. In `grid` layout, landscape items automatically span two
columns and portrait items span two rows; dense placement fills open cells. Override
that behavior per item with a one-based `placement`, for example:

```ts
placement: { column: 3, row: 1, columnSpan: 1, rowSpan: 2 }
```

Manual placement is used on desktop; mobile tiles return to the standard two-column
layout.

Gallery images use the same progressive image loader as portraits and project cards.
Small previews appear first on mobile and desktop. Opening the viewer immediately
requests its selected full-size image; hidden slides keep their previews.

Click an image to open the viewer. Use its buttons or left/right arrow keys to
browse, and Escape, Close, or the backdrop to dismiss it. On mobile, swipe sideways
to browse or swipe down quickly to close. Hold an image to magnify it. Set `lightbox: false`
for a static gallery. Without JavaScript, image links open the original file.

Add `videos` to a gallery to show clickable video poster tiles alongside its images.
Each video needs a source, poster, description, caption, and dimensions. Selecting
a poster opens and plays the video in the shared viewer. Video slides use native
controls and fit the available viewport as the phone rotates. The lightbox viewer
in a case study spans its main gallery and every section gallery, so swiping
continues through that page's images and videos.

To use the component on any other page:

```astro
---
import Gallery from '../components/Gallery.astro';
const images = [
  { src: '/images/portfolio/new-project.png', alt: 'Description of the image' },
];
---
<Gallery images={images} layout="grid" columns={2} label="Project images" />
```

Add `eager` when the gallery is near the top of a page. Gallery styles and viewer
controls are in `src/styles/gallery.css`.

## Shared image loading

Use `src/components/ProgressiveImage.astro` for site images. It renders a small
preview, reserves the image's dimensions, and defaults to native lazy loading:

```astro
<ProgressiveImage src="/images/portfolio/new-project.png" alt="Describe the image" />
```

After the window's `load` event, `src/utils/image-loading.ts` upgrades nearby images
during idle time with at most two background downloads. Offscreen images wait until
they approach the viewport. Clicking an image can request an upgrade before page
load completes. Original downloads are shared across components, and previews stay
visible until larger images decode. Failed requests retain the preview and can retry.

Add `eager` for a preview above the fold. Use `upgrade="on-demand"` for viewer images
that upgrade on click or through `upgradeImage()`, and `upgrade="preview"` for small
thumbnails that never need an upgrade. Normal links keep their navigation behavior.
External URLs and SVGs pass through; external images can provide `previewSrc`.

`scripts/image-assets.mjs` prepares preview and full-size WebPs for raster originals
under `public/images/` before Astro starts or builds. Previews are at most 640px wide;
larger WebPs retain original dimensions. Source files remain available for downloads.
Generated assets live in `public/images/generated/`, and their lookup table is
`src/data/generated/images.json`. Content hashes invalidate stale variants and browser
caches when originals change. No per-project preview paths are needed.

To refresh variants after editing images while the dev server is running:

```sh
npm run images:prepare
```

New builds regenerate them automatically. The old gallery-only loader, preview
component, generator, and hand-maintained project preview paths have been removed.

## Shared settings and assets

Edit the email address once in `site.ts`. The `emailLink` export builds its
`mailto:` URL from that address, and the home page uses the same address as its
visible link text. Social links are shared by Contact and the footer. The portrait
in `site.ts` is shared by Home and About. Shared link and identity types live in
`src/data/types.ts`; page contracts live in `src/data/pages/types.ts`.

Keep card configuration in `cardLayout` and full-gallery configuration in `gallery`.
`cardMeta` is optional and only appears on featured Home cards. Project colors are
controlled by the stylesheets; the unused project `accent` and `accentSoft` fields
have been removed. Avoid editing `src/data/generated/images.json` by hand.

Files in `public/` are available from the site root. For example:

```text
public/images/portfolio/new-project.png → /images/portfolio/new-project.png
```

Use the path on the right in project data.

Use `src/styles/global.css` as the CSS entry point and location index. Edit styles
in the corresponding feature module; keep its responsive overrides at the end of
that file, ordered from wider to narrower breakpoints. Shared tokens and responsive
spacing live in `foundations.css`; reduced-motion overrides live in
`accessibility.css`, which is imported last. Update the location index when adding
or renaming a module. Avoid editing `dist/`, which is replaced when Astro builds.

## Local development and builds

Run commands from the project root. Use Node.js 22.12 or newer.
The dependency lockfile is managed with pnpm; use `pnpm install --frozen-lockfile`
when installing the project's dependencies.

| Task | Command |
| --- | --- |
| Start the local server in background mode | `npm run dev -- --background` |
| Check the development server | `npm run astro -- dev status` |
| Read development server logs | `npm run astro -- dev logs` |
| Stop the development server | `npm run astro -- dev stop` |
| Check TypeScript and Astro component types | `npm run check` |
| Validate data, assets, image loading, and section navigation | `npm test` |
| Build the static site into `dist/` | `npm run build` |
| Preview the most recent build | `npm run preview` |

The development server updates as you save source files. A production preview
shows the last build, so rebuild after making changes you want to preview there.

The checker uses TypeScript 6, which provides the compiler API required by
`@astrojs/check`. Keep validation tools in `devDependencies` and use the pnpm lockfile
when installing them. `.gitignore` prevents adding new local dependencies and tool
caches; files already tracked by Git retain their existing tracking.

Reference: [Astro project structure](https://docs.astro.build/en/basics/project-structure/)
and [Astro routing](https://docs.astro.build/en/guides/routing/).
