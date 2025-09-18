#!/bin/bash

# 自动部署脚本
APP_DIR="/var/www/ainow123"
BACKUP_DIR="/var/backups/ainow123"
DATE=$(date +%Y%m%d_%H%M%S)

echo "🚀 开始部署..."

# 1. 备份当前版本
echo "📦 备份当前版本..."
mkdir -p $BACKUP_DIR/deploys
cp -r $APP_DIR $BACKUP_DIR/deploys/backup_$DATE

# 2. 进入应用目录
cd $APP_DIR

# 3. 拉取最新代码
echo "📥 拉取最新代码..."
git pull origin main

# 4. 安装依赖
echo "📦 安装依赖..."
npm install

# 5. 构建应用
echo "🔨 构建应用..."
npm run build

# 6. 数据库迁移
echo "🗄️  更新数据库..."
npm run db:generate
npm run db:push

# 7. 重启应用
echo "🔄 重启应用..."
pm2 restart ainow123-next

# 8. 等待应用启动
sleep 5

# 9. 检查应用状态
echo "✅ 检查应用状态..."
pm2 status ainow123-next

echo "🎉 部署完成!"
