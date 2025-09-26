"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const database_1 = require("./database");
const routes_1 = require("./routes");
// 加载环境变量
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// 中间件 - 为所有环境配置宽松的CORS
app.use((req, res, next) => {
    const origin = req.headers.origin;
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
            }
            else if (allowed instanceof RegExp && allowed.test(origin)) {
                isAllowed = true;
                break;
            }
        }
    }
    // 设置CORS响应头 - 强化处理
    if (isAllowed && origin) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    else {
        res.header('Access-Control-Allow-Origin', 'https://brinsec.github.io');
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Content-Range, X-Total-Count');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '3600');
    // 处理预检请求
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    next();
});
// 使用cors库作为backup  
app.use((0, cors_1.default)({
    origin: true,
    credentials: true
}));
app.use(express_1.default.json());
// 初始化数据库并启动服务器
// 设置路由
(0, routes_1.setupRoutes)(app);
// 启动服务器
async function startServer() {
    try {
        await (0, database_1.initializeDatabase)();
        console.log('✅ 数据库初始化完成');
        // 启动服务器（仅在非Vercel环境）
        if (!process.env.VERCEL) {
            app.listen(PORT, () => {
                console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
                console.log(`📊 GitHub自动化系统已启动`);
            });
        }
    }
    catch (error) {
        console.error('❌ 服务器启动失败:', error);
        if (!process.env.VERCEL) {
            process.exit(1);
        }
    }
}
if (process.env.VERCEL) {
    // Vercel环境，直接初始化数据库
    (0, database_1.initializeDatabase)().catch(console.error);
}
else {
    // 本地环境，启动服务器
    startServer();
}
exports.default = app;
//# sourceMappingURL=index.js.map