import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { initializeDatabase } from './database';
import { setupRoutes } from './routes';

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件 - 终极CORS解决方案：强制允许所有来源，特别支持GitHub Pages
app.use((req, res, next) => {
    const origin = req.headers.origin;
    console.log('🔄 CORS请求来源:', origin, 'Host:', req.headers.host, 'Method:', req.method);
    
    // VERCEL环境的终极解决方案：强制允许所有源，但优先处理GitHub Pages
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
    res.header('Access-Control-Allow-Headers', 
        'Origin, X-Requested-With, Content-Type, Accept, Authorization, Content-Range, X-Total-Count, Cache-Control, Pragma, X-Forwarded-For, X-Real-IP'
    );
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400');
    
    // 额外的GitHub Pages支持头
    res.header('Access-Control-Expose-Headers', 'Content-Range, X-Total-Count, X-Request-ID');
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'SAMEORIGIN');
    
    // 处理预检请求
    if (req.method === 'OPTIONS') {
        console.log('🔄 处理OPTIONS请求，立即返回200');
        res.status(200).json({ success: true, message: 'CORS预检通过' });
        return;
    }
    
    console.log('✅ CORS设置完成，继续处理请求');
    next();
});

// 简化的cors库配置，配合主中间件使用
app.use(cors({
    origin: true, // 允许所有源，配合自定义中间件
    credentials: true,
    optionsSuccessStatus: 200
}));

app.use(express.json());

// 初始化数据库并启动服务器
// 设置路由
setupRoutes(app);

// 启动服务器
async function startServer() {
    try {
        await initializeDatabase();
        console.log('✅ 数据库初始化完成');
        
        // 启动服务器（仅在非Vercel环境）
        if (!process.env.VERCEL) {
            app.listen(PORT, () => {
                console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
                console.log(`📊 GitHub自动化系统已启动`);
            });
        }
    } catch (error) {
        console.error('❌ 服务器启动失败:', error);
        if (!process.env.VERCEL) {
            process.exit(1);
        }
    }
}

if (process.env.VERCEL) {
    // Vercel环境，直接初始化数据库
    initializeDatabase().catch(console.error);
} else {
    // 本地环境，启动服务器
    startServer();
}

export default app;
