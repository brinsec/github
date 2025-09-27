import app from '../server/src/index';
import { initializeDatabase } from '../server/src/database';

// Vercel环境检测
console.log('🚀 Vercel环境检测:', {
    isVercel: !!process.env.VERCEL,
    githubToken: !!process.env.GITHUB_TOKEN ? '已设置' : '未设置',
    nodeEnv: process.env.NODE_ENV || '未设置'
});

// 初始化数据库
initializeDatabase().catch(error => {
    console.error('数据库初始化失败:', error);
});

// 导出应用
export default app;