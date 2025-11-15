import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GlobalLoader from "@/share/components/base/GlobalLoader";
import NavigationLoader from "@/share/components/base/NavigationLoader";
import AntdProvider from "@/share/components/providers/AntdProvider";
import QueryProvider from "@/share/components/providers/QueryProvider";
import ReduxProvider from "@/share/components/providers/ReduxProvider";
import HeaderClient from '@/share/components/home/HeaderClient';
import FooterClient from '@/share/components/home/FooterClient';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ThuKhoaTA - Nền tảng ôn luyện tiếng Anh trực tuyến",
  description: "ThuKhoaTA - Nền tảng ôn luyện tiếng Anh trực tuyến",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="mdl-js">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}> 
        <ReduxProvider>
          <QueryProvider>
              <AntdProvider>
              <HeaderClient />
              {children}
              <FooterClient />
              <GlobalLoader />
              <NavigationLoader />
              </AntdProvider>
          </QueryProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
