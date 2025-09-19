'use client'

import Link from 'next/link'
import { useState } from 'react'

const AI_TOOLS = [
  {
    id: 'text-to-image',
    title: '文生图',
    subtitle: 'AI绘画',
    description: '输入文字描述，AI生成精美图片',
    image: '/images/tool1.jpg',
    badge: '热门',
    badgeColor: 'bg-red-500',
    category: 'image',
    credits: 10,
    href: '/tools/text-to-image'
  },
  {
    id: 'image-to-video',
    title: 'FusionX 图生视频', 
    subtitle: '动态视频生成',
    description: '基于输入图片生成高质量动态视频',
    image: '/images/tool2.jpg',
    badge: 'NEW',
    badgeColor: 'bg-purple-500',
    category: 'video',
    credits: 30,
    href: '/tools/image-to-video'
  },
  {
    id: 'image-to-image',
    title: '图生图',
    subtitle: 'AI重绘',
    description: '基于参考图片生成新的图片',
    image: '/images/tool3.jpg',
    badge: '',
    badgeColor: '',
    category: 'image',
    credits: 15,
    href: '/tools/image-to-image'
  },
  {
    id: 'image-upscale',
    title: '司康改图',
    subtitle: 'Kortext.dev',
    description: '智能图片编辑和修复',
    image: '/images/tool4.jpg',
    badge: '',
    badgeColor: '',
    category: 'image',
    credits: 20,
    href: '/tools/image-upscale'
  },
  {
    id: 'auto-remove-bg',
    title: '自动抠图',
    subtitle: '',
    description: '一键去除图片背景',
    image: '/images/tool5.jpg',
    badge: '',
    badgeColor: '',
    category: 'image',
    credits: 10,
    href: '/tools/auto-remove-bg'
  },
  {
    id: 'flux-upscale',
    title: 'Flux',
    subtitle: '高清放大',
    description: '图片变清晰，强化细节！',
    image: '/images/tool6.jpg',
    badge: '',
    badgeColor: '',
    category: 'image',
    credits: 15,
    href: '/tools/flux-upscale'
  }
]

const CATEGORIES = [
  { id: 'all', name: '全部' },
  { id: 'image', name: '图像处理' },
  { id: 'video', name: '视频生成' },
]

export default function ToolGrid() {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredTools = selectedCategory === 'all' 
    ? AI_TOOLS 
    : AI_TOOLS.filter(tool => tool.category === selectedCategory)

  return (
    <div>
      {/* Category Filter */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-2 bg-gray-100 rounded-lg p-1">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => (
          <Link
            key={tool.id}
            href={tool.href}
            className="group bg-white rounded-2xl shadow-lg overflow-hidden card-hover border border-gray-100"
          >
            {/* Tool Image */}
            <div className="relative aspect-[4/3] bg-gray-200 overflow-hidden">
              {/* Placeholder image - In real app, use actual images */}
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {tool.title.charAt(0)}
                </span>
              </div>
              
              {/* Badge */}
              {tool.badge && (
                <div className={`absolute top-3 left-3 ${tool.badgeColor} text-white px-2 py-1 rounded-full text-xs font-bold`}>
                  {tool.badge}
                </div>
              )}

              {/* Credits */}
              <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs">
                {tool.credits} 积分
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-sm rounded-full p-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1M9 16h6" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Tool Info */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                    {tool.title}
                  </h3>
                  {tool.subtitle && (
                    <p className="text-sm text-blue-600 font-medium">
                      {tool.subtitle}
                    </p>
                  )}
                </div>
              </div>
              
              <p className="text-gray-600 text-sm">
                {tool.description}
              </p>

              {/* Action Button */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-1">
                    {/* Sample user avatars */}
                    <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white"></div>
                    <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                    <div className="w-6 h-6 bg-purple-500 rounded-full border-2 border-white"></div>
                  </div>
                  <span className="text-xs text-gray-500">1.2k+ 用户</span>
                </div>
                
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                  立即使用
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* View More */}
      <div className="text-center mt-12">
        <Link
          href="/tools"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
        >
          查看更多工具
          <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
