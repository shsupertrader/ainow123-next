# 生产环境维护命令

## 应用管理
```bash
# 查看应用状态
pm2 status
pm2 logs ainow123-production

# 重启应用
pm2 restart ainow123-production

# 停止应用
pm2 stop ainow123-production

# 查看详细信息
pm2 show ainow123-production
```

## 日志管理
```bash
# 查看实时日志
pm2 logs ainow123-production --lines 100

# 查看错误日志
tail -f /var/www/ainow123/logs/err.log

# 清空日志
pm2 flush
```

## 数据库管理
```bash
# 手动备份数据库
cp /var/www/ainow123/prisma/production.db /var/backups/ainow123/manual_backup_$(date +%Y%m%d_%H%M%S).db

# 查看数据库大小
ls -lh /var/www/ainow123/prisma/production.db
```

## 系统监控
```bash
# 查看系统资源
htop

# 查看磁盘使用
df -h

# 查看内存使用
free -h

# 查看网络连接
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
```

## 更新部署
```bash
# 更新代码
cd /var/www/ainow123
git pull origin main

# 安装新依赖
npm install

# 重新构建
npm run build

# 重启应用
pm2 restart ainow123-production
```

## 故障排除
```bash
# 检查应用是否运行
curl http://localhost:3000

# 检查Nginx配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx

# 查看系统日志
sudo journalctl -u nginx -f
sudo journalctl -u ssh -f
```

