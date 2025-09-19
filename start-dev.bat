@echo off
echo 启动即刻未来AI开发服务器...
echo ================================
echo.
echo 服务器启动中，请稍候...
echo 启动成功后访问: http://localhost:3002
echo 管理后台地址: http://localhost:3002/admin  
echo 管理员账户: admin@ainow123.com / admin123456
echo.
echo 按 Ctrl+C 停止服务器
echo ================================
node node_modules\next\dist\bin\next dev -p 3002
pause
