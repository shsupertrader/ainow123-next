import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, username, password } = await request.json()

    // 验证输入
    if (!email || !username || !password) {
      return NextResponse.json(
        { error: '请填写所有必填字段' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码长度至少6位' },
        { status: 400 }
      )
    }

    // 检查用户是否已存在
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: '邮箱或用户名已存在' },
        { status: 409 }
      )
    }

    // 创建用户
    const hashedPassword = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        credits: 100 // 新用户赠送100积分
      },
      select: {
        id: true,
        email: true,
        username: true,
        credits: true,
        role: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      message: '注册成功',
      user
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    )
  }
}

