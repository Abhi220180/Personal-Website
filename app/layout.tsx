import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Abhinav Gummadi | CS + CE at UW-Madison",
  description:
    "Interactive editorial-style personal website for Abhinav Gummadi, a CS + CE student at UW-Madison."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
