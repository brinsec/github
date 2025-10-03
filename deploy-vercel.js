#!/usr/bin/env node

// Vercel部署脚本
console.log('🚀 开始Vercel API部署...');

// 检查必要文件
const fs = require('fs');
const path = require('path');

const requiredFiles = [
    'api/index.ts',
    'api/health.ts',
    'public/index.html'
];

console.log('📁 检查必要文件...');
requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file} 存在`);
    } else {
        console.log(`❌ ${file} 不存在`);
    }
});

console.log('📦 API文件检查完成');
console.log('🎯 准备部署到Vercel');
