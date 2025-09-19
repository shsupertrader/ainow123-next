#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  console.log('🔐 创建管理员账户...')
  
  try {
    // 检查是否已有管理员
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (existingAdmin) {
      console.log('✅ 管理员账户已存在:', existingAdmin.email)
      return
    }

    // 创建默认管理员账户
    const adminEmail = 'admin@ainow123.com'
    const adminPassword = 'admin123456'
    const hashedPassword = await bcrypt.hash(adminPassword, 12)

    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        username: 'admin',
        password: hashedPassword,
        role: 'ADMIN',
        credits: 10000
      }
    })

    console.log('✅ 管理员账户创建成功!')
    console.log('邮箱:', adminEmail)
    console.log('密码:', adminPassword)
    console.log('⚠️  请在生产环境中修改默认密码!')
    
    // 创建默认的ComfyUI配置
    const existingConfig = await prisma.comfyUIConfig.findFirst()
    
    if (!existingConfig) {
      await prisma.comfyUIConfig.create({
        data: {
          name: '默认ComfyUI',
          apiUrl: 'http://127.0.0.1:8188',
          isActive: true
        }
      })
      console.log('✅ 默认ComfyUI配置已创建')
    }

  } catch (error) {
    console.error('❌ 创建管理员账户失败:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()

