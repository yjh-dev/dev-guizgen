import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import ThemeProvider from "@/components/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QuizGen AI - AI 퀴즈 자동 생성",
  description:
    "텍스트를 입력하면 AI가 자동으로 퀴즈를 생성합니다. 객관식, O/X, 단답형 문제를 손쉽게 만들어보세요.",
  keywords: [
    "AI 퀴즈",
    "퀴즈 생성",
    "자동 문제 생성",
    "객관식",
    "학습 도구",
    "QuizGen",
  ],
  openGraph: {
    title: "QuizGen AI - AI 퀴즈 자동 생성",
    description:
      "텍스트를 입력하면 AI가 자동으로 퀴즈를 생성합니다. 학습 효율을 높여보세요.",
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "QuizGen AI - AI 퀴즈 자동 생성",
    description:
      "텍스트를 입력하면 AI가 자동으로 퀴즈를 생성합니다.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          {children}
          <Toaster position="bottom-center" duration={2000} />
        </ThemeProvider>
      </body>
    </html>
  );
}
