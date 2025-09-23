# 多阶段构建
FROM node:18-alpine AS base

# 安装pnpm
RUN npm install -g pnpm

# 设置工作目录
WORKDIR /app

# 复制package文件
COPY package.json pnpm-lock.yaml ./
COPY client/package.json ./client/
COPY server/package.json ./server/

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建阶段
FROM base AS builder

# 构建客户端
WORKDIR /app/client
RUN pnpm run build

# 构建服务端
WORKDIR /app/server
RUN pnpm run build

# 生产阶段
FROM node:18-alpine AS production

# 安装pnpm
RUN npm install -g pnpm

WORKDIR /app

# 复制package文件
COPY package.json pnpm-lock.yaml ./
COPY client/package.json ./client/
COPY server/package.json ./server/

# 只安装生产依赖
RUN pnpm install --frozen-lockfile --prod

# 复制构建后的文件
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/src ./server/src

# 创建数据目录
RUN mkdir -p ./data

# 暴露端口
EXPOSE 3001

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3001

# 启动命令
CMD ["node", "server/dist/index.js"]
