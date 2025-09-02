# Makefile for Foundation Sprint

# 变量定义
DOCKER_COMPOSE = docker-compose
DOCKER_BUILDX = docker buildx
PLATFORM = linux/amd64

# 颜色输出
RED = \033[0;31m
GREEN = \033[0;32m
YELLOW = \033[0;33m
NC = \033[0m # No Color

.PHONY: help
help: ## 显示帮助信息
	@echo "Foundation Sprint - Docker 构建和管理"
	@echo ""
	@echo "可用命令:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

.PHONY: build
build: ## 构建所有镜像 (linux/amd64)
	@echo "$(YELLOW)构建镜像 (平台: $(PLATFORM))...$(NC)"
	$(DOCKER_COMPOSE) build --platform $(PLATFORM)

.PHONY: build-frontend
build-frontend: ## 构建前端镜像
	@echo "$(YELLOW)构建前端镜像...$(NC)"
	$(DOCKER_COMPOSE) build --platform $(PLATFORM) frontend

.PHONY: build-backend
build-backend: ## 构建后端镜像
	@echo "$(YELLOW)构建后端镜像...$(NC)"
	$(DOCKER_COMPOSE) build --platform $(PLATFORM) backend

.PHONY: up
up: ## 启动所有服务
	@echo "$(GREEN)启动所有服务...$(NC)"
	$(DOCKER_COMPOSE) up -d

.PHONY: up-dev
up-dev: ## 启动开发环境
	@echo "$(GREEN)启动开发环境...$(NC)"
	$(DOCKER_COMPOSE) -f docker-compose.yml -f docker-compose.dev.yml --profile dev up

.PHONY: down
down: ## 停止所有服务
	@echo "$(RED)停止所有服务...$(NC)"
	$(DOCKER_COMPOSE) down

.PHONY: restart
restart: down up ## 重启所有服务

.PHONY: logs
logs: ## 查看所有服务日志
	$(DOCKER_COMPOSE) logs -f

.PHONY: logs-backend
logs-backend: ## 查看后端日志
	$(DOCKER_COMPOSE) logs -f backend

.PHONY: logs-frontend
logs-frontend: ## 查看前端日志
	$(DOCKER_COMPOSE) logs -f frontend

.PHONY: ps
ps: ## 查看服务状态
	$(DOCKER_COMPOSE) ps

.PHONY: exec-backend
exec-backend: ## 进入后端容器
	$(DOCKER_COMPOSE) exec backend sh

.PHONY: exec-frontend
exec-frontend: ## 进入前端容器
	$(DOCKER_COMPOSE) exec frontend sh

.PHONY: exec-db
exec-db: ## 进入数据库容器
	$(DOCKER_COMPOSE) exec postgres psql -U foundation -d foundation_sprint

.PHONY: clean
clean: ## 清理所有容器和卷
	@echo "$(RED)清理容器和卷...$(NC)"
	$(DOCKER_COMPOSE) down -v

.PHONY: prune
prune: ## 清理 Docker 系统
	@echo "$(RED)清理 Docker 系统...$(NC)"
	docker system prune -af --volumes

.PHONY: migrate-up
migrate-up: ## 运行数据库迁移
	@echo "$(GREEN)运行数据库迁移...$(NC)"
	$(DOCKER_COMPOSE) exec backend go run ./cmd/migrate up

.PHONY: migrate-down
migrate-down: ## 回滚数据库迁移
	@echo "$(YELLOW)回滚数据库迁移...$(NC)"
	$(DOCKER_COMPOSE) exec backend go run ./cmd/migrate down

.PHONY: test
test: ## 运行测试
	@echo "$(GREEN)运行测试...$(NC)"
	$(DOCKER_COMPOSE) exec backend go test ./...
	$(DOCKER_COMPOSE) exec frontend npm test

.PHONY: lint
lint: ## 运行代码检查
	@echo "$(YELLOW)运行代码检查...$(NC)"
	$(DOCKER_COMPOSE) exec backend go fmt ./...
	$(DOCKER_COMPOSE) exec backend go vet ./...
	$(DOCKER_COMPOSE) exec frontend npm run lint

.PHONY: env
env: ## 从示例创建环境变量文件
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "$(GREEN)已创建 .env 文件，请编辑并填写实际值$(NC)"; \
	else \
		echo "$(YELLOW).env 文件已存在$(NC)"; \
	fi

.PHONY: backup
backup: ## 备份数据库
	@echo "$(GREEN)备份数据库...$(NC)"
	@mkdir -p backups
	$(DOCKER_COMPOSE) exec postgres pg_dump -U foundation foundation_sprint | gzip > backups/backup_$$(date +%Y%m%d_%H%M%S).sql.gz
	@echo "$(GREEN)备份完成$(NC)"

.PHONY: restore
restore: ## 恢复数据库 (使用最新备份)
	@echo "$(YELLOW)恢复数据库...$(NC)"
	@if [ -z "$$(ls -A backups 2>/dev/null)" ]; then \
		echo "$(RED)没有找到备份文件$(NC)"; \
	else \
		gunzip -c backups/$$(ls -t backups | head -1) | $(DOCKER_COMPOSE) exec -T postgres psql -U foundation foundation_sprint; \
		echo "$(GREEN)恢复完成$(NC)"; \
	fi

.PHONY: push
push: ## 推送镜像到注册表
	@echo "$(GREEN)推送镜像...$(NC)"
	$(DOCKER_COMPOSE) push

# 默认目标
.DEFAULT_GOAL := help