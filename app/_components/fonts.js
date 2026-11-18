import { Inter_Tight, JetBrains_Mono, Unbounded, Instrument_Sans } from "next/font/google";

// Self-hosted by Next.js at build time. The CSS uses them through --sans, --mono, --display and --body.
const interTight = Inter_Tight({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-inter-tight", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-jetbrains-mono", display: "swap" });
const unbounded = Unbounded({ subsets: ["latin"], weight: ["500", "700", "800"], variable: "--font-unbounded", display: "swap" });
const instrumentSans = Instrument_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-instrument-sans", display: "swap" });

export const fontVariables = [interTight, jetbrainsMono, unbounded, instrumentSans].map((f) => f.variable).join(" ");
