import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ReduxProvider from "../components/providers/ReduxProvider";
import QueryProvider from "../components/providers/QueryProvider";
import AntdProvider from "../components/providers/AntdProvider";

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
              {children}
            </AntdProvider>
          </QueryProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
