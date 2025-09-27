#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始简单部署到 GitHub Pages...');

try {
    // 1. 确保我们在正确的目录
    const rootDir = path.join(__dirname, '..');
    process.chdir(rootDir);
    
    // 2. 构建前端
    console.log('📦 构建前端项目...');
    execSync('cd client && pnpm run build', { stdio: 'inherit' });
    
    // 3. 运行 GitHub Pages 构建脚本
    console.log('🔧 运行 GitHub Pages 构建脚本...');
    execSync('node scripts/build-for-github-pages.js', { stdio: 'inherit' });
    
    // 4. 创建 gh-pages 目录
    const ghPagesDir = path.join(rootDir, 'gh-pages-deploy');
    if (fs.existsSync(ghPagesDir)) {
        fs.rmSync(ghPagesDir, { recursive: true, force: true });
    }
    fs.mkdirSync(ghPagesDir);
    
    // 5. 复制构建文件
    console.log('📋 复制构建文件...');
    const distDir = path.join(rootDir, 'client/dist');
    fs.cpSync(distDir, ghPagesDir, { recursive: true });
    
    // 6. 初始化 git 仓库
    console.log('🌿 初始化 gh-pages 仓库...');
    process.chdir(ghPagesDir);
    execSync('git init', { stdio: 'inherit' });
    execSync('git add .', { stdio: 'inherit' });
    execSync('git commit -m "Deploy to GitHub Pages"', { stdio: 'inherit' });
    
    // 7. 推送到 gh-pages 分支
    console.log('🚀 推送到 GitHub Pages...');
    execSync('git remote add origin https://github.com/brinsec/github.git', { stdio: 'inherit' });
    execSync('git push -f origin HEAD:gh-pages', { stdio: 'inherit' });
    
    // 8. 清理
    process.chdir(rootDir);
    fs.rmSync(ghPagesDir, { recursive: true, force: true });
    
    console.log('✅ 部署完成！');
    console.log('🌐 您的网站应该可以在以下地址访问：');
    console.log('   https://brinsec.github.io/github-automation-system/');
    console.log('\n⏰ 请注意：GitHub Pages 可能需要几分钟时间来更新。');
    
} catch (error) {
    console.error('❌ 部署失败:', error.message);
    process.exit(1);
}
