# 即刻未来AI - COMFYUI工作流平台

一个基于Next.js构建的AI创作平台，支持文生图、图生图、文生视频等COMFYUI工作流应用。

## 功能特性

- 🎨 **多种AI工具**：文生图、图生图、文生视频
- 🔐 **用户系统**：注册、登录、个人资料管理
- 💳 **积分系统**：积分充值、消费管理
- 💰 **支付集成**：支持Z-Pay支付接口
- 🛠️ **ComfyUI集成**：完整的ComfyUI API对接
- 📊 **管理后台**：用户管理、配置管理、数据统计
- 📱 **响应式设计**：支持移动端和桌面端

## 技术栈

- **前端**: Next.js 14, React, TypeScript, Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: SQLite + Prisma ORM
- **认证**: JWT + Cookie
- **支付**: Z-Pay集成
- **AI引擎**: ComfyUI API

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 快速启动 (推荐)

1. **克隆项目**
```bash
git clone <repository-url>
cd ainow123-next
```

2. **一键初始化**
```bash
npm run setup
```

3. **创建管理员账户**
```bash
npm run create-admin
```

4. **启动开发服务器**

Windows用户（如果遇到PowerShell执行策略问题）：
```bash
# 方法1：直接运行批处理文件
start-dev.bat

# 方法2：直接运行Node命令
node node_modules\next\dist\bin\next dev
```

其他系统：
```bash
npm run dev
```

访问 http://localhost:3000 查看应用，使用 `admin@ainow123.com` / `admin123456` 登录管理后台。

### 手动安装和运行

如果你想手动安装，可以按以下步骤：

1. **安装依赖**
```bash
npm install
```

2. **配置环境变量**

创建 `.env.local` 文件：
```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-change-this-in-production

# JWT Secret
JWT_SECRET=your-jwt-secret-change-this-in-production

# ComfyUI API (默认配置)
COMFYUI_API_URL=http://127.0.0.1:8188
COMFYUI_API_KEY=

# Z-Pay配置
ZPAY_MERCHANT_ID=your_merchant_id
ZPAY_SECRET_KEY=your_secret_key
ZPAY_API_URL=https://api.z-pay.cn

# 上传文件配置
UPLOAD_DIR=./public/uploads
MAX_FILE_SIZE=10485760
```

3. **初始化数据库**
```bash
npm run db:generate
npm run db:push
```

4. **启动开发服务器**
```bash
npm run dev
```

## 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API路由
│   ├── admin/             # 管理后台页面
│   ├── tools/             # AI工具页面
│   └── pricing/           # 积分充值页面
├── components/            # React组件
├── lib/                   # 工具库
│   ├── auth.ts           # 认证相关
│   ├── comfyui.ts        # ComfyUI集成
│   ├── payment.ts        # 支付集成
│   └── prisma.ts         # 数据库连接
└── prisma/               # 数据库模式
```

## 主要功能

### 1. 用户系统
- 用户注册和登录
- JWT认证
- 积分管理
- 个人资料

### 2. AI工具
- **文生图**: 根据文字描述生成图片
- **图生图**: 基于输入图片生成新图片
- **文生视频**: 从文字生成视频（规划中）

### 3. 积分系统
- 新用户赠送100积分
- 多种积分套餐
- Z-Pay支付集成
- 积分消费记录

### 4. 管理后台
- 用户管理
- ComfyUI配置管理
- 生成记录查看
- 支付记录管理
- 系统统计

## ComfyUI配置

在管理后台 `/admin/comfyui` 中配置ComfyUI API：

1. 添加ComfyUI配置
2. 设置API地址（如：http://127.0.0.1:8188）
3. 可选：设置API密钥
4. 测试连接
5. 激活配置

## 支付配置

项目集成了Z-Pay支付接口，需要在环境变量中配置：
- `ZPAY_MERCHANT_ID`: 商户ID
- `ZPAY_SECRET_KEY`: 签名密钥
- `ZPAY_API_URL`: API地址

## 部署

### 生产环境部署

1. **构建项目**
```bash
npm run build
```

2. **启动生产服务器**
```bash
npm start
```

3. **配置环境变量**
确保生产环境的环境变量正确配置，特别是：
- `NEXTAUTH_SECRET`: 随机生成的安全密钥
- `JWT_SECRET`: JWT签名密钥
- ComfyUI和支付相关配置

### Docker部署（可选）

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

## 开发指南

### 添加新的AI工具

1. 在 `src/lib/comfyui.ts` 中添加新的工作流方法
2. 创建对应的API端点 `src/app/api/generate/`
3. 创建前端页面 `src/app/tools/`
4. 更新工具网格组件

### 数据库迁移

```bash
# 修改schema后生成迁移
npm run db:migrate

# 重置数据库
npm run db:push
```

### 查看数据库

```bash
npm run db:studio
```

## 常见问题

### Q: ComfyUI连接失败
A: 检查ComfyUI服务是否运行，API地址是否正确，防火墙是否阻止连接。

### Q: 支付回调失败
A: 确保支付回调URL可以从外网访问，检查签名验证逻辑。

### Q: 图片生成失败
A: 检查ComfyUI模型是否正确加载，工作流配置是否有误。

## 贡献

欢迎提交Issue和Pull Request！

## 许可证

MIT License

## 联系方式

- 邮箱: ainow123@qq.com
- 网站: https://ainow123.com
