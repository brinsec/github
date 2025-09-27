#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 创建GitHub Pages专用的构建脚本
const buildForGitHubPages = () => {
    console.log('🚀 开始构建GitHub Pages版本...');
    
    // 1. 修改API基础URL
    const clientDistPath = path.join(__dirname, '../client/dist');
    const indexPath = path.join(clientDistPath, 'index.html');
    
    if (fs.existsSync(indexPath)) {
        let content = fs.readFileSync(indexPath, 'utf8');
        
        // 替换API基础URL为Vercel API的路径
        content = content.replace(
            /http:\/\/localhost:3001/g,
            'https://github-automation-system.vercel.app'
        );
        
        fs.writeFileSync(indexPath, content);
        console.log('✅ 已更新API基础URL');
    }
    
    // 2. 创建404.html用于SPA路由
    const notFoundHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>GitHub自动化系统</title>
    <script>
        // 重定向到主页
        window.location.replace('/github-automation-system/');
    </script>
</head>
<body>
    <p>正在跳转到主页...</p>
</body>
</html>`;
    
    fs.writeFileSync(path.join(clientDistPath, '404.html'), notFoundHtml);
    console.log('✅ 已创建404.html');
    
    // 3. 创建CNAME文件（如果使用自定义域名）
    const cnameContent = 'your-domain.com';
    fs.writeFileSync(path.join(clientDistPath, 'CNAME'), cnameContent);
    console.log('✅ 已创建CNAME文件');
    
    console.log('🎉 GitHub Pages构建完成！');
};

buildForGitHubPages();
