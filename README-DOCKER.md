# Docker 部署指南

## 快速开始

### 1. 环境准备

```bash
# 创建环境变量文件
make env

# 编辑 .env 文件，填写必要的配置
# 特别是 OPENAI_API_KEY
```

### 2. 构建和启动

```bash
# 构建所有镜像 (针对 linux/amd64)
make build

# 启动所有服务
make up

# 查看服务状态
make ps
```

服务将在以下端口运行：
- 前端: http://localhost
- 后端 API: http://localhost:8080
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- Adminer (开发环境): http://localhost:8081

## 开发环境

```bash
# 启动开发环境（包含热重载）
make up-dev

# 查看日志
make logs

# 进入容器调试
make exec-backend  # 进入后端容器
make exec-frontend # 进入前端容器
make exec-db      # 进入数据库
```

## 生产部署

### 在 Mac M4 上构建 linux/amd64 镜像

```bash
# 使用 docker buildx 构建多平台镜像
docker buildx create --use --name mybuilder

# 构建并推送到镜像仓库
docker buildx build --platform linux/amd64 \
  -t your-registry/foundation-frontend:latest \
  --push ./frontend

docker buildx build --platform linux/amd64 \
  -t your-registry/foundation-backend:latest \
  --push ./backend
```

### 使用 docker-compose 构建

```bash
# 指定平台构建
DOCKER_DEFAULT_PLATFORM=linux/amd64 docker-compose build

# 或者直接使用 Makefile
make build  # 已配置为 linux/amd64
```

## 常用命令

```bash
# 查看所有可用命令
make help

# 重启服务
make restart

# 查看后端日志
make logs-backend

# 运行测试
make test

# 代码检查
make lint

# 备份数据库
make backup

# 恢复数据库
make restore

# 清理所有容器和卷
make clean
```

## 环境变量说明

```env
# 数据库配置
POSTGRES_PASSWORD=foundation123  # PostgreSQL 密码
POSTGRES_DB=foundation_sprint     # 数据库名
POSTGRES_USER=foundation          # 数据库用户

# Redis 配置
REDIS_PASSWORD=redis123           # Redis 密码

# 后端配置
GIN_MODE=release                  # Gin 框架模式 (debug/release)
JWT_SECRET=your-secret-key        # JWT 密钥（生产环境请更改）
OPENAI_API_KEY=sk-xxx             # OpenAI API 密钥（必需）

# CORS 配置
CORS_ORIGINS=http://localhost:3000,http://localhost

# 前端配置
VITE_API_URL=http://localhost:8080  # API 地址
```

## 故障排查

### 1. 构建失败
```bash
# 清理 Docker 缓存
docker system prune -af

# 重新构建
make clean
make build
```

### 2. 端口占用
```bash
# 检查端口占用
lsof -i :80
lsof -i :8080
lsof -i :5432

# 修改 docker-compose.yml 中的端口映射
```

### 3. 数据库连接失败
```bash
# 检查数据库状态
docker-compose ps postgres

# 查看数据库日志
docker-compose logs postgres

# 手动连接测试
make exec-db
```

### 4. Mac M4 平台问题
```bash
# 确保指定了正确的平台
export DOCKER_DEFAULT_PLATFORM=linux/amd64

# 或在每个命令中指定
docker build --platform linux/amd64 ...
```

## 性能优化

### 1. 构建优化
- 使用多阶段构建减小镜像体积
- 利用构建缓存加速重复构建
- 前端静态资源使用 Nginx 服务

### 2. 运行优化
- 配置合理的资源限制
- 使用健康检查确保服务稳定
- 启用 Gzip 压缩减少传输大小

### 3. 数据库优化
- 定期备份数据
- 配置连接池
- 使用 Redis 缓存热数据

## 安全建议

1. **生产环境必须更改默认密码**
2. **使用 HTTPS 证书**
3. **限制数据库外部访问**
4. **定期更新依赖和基础镜像**
5. **配置防火墙规则**
6. **使用 secrets 管理敏感信息**

## 监控和日志

```bash
# 实时查看所有日志
make logs

# 导出日志到文件
docker-compose logs > logs.txt

# 使用 Docker 统计信息
docker stats

# 健康检查状态
docker-compose ps
```

## 升级和维护

```bash
# 拉取最新代码
git pull

# 重新构建镜像
make build

# 平滑重启
docker-compose up -d --no-deps --build backend
docker-compose up -d --no-deps --build frontend
```