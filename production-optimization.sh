#!/bin/bash

# 生产环境优化脚本
# 在服务器上运行：chmod +x production-optimization.sh && ./production-optimization.sh

echo "🚀 开始生产环境优化..."

# 1. 设置自动备份
echo "📦 设置数据库自动备份..."
mkdir -p /var/backups/ainow123

# 创建备份脚本
cat > /var/backups/ainow123/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/ainow123"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/var/www/ainow123"

# 备份SQLite数据库
cp $APP_DIR/prisma/production.db $BACKUP_DIR/production_$DATE.db

# 备份环境配置
cp $APP_DIR/.env.production $BACKUP_DIR/env_$DATE.backup

# 删除7天前的备份
find $BACKUP_DIR -name "*.db" -mtime +7 -delete
find $BACKUP_DIR -name "*.backup" -mtime +7 -delete

echo "备份完成: $DATE"
EOF

chmod +x /var/backups/ainow123/backup.sh

# 设置每日凌晨2点自动备份
(crontab -l 2>/dev/null; echo "0 2 * * * /var/backups/ainow123/backup.sh") | crontab -

# 2. 系统性能优化
echo "⚡ 优化系统性能..."

# 增加文件描述符限制
echo "* soft nofile 65536" >> /etc/security/limits.conf
echo "* hard nofile 65536" >> /etc/security/limits.conf

# 优化内核参数
cat >> /etc/sysctl.conf << 'EOF'
# 网络优化
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.ipv4.tcp_rmem = 4096 12582912 16777216
net.ipv4.tcp_wmem = 4096 12582912 16777216
net.core.netdev_max_backlog = 5000
EOF

sysctl -p

# 3. 设置日志轮转
echo "📝 配置日志轮转..."
cat > /etc/logrotate.d/ainow123 << 'EOF'
/var/www/ainow123/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

# 4. 安全加固
echo "🔒 安全加固..."

# 禁用root SSH登录 (可选，谨慎使用)
# sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config

# 安装fail2ban防止暴力破解
apt update
apt install -y fail2ban

# 配置fail2ban
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3
EOF

systemctl enable fail2ban
systemctl start fail2ban

echo "✅ 生产环境优化完成！"
echo "📊 建议安装监控工具："
echo "   - htop: sudo apt install htop"
echo "   - iotop: sudo apt install iotop"
echo "   - netdata: bash <(curl -Ss https://my-netdata.io/kickstart.sh)"
