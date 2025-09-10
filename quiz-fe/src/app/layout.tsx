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
  title: "QuizMaster - English Learning Platform",
  description: "Master English with daily quizzes, grammar challenges, and vocabulary builders",
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
                colorPrimary: '#c88bff', // Màu tím chính từ FloatingBubbles (200, 139, 255)
                colorPrimaryHover: '#8bc0ff', // Màu xanh hover từ FloatingBubbles (139, 192, 255)
                colorPrimaryActive: '#a855f7', // Màu tím đậm hơn cho active
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
