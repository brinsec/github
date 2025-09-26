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

// ULTRA NUCLEAR CORS - 最高级别Vercel入口CORS拦截
app.use((req: any, res: any, next: any) => {
    const origin = req.headers.origin;
    console.log('🚀 VERCEL API 入口CORS处理:', origin, req.method, req.url);
    
    // ULTRA强制性CORS头部设置 - 进入的最优先处理
    const corsHeaders = {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Content-Range, X-Total-Count, Cache-Control, Pragma',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
        'Vary': 'Origin'
    };
    
    // 强制应用每个CORS头
    Object.entries(corsHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
    });
    
    // GitHub Pages特殊强化路径处理
    if (origin && (origin.includes('github.io') || origin.includes('brinsec'))) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        console.log('🎯 Vercel GitHub Pages特殊处理:', origin);
    }
    
    // OPTIONS预检立即响应
    if (req.method === 'OPTIONS') {
        console.log('🚀 VERCEL OPTIONS响应成功:', origin);
        return res.status(200).json({
            success: true,
            message: 'CORS预检通过',
            origin: origin,
            handled_by: 'vercel_handler'
        });
    }
    
    next();
});

// 导出Express应用给Vercel
export default app;
