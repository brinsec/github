import app from '../server/src/index';
import { initializeDatabase } from '../server/src/database';

// 初始化数据库
initializeDatabase().catch(console.error);

// VERCEl终极CORS解决方案 - 在serverless函数层面强制处理
app.use((req, res, next) => {
    // 强制设置CORS头，绕过所有可能的限制
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Content-Range, X-Total-Count, Cache-Control, Pragma');
    res.setHeader('Access-Control-Allow-Credentials', 'false'); // VERCELOPEN预核问题
    res.setHeader('Access-Control-Max-Age', '86400');
    
    // Vercel特殊处理 - 强制覆盖任何其他CORS设置
    const origin = req.headers.origin;
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    // 立即处理OPTIONS请求
    if (req.method === 'OPTIONS') {
        console.log('🚀 VERCEL CORS OPTIONS处理:', origin);
        return res.status(200).json({ 
            success: true, 
            cors: 'vercel-enabled',
            origin: origin 
        });
    }
    
    console.log('💥 Vercel CORS设置完成:', origin, req.method, req.path);
    next();
});

export default app;
