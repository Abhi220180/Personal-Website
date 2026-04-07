import type { Metadata } from "next";
import "@/app/globals.css";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Abhinav Gummadi | CS + CE at UW-Madison",
  description:
    "Interactive editorial-style personal website for Abhinav Gummadi, a CS + CE student at UW-Madison.",
  icons: {
    icon: "/images/website-profile-pic.jpg",
    shortcut: "/images/website-profile-pic.jpg",
    apple: "/images/website-profile-pic.jpg"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(() => {
            try {
              const stored = localStorage.getItem("theme");
              const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
              const theme = stored === "light" || stored === "dark" ? stored : (systemDark ? "dark" : "light");
              document.documentElement.classList.toggle("dark", theme === "dark");
            } catch {}
          })();`}
        </Script>
        {children}
      </body>
    </html>
  );
}
