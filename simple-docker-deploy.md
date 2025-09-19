# 宝塔面板 + Docker 简单部署

## 1. 安装宝塔面板
```bash
# Ubuntu/Debian
wget -O install.sh http://download.bt.cn/install/install-ubuntu_6.0.sh && sudo bash install.sh

# CentOS
yum install -y wget && wget -O install.sh http://download.bt.cn/install/install_6.0.sh && sh install.sh
```

## 2. 在宝塔面板中操作

### 安装Docker
- 进入宝塔面板 → 软件商店 → 搜索"Docker" → 安装

### 创建项目目录
- 文件管理 → 创建目录：`/www/wwwroot/ainow123`

### 上传项目文件
- 将你的项目文件上传到 `/www/wwwroot/ainow123/`

## 3. 创建简化的Docker配置

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生成Prisma客户端
RUN npx prisma generate

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["npm", "start"]
```

### docker-compose.yml
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=your-super-secret-jwt-key
      - COMFYUI_API_URL=http://175.155.64.198:8189
      - NEXTAUTH_SECRET=your-nextauth-secret
    volumes:
      - ./data:/app/prisma
    restart: unless-stopped
```

### 部署命令
```bash
# 在项目目录下执行
docker-compose up -d
```

## 4. 配置反向代理
- 宝塔面板 → 网站 → 添加站点
- 域名：你的域名
- 反向代理：127.0.0.1:3000
- 自动申请SSL证书
```

