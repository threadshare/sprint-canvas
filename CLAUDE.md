# Foundation Sprint - Claude Code 项目配置

## 项目概述
这是一个基于 Google Ventures Foundation Sprint 方法论的产品，帮助创始团队在 10 小时内达成核心战略共识。项目采用 React + Golang 技术栈，强调简洁、健壮、用户友好的设计理念。

## 产品设计原则

### 1. 纸质卡片美学
- **视觉风格**：模拟真实纸质卡片，带有轻微阴影和纸张质感
- **交互方式**：支持拖拽、翻转、堆叠等物理隐喻
- **颜色方案**：温暖的米白色背景，手写风格的深蓝色文字
- **动画效果**：平滑但不过度，模拟真实物理运动

### 2. 用户体验优先
- **引导式流程**：每一步都有清晰的指引，降低学习成本
- **即时反馈**：所有操作都有视觉和听觉反馈
- **容错设计**：支持撤销、自动保存、历史版本
- **无障碍设计**：支持键盘导航和屏幕阅读器

### 3. 协作为核心
- **实时同步**：多人操作无延迟感知
- **独立思考空间**：Note and Vote 机制保证独立性
- **决策透明**：所有决策过程可追溯
- **角色区分**：不同权限的清晰界定

## 技术实现原则

### 前端开发规范

#### React 组件设计
```typescript
// 组件应该小而专注
// 优先使用函数组件和 Hooks
// 使用 TypeScript 确保类型安全

// 好的例子
const CardStack = ({ cards, onCardClick }: CardStackProps) => {
  // 单一职责，只负责卡片堆叠展示
}

// 避免过度设计
// 不要创建过多抽象层
```

#### ShadcnUI 使用
- 优先使用 ShadcnUI 提供的基础组件
- 定制化时保持一致的设计语言
- 使用 CSS 变量管理主题

#### TailwindCSS 规范
```css
/* 使用语义化的类名组合 */
.card-paper {
  @apply bg-amber-50 shadow-sm rounded-lg p-6 
         border border-amber-100 transition-shadow
         hover:shadow-md;
}

/* 避免过长的内联类名 */
/* 抽取常用组合为组件类 */
```

#### 状态管理
- 局部状态用 useState
- 跨组件状态用 Context API
- 复杂状态用 useReducer
- 避免过早引入 Redux 等重量级方案

### 后端开发规范

#### Golang 哲学
```go
// 简单优于复杂
// 明确优于隐晦
// 组合优于继承

// 好的接口设计
type SprintService interface {
    CreateSprint(ctx context.Context, input CreateSprintInput) (*Sprint, error)
    // 方法少而精，参数明确
}

// 错误处理要明确
if err != nil {
    return fmt.Errorf("failed to create sprint: %w", err)
}
```

#### Gin 框架使用
- RESTful API 设计
- 中间件链式调用
- 统一的错误处理
- 请求验证和响应格式化

#### 项目结构
```
backend/
├── cmd/api/          # 应用入口
├── internal/         # 内部包
│   ├── models/      # 数据模型
│   ├── services/    # 业务逻辑
│   ├── handlers/    # HTTP 处理器
│   └── websocket/   # WebSocket 处理
└── pkg/             # 可复用包
```

### 数据库设计
```sql
-- 保持简单的表结构
-- 避免过度正规化
-- 合理使用索引

CREATE TABLE sprints (
    id UUID PRIMARY KEY,
    team_id UUID NOT NULL,
    phase VARCHAR(50) NOT NULL,
    data JSONB, -- 灵活存储阶段数据
    created_at TIMESTAMP DEFAULT NOW()
);
```

## AI 集成策略

### Sub-Agents 实现
```typescript
// 每个 Agent 是独立的服务
interface Agent {
  name: string
  prompt: string
  process(input: string): Promise<AgentResponse>
}

// 使用 OpenAI Function Calling
// 结构化输入输出
// 流式响应提升体验
```

### 提示工程原则
- 明确的角色定义
- 结构化的输出格式
- 上下文注入
- 错误处理和重试机制

## 开发工作流

