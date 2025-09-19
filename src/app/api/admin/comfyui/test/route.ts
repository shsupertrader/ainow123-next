import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ComfyUIClient } from '@/lib/comfyui'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: '登录已过期' }, { status: 401 })
    }

    // 检查管理员权限
    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    const { configId } = await request.json()

    if (!configId) {
      return NextResponse.json({ error: '请提供配置ID' }, { status: 400 })
    }

    // 获取配置
    const config = await prisma.comfyUIConfig.findUnique({
      where: { id: configId }
    })

    if (!config) {
      return NextResponse.json({ error: '配置不存在' }, { status: 404 })
    }

    // 创建ComfyUI客户端并测试连接
    const client = new ComfyUIClient({
      apiUrl: config.apiUrl,
      apiKey: config.apiKey || undefined
    })

    const isConnected = await client.testConnection()

    if (isConnected) {
      return NextResponse.json({ 
        success: true,
        message: 'ComfyUI连接测试成功'
      })
    } else {
      return NextResponse.json({ 
        success: false,
        error: 'ComfyUI连接测试失败，请检查API地址和网络连接'
      })
    }
  } catch (error) {
    console.error('Test ComfyUI connection error:', error)
    return NextResponse.json({
      success: false,
      error: `连接测试失败: ${error.message}`
    })
  }
}

