'use client'

import { useState, useEffect } from 'react'

interface Generation {
  id: string
  type: string
  prompt: string
  imageUrl?: string
  videoUrl?: string
  status: string
  createdAt: string
  creditsUsed: number
}

interface RecentGenerationsProps {
  userId: string
}

export default function RecentGenerations({ userId }: RecentGenerationsProps) {
  const [generations, setGenerations] = useState<Generation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGenerations()
  }, [userId])

  const fetchGenerations = async () => {
    try {
      const response = await fetch('/api/generations/recent')
      if (response.ok) {
        const data = await response.json()
        setGenerations(data.generations || [])
      }
    } catch (error) {
      console.error('Failed to fetch generations:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'TEXT_TO_IMAGE':
        return '文生图'
      case 'IMAGE_TO_IMAGE':
        return '图生图'
      case 'IMAGE_TO_VIDEO':
        return '图生视频'
      case 'TEXT_TO_VIDEO':
        return '文生视频'
      default:
        return type
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '排队中'
      case 'PROCESSING':
        return '生成中'
      case 'COMPLETED':
        return '已完成'
      case 'FAILED':
        return '失败'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
            <div className="aspect-square bg-gray-200"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (generations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">还没有作品</h3>
        <p className="text-gray-600 mb-6">开始使用AI工具创作你的第一个作品吧！</p>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
          开始创作
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {generations.map((generation) => (
        <div key={generation.id} className="bg-white rounded-2xl shadow-lg overflow-hidden card-hover">
          {/* Image/Video Preview */}
          <div className="aspect-square bg-gray-100 relative overflow-hidden">
            {generation.status === 'COMPLETED' && generation.imageUrl ? (
              <img
                src={generation.imageUrl}
                alt="Generated content"
                className="w-full h-full object-cover"
              />
            ) : generation.status === 'COMPLETED' && generation.videoUrl ? (
              <video
                src={generation.videoUrl}
                className="w-full h-full object-cover"
                controls
                muted
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                {generation.status === 'PROCESSING' ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <span className="text-sm text-gray-500">生成中...</span>
                  </div>
                ) : generation.status === 'FAILED' ? (
                  <div className="text-center text-red-500">
                    <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm">生成失败</span>
                  </div>
                ) : (
                  <div className="text-center text-gray-400">
                    <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">排队中</span>
                  </div>
                )}
              </div>
            )}

            {/* Status Badge */}
            <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(generation.status)}`}>
              {getStatusLabel(generation.status)}
            </div>

            {/* Type Badge */}
            <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs">
              {getTypeLabel(generation.type)}
            </div>
          </div>

          {/* Content Info */}
          <div className="p-4">
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {generation.prompt}
            </p>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{generation.creditsUsed} 积分</span>
              <span>{new Date(generation.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
