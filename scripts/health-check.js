#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('🏥 GitHub 自动化系统健康检查\n');

const checks = [
    {
        name: 'GitHub Pages 前端',
        url: 'https://brinsec.github.io/github-automation-system/',
        expectedStatus: 200,
        critical: true
    },
    {
        name: 'Vercel API 健康检查',
        url: 'https://github-1svkvp049-brinsecs-projects.vercel.app/api/health',
        expectedStatus: 200,
        critical: true
    },
    {
        name: 'Vercel API 测试端点',
        url: 'https://github-1svkvp049-brinsecs-projects.vercel.app/api/test',
        expectedStatus: 200,
        critical: false
    },
    {
        name: 'Vercel API 仓库数据',
        url: 'https://github-1svkvp049-brinsecs-projects.vercel.app/api/repositories',
        expectedStatus: 200,
        critical: false
    },
    {
        name: 'Vercel API 分类数据',
        url: 'https://github-1svkvp049-brinsecs-projects.vercel.app/api/categories',
        expectedStatus: 200,
        critical: false
    }
];

async function checkUrl(url, timeout = 10000) {
    return new Promise((resolve) => {
        const request = https.get(url, (response) => {
            let data = '';
            response.on('data', (chunk) => {
                data += chunk;
            });
            response.on('end', () => {
                resolve({
                    status: response.statusCode,
                    headers: response.headers,
                    data: data.substring(0, 200) // 只取前200个字符
                });
            });
        });
        
        request.on('error', (error) => {
            resolve({
                status: 'ERROR',
                error: error.message
            });
        });
        
        request.setTimeout(timeout, () => {
            request.destroy();
            resolve({
                status: 'TIMEOUT',
                error: 'Request timeout'
            });
        });
    });
}

async function runHealthCheck() {
    console.log('📋 系统健康检查报告\n');
    console.log('=' .repeat(50));
    
    let criticalIssues = 0;
    let totalIssues = 0;
    
    for (const check of checks) {
        process.stdout.write(`🔍 ${check.name.padEnd(25)} `);
        
        const result = await checkUrl(check.url);
        
        if (result.status === check.expectedStatus) {
            console.log('✅ 正常');
        } else if (result.status === 'ERROR') {
            console.log(`❌ 错误: ${result.error}`);
            totalIssues++;
            if (check.critical) criticalIssues++;
        } else if (result.status === 'TIMEOUT') {
            console.log('⏰ 超时');
            totalIssues++;
            if (check.critical) criticalIssues++;
        } else {
            console.log(`⚠️  状态码: ${result.status}`);
            totalIssues++;
            if (check.critical) criticalIssues++;
        }
    }
    
    console.log('\n' + '=' .repeat(50));
    
    // 系统状态总结
    if (criticalIssues === 0 && totalIssues === 0) {
        console.log('🎉 系统状态: 全部正常');
        console.log('✅ 所有关键服务运行正常');
    } else if (criticalIssues === 0) {
        console.log('⚠️  系统状态: 部分问题');
        console.log('✅ 关键服务正常，部分功能可能受影响');
    } else {
        console.log('🚨 系统状态: 严重问题');
        console.log('❌ 关键服务出现问题，需要立即处理');
    }
    
    console.log(`📊 问题统计: ${totalIssues} 个问题 (${criticalIssues} 个关键问题)`);
    
    // 本地文件检查
    console.log('\n📁 本地文件检查:');
    const distPath = path.join(__dirname, '../client/dist');
    
    if (fs.existsSync(distPath)) {
        console.log('✅ 构建目录存在');
        
        const indexPath = path.join(distPath, 'index.html');
        if (fs.existsSync(indexPath)) {
            console.log('✅ index.html 存在');
            
            const content = fs.readFileSync(indexPath, 'utf8');
            if (content.includes('github-automation-system')) {
                console.log('✅ 路径配置正确');
            } else {
                console.log('⚠️  路径配置可能有问题');
            }
        } else {
            console.log('❌ index.html 不存在');
        }
        
        const assetsPath = path.join(distPath, 'assets');
        if (fs.existsSync(assetsPath)) {
            const assets = fs.readdirSync(assetsPath);
            console.log(`✅ assets 目录存在 (${assets.length} 个文件)`);
        } else {
            console.log('❌ assets 目录不存在');
        }
    } else {
        console.log('❌ 构建目录不存在');
    }
    
    // 建议操作
    console.log('\n💡 建议操作:');
    if (criticalIssues > 0) {
        console.log('1. 检查 Vercel 部署状态');
        console.log('2. 检查 GitHub Pages 设置');
        console.log('3. 重新部署应用');
    } else if (totalIssues > 0) {
        console.log('1. 等待几分钟让服务更新');
        console.log('2. 清除浏览器缓存');
        console.log('3. 检查网络连接');
    } else {
        console.log('1. 系统运行正常，无需操作');
        console.log('2. 可以正常使用所有功能');
    }
    
    console.log('\n🌐 访问链接:');
    console.log('前端: https://brinsec.github.io/github-automation-system/');
    console.log('API:  https://github-1svkvp049-brinsecs-projects.vercel.app/api/health');
    
    console.log('\n🏥 健康检查完成！');
    
    // 返回适当的退出码
    process.exit(criticalIssues > 0 ? 1 : 0);
}

runHealthCheck().catch((error) => {
    console.error('❌ 健康检查失败:', error.message);
    process.exit(1);
});
