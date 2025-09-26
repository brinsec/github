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

// 中间件 - 强化CORS配置，兼容Vercel环境
app.use((req, res, next) => {
    const origin = req.headers.origin;
    console.log('🔄 CORS请求来源:', origin, 'Host:', req.headers.host);
    
    const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://brinsec.github.io',
        /^https:\/\/.*\.github\.io$/
    ];
    
    // 检查是否是允许的来源
    let isAllowed = false;
    if (origin) {
        for (const allowed of allowedOrigins) {
            if (typeof allowed === 'string' && origin === allowed) {
                isAllowed = true;
                break;
            } else if (allowed instanceof RegExp && allowed.test(origin)) {
                isAllowed = true;
                break;
            }
        }
    }

    // 在Vercel环境中，CORS处理更加宽松
    if (process.env.VERCEL || origin) {
        if (isAllowed && origin) {
            res.header('Access-Control-Allow-Origin', origin);
            console.log('✅ 允许的Origin:', origin);
        } else if (origin && origin.includes('github.io')) {
            res.header('Access-Control-Allow-Origin', origin);
            console.log('✅ GitHub Pages Origin:', origin);
        } else {
            res.header('Access-Control-Allow-Origin', '*');
        }
    } else {
        res.header('Access-Control-Allow-Origin', 'https://brinsec.github.io');
    }
    
    // 强化CORS头
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 
        'Origin, X-Requested-With, Content-Type, Accept, Authorization, Content-Range, X-Total-Count, Cache-Control, Pragma'
    );
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400');
    
    // 处理预检请求
    if (req.method === 'OPTIONS') {
        console.log('🔄 处理OPTIONS请求');
        res.status(200).end();
        return;
    }
    
    next();
});

// 使用cors库作为backup，特别针对Vercel环境
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://brinsec.github.io',
        /^https:\/\/.*\.github\.io$/
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Origin', 
        'X-Requested-With', 
        'Content-Type', 
        'Accept', 
        'Authorization', 
        'Content-Range', 
        'X-Total-Count', 
        'Cache-Control', 
        'Pragma'
    ],
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
