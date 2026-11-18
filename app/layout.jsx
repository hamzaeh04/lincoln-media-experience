export const metadata = {
  title: "The Lincoln Media — Build What's Next",
  description: "The Lincoln Media is a New York studio building AI systems, SaaS platforms and mobile apps.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Each page sets its own body class (e.g. "locked") and the scripts change it at runtime */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
