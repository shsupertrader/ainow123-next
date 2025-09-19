'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

interface User {
  id: string
  username: string
  email: string
  credits: number
  role: string
  createdAt: string
}

export default function ProfilePage() {
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">个人资料</h1>
          <p className="text-gray-600">管理你的账户信息和设置</p>
        </div>

        {user && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 用户信息卡片 */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-bold text-white">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">{user.username}</h2>
                  <p className="text-gray-600 mb-4">{user.email}</p>
                  
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg p-3 mb-4">
                    <div className="text-2xl font-bold">{user.credits}</div>
                    <div className="text-sm opacity-90">可用积分</div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">账户类型:</span>
                      <span className={`font-medium ${user.role === 'ADMIN' ? 'text-red-600' : 'text-blue-600'}`}>
                        {user.role === 'ADMIN' ? '管理员' : '普通用户'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">注册时间:</span>
                      <span className="text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 详细信息和操作 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 账户信息 */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">账户信息</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                    <input
                      type="text"
                      value={user.username}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">邮箱地址</label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  
                  <div className="pt-4">
                    <button
                      disabled
                      className="bg-gray-400 text-white px-6 py-2 rounded-lg cursor-not-allowed"
                    >
                      编辑资料 (开发中)
                    </button>
                  </div>
                </div>
              </div>

              {/* 积分管理 */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">积分管理</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600">{user.credits}</div>
                    <div className="text-sm text-blue-700">当前余额</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600">0</div>
                    <div className="text-sm text-green-700">今日消耗</div>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => router.push('/pricing')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    充值积分
                  </button>
                  <button
                    disabled
                    className="bg-gray-400 text-white px-6 py-2 rounded-lg cursor-not-allowed"
                  >
                    消费记录 (开发中)
                  </button>
                </div>
              </div>

              {/* 快捷操作 */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">快捷操作</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => router.push('/tools')}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">AI工具</div>
                      <div className="text-sm text-gray-600">开始创作</div>
                    </div>
                  </button>
                  
                  <button
                    disabled
                    className="flex items-center p-4 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed"
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-400">我的作品</div>
                      <div className="text-sm text-gray-400">开发中</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

