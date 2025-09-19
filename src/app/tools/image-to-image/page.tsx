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

export default function ImageToImagePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [formData, setFormData] = useState({
    prompt: '',
    negative_prompt: '',
    strength: 0.75,
    steps: 20,
    cfg_scale: 7.0,
    sampler: 'euler'
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

    if (user.credits < 15) {
      alert('积分不足，请先充值')
      return
    }

    setGenerating(true)
    setResult(null)

    // TODO: 实现图生图API调用
    alert('图生图功能正在开发中，敬请期待！')
    setGenerating(false)
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">图生图</h1>
          <p className="text-gray-600">基于输入图片和文字描述生成新的图片</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 参数设置 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6">设置参数</h2>
            
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
                  描述提示词
                </label>
                <textarea
                  name="prompt"
                  value={formData.prompt}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="描述你想要生成的图片..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  负向提示词（可选）
                </label>
                <textarea
                  name="negative_prompt"
                  value={formData.negative_prompt}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="描述你不想要的内容..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  影响强度: {formData.strength}
                </label>
                <input
                  type="range"
                  name="strength"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={formData.strength}
                  onChange={handleChange}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>保持原图</span>
                  <span>大幅改变</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    步数
                  </label>
                  <input
                    type="number"
                    name="steps"
                    value={formData.steps}
                    onChange={handleChange}
                    min="10"
                    max="50"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CFG Scale
                  </label>
                  <input
                    type="number"
                    name="cfg_scale"
                    value={formData.cfg_scale}
                    onChange={handleChange}
                    min="1"
                    max="20"
                    step="0.5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  采样器
                </label>
                <select
                  name="sampler"
                  value={formData.sampler}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="euler">Euler</option>
                  <option value="euler_ancestral">Euler Ancestral</option>
                  <option value="dpm_2">DPM 2</option>
                  <option value="dpm_2_ancestral">DPM 2 Ancestral</option>
                  <option value="lms">LMS</option>
                </select>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-yellow-700">
                    消耗 15 积分 | 当前余额: {user?.credits || 0} 积分
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={generating || !user || user.credits < 15 || !inputImage}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? '生成中...' : '开始生成'}
              </button>
            </form>
          </div>

          {/* 结果显示 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6">生成结果</h2>
            
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p>生成结果将在这里显示</p>
              <p className="text-sm mt-2">功能开发中，敬请期待！</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

