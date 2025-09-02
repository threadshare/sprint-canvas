# Foundation Sprint 应用

基于 Google Ventures 的 Foundation Sprint 方法论开发的科学思考和快速验证 IDEA 的应用。

## 项目结构

```
.
├── frontend/           # React + ShadcnUI + TailwindCSS 前端应用
├── backend/            # Golang + Gin 后端 API
└── README.md
```

## 核心功能

### Foundation Sprint 工作流
1. **基础阶段**: 定义客户、问题、竞争和优势
2. **差异化阶段**: 2x2 分析图找到独特定位
3. **方法阶段**: Magic Lenses 多角度评估方案

### AI Sub-Agents
- **帮我想 Agent**: 补充思考角度，发现盲点
- **批判我 Agent**: 挑战理想主义，评估市场现实性  
- **查一查 Agent**: 深度研究，收集资料

### 协作功能
- 自定义房间 ID 会议室
- 实时协作编辑
- Note and Vote 投票机制

## 技术栈

**前端**: React 18 + TypeScript + ShadcnUI + TailwindCSS + Vite
**后端**: Golang + Gin + WebSocket + PostgreSQL
**样式**: 纸质卡片风格设计

## 开发进度

- [x] 项目初始化
- [ ] React 前端搭建
- [ ] Golang 后端搭建
- [ ] 核心工作流实现
- [ ] AI Agents 集成
- [ ] 协作功能开发

## 快速开始

### 前端开发
```bash
cd frontend
npm install
npm run dev
```

### 后端开发
```bash
cd backend
go mod tidy
go run cmd/api/main.go
```