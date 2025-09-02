# Foundation Sprint Backend

基于 Google Ventures Foundation Sprint 方法论的后端 API，提供 AI Sub-Agents 和实时协作功能。

## 架构设计

### Sub-Agents 系统

本项目实现了三个核心 AI Sub-Agents，采用 **ReAct (Reasoning + Acting)** 框架和 **MCP (Model Context Protocol)** 工具系统：

#### 1. ThinkAgent (帮我想)
- **角色**: 思维拓展助手
- **职责**: 帮助用户从不同角度思考问题，发现盲点
- **工具**: 
  - `brainstorm`: 创意激发
  - `perspective_analysis`: 多角度分析
  - `blind_spot_detection`: 盲点识别
  - `analogy_finder`: 类比发现
  - `question_generator`: 问题生成

#### 2. CritiqueAgent (批判我)
- **角色**: 批判性分析专家
- **职责**: 挑战假设，评估可行性
- **工具**:
  - `assumption_checker`: 假设验证
  - `market_validator`: 市场验证
  - `feasibility_analyzer`: 可行性分析
  - `risk_assessor`: 风险评估
  - `competitor_analyzer`: 竞争分析

#### 3. ResearchAgent (查一查)
- **角色**: 深度研究专家
- **职责**: 收集数据，提供洞察
- **工具**:
  - `web_search`: 网络搜索
  - `market_research`: 市场研究
  - `trend_analyzer`: 趋势分析
  - `data_collector`: 数据收集
  - `source_validator`: 来源验证

### ReAct 框架

每个 Agent 都遵循 ReAct 循环：

1. **Thought (思考)**: 分析当前情况，决定下一步
2. **Action (行动)**: 使用工具或提供答案
3. **Observation (观察)**: 获取行动结果
4. **Reflection (反思)**: 评估结果，调整策略

这个循环最多进行 5 次迭代，确保深度思考和准确响应。

## 快速开始

### 环境要求

- Go 1.21+
- PostgreSQL 14+
- Redis 6+

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/threadshare/sprint-canvas.git
cd sprint-canvas/backend
```

2. **安装依赖**
```bash
go mod tidy
```

3. **配置环境变量**
```bash
cp .env.example .env
# 编辑 .env 文件，添加你的 API 密钥
```

4. **设置 LLM Provider**

选择 OpenAI 或 Anthropic：

**OpenAI**:
```env
OPENAI_API_KEY=sk-your-api-key
OPENAI_MODEL=gpt-4-turbo-preview
```

**Anthropic**:
```env
ANTHROPIC_API_KEY=sk-ant-your-api-key
ANTHROPIC_MODEL=claude-3-opus-20240229
```

5. **运行服务**
```bash
go run cmd/api/main.go
```

服务将在 `http://localhost:8080` 启动。

## API 使用

### Sub-Agents API

#### ThinkAgent - 帮我想

```bash
curl -X POST http://localhost:8080/api/v1/agents/think \
  -H "Content-Type: application/json" \
  -d '{
    "query": "如何让我的产品在市场上脱颖而出？",
    "context": "我们正在开发一个协作工具",
    "phase": "differentiation",
    "room_id": "room123"
  }'
```

**响应示例**:
```json
{
  "agent": "think",
  "response": "基于您的协作工具定位，我建议从以下角度思考差异化...",
  "reasoning": [
    {
      "step_number": 1,
      "thought": "需要先了解现有协作工具的竞争格局",
      "action": "perspective_analysis",
      "observation": "识别了5个关键利益相关者视角",
      "reflection": "不同用户群体有不同的核心需求"
    }
  ],
  "suggestions": [
    "考虑垂直行业的特定需求",
    "探索AI驱动的独特功能",
    "关注用户体验的微创新"
  ],
  "next_actions": [
    "进行100个用户访谈",
    "分析竞品的用户评价",
    "测试差异化概念"
  ],
  "confidence": 0.85
}
```

#### CritiqueAgent - 批判我

