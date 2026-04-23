import type { Metadata } from "next";
import "@/app/globals.css";

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
    <html lang="en" className="dark">
      <body>
        {children}
      </body>
    </html>
  );
}
