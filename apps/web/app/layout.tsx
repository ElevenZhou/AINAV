import type { Metadata } from "next";
import "./globals.css";
import Navbar from "../components/ui/Navbar";

export const metadata: Metadata = {
  title: "ai搭子 - AI中文导航",
  description: "收录快、搜索快、支持 Agent 调用的 AI 中文导航网站",
  keywords: "AI工具, AI中文导航, ChatGPT, 人工智能, AI写作, AI绘图",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
