import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '即刻未来AI - COMFYUI工作流平台',
  description: '支持文生图、图生图、文生视频的AI创作平台',
  keywords: 'AI, ComfyUI, 文生图, 图生图, 文生视频, 人工智能',
  authors: [{ name: '即刻未来AI' }],
  openGraph: {
    title: '即刻未来AI - COMFYUI工作流平台',
    description: '支持文生图、图生图、文生视频的AI创作平台',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  )
}

