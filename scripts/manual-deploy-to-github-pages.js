#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始手动部署到 GitHub Pages...');

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
    
    // 4. 复制构建文件到临时目录
    console.log('📋 复制构建文件到临时目录...');
    const distDir = path.join(rootDir, 'client/dist');
    const tempDir = path.join(rootDir, 'temp-deploy');
    if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
    fs.cpSync(distDir, tempDir, { recursive: true });
    
    // 5. 切换到 gh-pages 分支
    console.log('🌿 切换到 gh-pages 分支...');
    try {
        execSync('git checkout gh-pages', { stdio: 'inherit' });
    } catch (error) {
        // 如果 gh-pages 分支不存在，创建它
        console.log('📝 创建 gh-pages 分支...');
        execSync('git checkout -b gh-pages', { stdio: 'inherit' });
    }
    
    // 6. 复制构建文件到根目录
    console.log('📋 复制构建文件...');
    const files = fs.readdirSync(tempDir);
    
    // 清空当前目录（除了 .git）
    const currentFiles = fs.readdirSync('.');
    currentFiles.forEach(file => {
        if (file !== '.git' && file !== '.github') {
            const filePath = path.join('.', file);
            if (fs.statSync(filePath).isDirectory()) {
                fs.rmSync(filePath, { recursive: true, force: true });
            } else {
                fs.unlinkSync(filePath);
            }
        }
    });
    
    // 复制新文件
    files.forEach(file => {
        const srcPath = path.join(tempDir, file);
        const destPath = path.join('.', file);
        if (fs.statSync(srcPath).isDirectory()) {
            fs.cpSync(srcPath, destPath, { recursive: true });
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    });
    
    // 清理临时目录
    fs.rmSync(tempDir, { recursive: true, force: true });
    
    // 6. 提交更改
    console.log('💾 提交更改...');
    execSync('git add .', { stdio: 'inherit' });
    execSync('git commit -m "手动部署到 GitHub Pages"', { stdio: 'inherit' });
    
    // 7. 推送到 gh-pages 分支
    console.log('🚀 推送到 GitHub...');
    execSync('git push origin gh-pages', { stdio: 'inherit' });
    
    // 8. 切换回 main 分支
    console.log('🔄 切换回 main 分支...');
    execSync('git checkout main', { stdio: 'inherit' });
    
    console.log('✅ 手动部署完成！');
    console.log('🌐 您的网站应该可以在以下地址访问：');
    console.log('   https://brinsec.github.io/github-automation-system/');
    
} catch (error) {
    console.error('❌ 部署失败:', error.message);
    process.exit(1);
}
