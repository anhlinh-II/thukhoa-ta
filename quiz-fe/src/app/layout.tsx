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
      <head>
{/* 
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Quicksand:wght@300..700&display=swap" rel="stylesheet"></link> */}

      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ReduxProvider>
          <QueryProvider>
            <AntdProvider>
              <HeaderClient />
              <div className="min-h-screen flex flex-col">
                <main className="flex-1">
                  {children}
                </main>
                <FooterClient />
              </div>
              <GlobalLoader />
              <NavigationLoader />
            </AntdProvider>
          </QueryProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
