#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始最终部署到 GitHub Pages...');

try {
    const rootDir = path.join(__dirname, '..');
    process.chdir(rootDir);
    
    // 1. 确保构建是最新的
    console.log('📦 确保构建是最新的...');
    execSync('cd client && pnpm run build', { stdio: 'inherit' });
    execSync('node scripts/build-for-github-pages.js', { stdio: 'inherit' });
    
    // 2. 删除现有的 gh-pages 分支（如果存在）
    console.log('🗑️ 清理现有的 gh-pages 分支...');
    try {
        execSync('git branch -D gh-pages', { stdio: 'pipe' });
    } catch (error) {
        // 忽略错误，分支可能不存在
    }
    
    // 3. 创建新的 gh-pages 分支
    console.log('🌿 创建新的 gh-pages 分支...');
    execSync('git checkout --orphan gh-pages', { stdio: 'inherit' });
    execSync('git rm -rf .', { stdio: 'inherit' });
    
    // 4. 复制构建文件
    console.log('📋 复制构建文件...');
    const distDir = path.join(rootDir, 'client/dist');
    const files = fs.readdirSync(distDir);
    
    files.forEach(file => {
        const srcPath = path.join(distDir, file);
        const destPath = path.join(rootDir, file);
        if (fs.statSync(srcPath).isDirectory()) {
            fs.cpSync(srcPath, destPath, { recursive: true });
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    });
    
    // 5. 提交并推送
    console.log('💾 提交更改...');
    execSync('git add .', { stdio: 'inherit' });
    execSync('git commit -m "Deploy to GitHub Pages"', { stdio: 'inherit' });
    
    console.log('🚀 推送到 GitHub...');
    execSync('git push origin gh-pages --force', { stdio: 'inherit' });
    
    // 6. 切换回 main 分支
    console.log('🔄 切换回 main 分支...');
    execSync('git checkout main', { stdio: 'inherit' });
    
    console.log('✅ 部署完成！');
    console.log('🌐 您的网站应该可以在以下地址访问：');
    console.log('   https://brinsec.github.io/github-automation-system/');
    console.log('\n⏰ 请注意：GitHub Pages 可能需要几分钟时间来更新。');
    console.log('📋 如果仍有问题，请检查：');
    console.log('   1. GitHub 仓库的 Pages 设置');
    console.log('   2. 等待 5-10 分钟让 GitHub Pages 更新');
    console.log('   3. 清除浏览器缓存后重新访问');
    
} catch (error) {
    console.error('❌ 部署失败:', error.message);
    
    // 确保切换回 main 分支
    try {
        execSync('git checkout main', { stdio: 'pipe' });
    } catch (e) {
        // 忽略错误
    }
    
    process.exit(1);
}
