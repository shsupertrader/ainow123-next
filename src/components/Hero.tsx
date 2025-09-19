'use client'

import Link from 'next/link'

interface User {
  id: string
  username: string
  credits: number
}

interface HeroProps {
  user: User | null
}

export default function Hero({ user }: HeroProps) {
  return (
    <section className="gradient-bg text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Innovation NOW! Badge */}
          <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
            <span className="text-pink-300 font-bold mr-2">🚀</span>
            <span className="text-white font-medium">Innovation NOW!</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-pink-400 to-yellow-400 bg-clip-text text-transparent">
              即刻未来AI
            </span>
          </h1>

          {/* Description */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-lg">
              {/* Left side */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center mb-4">
                  <span className="text-2xl mr-3">🎨</span>
                  <h3 className="text-xl font-bold text-yellow-300">新用户福利送600算力</h3>
                </div>
                <p className="text-white/90">相当于20个3秒图生视频</p>
                <div className="mt-4 text-center">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-full font-bold">
                    Let's Begin!
                  </span>
                </div>
              </div>

              {/* Right side */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center mb-4">
                  <span className="text-2xl mr-3">⚡</span>
                  <h3 className="text-xl font-bold text-blue-300">每日登录再送200算力</h3>
                </div>
                <p className="text-white/90">网站试运行 新工作流持续上线</p>
                <div className="mt-4 text-center">
                  <span className="text-white font-medium">
                    邮箱: ainow123@qq.com
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {user ? (
              <>
                <Link
                  href="/tools"
                  className="bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
                >
                  开始创作
                </Link>
                <Link
                  href="/generations"
                  className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-purple-600 transition-all"
                >
                  我的作品
                </Link>
              </>
            ) : (
              <>
                <button className="bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg">
                  立即体验
                </button>
                <Link
                  href="/gallery"
                  className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-purple-600 transition-all"
                >
                  浏览作品
                </Link>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">10K+</div>
              <div className="text-white/80 mt-1">用户</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-400">50K+</div>
              <div className="text-white/80 mt-1">作品</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">100+</div>
              <div className="text-white/80 mt-1">模型</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">24/7</div>
              <div className="text-white/80 mt-1">服务</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

