#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('🔍 开始验证部署状态...\n');

const checks = [
    {
        name: 'GitHub Pages 主页',
        url: 'https://brinsec.github.io/github-automation-system/',
        expectedStatus: 200
    },
    {
        name: 'CSS 文件',
        url: 'https://brinsec.github.io/github-automation-system/assets/index-37cb0d2e.css',
        expectedStatus: 200
    },
    {
        name: 'JavaScript 文件',
        url: 'https://brinsec.github.io/github-automation-system/assets/index-b15b353f.js',
        expectedStatus: 200
    },
    {
        name: 'Vercel API 健康检查',
        url: 'https://github-1svkvp049-brinsecs-projects.vercel.app/api/health',
        expectedStatus: 200
    },
    {
        name: 'Vercel API 测试端点',
        url: 'https://github-1svkvp049-brinsecs-projects.vercel.app/api/test',
        expectedStatus: 200
    }
];

async function checkUrl(url) {
    return new Promise((resolve) => {
        const request = https.get(url, (response) => {
            resolve({
                status: response.statusCode,
                headers: response.headers
            });
        });
        
        request.on('error', (error) => {
            resolve({
                status: 'ERROR',
                error: error.message
            });
        });
        
        request.setTimeout(10000, () => {
            request.destroy();
            resolve({
                status: 'TIMEOUT',
                error: 'Request timeout'
            });
        });
    });
}

async function verifyDeployment() {
    console.log('📋 部署验证清单:\n');
    
    for (const check of checks) {
        process.stdout.write(`🔍 检查 ${check.name}... `);
        
        const result = await checkUrl(check.url);
        
        if (result.status === check.expectedStatus) {
            console.log('✅ 正常');
        } else if (result.status === 'ERROR') {
            console.log(`❌ 错误: ${result.error}`);
        } else if (result.status === 'TIMEOUT') {
            console.log('⏰ 超时');
        } else {
            console.log(`⚠️  状态码: ${result.status}`);
        }
    }
    
    console.log('\n📊 本地构建文件检查:');
    
    const distPath = path.join(__dirname, '../client/dist');
    const indexPath = path.join(distPath, 'index.html');
    const assetsPath = path.join(distPath, 'assets');
    
    if (fs.existsSync(indexPath)) {
        console.log('✅ index.html 存在');
        
        const indexContent = fs.readFileSync(indexPath, 'utf8');
        if (indexContent.includes('/github-automation-system/')) {
            console.log('✅ 路径配置正确');
        } else {
            console.log('❌ 路径配置可能有问题');
        }
    } else {
        console.log('❌ index.html 不存在');
    }
    
    if (fs.existsSync(assetsPath)) {
        const assets = fs.readdirSync(assetsPath);
        console.log(`✅ assets 目录存在，包含 ${assets.length} 个文件`);
        
        assets.forEach(file => {
            console.log(`   - ${file}`);
        });
    } else {
        console.log('❌ assets 目录不存在');
    }
    
    console.log('\n🌐 访问链接:');
    console.log('前端: https://brinsec.github.io/github-automation-system/');
    console.log('API: https://github-1svkvp049-brinsecs-projects.vercel.app/api/health');
    
    console.log('\n🎉 验证完成！');
}

verifyDeployment().catch(console.error);