```bash
curl -X POST http://localhost:8080/api/v1/agents/critique \
  -H "Content-Type: application/json" \
  -d '{
    "query": "我们计划通过免费增值模式快速获取用户",
    "context": "目标是6个月内达到10万用户",
    "phase": "approach"
  }'
```

#### ResearchAgent - 查一查

```bash
curl -X POST http://localhost:8080/api/v1/agents/research \
  -H "Content-Type: application/json" \
  -d '{
    "query": "协作工具市场的最新趋势是什么？",
    "context": "准备进入B2B SaaS市场",
    "phase": "foundation"
  }'
```

### 请求参数说明

| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| query | string | 是 | 用户的问题或请求 |
| context | string | 是 | 当前讨论的上下文 |
| phase | string | 否 | Sprint阶段: foundation/differentiation/approach |
| room_id | string | 否 | 协作房间ID |
| history | array | 否 | 对话历史 |
| data | object | 否 | 额外的相关数据 |

### 响应字段说明

| 字段 | 类型 | 说明 |
|-----|------|------|
| response | string | Agent的主要回复 |
| reasoning | array | ReAct推理步骤 |
| tools | array | 使用的工具记录 |
| suggestions | array | 具体建议列表 |
| next_actions | array | 建议的下一步行动 |
| confidence | float | 响应置信度 (0-1) |
| metadata | object | 额外的元数据和洞察 |

## 项目结构

```
backend/
├── cmd/api/              # 应用入口
│   └── main.go
├── internal/
│   ├── agents/          # AI Agents 核心
│   │   ├── core.go      # Agent 接口定义
│   │   ├── react.go     # ReAct 框架实现
│   │   ├── think_agent.go
│   │   ├── critique_agent.go
│   │   ├── research_agent.go
│   │   ├── service.go   # Agent 服务编排
│   │   ├── llm/        # LLM 客户端
│   │   │   ├── client.go
│   │   │   └── types.go
│   │   └── tools/      # MCP 工具实现
│   │       ├── registry.go
│   │       ├── think_tools.go
│   │       ├── critique_tools.go
│   │       └── research_tools.go
│   ├── handlers/        # HTTP 处理器
│   ├── models/         # 数据模型
│   ├── middleware/     # 中间件
│   └── websocket/      # WebSocket 处理
└── pkg/
    └── utils/          # 工具函数
```

## 开发指南

### 添加新的 Agent

1. 创建 Agent 结构体，嵌入 `BaseAgent`:
```go
type CustomAgent struct {
    BaseAgent
    processor *ReActProcessor
}
```

2. 实现 `Agent` 接口的 `Process` 方法

3. 在 `service.go` 中注册新 Agent

### 添加新的工具

1. 实现 `Tool` 接口:
```go
type CustomTool struct {
    BaseTool
}

func (t *CustomTool) Execute(ctx context.Context, input map[string]interface{}) (interface{}, error) {
    // 工具逻辑
}
```

2. 在相应的工具文件中注册

3. 在 `registry.go` 中添加到对应 Agent 的工具列表

### 测试

```bash
# 运行所有测试
go test ./...

# 运行特定包的测试
go test ./internal/agents/...

# 运行带覆盖率的测试
go test -cover ./...
```

## 性能优化

- **并发处理**: 多个 Agent 可以并行执行
- **上下文超时**: 每个请求有 30 秒超时限制
- **工具缓存**: 工具结果可以缓存以减少重复调用
- **流式响应**: 支持 SSE 流式返回结果

## 故障排查

### 常见问题

1. **API 密钥错误**
   - 检查 `.env` 文件中的 API 密钥
   - 确保选择了正确的 Provider

2. **Agent 响应超时**
   - 增加 `AGENT_TIMEOUT_SECONDS`
   - 减少 `AGENT_MAX_ITERATIONS`

3. **工具执行失败**
   - 检查工具的输入参数
   - 查看详细的错误日志

## 贡献指南

欢迎提交 Pull Request！请确保：

1. 代码通过所有测试
2. 遵循 Go 代码规范
3. 添加必要的文档
4. 提交清晰的 commit 信息

## License

MIT