### 本地开发
```bash
# 前端开发
cd frontend
npm run dev  # 启动开发服务器

# 后端开发
cd backend
go run cmd/api/main.go  # 启动 API 服务

# 数据库
docker-compose up -d postgres  # 使用 Docker 运行数据库
```

### 代码质量
```bash
# 前端
npm run lint      # ESLint 检查
npm run type-check # TypeScript 检查
npm run test      # 单元测试

# 后端
go fmt ./...      # 格式化代码
go vet ./...      # 静态分析
go test ./...     # 运行测试
```

### Git 工作流
- main 分支保持稳定
- feature/* 分支开发新功能
- fix/* 分支修复问题
- 使用 PR 进行代码审查
- Commit 信息要清晰明确

## 部署和运维

### 容器化
```dockerfile
# 多阶段构建，减小镜像体积
# 前端构建产物通过 Nginx 服务
# 后端编译为单一二进制文件
```

### 监控和日志
- 结构化日志（JSON 格式）
- 分布式追踪（OpenTelemetry）
- 性能监控（Prometheus + Grafana）
- 错误跟踪（Sentry）

## 安全考虑

### 认证和授权
- JWT Token 认证
- 基于角色的访问控制（RBAC）
- Session 管理
- Rate Limiting

### 数据安全
- HTTPS 加密传输
- 敏感数据加密存储
- SQL 注入防护
- XSS/CSRF 防护

## 性能优化

### 前端性能
- 代码分割和懒加载
- 图片优化和 CDN
- Service Worker 缓存
- Virtual Scrolling

### 后端性能
- 数据库查询优化
- Redis 缓存层
- 连接池管理
- 异步处理

## 测试策略

### 单元测试
- 核心业务逻辑 100% 覆盖
- 使用 Mock 隔离依赖
- 表格驱动测试（Golang）

### 集成测试
- API 端到端测试
- WebSocket 连接测试
- 数据库事务测试

### E2E 测试
- 关键用户流程
- 多浏览器兼容性
- 性能基准测试

## 文档规范

### 代码注释
```go
// SprintService 处理 Sprint 相关的业务逻辑
// 遵循单一职责原则，只处理 Sprint 的创建、更新、查询
type SprintService struct {
    repo SprintRepository
    // ...
}
```

### API 文档
- 使用 OpenAPI/Swagger 规范
- 提供请求和响应示例
- 错误码说明

### 用户文档
- 快速开始指南
- 功能说明
- 最佳实践
- 常见问题

## 常用命令速查

### 开发环境
```bash
# 安装依赖
make install

# 启动所有服务
make dev

# 运行测试
make test

# 构建生产版本
make build

# 清理构建产物
make clean
```

### 数据库操作
```bash
# 运行迁移
make migrate-up

# 回滚迁移
make migrate-down

# 创建新迁移
make migration name=add_users_table
```

### Docker 操作
```bash
# 构建镜像
docker build -t foundation-sprint .

# 运行容器
docker-compose up

# 查看日志
docker-compose logs -f api
```

## 故障排查

### 常见问题
1. WebSocket 连接失败
   - 检查 CORS 配置
   - 确认防火墙规则
   - 查看 Nginx 代理配置

2. 数据同步延迟
   - 检查 Redis 连接
   - 优化数据库查询
   - 考虑使用 CDC

3. AI 响应超时
   - 实现重试机制
   - 使用流式响应
   - 设置合理的超时时间

## 团队协作

### 代码审查清单
- [ ] 代码符合项目规范
- [ ] 有适当的测试覆盖
- [ ] 文档已更新
- [ ] 没有安全漏洞
- [ ] 性能影响已评估

### 发布流程
1. 创建 Release PR
2. 运行完整测试套件
3. 更新 CHANGELOG
4. 打 Tag 并发布
5. 部署到生产环境
6. 监控关键指标

## 核心理念总结

**不要过度设计** - 从简单开始，根据需要演进
**保持一致性** - 代码风格、命名规范、架构模式
**用户至上** - 每个决策都要考虑用户体验
**持续改进** - 定期回顾和优化

记住：我们的目标是帮助创始团队快速达成共识并验证想法，技术只是实现这个目标的工具。保持简单、保持专注、保持迭代。