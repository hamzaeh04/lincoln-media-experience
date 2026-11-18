import PageMarkup, { pageMetadata } from "../_components/PageMarkup";
import SiteScripts from "../_components/SiteScripts";

export const metadata = pageMetadata("/");

export default function Home() {
  return (
    <>
      <PageMarkup route="/" />
      <SiteScripts kind="home" />
    </>
  );
}
