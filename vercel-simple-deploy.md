# Vercel 超简单部署指南

## 🚀 5分钟上线你的AI网站

### 第1步：上传代码到GitHub（3分钟）

1. **访问GitHub.com**
   - 注册/登录GitHub账号
   - 点击右上角 "+" → "New repository"
   - 仓库名：`ainow123-next`
   - 设为Public（公开）
   - 点击"Create repository"

2. **上传项目文件**
   - 在新建的仓库页面，点击"uploading an existing file"
   - 将你的整个项目文件夹拖拽上传
   - 或者压缩后上传再解压

### 第2步：连接Vercel（2分钟）

1. **访问 vercel.com**
   - 点击"Start Deploying"
   - 选择"Continue with GitHub"
   - 授权Vercel访问你的GitHub

2. **导入项目**
   - 找到你的`ainow123-next`仓库
   - 点击"Import"
   - **不用修改任何设置**，直接点击"Deploy"

### 第3步：等待部署完成（30秒）

- Vercel会自动：
  - 安装依赖
  - 构建项目  
  - 部署到全球CDN
  - 生成HTTPS域名

### 🎉 完成！

你会得到一个类似这样的网址：
`https://ainow123-next-xxx.vercel.app`

## ⚠️ 唯一的问题和解决方案

**问题**：SQLite数据库每次部署会重置

**解决方案**：升级到Vercel Postgres（依然免费）

### 数据库升级步骤：

1. **在Vercel项目页面**
   - 点击"Storage"标签
   - 选择"Postgres"
   - 点击"Create"（免费）

2. **更新环境变量**
   - 复制Vercel提供的数据库连接字符串
   - 在项目设置→Environment Variables中：
   - 添加：`DATABASE_URL` = `你的数据库连接字符串`

3. **更新数据库配置**
   - 修改`prisma/schema.prisma`：
   ```prisma
   datasource db {
     provider = "postgresql"  // 改为postgresql
     url      = env("DATABASE_URL")
   }
   ```

4. **重新部署**
   - 推送代码更新到GitHub
   - Vercel自动重新部署

## 💰 费用情况

### 免费额度（完全够用）：
- **带宽**：100GB/月
- **函数调用**：100万次/月  
- **构建时间**：6000分钟/月
- **数据库**：60小时计算时间/月

### 什么时候需要付费？
- 月访问量超过100万
- 需要更多存储空间
- 需要团队协作功能

## 🛡️ 自动获得的安全功能

✅ **DDoS防护** - 抵御攻击
✅ **SSL证书** - HTTPS加密
✅ **防火墙** - 恶意请求拦截  
✅ **安全头** - XSS、CSRF防护
✅ **全球CDN** - 99.99%可用性
✅ **自动备份** - 代码版本控制

## 🎯 为什么适合你

### ✅ 技术要求
- **不需要**：Linux、服务器管理、域名配置
- **不需要**：CDN配置、SSL证书、安全设置
- **只需要**：会使用浏览器点击

### ✅ 维护工作
- **零维护** - Vercel处理所有基础设施
- **自动更新** - 推送代码即部署
- **自动监控** - 问题自动通知

### ✅ 成本
- **开发阶段**：完全免费
- **生产阶段**：大部分情况免费
- **商业化后**：按需付费，透明定价

