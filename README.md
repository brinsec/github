# GitHub自动化系统

一个智能的GitHub项目管理工具，自动发现、分类和追踪GitHub项目。

## ✨ 功能特性

### 🔍 智能项目发现
- **自动发现新项目**：基于多种算法发现GitHub上的新项目和热门项目
- **多维度搜索**：支持按语言、时间、Star数等条件搜索
- **智能推荐**：基于技术栈和兴趣推荐相关项目

### 📊 项目分析
- **自动分类**：智能识别项目类型和技术栈
- **趋势分析**：追踪项目Star、Fork等指标变化
- **统计分析**：提供详细的项目统计和图表

### 🏆 排行榜系统
- **总榜排行**：综合所有时间段的热门项目
- **周度热门**：一周内上升最快的项目
- **月度热门**：一个月内最受欢迎的项目
- **季度热门**：一个季度内的热门项目

### ⏰ 定时任务
- **自动发现**：每6小时自动发现新项目
- **深度分析**：每天进行深度项目分析
- **定期更新**：自动更新项目数据和统计

## 🚀 快速开始

### 环境要求
- Node.js 18+
- pnpm 8+
- GitHub Personal Access Token

### 本地开发

1. **克隆项目**
```bash
git clone https://github.com/your-username/github-automation-system.git
cd github-automation-system
```

2. **安装依赖**
```bash
pnpm install
```

3. **配置环境变量**
```bash
# 创建 .env 文件
echo "GITHUB_TOKEN=your_github_token_here" > .env
```

4. **启动开发服务器**
```bash
pnpm run dev
```

5. **访问应用**
- 前端：http://localhost:3000
- 后端API：http://localhost:3001

### Docker部署

1. **使用Docker Compose**
```bash
# 设置环境变量
export GITHUB_TOKEN=your_github_token_here

# 启动服务
docker-compose up -d
```

2. **访问应用**
- 应用地址：http://localhost:80

## 📁 项目结构

```
github-automation-system/
├── client/                 # 前端React应用
│   ├── src/
│   │   ├── components/     # 组件
│   │   ├── pages/         # 页面
│   │   └── ...
│   └── package.json
├── server/                # 后端Node.js应用
│   ├── src/
│   │   ├── services/      # 服务层
│   │   ├── routes.ts      # 路由
│   │   └── ...
│   └── package.json
├── shared/                # 共享类型定义
├── .github/              # GitHub Actions
├── docker-compose.yml     # Docker配置
├── Dockerfile            # Docker镜像
└── README.md             # 项目文档
```

## 🔧 配置说明

### 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `GITHUB_TOKEN` | GitHub Personal Access Token | 必填 |
| `NODE_ENV` | 运行环境 | development |
| `DATABASE_PATH` | 数据库文件路径 | ./data/github_repos.json |
| `PORT` | 服务端口 | 3001 |

### GitHub Token权限

需要以下权限：
- `repo` - 访问仓库信息
- `user` - 访问用户信息
- `read:org` - 读取组织信息

## 🚀 部署指南

### GitHub Pages部署

1. **启用GitHub Pages**
   - 进入仓库设置
   - 选择Pages选项卡
   - 选择GitHub Actions作为源

2. **配置Secrets**
   - `GITHUB_TOKEN`: GitHub Personal Access Token

### Vercel部署

1. **连接Vercel**
   - 导入GitHub仓库到Vercel
   - 配置环境变量

2. **环境变量配置**
   ```
   GITHUB_TOKEN=your_github_token
   NODE_ENV=production
   ```

### Docker部署

1. **构建镜像**
```bash
docker build -t github-automation .
```

2. **运行容器**
```bash
docker run -d \
  -p 3001:3001 \
  -e GITHUB_TOKEN=your_token \
  -v $(pwd)/data:/app/data \
  github-automation
```

## 📊 API文档

### 热门项目API

- `GET /api/trending/weekly` - 获取周度热门项目
- `GET /api/trending/monthly` - 获取月度热门项目
- `GET /api/trending/quarterly` - 获取季度热门项目
- `GET /api/trending/overall` - 获取总榜

### 项目发现API

- `GET /api/discovery/projects` - 获取所有发现的项目
- `GET /api/discovery/stats` - 获取发现统计
- `POST /api/discovery/start` - 开始发现新项目

### 仓库管理API

- `GET /api/repositories` - 获取所有仓库
- `POST /api/sync/:username` - 同步用户仓库
- `GET /api/categories` - 获取所有分类

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [React](https://reactjs.org/) - 前端框架
- [Ant Design](https://ant.design/) - UI组件库
- [Node.js](https://nodejs.org/) - 后端运行时
- [GitHub API](https://docs.github.com/en/rest) - GitHub数据源

## 📞 联系方式

- 项目链接：[https://github.com/your-username/github-automation-system](https://github.com/your-username/github-automation-system)
- 问题反馈：[Issues](https://github.com/your-username/github-automation-system/issues)

---

⭐ 如果这个项目对你有帮助，请给它一个星标！