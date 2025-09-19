'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import ToolGrid from '@/components/ToolGrid'
import RecentGenerations from '@/components/RecentGenerations'
import { User } from '@/types/user'

export default function HomePage() {
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

  return (
    <main className="min-h-screen">
      <Header user={user} setUser={setUser} />
      
      {/* Hero Section */}
      <Hero user={user} />
      
      {/* AI Tools Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              精选应用
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              探索强大的AI创作工具，轻松实现你的创意想法
            </p>
          </div>
          
          <ToolGrid />
        </div>
      </section>

      {/* Recent Generations */}
      {user && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                画作
              </h2>
              <p className="text-lg text-gray-600">
                查看你最近的AI创作作品
              </p>
            </div>
            
            <RecentGenerations userId={user.id} />
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">即刻未来AI</h3>
              <p className="text-gray-400">
                让AI创作触手可及，释放你的无限创意
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">功能</h4>
              <ul className="space-y-2 text-gray-400">
                <li>文生图</li>
                <li>图生图</li>
                <li>文生视频</li>
                <li>自动抠图</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">联系我们</h4>
              <p className="text-gray-400">
                邮箱: ainow123@qq.com
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 即刻未来AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}

