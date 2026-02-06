import type { Metadata } from "next";
import {
  Noto_Sans,
  Noto_Sans_Lao_Looped,
  Noto_Sans_Thai_Looped,
  Open_Sans,
} from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/language-context";
import { AuthProvider } from "@/lib/auth-provider";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const notoSansLao = Noto_Sans_Lao_Looped({
  variable: "--font-noto-sans-lao",
  subsets: ["lao"],
  weight: ["400", "500", "600", "700"],
});

const notoSansThai = Noto_Sans_Thai_Looped({
  variable: "--font-noto-sans-thai",
  subsets: ["thai"],
  weight: ["400", "500", "600", "700"],
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Hmong Lus Suab - ບັນທຶກສຽງພາສາມົ້ງ",
  description: "ຊ່ວຍກັນບັນທຶກສຽງພາສາມົ້ງເພື່ອສືບສານພາສາຂອງພວກເຮົາ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="lo" suppressHydrationWarning>
      <body
        suppressContentEditableWarning
        suppressHydrationWarning
        className={`${notoSans.variable} ${notoSansLao.variable} ${notoSansThai.variable} ${openSans.variable}`}
      >
        <AuthProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
