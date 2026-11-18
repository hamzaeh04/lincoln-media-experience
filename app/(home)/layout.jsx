import "../_styles/styles.css";
import "../_styles/site.css";
import { fontVariables } from "../_components/fonts";

// Home: the voice-guided experience followed by the studio site. The page starts "locked"
// (guide on screen, site hidden) until the visitor finishes or skips the guide.
export default function HomeLayout({ children }) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body className="locked" data-page="home" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
