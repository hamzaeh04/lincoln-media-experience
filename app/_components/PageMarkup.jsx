import pages from "../../content/pages.json";

// The site's page markup (generated from legacy/ by `npm run pages`). Its interactive parts are
// driven by the scripts that SiteScripts loads once the page has hydrated. The wrapper uses
// `display: contents`, so it adds no box to the layout.
export function getPage(route) {
  return pages[route] || null;
}

export const allRoutes = () => Object.keys(pages);

export function pageMetadata(route) {
  const p = getPage(route);
  return p ? { title: p.title, description: p.description } : {};
}

export default function PageMarkup({ route }) {
  return <div id="lm-page" style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: getPage(route).body }} />;
}
