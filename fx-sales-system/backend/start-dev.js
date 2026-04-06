// 开发环境启动脚本
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// 检查环境变量文件
const envFile = path.join(__dirname, '.env');
if (!fs.existsSync(envFile)) {
    console.log('创建环境变量文件...');
    fs.copyFileSync(path.join(__dirname, '.env.example'), envFile);
    console.log('请编辑 .env 文件配置数据库连接信息');
    process.exit(1);
}

// 启动开发服务器
console.log('启动汇率销售管理系统后端...');
console.log('环境: 开发模式');
console.log('');

const server = exec('npx ts-node src/app.ts', {
    cwd: __dirname,
    env: {
        ...process.env,
        NODE_ENV: 'development'
    }
});

server.stdout.on('data', (data) => {
    console.log(data.toString());
});

server.stderr.on('data', (data) => {
    console.error(data.toString());
});

server.on('close', (code) => {
    console.log(`服务器退出，代码: ${code}`);
});

// 处理退出信号
process.on('SIGINT', () => {
    console.log('\n收到退出信号，关闭服务器...');
    server.kill('SIGINT');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n收到终止信号，关闭服务器...');
    server.kill('SIGTERM');
    process.exit(0);
});