# The Lincoln Media — site

Next.js 15 (App Router) site: the voice-guided experience on the home page, then the studio site, plus 52 inner pages.

## Run

```bash
npm install
npm run dev        # http://localhost:5178
npm run build && npm start
```

## Structure

| Path | What it is |
| --- | --- |
| `app/(home)/` | Home route `/` — its layout imports the CSS and sets `<body class="locked">` |
| `app/(site)/[...slug]/` | All inner pages (`/services/seo`, `/about-us`, …), statically generated |
| `app/_components/PageMarkup.jsx` | Renders a page's markup from `content/pages.json` |
| `app/_components/SiteScripts.jsx` | Client component: loads Three.js, GSAP, Lenis (npm) and the site scripts after hydration |
| `app/_components/fonts.js` | Fonts via `next/font/google` |
| `app/_styles/*.css` | Global stylesheets, imported by the layouts |
| `app/_scripts/*.js` | The guide (`app.js`), site motion (`site.js`), inner-page 3D (`inner.js`), voice lines |
| `app/api/plan` | AI build plan (needs `ANTHROPIC_API_KEY`) |
| `app/api/say` | Live voice for the visitor's name (local only; off on Vercel) |
| `public/assets/` | Images and pre-generated voice clips |
| `legacy/` + `scripts/` | Source HTML for the page markup — `npm run pages` regenerates `content/pages.json` |

`npm run voice` regenerates the voice clips after editing `app/_scripts/voice-lines.js`.
