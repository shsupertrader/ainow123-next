import axios from 'axios'

export interface ComfyUIConfig {
  apiUrl: string
  apiKey?: string
}

export interface WorkflowParams {
  prompt: string
  negative_prompt?: string
  width?: number
  height?: number
  steps?: number
  cfg_scale?: number
  sampler?: string
  seed?: number
  input_image?: string
}

export interface GenerationResult {
  success: boolean
  job_id?: string
  images?: string[]
  video_url?: string
  error?: string
}

export class ComfyUIClient {
  private config: ComfyUIConfig

  constructor(config: ComfyUIConfig) {
    this.config = config
  }

  private async makeRequest(endpoint: string, data: any = null, method: 'GET' | 'POST' = 'GET') {
    const url = `${this.config.apiUrl}${endpoint}`
    const headers: any = {
      'Content-Type': 'application/json'
    }

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`
    }

    try {
      const response = await axios({
        method,
        url,
        headers,
        data,
        timeout: 30000
      })
      return response.data
    } catch (error: any) {
      console.error('ComfyUI API Error:', error.message)
      throw new Error(`ComfyUI API 请求失败: ${error.message}`)
    }
  }

  // 上传图片到ComfyUI
  async uploadImage(imageBuffer: Buffer, fileName: string): Promise<string> {
    const url = `${this.config.apiUrl}/upload/image`
    
    const FormData = require('form-data')
    const formData = new FormData()
    formData.append('image', imageBuffer, fileName)
    formData.append('overwrite', 'true')

    try {
      const response = await axios({
        method: 'POST',
        url,
        data: formData,
        headers: {
          ...formData.getHeaders(),
          ...(this.config.apiKey ? { 'Authorization': `Bearer ${this.config.apiKey}` } : {})
        },
        timeout: 30000
      })
      
      console.log('📤 图片上传到ComfyUI成功:', response.data)
      return response.data.name || fileName
    } catch (error: any) {
      console.error('❌ 图片上传到ComfyUI失败:', error.message)
      throw new Error(`图片上传失败: ${error.message}`)
    }
  }

  // 文生图工作流
  async textToImage(params: WorkflowParams): Promise<GenerationResult> {
    const workflow = {
      "1": {
        "inputs": {
          "text": params.prompt,
          "clip": ["11", 1]
        },
        "class_type": "CLIPTextEncode"
      },
      "2": {
        "inputs": {
          "text": params.negative_prompt || "",
          "clip": ["11", 1]
        },
        "class_type": "CLIPTextEncode"
      },
      "3": {
        "inputs": {
          "seed": params.seed || Math.floor(Math.random() * 1000000),
          "steps": params.steps || 20,
          "cfg": params.cfg_scale || 7.0,
          "sampler_name": params.sampler || "euler",
          "scheduler": "normal",
          "denoise": 1.0,
          "model": ["10", 0],
          "positive": ["1", 0],
          "negative": ["2", 0],
          "latent_image": ["4", 0]
        },
        "class_type": "KSampler"
      },
      "4": {
        "inputs": {
          "width": params.width || 512,
          "height": params.height || 512,
          "batch_size": 1
        },
        "class_type": "EmptyLatentImage"
      },
      "8": {
        "inputs": {
          "samples": ["3", 0],
          "vae": ["10", 2]
        },
        "class_type": "VAEDecode"
      },
      "9": {
        "inputs": {
          "filename_prefix": "ComfyUI",
          "images": ["8", 0]
        },
        "class_type": "SaveImage"
      },
      "10": {
        "inputs": {
          "ckpt_name": "sd_xl_base_1.0.safetensors"
        },
        "class_type": "CheckpointLoaderSimple"
      },
      "11": {
        "inputs": {
          "ckpt_name": "sd_xl_base_1.0.safetensors"
        },
        "class_type": "CheckpointLoaderSimple"
      }
    }

    try {
      const result = await this.makeRequest('/prompt', { prompt: workflow }, 'POST')
      return {
        success: true,
        job_id: result.prompt_id
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 图生图工作流
  async imageToImage(params: WorkflowParams): Promise<GenerationResult> {
    if (!params.input_image) {
      return {
        success: false,
        error: '缺少输入图片'
      }
    }

    // 这里应该包含图生图的工作流配置
    // 为简化，暂时使用类似的结构
    const workflow = {
      // 图生图工作流配置...
    }

    try {
      const result = await this.makeRequest('/prompt', { prompt: workflow }, 'POST')
      return {
        success: true,
        job_id: result.prompt_id
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 文生视频工作流
  async textToVideo(params: WorkflowParams): Promise<GenerationResult> {
    // 文生视频工作流配置
    const workflow = {
      // 视频生成工作流配置...
    }

    try {
      const result = await this.makeRequest('/prompt', { prompt: workflow }, 'POST')
      return {
        success: true,
        job_id: result.prompt_id
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // FusionX图生视频工作流
  async imageToVideo(params: WorkflowParams): Promise<GenerationResult> {
    if (!params.input_image) {
      return {
        success: false,
        error: '缺少输入图片'
      }
    }

    if (!params.prompt) {
      return {
        success: false,
        error: '缺少提示词'
      }
    }

    // 使用用户提示词
    const userPrompt = params.prompt
    
    // 调试日志：确认提示词参数
    console.log('🔍 提示词参数检查:', {
      params_prompt: params.prompt,
      userPrompt: userPrompt,
      prompt_type: typeof userPrompt,
      prompt_length: userPrompt?.length
    })

    // FusionX图生视频工作流配置
    const workflow = {
      "7": {
        "inputs": {
          "model_name": "wan_2.1_vae.safetensors",
          "precision": "bf16"
        },
        "class_type": "WanVideoVAELoader"
      },
      "9": {
        "inputs": {
          "model_name": "umt5_xxl_fp16.safetensors",
          "precision": "bf16",
          "load_device": "offload_device",
          "quantization": "disabled"
        },
        "class_type": "LoadWanVideoT5TextEncoder"
      },
      "15": {
        "inputs": {
          "model": "Wan14Bi2vFusioniX_fp16.safetensors",
          "base_precision": "fp16",
          "quantization": "fp8_e4m3fn",
          "load_device": "offload_device",
          "attention_mode": "sageattn"
        },
        "class_type": "WanVideoModelLoader"
      },
      "18": {
        "inputs": {
          "value": 5
        },
        "class_type": "JWInteger"
      },
      "19": {
        "inputs": {
          "enable_vae_tiling": true,
          "tile_x": 272,
          "tile_y": 272,
          "tile_stride_x": 144,
          "tile_stride_y": 128,
          "normalization": "default",
          "vae": ["7", 0],
          "samples": ["28", 0]
        },
        "class_type": "WanVideoDecode"
      },
      "21": {
        "inputs": {
          "aspect_ratio": "original",
          "proportional_width": 1,
          "proportional_height": 1,
          "fit": "letterbox",
          "method": "lanczos",
          "round_to_multiple": "16",
          "scale_to_side": "longest",
          "scale_to_length": ["25", 0],
          "background_color": "#000000",
          "image": ["29", 0]
        },
        "class_type": "LayerUtility: ImageScaleByAspectRatio V2"
      },
      "24": {
        "inputs": {
          "expression": "a*16+1",
          "a": ["18", 0]
        },
        "class_type": "MathExpression|pysssss"
      },
      "25": {
        "inputs": {
          "value": 834
        },
        "class_type": "JWInteger"
      },
      "27": {
        "inputs": {
          "select": 1,
          "sel_mode": false,
          "input1": ["33", 0],
          "input2": ["33", 0]
        },
        "class_type": "ImpactSwitch"
      },
      "28": {
        "inputs": {
          "steps": 8,
          "cfg": 1.0,
          "shift": 5.0,
          "seed": Math.floor(Math.random() * 1000000),
          "force_offload": true,
          "scheduler": "unipc",
          "riflex_freq_index": 0,
          "denoise_strength": 1,
          "batched_cfg": false,
          "rope_function": "comfy",
          "model": ["15", 0],
          "image_embeds": ["39", 0],
          "text_embeds": ["38", 0]
        },
        "class_type": "WanVideoSampler"
      },
      "29": {
        "inputs": {
          "image": params.input_image
        },
        "class_type": "LoadImage"
      },
      "31": {
        "inputs": {
          "frame_rate": 16,
          "loop_count": 0,
          "filename_prefix": "FusionX_Video",
          "format": "video/h264-mp4",
          "pix_fmt": "yuv420p",
          "crf": 19,
          "save_metadata": true,
          "trim_to_audio": false,
          "pingpong": false,
          "save_output": true,
          "images": ["19", 0]
        },
        "class_type": "VHS_VideoCombine"
      },
      "33": {
        "inputs": {
          "text": userPrompt
        },
        "class_type": "CR Text"
      },
      "35": {
        "inputs": {
          "prompt": "色调艳丽，过曝，静态，细节模糊不清，字幕，风格，作品，画作，画面，静止，整体发灰，最差质量，低质量，JPEG压缩残留，丑陋的，残缺的，多余的手指，画得不好的手部，画得不好的脸部，畸形的，毁容的，形态畸形的肢体，手指融合，静止不动的画面，杂乱的背景，三条腿，背景人很多，倒着走",
          "force_offload": true,
          "t5": ["9", 0],
          "model_to_offload": ["15", 0]
        },
        "class_type": "WanVideoTextEncodeSingle"
      },
      "36": {
        "inputs": {
          "prompt": ["27", 0],
          "force_offload": true,
          "t5": ["9", 0],
          "model_to_offload": ["15", 0]
        },
        "class_type": "WanVideoTextEncodeSingle"
      },
      "38": {
        "inputs": {
          "nag_scale": 11,
          "nag_tau": 2.5,
          "nag_alpha": 0.25,
          "original_text_embeds": ["36", 0],
          "nag_text_embeds": ["35", 0]
        },
        "class_type": "WanVideoApplyNAG"
      },
      "39": {
        "inputs": {
          "width": ["21", 3],
          "height": ["21", 4],
          "num_frames": ["24", 0],
          "noise_aug_strength": 0.03,
          "start_latent_strength": 1,
          "end_latent_strength": 1,
          "force_offload": true,
          "fun_or_fl2v_model": false,
          "tiled_vae": false,
          "vae": ["7", 0],
          "start_image": ["21", 0]
        },
        "class_type": "WanVideoImageToVideoEncode"
      }
    }

    // 调试日志
    console.log('🎬 发送到ComfyUI的图生视频工作流参数:', {
      prompt: params.prompt,
      input_image: params.input_image
    })
    console.log('🔧 工作流关键节点配置:', {
      node_18_duration: workflow["18"]?.inputs?.value,
      node_33_text: workflow["33"]?.inputs?.text,
      node_29_image: workflow["29"]?.inputs?.image,
      node_28_steps: workflow["28"]?.inputs?.steps,
      node_28_cfg: workflow["28"]?.inputs?.cfg,
      node_25_resolution: workflow["25"]?.inputs?.value
    })
    
    // 特别确认节点33的配置
    console.log('🎯 节点33详细配置:', {
      userPrompt: userPrompt,
      node33_complete: workflow["33"],
      node33_text_value: workflow["33"]?.inputs?.text
    })

    try {
      const result = await this.makeRequest('/prompt', { prompt: workflow }, 'POST')
      console.log('✅ ComfyUI响应:', result)
      return {
        success: true,
        job_id: result.prompt_id
      }
    } catch (error: any) {
      console.error('❌ ComfyUI错误:', error.message)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 检查任务状态
  async checkJobStatus(jobId: string) {
    try {
      const result = await this.makeRequest(`/history/${jobId}`)
      
      // 如果有详细信息，打印出来
      if (result[jobId]) {
        const job = result[jobId]
        if (job.status && job.status.messages && job.status.messages.length > 0) {
          console.log('📋 ComfyUI任务状态信息:')
          job.status.messages.forEach((msg: any, index: number) => {
            console.log(`  ${index + 1}. ${msg[0]}: ${JSON.stringify(msg[1], null, 2)}`)
          })
        }
        
        // 检查是否有错误
        if (job.status && job.status.status_str === 'error') {
          console.error('❌ ComfyUI任务执行错误:')
          if (job.status.messages) {
            job.status.messages.forEach((msg: any) => {
              if (msg[0] === 'execution_error') {
                console.error('执行错误详情:', JSON.stringify(msg[1], null, 2))
              }
            })
          }
        }
      }
      
      return result
    } catch (error: any) {
      throw new Error(`检查任务状态失败: ${error.message}`)
    }
  }

  // 获取生成的图片
  async getGeneratedImages(jobId: string): Promise<string[]> {
    try {
      const history = await this.checkJobStatus(jobId)
      const images: string[] = []
      
      if (history[jobId] && history[jobId].outputs) {
        for (const nodeId in history[jobId].outputs) {
          const node = history[jobId].outputs[nodeId]
          if (node.images) {
            for (const image of node.images) {
              images.push(`${this.config.apiUrl}/view?filename=${image.filename}&subfolder=${image.subfolder}&type=${image.type}`)
            }
          }
        }
      }
      
      return images
    } catch (error: any) {
      throw new Error(`获取生成图片失败: ${error.message}`)
    }
  }

  // 获取生成的视频
  async getGeneratedVideos(jobId: string): Promise<string[]> {
    try {
      const history = await this.checkJobStatus(jobId)
      const videos: string[] = []
      
      console.log('🔍 查找生成的视频文件:', { jobId })
      
      if (history[jobId] && history[jobId].outputs) {
        console.log('📁 输出节点列表:', Object.keys(history[jobId].outputs))
        
        for (const nodeId in history[jobId].outputs) {
          const node = history[jobId].outputs[nodeId]
          console.log(`🎯 检查节点 ${nodeId}:`, {
            hasGifs: !!node.gifs,
            hasVideos: !!node.videos,
            hasImages: !!node.images,
            content: node
          })
          
          // 查找视频文件节点 (VHS_VideoCombine 节点31)
          if (node.gifs && node.gifs.length > 0) {
            console.log(`🎬 在节点${nodeId}找到GIF:`, node.gifs)
            for (const gif of node.gifs) {
              const videoUrl = `${this.config.apiUrl}/view?filename=${gif.filename}&subfolder=${gif.subfolder}&type=${gif.type}`
              videos.push(videoUrl)
              console.log('✅ 添加GIF视频URL:', videoUrl)
            }
          }
          
          // 查找直接的视频输出
          if (node.videos && node.videos.length > 0) {
            console.log(`🎥 在节点${nodeId}找到视频:`, node.videos)
            for (const video of node.videos) {
              const videoUrl = `${this.config.apiUrl}/view?filename=${video.filename}&subfolder=${video.subfolder}&type=${video.type}`
              videos.push(videoUrl)
              console.log('✅ 添加视频URL:', videoUrl)
            }
          }
          
          // 检查是否有其他文件类型
          if (node.filenames) {
            console.log(`📄 在节点${nodeId}找到文件名:`, node.filenames)
          }
        }
      } else {
        console.log('❌ 未找到任务输出或历史记录')
      }
      
      console.log('🎬 最终视频列表:', videos)
      return videos
    } catch (error: any) {
      console.error('❌ 获取生成视频失败:', error)
      throw new Error(`获取生成视频失败: ${error.message}`)
    }
  }

  // 测试连接
  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest('/system_stats')
      return true
    } catch (error) {
      return false
    }
  }
}

// 获取默认的ComfyUI客户端
export async function getComfyUIClient(): Promise<ComfyUIClient> {
  const { prisma } = await import('./prisma')
  
  const config = await prisma.comfyUIConfig.findFirst({
    where: { isActive: true }
  })

  if (!config) {
    // 使用环境变量的默认配置
    return new ComfyUIClient({
      apiUrl: process.env.COMFYUI_API_URL || 'http://175.155.64.198:8189',
      apiKey: process.env.COMFYUI_API_KEY
    })
  }

  return new ComfyUIClient({
    apiUrl: config.apiUrl,
    apiKey: config.apiKey || undefined
  })
}
