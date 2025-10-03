#!/usr/bin/env node

// Vercel构建脚本 - 仅用于API部署
console.log('🚀 Vercel API构建开始...');

// 检查API文件是否存在
const fs = require('fs');
const path = require('path');

const apiFiles = [
    'api/health.ts',
    'api/index.ts'
];

console.log('📁 检查API文件...');
apiFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file} 存在`);
    } else {
        console.log(`❌ ${file} 不存在`);
    }
});

console.log('📦 API文件检查完成');
console.log('🎯 跳过客户端和服务端构建，仅部署API');
