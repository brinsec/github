import app from '../server/src/index';
import { initializeDatabase } from '../server/src/database';

// Vercel环境配置检查  
console.log('🚀 Vercel环境检测:', {
    isVercel: !!process.env.VERCEL,
    githubToken: !!process.env.GITHUB_TOKEN ? '已设置' : '未设置',
    nodeEnv: process.env.NODE_ENV || '未设置'
});

// 在Vercel环境下，延迟初始化数据库以防止冷启动时的错误
if (process.env.VERCEL) {
    try {
        initializeDatabase().catch(error => {
            console.error('数据库初始化失败，继续运行:', error);
        });
    } catch (error) {
        console.error('启动时数据库错误，但有备份:', error);
    }
} else {
    initializeDatabase().catch(console.error);
}

// 导出应用
export default app;