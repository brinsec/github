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

// 中间件
app.use(cors());
app.use(express.json());

// 初始化数据库并启动服务器
async function startServer() {
    try {
        await initializeDatabase();
        console.log('✅ 数据库初始化完成');
        
        // 设置路由
        setupRoutes(app);
        
        // 启动服务器
        app.listen(PORT, () => {
            console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
            console.log(`📊 GitHub自动化系统已启动`);
        });
    } catch (error) {
        console.error('❌ 服务器启动失败:', error);
        process.exit(1);
    }
}

startServer();

export default app;
