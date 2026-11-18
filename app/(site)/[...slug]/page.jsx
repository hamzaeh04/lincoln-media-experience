import { notFound } from "next/navigation";
import PageMarkup, { allRoutes, getPage, pageMetadata } from "../../_components/PageMarkup";
import SiteScripts from "../../_components/SiteScripts";

export const dynamicParams = false;

export function generateStaticParams() {
  return allRoutes().filter((r) => r !== "/").map((r) => ({ slug: r.slice(1).split("/") }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return pageMetadata("/" + slug.join("/"));
}

export default async function InnerPage({ params }) {
  const { slug } = await params;
  const route = "/" + slug.join("/");
  if (!getPage(route)) notFound();
  return (
    <>
      <PageMarkup route={route} />
      <SiteScripts kind="inner" />
    </>
  );
}
