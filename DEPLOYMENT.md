# 部署指南

本文档介绍如何将GitHub自动化系统部署到各种平台。

## 🚀 部署选项

### 1. GitHub Pages (免费)

**适用场景**：静态网站展示，适合前端演示

**步骤**：

1. **启用GitHub Pages**
   ```bash
   # 推送代码到GitHub
   git add .
   git commit -m "Add GitHub Pages support"
   git push origin main
   ```

2. **配置GitHub Actions**
   - 进入仓库设置 → Pages
   - 选择 "GitHub Actions" 作为源
   - 系统会自动使用 `.github/workflows/deploy.yml`

3. **设置环境变量**
   - 进入仓库设置 → Secrets and variables → Actions
   - 添加 `GITHUB_TOKEN` secret

4. **访问网站**
   - 地址：`https://your-username.github.io/github-automation-system`

### 2. Vercel (推荐)

**适用场景**：全栈应用，支持API和数据库

**步骤**：

1. **安装Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **部署**
   ```bash
   # 登录Vercel
   vercel login
   
   # 部署项目
   vercel
   
   # 生产环境部署
   vercel --prod
   ```

3. **配置环境变量**
   - 在Vercel Dashboard中添加环境变量：
     - `GITHUB_TOKEN`: 你的GitHub Token
     - `NODE_ENV`: production

4. **自动部署**
   - 连接GitHub仓库到Vercel
   - 每次push到main分支自动部署

### 3. Netlify

**适用场景**：静态网站 + 无服务器函数

**步骤**：

1. **构建配置**
   ```toml
   # netlify.toml
   [build]
     command = "pnpm run build:github-pages"
     publish = "client/dist"
   
   [build.environment]
     NODE_VERSION = "18"
   
   [[redirects]]
     from = "/api/*"
     to = "/.netlify/functions/:splat"
     status = 200
   ```

2. **部署**
   - 连接GitHub仓库到Netlify
   - 设置构建命令：`pnpm run build:github-pages`
   - 设置发布目录：`client/dist`

### 4. Docker部署

**适用场景**：自托管服务器

**步骤**：

1. **构建镜像**
   ```bash
   docker build -t github-automation .
   ```

2. **运行容器**
   ```bash
   docker run -d \
     --name github-automation \
     -p 3001:3001 \
     -e GITHUB_TOKEN=your_token \
     -v $(pwd)/data:/app/data \
     github-automation
   ```

3. **使用Docker Compose**
   ```bash
   # 设置环境变量
   export GITHUB_TOKEN=your_github_token
   
   # 启动服务
   docker-compose up -d
   ```

### 5. 云服务器部署

**适用场景**：VPS、云服务器

**步骤**：

1. **准备服务器**
   ```bash
   # 安装Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # 安装pnpm
   npm install -g pnpm
   
   # 安装Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   ```

2. **部署应用**
   ```bash
   # 克隆项目
   git clone https://github.com/your-username/github-automation-system.git
   cd github-automation-system
   
   # 安装依赖
   pnpm install:all
   
   # 构建项目
   pnpm run build
   
   # 启动服务
   pnpm run start
   ```

3. **配置Nginx**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3001;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

## 🔧 环境配置

### 必需的环境变量

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `GITHUB_TOKEN` | GitHub Personal Access Token | `ghp_xxxxxxxxxxxx` |
| `NODE_ENV` | 运行环境 | `production` |
| `DATABASE_PATH` | 数据库文件路径 | `./data/github_repos.json` |
| `PORT` | 服务端口 | `3001` |

### GitHub Token权限

创建GitHub Token时需要以下权限：
- ✅ `repo` - 访问仓库信息
- ✅ `user` - 访问用户信息  
- ✅ `read:org` - 读取组织信息

## 📊 监控和维护

### 健康检查

访问 `/api/health` 端点检查服务状态：

```bash
curl https://your-domain.com/api/health
```

### 日志监控

```bash
# Docker日志
docker logs github-automation

# 系统日志
journalctl -u github-automation
```

### 数据备份

```bash
# 备份数据库
cp data/github_repos.json backup/github_repos_$(date +%Y%m%d).json

# 自动备份脚本
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
cp data/github_repos.json "backup/github_repos_$DATE.json"
find backup/ -name "github_repos_*.json" -mtime +7 -delete
```

## 🚨 故障排除

### 常见问题

1. **API请求失败**
   - 检查GitHub Token是否有效
   - 确认Token权限设置正确
   - 检查网络连接

2. **数据库错误**
   - 确认数据目录权限
   - 检查磁盘空间
   - 验证JSON文件格式

3. **构建失败**
   - 检查Node.js版本
   - 确认依赖安装完整
   - 查看构建日志

### 性能优化

1. **启用缓存**
   ```javascript
   // 在API响应中添加缓存头
   res.setHeader('Cache-Control', 'public, max-age=3600');
   ```

2. **数据库优化**
   ```javascript
   // 定期清理旧数据
   const cleanupOldData = () => {
     // 删除30天前的数据
   };
   ```

3. **CDN配置**
   ```javascript
   // 静态资源使用CDN
   const CDN_URL = 'https://cdn.your-domain.com';
   ```

## 📈 扩展部署

### 负载均衡

```yaml
# docker-compose.yml
version: '3.8'
services:
  app1:
    build: .
    environment:
      - NODE_ENV=production
  app2:
    build: .
    environment:
      - NODE_ENV=production
  nginx:
    image: nginx
    ports:
      - "80:80"
    volumes:
      - ./nginx-lb.conf:/etc/nginx/nginx.conf
```

### 数据库升级

```javascript
// 迁移脚本
const migrateDatabase = async () => {
  // 从JSON文件迁移到PostgreSQL
  // 或升级数据结构
};
```

---

💡 **提示**：选择部署方式时，考虑你的需求、预算和技术栈。对于个人项目，推荐使用Vercel或GitHub Pages；对于企业应用，推荐使用Docker或云服务器。
