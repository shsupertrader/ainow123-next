'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

interface User {
  id: string
  username: string
  email: string
  credits: number
}

export default function GenerationsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 检查登录状态
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user)
        } else {
          router.push('/')
        }
      })
      .catch(() => router.push('/'))
      .finally(() => setLoading(false))
  }, [router])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header user={user} setUser={setUser} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">我的作品</h1>
          <p className="text-gray-600 mb-12">查看和管理你的AI创作作品</p>
          
          <div className="bg-white rounded-2xl shadow-lg p-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">还没有作品</h2>
            <p className="text-gray-600 mb-8">
              你还没有创作任何作品。开始使用AI工具来创作你的第一个作品吧！
            </p>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-blue-600 font-semibold">文生图</div>
                  <div className="text-sm text-blue-700 mt-1">将文字转换为图片</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-green-600 font-semibold">图生图</div>
                  <div className="text-sm text-green-700 mt-1">基于图片生成新图</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-purple-600 font-semibold">文生视频</div>
                  <div className="text-sm text-purple-700 mt-1">从文字生成视频</div>
                </div>
              </div>
              
              <div className="mt-8">
                <button
                  onClick={() => router.push('/tools')}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  开始创作
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

