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

    // 检查管理员权限
    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    // 获取统计数据
    const [totalUsers, totalGenerations, payments, activeUsers] = await Promise.all([
      // 总用户数
      prisma.user.count(),
      
      // 总生成数
      prisma.generation.count(),
      
      // 已完成的支付
      prisma.payment.findMany({
        where: { status: 'PAID' },
        select: { amount: true }
      }),
      
      // 过去30天活跃用户（有生成记录的用户）
      prisma.user.count({
        where: {
          generations: {
            some: {
              createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
              }
            }
          }
        }
      })
    ])

    // 计算总收入
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0)

    return NextResponse.json({
      totalUsers,
      totalGenerations,
      totalRevenue,
      activeUsers
    })
  } catch (error) {
    console.error('Get admin stats error:', error)
    return NextResponse.json(
      { error: '获取统计数据失败' },
      { status: 500 }
    )
  }
}

