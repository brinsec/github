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

// 中间件 - NUCLEAR OPTION CORS：绕过所有CORS限制
app.use((req, res, next) => {
    const origin = req.headers.origin;
    console.log('🔄 NUCLEAR CORS处理:', origin, req.method, req.path);
    
    // 强制CORS设置 - NUCLEAR OPTION
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Content-Range, X-Total-Count, Cache-Control, Pragma');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');
    
    // Vercel特殊处理
    if (process.env.VERCEL) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        console.log('🚀 VERCEL环境强制开放所有源');
    }
    
    // 立即处理OPTIONS
    if (req.method === 'OPTIONS') {
        console.log('✅ NUCLEAR OPTIONS返回200');
        res.status(200).end();
        return;
    }
    
    next();
});

// 完全绕过cors库，使用纯自定义实现
// app.use(cors({...})); // 禁用cors库，完全由自定义控制

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
