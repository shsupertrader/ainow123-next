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

export default function ImageToVideoPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [formData, setFormData] = useState({
    prompt: ''
  })
  const [inputImage, setInputImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [result, setResult] = useState<any>(null)

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setInputImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !inputImage) return

    if (user.credits < 30) {
      alert('积分不足，请先充值')
      return
    }

    setGenerating(true)
    setResult(null)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('image', inputImage)
      formDataToSend.append('prompt', formData.prompt)

      const response = await fetch('/api/generate/image-to-video', {
        method: 'POST',
        body: formDataToSend,
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
        // 开始轮询检查状态
        pollGenerationStatus(data.generationId)
        // 更新用户积分
        setUser(prev => prev ? { ...prev, credits: prev.credits - 30 } : null)
      } else {
        alert(data.error || '生成失败')
      }
    } catch (error) {
      alert('网络错误，请稍后重试')
    } finally {
      setGenerating(false)
    }
  }

  const pollGenerationStatus = async (generationId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/generate/check-status/${generationId}`)
        const data = await response.json()

        if (data.status === 'COMPLETED') {
          setResult(prev => ({ ...prev, ...data }))
          clearInterval(pollInterval)
        } else if (data.status === 'FAILED') {
          setResult(prev => ({ ...prev, ...data }))
          clearInterval(pollInterval)
        }
      } catch (error) {
        console.error('Poll error:', error)
      }
    }, 5000) // 每5秒检查一次

    // 10分钟后停止轮询
    setTimeout(() => clearInterval(pollInterval), 600000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }))
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header user={user} setUser={setUser} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">FusionX 图生视频</h1>
          <p className="text-gray-600">基于输入图片生成高质量动态视频</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 参数设置 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6">生成参数</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 图片上传 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  上传输入图片
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {imagePreview ? (
                    <div>
                      <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg mb-4" />
                      <p className="text-sm text-gray-500 mb-2">{inputImage?.name}</p>
                    </div>
                  ) : (
                    <div className="py-8">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-600">点击上传图片</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                    required
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    选择图片
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  提示词 *
                </label>
                <textarea
                  name="prompt"
                  value={formData.prompt}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="描述您希望生成的视频内容，例如：
• 缓慢地向前走，微风吹动头发
• 轻柔地摇摆，树叶飘落
• 眼睛眨动，嘴角微笑
• 水波荡漾，倒影晃动"
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 <strong>提示</strong>：越详细的提示词描述，生成的视频效果越好
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">📐 固定参数</h4>
                <div className="grid grid-cols-2 gap-4 text-sm text-blue-700">
                  <div>
                    <span className="font-medium">视频时长:</span> 5秒
                  </div>
                  <div>
                    <span className="font-medium">分辨率:</span> 834px
                  </div>
                  <div>
                    <span className="font-medium">生成步数:</span> 8步
                  </div>
                  <div>
                    <span className="font-medium">CFG Scale:</span> 1.0
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <span className="text-sm text-yellow-700 font-medium">
                      消耗 30 积分 | 当前余额: {user?.credits || 0} 积分
                    </span>
                    <p className="text-xs text-yellow-600 mt-1">
                      预计生成时间：3-8分钟
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={generating || !user || user.credits < 30 || !inputImage}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? '生成中...' : '🎬 开始生成视频'}
              </button>
            </form>
          </div>

          {/* 结果显示 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6">生成结果</h2>
            
            {result ? (
              <div className="space-y-4">
                {result.status === 'COMPLETED' && result.videoUrl ? (
                  <div>
                    <video
                      src={result.videoUrl}
                      controls
                      autoPlay
                      muted
                      loop
                      className="w-full rounded-lg shadow-md"
                    />
                    <div className="mt-4 flex space-x-2">
                      <a
                        href={result.videoUrl}
                        download
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        下载视频
                      </a>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        分享作品
                      </button>
                    </div>
                  </div>
                ) : result.status === 'FAILED' ? (
                  <div className="text-center py-8">
                    <div className="text-red-500 mb-4">
                      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">生成失败</h3>
                    <p className="text-gray-600">{result.errorMessage || '请检查参数后重试'}</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">正在生成视频</h3>
                    <p className="text-gray-600">请耐心等待，通常需要3-8分钟</p>
                    <div className="mt-4 bg-blue-50 rounded-lg p-3">
                      <p className="text-sm text-blue-700">
                        💡 视频生成中，你可以关闭页面稍后查看结果
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p>生成的视频将在这里显示</p>
                <p className="text-sm mt-2">支持格式：MP4 高清视频</p>
              </div>
            )}
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">使用说明</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-blue-600 font-semibold mb-2">📸 图片要求</div>
              <ul className="text-blue-700 space-y-1">
                <li>• 清晰的主体对象</li>
                <li>• 建议1:1或16:9比例</li>
                <li>• 避免过于复杂背景</li>
              </ul>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-green-600 font-semibold mb-2">✍️ 运动描述</div>
              <ul className="text-green-700 space-y-1">
                <li>• 描述具体运动方式</li>
                <li>• 包含速度和方向</li>
                <li>• 避免静态词汇</li>
              </ul>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-purple-600 font-semibold mb-2">⚙️ 参数建议</div>
              <ul className="text-purple-700 space-y-1">
                <li>• 新手使用默认参数</li>
                <li>• 高质量选择12步</li>
                <li>• 快速预览选择6步</li>
              </ul>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-orange-600 font-semibold mb-2">🎬 效果优化</div>
              <ul className="text-orange-700 space-y-1">
                <li>• 运动幅度适中</li>
                <li>• 避免过于夸张</li>
                <li>• 考虑物理合理性</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
