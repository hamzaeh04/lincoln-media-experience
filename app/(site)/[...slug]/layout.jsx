import "../../_styles/styles.css";
import "../../_styles/site.css";
import "../../_styles/inner.css";
import { fontVariables } from "../../_components/fonts";
import { getPage } from "../../_components/PageMarkup";

// Inner pages (services, work, about, policies…)
export default async function InnerLayout({ children, params }) {
  const { slug } = await params;
  const page = getPage("/" + slug.join("/"));
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body className={page?.bodyClass || "in-site inner"} data-page={page?.dataPage || "inner"} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
