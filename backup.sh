#!/bin/bash

# 数据库备份脚本
BACKUP_DIR="/var/backups/ainow123"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/var/www/ainow123"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份SQLite数据库
cp $APP_DIR/prisma/production.db $BACKUP_DIR/production_$DATE.db

# 备份环境配置
cp $APP_DIR/.env.production $BACKUP_DIR/env_$DATE.backup

# 删除7天前的备份
find $BACKUP_DIR -name "*.db" -mtime +7 -delete
find $BACKUP_DIR -name "*.backup" -mtime +7 -delete

echo "备份完成: $DATE"

