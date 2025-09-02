# 交互式 Sub-Agents 使用指南

## 概述

交互式 Sub-Agents 支持在 ReAct 推理过程中与用户进行多轮对话。当 Agent 需要更多信息、需要确认或让用户做选择时，可以暂停执行，等待用户输入后继续。

## 核心特性

### 1. 会话管理
- **会话 ID**: 每个交互式会话都有唯一的 session_id
- **会话状态**: active（活跃）、paused（暂停）、completed（完成）、failed（失败）、expired（过期）
- **会话超时**: 默认 30 分钟无活动后过期

### 2. 交互类型
- `need_input`: 需要用户提供信息
- `confirmation`: 需要用户确认
- `choice`: 需要用户选择
- `clarification`: 需要澄清

### 3. 多轮对话支持
- Agent 可以在 ReAct 循环中的任何步骤请求用户输入
- 会话状态自动保存，支持断点续传
- 完整保留推理历史和上下文

## API 使用示例

### 1. 开始新的交互式会话

```bash
POST /api/v1/agents/think/interactive
Content-Type: application/json

{
  "query": "帮我设计一个新产品的差异化策略",
  "context": "我们正在开发一个协作工具",
  "phase": "differentiation"
}
```

**响应**:
```json
{
  "agent": "think",
  "response": "",
  "session_id": "ThinkAgent_1234567890",
  "needs_interaction": true,
  "interaction_type": "need_input",
  "interaction_prompt": "为了更好地帮助您，我需要了解：您的目标用户群体是谁？他们的主要痛点是什么？",
  "can_continue": true,
  "session_status": "paused",
  "reasoning": [
    {
      "step_number": 1,
      "thought": "需要了解更多关于目标用户的信息才能提供准确的差异化建议",
      "action": "ask_user",
      "action_input": "目标用户群体和痛点"
    }
  ]
}
```

### 2. 继续会话（提供用户输入）

```bash
POST /api/v1/agents/think/interactive
Content-Type: application/json

{
  "session_id": "ThinkAgent_1234567890",
  "user_input": "我们的目标用户是远程团队，主要痛点是异步协作效率低，信息同步困难"
}
```

**响应**:
```json
{
  "agent": "think",
  "response": "基于您的远程团队定位，我建议以下差异化策略...",
  "session_id": "ThinkAgent_1234567890",
  "needs_interaction": false,
  "can_continue": false,
  "session_status": "completed",
  "reasoning": [
    {
      "step_number": 1,
      "thought": "需要了解更多关于目标用户的信息",
      "action": "ask_user",
      "observation": "User provided: 远程团队，异步协作效率低"
    },
    {
      "step_number": 2,
      "thought": "现在有了用户信息，可以使用工具分析差异化机会",
      "action": "perspective_analysis",
      "observation": "识别了5个差异化维度..."
    }
  ],
  "suggestions": [
    "专注异步协作的时间线功能",
    "智能信息聚合和推送",
    "跨时区协作优化"
  ],
  "confidence": 0.85
}
```

### 3. 确认型交互

```json
{
  "needs_interaction": true,
  "interaction_type": "confirmation",
  "interaction_prompt": "请确认：您希望重点关注技术差异化而不是价格优势？(是/否)",
  "interaction_options": ["是", "否", "需要修改"]
}
```

### 4. 选择型交互

```json
{
  "needs_interaction": true,
  "interaction_type": "choice",
  "interaction_prompt": "请选择您最感兴趣的差异化方向：",
  "interaction_options": [
    "AI驱动的智能协作",
    "极致的用户体验",
    "垂直行业深度定制",
    "开源和社区驱动"
  ]
}
```

## 会话管理 API

### 查看 Agent 的所有会话

```bash
GET /api/v1/agents/ThinkAgent/sessions
```

**响应**:
```json
{
  "agent": "ThinkAgent",
  "sessions": [
    {
      "session_id": "ThinkAgent_1234567890",
      "start_time": "2024-01-15T10:00:00Z",
      "last_update": "2024-01-15T10:05:00Z",
      "status": "paused",
      "current_iteration": 2,
      "max_iterations": 5,
      "interactions_count": 1
    }
  ],
  "total": 1
}
```

### 获取会话详情

```bash
GET /api/v1/agents/sessions/ThinkAgent_1234567890
```

### 删除会话

```bash
DELETE /api/v1/agents/sessions/ThinkAgent_1234567890
```

## 实际使用场景

### 场景 1: 需求不明确时的澄清

用户: "帮我分析一下市场"
Agent: "我需要了解：您想分析哪个具体市场？是竞争分析还是市场规模研究？"
用户: "B2B SaaS 协作工具市场的竞争格局"
Agent: [继续执行详细分析]

### 场景 2: 关键决策的确认

Agent: "基于分析，我建议采用免费增值模式。请确认是否继续基于这个假设进行规划？"
用户: "否，我们想采用纯订阅制"
Agent: [调整策略重新分析]

### 场景 3: 多选项的选择

Agent: "发现了三个可能的差异化方向，请选择您最感兴趣的：
1. 专注视频协作
2. 深度项目管理集成
3. AI 自动化工作流"
用户: "选择 3"
Agent: [深入探讨 AI 自动化方向]

## 最佳实践

### 1. 会话管理
- 保存 session_id 以支持断点续传
- 定期检查会话状态避免超时
- 完成后可以删除会话释放资源

### 2. 错误处理
```javascript
async function interactWithAgent(input) {
  try {
    const response = await fetch('/api/v1/agents/think/interactive', {
      method: 'POST',
      body: JSON.stringify(input)
    });
    
    const data = await response.json();
    
    if (data.needs_interaction) {
      // 显示交互提示给用户
      const userInput = await promptUser(data.interaction_prompt, data.interaction_options);
      
      // 继续会话
      return interactWithAgent({
        session_id: data.session_id,
        user_input: userInput
      });
    }
    
    return data;
  } catch (error) {
    console.error('Agent interaction failed:', error);
  }
}
```

### 3. 前端集成建议
- 使用模态框或侧边栏显示交互提示
- 保存会话历史支持回看
- 提供"取消"选项允许用户退出会话
- 实时显示推理步骤增强透明度

## 配置选项

在 `.env` 文件中可以配置：

```env
# 会话超时时间（秒）
AGENT_SESSION_TIMEOUT=1800

# 最大交互次数
AGENT_MAX_INTERACTIONS=10

# 是否启用会话持久化
AGENT_SESSION_PERSISTENCE=true
```

## 注意事项

1. **会话超时**: 超过 30 分钟无活动的会话会被标记为过期
2. **并发限制**: 同一用户同时只能有 3 个活跃会话
3. **内容长度**: 用户输入限制在 2000 字符以内
4. **重试机制**: 如果 Agent 请求失败，会话状态会保留，可以重试

## 故障排查

### 会话找不到
- 检查 session_id 是否正确
- 确认会话没有超时
- 查看会话列表确认状态

### 交互无响应
- 确认提供了必需的 user_input
- 检查输入格式是否正确
- 查看 Agent 日志了解详细错误

### 推理中断
- 可能达到最大迭代次数
- 检查 LLM API 配额
- 查看错误日志