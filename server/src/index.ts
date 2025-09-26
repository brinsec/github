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

// 中间件 - 配置CORS允许GitHub Pages域名
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:5173', 
        'https://brinsec.github.io',
        /^https:\/\/.*\.github\.io$/
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 添加全局CORS头
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://brinsec.github.io');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    next();
});

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
