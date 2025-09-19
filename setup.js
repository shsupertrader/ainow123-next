#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🚀 即刻未来AI - 项目初始化脚本')
console.log('===============================\n')

// 检查 Node.js 版本
const nodeVersion = process.version
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0])
if (majorVersion < 18) {
  console.error('❌ 需要 Node.js 18 或更高版本，当前版本:', nodeVersion)
  process.exit(1)
}
console.log('✅ Node.js 版本检查通过:', nodeVersion)

// 检查 .env.local 文件
const envPath = path.join(__dirname, '.env.local')
if (!fs.existsSync(envPath)) {
  console.log('📝 创建环境变量文件...')
  
  const envContent = `# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=${generateRandomString(32)}

# JWT Secret
JWT_SECRET=${generateRandomString(32)}

# ComfyUI API (默认配置)
COMFYUI_API_URL=http://127.0.0.1:8188
COMFYUI_API_KEY=

# Z-Pay配置 (请替换为你的实际配置)
ZPAY_MERCHANT_ID=your_merchant_id
ZPAY_SECRET_KEY=your_secret_key
ZPAY_API_URL=https://api.z-pay.cn

# 上传文件配置
UPLOAD_DIR=./public/uploads
MAX_FILE_SIZE=10485760`

  fs.writeFileSync(envPath, envContent)
  console.log('✅ 环境变量文件已创建: .env.local')
} else {
  console.log('✅ 环境变量文件已存在')
}

// 检查是否已安装依赖
const nodeModulesPath = path.join(__dirname, 'node_modules')
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 安装项目依赖...')
  try {
    execSync('npm install', { stdio: 'inherit' })
    console.log('✅ 依赖安装完成')
  } catch (error) {
    console.error('❌ 依赖安装失败:', error.message)
    process.exit(1)
  }
} else {
  console.log('✅ 项目依赖已安装')
}

// 检查autoprefixer是否安装
const autoprefixerPath = path.join(__dirname, 'node_modules', 'autoprefixer')
if (!fs.existsSync(autoprefixerPath)) {
  console.log('📦 安装autoprefixer...')
  try {
    execSync('npm install autoprefixer', { stdio: 'inherit' })
    console.log('✅ autoprefixer安装完成')
  } catch (error) {
    console.error('❌ autoprefixer安装失败:', error.message)
    process.exit(1)
  }
}

// 检查并生成 Prisma 客户端
console.log('🗄️  初始化数据库...')
try {
  execSync('npx prisma generate', { stdio: 'inherit' })
  console.log('✅ Prisma 客户端生成完成')
  
  execSync('npx prisma db push', { stdio: 'inherit' })
  console.log('✅ 数据库结构推送完成')
} catch (error) {
  console.error('❌ 数据库初始化失败:', error.message)
  process.exit(1)
}

// 创建上传目录
const uploadDir = path.join(__dirname, 'public', 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
  console.log('✅ 上传目录已创建')
}

console.log('\n🎉 项目初始化完成！')
console.log('\n下一步操作:')
console.log('1. 运行 npm run dev 启动开发服务器')
console.log('2. 访问 http://localhost:3000 查看应用')
console.log('3. 访问 http://localhost:3000/admin 进入管理后台')
console.log('4. 配置 ComfyUI API 连接（如果需要）')
console.log('5. 配置支付接口（如果需要）')
console.log('\n📚 更多信息请查看 README.md')

// 生成随机字符串
function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
