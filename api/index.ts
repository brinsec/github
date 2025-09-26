import app from '../server/src/index';
import { initializeDatabase } from '../server/src/database';

// Vercel环境配置检查  
console.log('🚀 Vercel环境检测:', {
    isVercel: !!process.env.VERCEL,
    githubToken: !!process.env.GITHUB_TOKEN ? '已设置' : '未设置',
    nodeEnv: process.env.NODE_ENV || '未设置'
});

// 初始化数据库
initializeDatabase().catch(console.error);

// 额外的 CORS 强化器在应用顶部
app.use((req: any, res: any, next: any) => {
    const origin = req.headers.origin;
    console.log('🚀 VERCEL顶级CORS处理:', origin, req.method, req.url);
    
    // 超级CORS头设置
    const corsSuperHeaders = {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Content-Range, X-Total-Count, Cache-Control, Pragma',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
        'Vary': 'Origin'
    };
    
    // 批量设置
    Object.entries(corsSuperHeaders).forEach(([key, value]) => res.setHeader(key, value));
    
    // 特别GitHub Pages处理
    if (origin && (origin.includes('github.io') || origin.includes('brinsec.github.io'))) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        console.log('🎯 顶级GitHub Pages CORS处理:', origin);
    }
    
    // OPTIONS立即响应
    if (req.method === 'OPTIONS') {
        console.log('🚀 OPTIONS立即响应完成:', origin);
        return res.status(200).json({
            success: true,
            message: 'CORS预检完成',
            origin: origin
        });
    }
    
    next();
});

// 重新定义健康检查处理器
app.get('/api/health', (req: any, res: any) => {
    const origin = req.headers.origin;
    console.log('🏥 健康检查强化处理:', origin);
    
    // 第三次确保CORS头
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
    
    // 最后确定的GitHub Pages处理
    if (origin && (origin.includes('github.io') || origin.includes('brinsec.github.io'))) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        console.log('🎯 健康检查GitHub Pages终极处理:', origin);
    }
    
    res.status(200).json({
        success: true,
        message: 'API服务运行正常',
        origin: origin,
        cors: 'definitively_enabled',
        vercel: !!process.env.VERCEL,
        github_token: !!process.env.GITHUB_TOKEN,
        timestamp: new Date().toISOString()
    });
});

// 导出应用
export default app;
