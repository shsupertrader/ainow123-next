import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getComfyUIClient } from '@/lib/comfyui'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'

// 处理文件上传
async function parseFormData(request: NextRequest) {
  const formData = await request.formData()
  const data: any = {}
  
  formData.forEach((value, key) => {
    if (value instanceof File) {
      data[key] = value
    } else {
      data[key] = value
    }
  })
  
  return data
}

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

    const formData = await parseFormData(request)
    const {
      prompt,
      image
    } = formData

    if (!prompt) {
      return NextResponse.json({ error: '请输入提示词' }, { status: 400 })
    }

    if (!image || !(image instanceof File)) {
      return NextResponse.json({ error: '请上传输入图片' }, { status: 400 })
    }

    // 检查用户积分
    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    const creditsRequired = 30 // 图生视频消耗30积分
    if (user.credits < creditsRequired) {
      return NextResponse.json({ error: '积分不足' }, { status: 400 })
    }

    // 准备图片数据
    const fileExtension = path.extname(image.name)
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}${fileExtension}`
    
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 调用ComfyUI API
    const comfyUI = await getComfyUIClient()
    
    // 上传图片到ComfyUI
    console.log('📤 正在上传图片到ComfyUI...')
    const uploadedImageName = await comfyUI.uploadImage(buffer, fileName)

    // 创建生成记录
    const generation = await prisma.generation.create({
        data: {
          userId: payload.userId,
          type: 'IMAGE_TO_VIDEO',
          prompt: prompt,
          inputImageUrl: uploadedImageName, // 使用ComfyUI返回的图片名称
          creditsUsed: creditsRequired,
          status: 'PENDING',
          parameters: JSON.stringify({
            prompt,
            uploadedImageName
          })
        }
    })

    // 扣除积分
    await prisma.user.update({
      where: { id: payload.userId },
      data: { credits: user.credits - creditsRequired }
    })

    // 调试日志
    console.log('🎬 图生视频参数:', {
      prompt,
      uploadedImageName
    })
    
    const result = await comfyUI.imageToVideo({
      prompt: prompt,
      input_image: uploadedImageName // 使用上传后返回的图片名称
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
        message: '开始生成视频，请稍候...'
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

      // 删除上传的文件
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }

      return NextResponse.json({
        success: false,
        error: result.error || '生成失败'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Image to video error:', error)
    return NextResponse.json(
      { error: '生成失败，请稍后重试' },
      { status: 500 }
    )
  }
}

// Next.js 14 App Router 不需要这个配置
