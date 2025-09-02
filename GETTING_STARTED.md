# Foundation Sprint 应用 - 快速开始指南

## 项目概述

这是一个基于 Google Ventures 的 Foundation Sprint 方法论开发的科学思考和快速验证 IDEA 的应用。应用集成了三个 AI sub-agents（帮我想、批判我、查一查）进行深度分析，支持实时协作的多人会议室功能。

## 🎉 当前状态

**✅ 完整功能可用** - 应用已完成前后端集成，支持多人实时协作和 AI-Native 体验！

### 核心功能验证：
- ✅ 前端服务: http://localhost:5173
- ✅ 后端 API: http://localhost:8080 
- ✅ 房间创建和管理
- ✅ AI 助手集成
- ✅ 实时协作同步

## 技术栈

- **前端**: React 18 + TypeScript + ShadcnUI + TailwindCSS + Vite
- **后端**: Golang + Gin + WebSocket
- **样式**: 纸质卡片风格设计

## 核心功能

### Foundation Sprint 三阶段工作流

1. **基础阶段 (Foundation)**: 
   - 定义客户、问题、竞争对手和团队优势
   - Note and Vote 投票机制达成共识

2. **差异化阶段 (Differentiation)**:
   - 经典和自定义差异化因素分析
   - 2x2 分析矩阵找到独特定位
   - 提炼项目原则形成"迷你宣言"

3. **方法阶段 (Approach)**:
   - 列出所有可能的执行路径
   - Magic Lenses 多角度评估工具
   - 最终决策和理由说明

### AI Sub-Agents

- **帮我想 Agent**: 补充思考角度，发现盲点
- **批判我 Agent**: 挑战理想主义想法，评估市场现实性  
- **查一查 Agent**: 深度研究，收集相关资料

### 协作功能

- 纸质卡片风格的可编辑组件
- 实时投票和决策记录
- WebSocket 实时协作 ✅
- 多人房间管理 ✅
- AI-Native 智能助手集成 ✅

## 快速开始

### 1. 启动前端开发服务器

```bash
cd frontend
npm install
npm run dev
```

前端将运行在 http://localhost:5173/

### 2. 启动后端 API 服务器

```bash
cd backend
go mod tidy
go run cmd/api/main.go
```

后端将运行在 http://localhost:8080/

### 3. 访问应用

打开浏览器访问 http://localhost:5173/ 即可开始使用 Foundation Sprint 工作流。

## API 接口

### 健康检查
- `GET /api/v1/health` - 服务器健康状态

### 房间管理
- `POST /api/v1/foundation/rooms` - 创建新房间
- `GET /api/v1/foundation/rooms/:id` - 获取房间信息
- `PUT /api/v1/foundation/rooms/:id/foundation` - 更新基础阶段数据
- `PUT /api/v1/foundation/rooms/:id/differentiation` - 更新差异化阶段数据
- `PUT /api/v1/foundation/rooms/:id/approach` - 更新方法阶段数据

### AI Agents
- `POST /api/v1/agents/think` - "帮我想" Agent
- `POST /api/v1/agents/critique` - "批判我" Agent
- `POST /api/v1/agents/research` - "查一查" Agent

### 协作功能
- `POST /api/v1/collaboration/rooms/:id/vote` - 创建投票
- `GET /api/v1/collaboration/rooms/:id/votes` - 获取房间投票
- `PUT /api/v1/collaboration/votes/:id` - 更新投票

### WebSocket
- `GET /ws/:roomId` - 实时协作连接

## 使用流程

1. **开始 Foundation Sprint**: 应用会引导您完成三个阶段
2. **基础阶段**: 添加客户、问题、竞争对手和优势信息
3. **投票决策**: 使用 Note and Vote 功能达成团队共识
4. **差异化分析**: 通过经典和自定义因素找到独特定位
5. **2x2 矩阵**: 可视化产品在竞争格局中的位置
6. **Magic Lenses**: 多角度评估执行方案
7. **AI 助手**: 随时点击右上角 "AI 助手" 获得深度分析
8. **最终决策**: 选择最佳执行路径并说明理由

## 特色功能

### 纸质卡片设计
- 模仿真实便签纸的视觉效果
- 悬停时卡片轻微上浮动画
- 不同类型卡片有不同颜色主题

### AI 助手团队
- 右侧滑出面板设计
- 支持最小化和多Agent切换
- 实时对话记录

### 协作决策
- 可视化投票结果
- 权重投票系统
- 评论和理由记录

## 开发说明

### 项目结构

```
.
├── frontend/                 # React 前端应用
│   ├── src/
│   │   ├── components/       # 组件库
│   │   │   ├── cards/       # 卡片组件
│   │   │   ├── workflows/   # 工作流组件
│   │   │   └── ui/          # 基础UI组件
│   │   └── lib/             # 工具函数
├── backend/                  # Golang 后端API
│   ├── cmd/api/             # 应用入口
│   ├── internal/            # 内部包
│   │   ├── handlers/        # HTTP处理器
│   │   ├── models/          # 数据模型
│   │   ├── middleware/      # 中间件
│   │   └── agents/          # AI agents逻辑
└── README.md
```

### 开发状态

#### ✅ 已完成功能

- [x] **前后端完整集成**: Type-safe API 客户端，错误处理，实时同步
- [x] **房间管理系统**: 创建/加入房间，参与者管理，房间分享
- [x] **AI-Native 体验**: 智能建议卡片，上下文感知 AI 助手
- [x] **实时协作**: WebSocket 集成，多用户同步，连接状态监控
- [x] **专业 UI/UX**: Toast 通知，加载状态，错误处理

#### 🚧 下一步开发

- [ ] 添加用户认证系统
- [ ] 导出 PDF 报告功能
- [ ] 移动端适配
- [ ] 数据持久化优化
- [ ] 高级协作功能 (评论、标注)

## 许可证

本项目仅供学习和演示使用。