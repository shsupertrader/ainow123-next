import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 获取所有配置
export async function GET(request: NextRequest) {
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

    const configs = await prisma.comfyUIConfig.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ configs })
  } catch (error) {
    console.error('Get ComfyUI configs error:', error)
    return NextResponse.json(
      { error: '获取配置失败' },
      { status: 500 }
    )
  }
}

// 创建新配置
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

    const { name, apiUrl, apiKey } = await request.json()

    if (!name || !apiUrl) {
      return NextResponse.json({ error: '请填写必填字段' }, { status: 400 })
    }

    // 检查名称是否已存在
    const existingConfig = await prisma.comfyUIConfig.findUnique({
      where: { name }
    })

    if (existingConfig) {
      return NextResponse.json({ error: '配置名称已存在' }, { status: 409 })
    }

    // 如果这是第一个配置，设为激活状态
    const configCount = await prisma.comfyUIConfig.count()
    const isActive = configCount === 0

    const config = await prisma.comfyUIConfig.create({
      data: {
        name,
        apiUrl,
        apiKey: apiKey || null,
        isActive
      }
    })

    return NextResponse.json({ 
      message: '配置创建成功',
      config 
    })
  } catch (error) {
    console.error('Create ComfyUI config error:', error)
    return NextResponse.json(
      { error: '创建配置失败' },
      { status: 500 }
    )
  }
}

