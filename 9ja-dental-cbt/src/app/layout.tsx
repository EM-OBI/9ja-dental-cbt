import type { Metadata } from "next";
import {
  Inter,
  Playfair_Display,
  Allura,
  Dancing_Script,
} from "next/font/google";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--body-font",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--heading-font",
});
const allura = Allura({
  subsets: ["latin"],
  weight: "400",
  variable: "--cursive-font-two",
});
const dancing = Dancing_Script({
  subsets: ["latin"],
  variable: "--cursive-font",
});
export const metadata: Metadata = {
  title: "Naija Dentistry Specialization Quiz App",
  description:
    "Instantly master specialization in dentistry with our comprehensive quiz app and AI insights.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${allura.variable} ${dancing.variable}`}
    >
      <body className=" text-white min-h-screen">{children}</body>
    </html>
  );
}
