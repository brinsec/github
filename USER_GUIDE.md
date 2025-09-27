# 📖 GitHub 自动化系统使用指南

## 🚀 快速开始

### 访问应用
- **前端应用**: https://brinsec.github.io/github-automation-system/
- **API 文档**: https://github-1svkvp049-brinsecs-projects.vercel.app/api/health

### 主要功能
1. **仓库管理** - 查看和分类您的 GitHub 仓库
2. **智能分类** - 自动按技术栈分类仓库
3. **统计分析** - 查看仓库统计和趋势
4. **热门发现** - 发现和关注热门项目

## 📱 界面导航

### 主页面
- **仪表板** - 系统概览和快速统计
- **仓库列表** - 查看所有已同步的仓库
- **分类管理** - 管理仓库分类规则
- **统计分析** - 详细的统计图表

### 功能页面
- **趋势页面** - 查看热门项目趋势
- **项目发现** - 发现新的热门项目
- **搜索数据库** - 搜索和分析项目数据
- **调度管理** - 管理自动任务

## ⚙️ 配置设置

### GitHub Token 配置
1. 访问 GitHub → Settings → Developer settings → Personal access tokens
2. 生成新的 token，勾选 `repo` 权限
3. 在系统设置中配置 token

### 数据库配置
- **开发环境**: 使用本地 SQLite 文件
- **生产环境**: 使用 Vercel 内存数据库

## 🔧 开发指南

### 本地开发
```bash
# 克隆仓库
git clone https://github.com/brinsec/github.git
cd github

# 安装依赖
pnpm run install:all

# 启动开发服务器
pnpm run dev
```

### 环境变量
创建 `.env` 文件：
```env
GITHUB_TOKEN=your_github_token_here
DATABASE_PATH=./data/github_repos.json
```

### 项目结构
```
├── client/          # React 前端应用
├── server/          # Node.js 后端服务
├── shared/          # 共享类型定义
├── api/             # Vercel API 入口
└── scripts/         # 部署和工具脚本
```

## 📊 API 使用

### 基础端点
- `GET /api/health` - 健康检查
- `GET /api/test` - 测试端点

### 数据端点
- `GET /api/repositories` - 获取仓库列表
- `GET /api/categories` - 获取分类列表
- `GET /api/statistics` - 获取统计信息

### 操作端点
- `POST /api/sync/:username` - 同步用户仓库
- `POST /api/classify` - 执行自动分类

## 🚀 部署指南

### 自动部署
推送代码到 main 分支会自动触发部署：
- 前端自动部署到 GitHub Pages
- 后端自动部署到 Vercel

### 手动部署
```bash
# 部署前端到 GitHub Pages
git subtree push --prefix=client/dist origin gh-pages

# 部署后端到 Vercel
vercel --prod
```

### 验证部署
```bash
# 运行部署验证
node scripts/verify-deployment.js
```

## 🛠️ 故障排除

### 常见问题

#### 1. 页面无法加载
- 检查 GitHub Pages 设置
- 清除浏览器缓存
- 等待 5-10 分钟让 GitHub Pages 更新

#### 2. API 连接失败
- 检查 CORS 配置
- 验证 Vercel 部署状态
- 查看浏览器控制台错误

#### 3. 数据同步失败
- 检查 GitHub Token 配置
- 确认 Token 权限设置
- 查看服务器日志

### 调试工具
```bash
# 查看构建状态
pnpm run build

# 验证部署状态
node scripts/verify-deployment.js

# 检查 API 健康状态
curl https://github-1svkvp049-brinsecs-projects.vercel.app/api/health
```

## 📈 功能扩展

### 添加新功能
1. 在 `client/src/pages/` 创建新页面
2. 在 `server/src/routes.ts` 添加 API 路由
3. 更新导航菜单
4. 测试和部署

### 自定义分类规则
编辑 `server/src/database.ts` 中的默认分类：
```typescript
const defaultCategories: Category[] = [
    {
        id: 'your-category',
        name: '您的分类',
        description: '分类描述',
        color: '#FF5733',
        criteria: {
            languages: ['JavaScript', 'TypeScript'],
            keywords: ['your-keyword'],
            topics: ['your-topic']
        }
    }
];
```

## 🔒 安全考虑

### GitHub Token 安全
- 定期轮换 Token
- 使用最小权限原则
- 不要在代码中硬编码 Token

### 数据隐私
- 本地数据存储在本地文件系统
- 生产环境使用内存数据库
- 不存储敏感用户信息

## 📞 支持

### 获取帮助
- 查看项目文档
- 检查 GitHub Issues
- 查看部署日志

### 贡献代码
1. Fork 仓库
2. 创建功能分支
3. 提交 Pull Request
4. 等待代码审查

---

**版本**: 1.0.0  
**最后更新**: 2024年9月  
**维护者**: GitHub 自动化系统团队
