import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 更新配置
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // 检查配置是否存在
    const existingConfig = await prisma.comfyUIConfig.findUnique({
      where: { id: params.id }
    })

    if (!existingConfig) {
      return NextResponse.json({ error: '配置不存在' }, { status: 404 })
    }

    // 检查名称是否与其他配置冲突
    const nameConflict = await prisma.comfyUIConfig.findFirst({
      where: {
        name,
        id: { not: params.id }
      }
    })

    if (nameConflict) {
      return NextResponse.json({ error: '配置名称已存在' }, { status: 409 })
    }

    const config = await prisma.comfyUIConfig.update({
      where: { id: params.id },
      data: {
        name,
        apiUrl,
        apiKey: apiKey || null
      }
    })

    return NextResponse.json({ 
      message: '配置更新成功',
      config 
    })
  } catch (error) {
    console.error('Update ComfyUI config error:', error)
    return NextResponse.json(
      { error: '更新配置失败' },
      { status: 500 }
    )
  }
}

// 部分更新（用于启用/禁用）
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { isActive } = await request.json()

    // 检查配置是否存在
    const existingConfig = await prisma.comfyUIConfig.findUnique({
      where: { id: params.id }
    })

    if (!existingConfig) {
      return NextResponse.json({ error: '配置不存在' }, { status: 404 })
    }

    if (isActive) {
      // 如果要激活这个配置，先禁用其他所有配置
      await prisma.comfyUIConfig.updateMany({
        where: { id: { not: params.id } },
        data: { isActive: false }
      })
    }

    const config = await prisma.comfyUIConfig.update({
      where: { id: params.id },
      data: { isActive }
    })

    return NextResponse.json({ 
      message: '配置状态更新成功',
      config 
    })
  } catch (error) {
    console.error('Update ComfyUI config status error:', error)
    return NextResponse.json(
      { error: '更新配置状态失败' },
      { status: 500 }
    )
  }
}

// 删除配置
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // 检查配置是否存在
    const existingConfig = await prisma.comfyUIConfig.findUnique({
      where: { id: params.id }
    })

    if (!existingConfig) {
      return NextResponse.json({ error: '配置不存在' }, { status: 404 })
    }

    // 不允许删除当前激活的配置
    if (existingConfig.isActive) {
      return NextResponse.json({ error: '不能删除当前激活的配置' }, { status: 400 })
    }

    await prisma.comfyUIConfig.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: '配置删除成功' })
  } catch (error) {
    console.error('Delete ComfyUI config error:', error)
    return NextResponse.json(
      { error: '删除配置失败' },
      { status: 500 }
    )
  }
}

