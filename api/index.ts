import app from '../server/src/index';
import { initializeDatabase } from '../server/src/database';

// 初始化数据库
initializeDatabase().catch(console.error);

export default app;
