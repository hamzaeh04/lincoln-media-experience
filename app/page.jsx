import LegacyPage, { pageMetadata } from "./LegacyPage";

// Home: the voice-guided experience followed by the studio site
export const metadata = pageMetadata("/");

export default function Home() {
  return <LegacyPage route="/" />;
}
