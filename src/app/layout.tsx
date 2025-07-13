import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "SuperConvertor - 专业图片处理工具",
  description: "强大的在线图片处理工具，支持10+种格式转换、智能裁剪、批量处理、压缩优化。完全免费，保护隐私，无需注册。",
  keywords: "图片转换,图片压缩,图片裁剪,格式转换,WebP,JPEG,PNG,GIF,AVIF,批量处理",
  authors: [{ name: "SuperConvertor Team" }],
  robots: "index, follow",
  openGraph: {
    title: "SuperConvertor - 专业图片处理工具",
    description: "强大的在线图片处理工具，支持10+种格式转换、智能裁剪、批量处理、压缩优化",
    type: "website",
    locale: "zh_CN",
  },
  twitter: {
    card: "summary_large_image",
    title: "SuperConvertor - 专业图片处理工具",
    description: "强大的在线图片处理工具，支持10+种格式转换、智能裁剪、批量处理、压缩优化",
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#3B82F6',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#3B82F6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SuperConvertor" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
