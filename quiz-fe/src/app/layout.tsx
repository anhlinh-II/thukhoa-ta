import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConfigProvider } from "antd";
import ReduxProvider from "../components/providers/ReduxProvider";
import QueryProvider from "../components/providers/QueryProvider";

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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReduxProvider>
          <QueryProvider>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#9a4cff',
                colorPrimaryHover: '#7a3bdf',
                colorPrimaryActive: '#6f2ac5',
                borderRadius: 8,
                fontSize: 16,
              },
              components: {
                Button: {
                  borderRadius: 8,
                  fontWeight: 500,
                },
                Input: {
                  borderRadius: 8,
                },
                Card: {
                  borderRadius: 12,
                },
              },
            }}
          >
            {children}
          </ConfigProvider>
          </QueryProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
