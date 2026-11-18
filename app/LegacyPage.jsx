import pages from "../content/pages.json";

// Renders one of the site's pages exactly as it was built: same markup, stylesheets and scripts.
// The browser runs the page's scripts in order while parsing (as on the static site), and the
// wrapper uses `display: contents`, so it adds no box to the layout.
export function getPage(route) {
  return pages[route] || null;
}

export function pageMetadata(route) {
  const p = getPage(route);
  return p ? { title: p.title, description: p.description } : {};
}

export default function LegacyPage({ route }) {
  const p = getPage(route);
  // Set the page's <body> class / data-page before anything renders (the CSS and scripts rely on them)
  const boot = `<script>document.body.className=${JSON.stringify(p.bodyClass)};document.body.setAttribute("data-page",${JSON.stringify(p.dataPage)});</script>`;
  return <div id="lm-page" style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: boot + p.head + p.body }} />;
}
