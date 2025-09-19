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

const CREDIT_PACKAGES = [
  { credits: 100, price: 10, bonus: 0, popular: false },
  { credits: 500, price: 45, bonus: 50, popular: true },
  { credits: 1000, price: 80, bonus: 200, popular: false },
  { credits: 2000, price: 150, bonus: 500, popular: false },
  { credits: 5000, price: 300, bonus: 1500, popular: false }
]

export default function PricingPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<number | null>(null)

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

  const handlePurchase = async (credits: number) => {
    if (!user) return

    setPurchasing(credits)

    try {
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credits }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // 跳转到支付页面
        window.open(data.payUrl, '_blank')
      } else {
        alert(data.error || '创建支付失败')
      }
    } catch (error) {
      alert('网络错误，请稍后重试')
    } finally {
      setPurchasing(null)
    }
  }

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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">积分充值</h1>
          <p className="text-xl text-gray-600 mb-8">
            选择适合你的积分套餐，解锁无限创意可能
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

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {CREDIT_PACKAGES.map((pkg, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl shadow-lg overflow-hidden ${
                pkg.popular ? 'ring-2 ring-blue-500 transform scale-105' : ''
              }`}
            >
              {pkg.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center py-2 text-sm font-medium">
                  🔥 最受欢迎
                </div>
              )}
              
              <div className={`p-6 ${pkg.popular ? 'pt-12' : ''}`}>
                {/* Credits Amount */}
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {pkg.credits.toLocaleString()}
                  </div>
                  <div className="text-gray-600">积分</div>
                  {pkg.bonus > 0 && (
                    <div className="text-green-600 text-sm font-medium mt-1">
                      + {pkg.bonus} 赠送积分
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="text-center mb-6">
                  <div className="text-2xl font-bold text-blue-600">
                    ¥{pkg.price}
                  </div>
                  <div className="text-gray-500 text-sm">
                    约 ¥{(pkg.price / (pkg.credits + pkg.bonus)).toFixed(3)}/积分
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2 mb-6 text-sm text-gray-600">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    永不过期
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    支持所有功能
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    7×24小时服务
                  </div>
                  {pkg.bonus > 0 && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      额外赠送 {pkg.bonus} 积分
                    </div>
                  )}
                </div>

                {/* Purchase Button */}
                <button
                  onClick={() => handlePurchase(pkg.credits)}
                  disabled={purchasing === pkg.credits}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    pkg.popular
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {purchasing === pkg.credits ? '处理中...' : '立即购买'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Usage Guide */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">积分使用说明</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">文生图</h3>
              <p className="text-gray-600 text-sm">每次生成消耗 10 积分</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">图生图</h3>
              <p className="text-gray-600 text-sm">每次生成消耗 15 积分</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">文生视频</h3>
              <p className="text-gray-600 text-sm">每次生成消耗 30 积分</p>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">支持的支付方式</h3>
          <div className="flex justify-center items-center space-x-8 text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">支</span>
              </div>
              <span>支付宝</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">微</span>
              </div>
              <span>微信支付</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">Z</span>
              </div>
              <span>Z-Pay</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

