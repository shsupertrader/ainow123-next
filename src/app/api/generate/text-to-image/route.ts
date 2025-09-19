import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getComfyUIClient } from '@/lib/comfyui'

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

    const {
      prompt,
      negative_prompt,
      width = 512,
      height = 512,
      steps = 20,
      cfg_scale = 7.0,
      sampler = 'euler'
    } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: '请输入提示词' }, { status: 400 })
    }

    // 检查用户积分
    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    const creditsRequired = 10 // 文生图消耗10积分
    if (user.credits < creditsRequired) {
      return NextResponse.json({ error: '积分不足' }, { status: 400 })
    }

    // 创建生成记录
    const generation = await prisma.generation.create({
      data: {
        userId: payload.userId,
        type: 'TEXT_TO_IMAGE',
        prompt,
        negativePrompt: negative_prompt,
        creditsUsed: creditsRequired,
        status: 'PENDING',
        parameters: JSON.stringify({
          width,
          height,
          steps,
          cfg_scale,
          sampler
        })
      }
    })

    // 扣除积分
    await prisma.user.update({
      where: { id: payload.userId },
      data: { credits: user.credits - creditsRequired }
    })

    // 调用ComfyUI API
    const comfyUI = await getComfyUIClient()
    const result = await comfyUI.textToImage({
      prompt,
      negative_prompt,
      width,
      height,
      steps,
      cfg_scale,
      sampler
    })

    if (result.success && result.job_id) {
      // 更新生成记录
      await prisma.generation.update({
        where: { id: generation.id },
        data: {
          status: 'PROCESSING',
          comfyuiJobId: result.job_id
        }
      })

      return NextResponse.json({
        success: true,
        generationId: generation.id,
        jobId: result.job_id,
        message: '开始生成图片，请稍候...'
      })
    } else {
      // 更新状态为失败，退还积分
      await prisma.generation.update({
        where: { id: generation.id },
        data: {
          status: 'FAILED',
          errorMessage: result.error
        }
      })

      await prisma.user.update({
        where: { id: payload.userId },
        data: { credits: user.credits }
      })

      return NextResponse.json({
        success: false,
        error: result.error || '生成失败'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Text to image error:', error)
    return NextResponse.json(
      { error: '生成失败，请稍后重试' },
      { status: 500 }
    )
  }
}
