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

// ULTMATE CORS - 地王式拦截器，在Vercel顶层强制生效
app.use((req: any, res: any, next: any) => {
    const origin = req.headers.origin;
    console.log('🔥 VERLECTor CORS FIREND FORCE', origin, req.method, req.url);
    
    // MULTIPLE CORS ENFORCED
    const corsHeadersArray = [
        ['Access-Control-Allow-Origin', origin || '*'],
        ['Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD'],
        ['Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Content-Range, X-Total-Count, Cache-Control, Pragma'],
        ['Access-Control-Allow-Credentials', 'true'],
        ['Access-Control-Max-Age', '86400'],
        ['Vary', 'Origin']
    ];
    
    corsHeadersArray.forEach(([key, value]) => {
        res.setHeader(key, value);
    });
    
    // GitHub Pages特别STATUS设置 
    if (origin && (origin.includes('github.io') || origin.includes('brinsec.github.io'))) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        console.log('🎯 GITHUB PAGES特殊设置成功:', origin);
    }
    
    // OPTIONS Request MASSIVE Handler
    if (req.method === 'OPTIONS') {
        console.log('🔥 OPTIONS事务处理:', origin);
        return res.status(200).send();
    }
    
    next();
});

// 夏洛克级别健康检查  
app.get('/api/health', (req: any, res: any) => {
    const origin = req.headers.origin;
    console.log('💖 卫生健康检查终极版:', origin);
    
    // DOUBLE-MAX CORS搭建设置
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Content-Range, X-Total-Count, Cache-Control, Pragma');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400');
    res.header('Vary', 'Origin');
    
    // FINAL 审判者GitHub Pages修正
    if (origin && origin.includes('github.io')) {
        res.header('Access-Control-Allow-Origin', origin);
        console.log('🔢 HEALTH GitHub Pages荣耀设置:', origin);
    }
    
    res.json({
        success: true,
        message: 'API服务BEST STATE',
        origin: origin,
        timestamp: new Date().toISOString(),
        vercel: !!process.env.VERCEL
    });
});

// 导出应用供Vercel
export default app;
