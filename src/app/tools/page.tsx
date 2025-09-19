'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import ToolGrid from '@/components/ToolGrid'

interface User {
  id: string
  username: string
  email: string
  credits: number
}

export default function ToolsPage() {
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
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header user={user} setUser={setUser} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AI创作工具</h1>
          <p className="text-xl text-gray-600 mb-8">
            选择你需要的AI工具，开始创作之旅
          </p>
          
          {user && (
            <div className="inline-flex items-center bg-blue-50 border border-blue-200 rounded-lg px-6 py-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-sm text-gray-600">当前余额</div>
                  <div className="text-2xl font-bold text-blue-600">{user.credits} 积分</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tools Grid */}
        <ToolGrid />

        {/* 说明区域 */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">如何使用AI工具</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">选择工具</h3>
              <p className="text-gray-600 text-sm">
                根据你的需求选择合适的AI工具，如文生图、图生图或文生视频
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">输入内容</h3>
              <p className="text-gray-600 text-sm">
                输入你的创意描述或上传图片，设置相关参数以获得最佳效果
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">获得结果</h3>
              <p className="text-gray-600 text-sm">
                等待AI处理完成，下载你的作品或分享给朋友
              </p>
            </div>
          </div>
        </div>

        {/* 积分说明 */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">积分使用说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">10</div>
              <div className="text-sm text-gray-600">文生图 / 积分</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">15</div>
              <div className="text-sm text-gray-600">图生图 / 积分</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">30</div>
              <div className="text-sm text-gray-600">文生视频 / 积分</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

