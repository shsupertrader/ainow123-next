module.exports = {
  apps: [
    {
      name: 'ainow123-next',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/var/www/ainow123',
      instances: 1,
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    }
  ]
}
