import type { Metadata } from "next";
import {
  Inter,
  Playfair_Display,
  Allura,
  Dancing_Script,
  Nunito_Sans,
} from "next/font/google";
import "../globals.css";
import ClientLayout from "@/components/ClientLayout";

// Force dynamic rendering to avoid SSR issues
export const dynamic = "force-dynamic";

const inter = Inter({
  subsets: ["latin"],
  variable: "--body-font",
});

// Google Sans alternative (Nunito Sans is very similar to Google Sans)
const googleSans = Nunito_Sans({
  subsets: ["latin"],
  variable: "--google-sans-font",
  weight: ["300", "400", "500", "600", "700"],
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
      className={`${inter.variable} ${googleSans.variable} ${playfair.variable} ${allura.variable} ${dancing.variable} h-full`}
    >
      <body className="bg-background text-foreground h-full antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
