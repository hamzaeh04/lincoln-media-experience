"use client";
import { useEffect } from "react";

// Runs the site's animation and guide scripts (bundled by Next.js) once the page markup is on screen,
// in the same order the static site used. Three.js, GSAP and Lenis come from npm and are exposed on
// `window`, which is where the scripts look for them.
export default function SiteScripts({ kind }) {
  useEffect(() => {
    if (window.__lmBooted) return; // run once (React mounts effects twice in development)
    window.__lmBooted = true;
    (async () => {
      const [THREE, { gsap }, { ScrollTrigger }, { default: Lenis }] = await Promise.all([
        import("three"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("lenis"),
      ]);
      Object.assign(window, { THREE, gsap, ScrollTrigger, Lenis });
      // One at a time: each script relies on the ones before it
      if (kind === "home") {
        await import("../_scripts/voice-lines.js");
        await import("../_scripts/app.js");
      } else {
        await import("../_scripts/inner.js");
      }
      await import("../_scripts/site.js");
      window.dispatchEvent(new Event("lm:ready"));
    })();
  }, [kind]);
  return null;
}
