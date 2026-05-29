import type { Metadata } from "next";
import { Noto_Sans_KR, Comfortaa } from "next/font/google";
import "./globals.css";

const noto = Noto_Sans_KR({ subsets: ["latin"], weight: ["400", "700", "900"] });
const comfortaa = Comfortaa({ subsets: ["latin"], variable: "--font-comfortaa" });

export const metadata: Metadata = {
  title: "Class OS 310",
  description: "학급 자료 코디네이터 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${noto.className} ${comfortaa.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}