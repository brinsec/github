# Vercel 部署指南

## 当前问题诊断

您的 Vercel API 出现 500 错误，可能的原因包括：

1. **依赖问题**：缺少必要的依赖包
2. **TypeScript 编译问题**：Vercel 无法正确编译 TypeScript
3. **入口文件问题**：API 入口文件配置不正确
4. **环境变量问题**：缺少必要的环境变量

## 已修复的问题

### ✅ 1. 添加了必要的依赖
在根目录的 `package.json` 中添加了：
- `express`: Web 框架
- `@types/express`: TypeScript 类型定义
- `@types/node`: Node.js 类型定义
- `typescript`: TypeScript 编译器

### ✅ 2. 创建了 TypeScript 配置
添加了 `tsconfig.json` 文件，配置了正确的编译选项。

### ✅ 3. 创建了简化的健康检查端点
- `api/health.ts`: 使用 Vercel 标准格式的简单端点
- 移除了复杂的依赖和初始化

### ✅ 4. 优化了 Vercel 配置
更新了 `vercel.json`，添加了：
- 正确的构建配置
- 路由配置
- 函数超时设置

## 部署步骤

### 方法 1: 通过 Vercel CLI（推荐）

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 登录 Vercel
vercel login

# 3. 部署到生产环境
vercel --prod
```

### 方法 2: 通过 GitHub 集成

1. 将代码推送到 GitHub 仓库
2. 在 Vercel 控制台连接 GitHub 仓库
3. 自动部署

## 测试端点

部署成功后，测试以下端点：

1. **健康检查**：
   ```
   https://your-project.vercel.app/api/health
   ```

2. **如果健康检查成功，再测试其他端点**：
   ```
   https://your-project.vercel.app/api/test
   ```

## 环境变量设置

在 Vercel 控制台设置以下环境变量：

- `GITHUB_TOKEN`: 您的 GitHub Personal Access Token
- `NODE_ENV`: `production`

## 故障排除

### 如果仍然出现 500 错误：

1. **检查 Vercel 控制台的函数日志**
2. **确认环境变量已正确设置**
3. **检查构建日志是否有编译错误**

### 如果健康检查端点工作正常：

说明基本配置正确，可以逐步添加更多功能。

## 下一步

一旦基本 API 工作正常，我们可以：

1. 逐步添加真实的 GitHub API 集成
2. 添加数据库功能
3. 完善错误处理
4. 添加更多 API 端点

## 联系支持

如果问题仍然存在，请提供：
- Vercel 控制台的错误日志
- 具体的错误信息
- 部署配置截图
