import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    const generations = await prisma.generation.findMany({
      where: {
        userId: payload.userId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 12, // 最近12个
      select: {
        id: true,
        type: true,
        prompt: true,
        imageUrl: true,
        videoUrl: true,
        status: true,
        creditsUsed: true,
        createdAt: true
      }
    })

    return NextResponse.json({ generations })
  } catch (error) {
    console.error('Get recent generations error:', error)
    return NextResponse.json(
      { error: '获取作品失败' },
      { status: 500 }
    )
  }
}

