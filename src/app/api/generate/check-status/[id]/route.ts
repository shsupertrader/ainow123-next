import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getComfyUIClient } from '@/lib/comfyui'

export async function GET(
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

    const generation = await prisma.generation.findFirst({
      where: {
        id: params.id,
        userId: payload.userId
      }
    })

    if (!generation) {
      return NextResponse.json({ error: '生成记录不存在' }, { status: 404 })
    }

    // 如果已经完成，直接返回结果
    if (generation.status === 'COMPLETED' || generation.status === 'FAILED') {
      return NextResponse.json({
        status: generation.status,
        imageUrl: generation.imageUrl,
        videoUrl: generation.videoUrl,
        errorMessage: generation.errorMessage
      })
    }

    // 检查ComfyUI任务状态
    if (generation.comfyuiJobId) {
      const comfyUI = await getComfyUIClient()
      
      try {
        const jobStatus = await comfyUI.checkJobStatus(generation.comfyuiJobId)
        
        // 检查是否完成
        if (jobStatus[generation.comfyuiJobId]) {
          const job = jobStatus[generation.comfyuiJobId]
          
          if (job.status && job.status.completed) {
            // 根据生成类型获取结果
            if (generation.type === 'IMAGE_TO_VIDEO') {
              // 获取生成的视频
              const videos = await comfyUI.getGeneratedVideos(generation.comfyuiJobId)
              
              if (videos.length > 0) {
                // 更新为完成状态
                await prisma.generation.update({
                  where: { id: generation.id },
                  data: {
                    status: 'COMPLETED',
                    videoUrl: videos[0] // 取第一个视频
                  }
                })

                return NextResponse.json({
                  status: 'COMPLETED',
                  videoUrl: videos[0]
                })
              }
            } else {
              // 获取生成的图片
              const images = await comfyUI.getGeneratedImages(generation.comfyuiJobId)
              
              if (images.length > 0) {
                // 更新为完成状态
                await prisma.generation.update({
                  where: { id: generation.id },
                  data: {
                    status: 'COMPLETED',
                    imageUrl: images[0] // 取第一张图片
                  }
                })

                return NextResponse.json({
                  status: 'COMPLETED',
                  imageUrl: images[0]
                })
              }
            }
          } else if (job.status && job.status.status_str === 'error') {
            // 更新为失败状态
            await prisma.generation.update({
              where: { id: generation.id },
              data: {
                status: 'FAILED',
                errorMessage: job.status.messages?.join(', ') || '生成失败'
              }
            })

            return NextResponse.json({
              status: 'FAILED',
              errorMessage: job.status.messages?.join(', ') || '生成失败'
            })
          }
        }
      } catch (error) {
        console.error('Check job status error:', error)
      }
    }

    // 仍在处理中
    return NextResponse.json({
      status: generation.status
    })
  } catch (error) {
    console.error('Check status error:', error)
    return NextResponse.json(
      { error: '检查状态失败' },
      { status: 500 }
    )
  }
}
