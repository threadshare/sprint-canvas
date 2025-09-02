package agents

import (
	"context"
	"foundation-sprint/internal/agents/tools"
)

// ThinkAgent is the "帮我想" agent that helps expand thinking perspectives
type ThinkAgent struct {
	BaseAgent
	processor *ReActProcessor
}

// NewThinkAgent creates a new ThinkAgent
func NewThinkAgent(llmClient LLMClient) *ThinkAgent {
	agent := &ThinkAgent{
		BaseAgent: BaseAgent{
			Name: "ThinkAgent",
			Role: "思维拓展助手",
			BackgroundKnowledge: `我是一位创新思维专家，擅长：
- 发散性思维和创意激发
- 多角度问题分析
- 识别思维盲点和隐含假设
- 跨领域知识连接
- 系统性思考方法
我熟悉设计思维、TRIZ创新理论、第一性原理等思维框架。`,
			Responsibility: `帮助用户：
1. 从不同角度思考问题
2. 发现容易忽略的重要因素
3. 生成创新的解决方案
4. 挑战固有思维模式
5. 建立跨领域的连接`,
			LLMClient:     llmClient,
			MaxIterations: 5,
		},
	}
	
	// Get tools for this agent
	agentTools := tools.GetToolsForAgent("ThinkAgent")
	
	// Create ReAct processor
	agent.processor = NewReActProcessor(agent, llmClient, agentTools, 5)
	
	return agent
}

// Process executes the ThinkAgent's logic
func (a *ThinkAgent) Process(ctx context.Context, input AgentInput) (*AgentOutput, error) {
	// Use the ReAct processor to handle the request
	output, err := a.processor.Process(ctx, input)
	if err != nil {
		return nil, NewAgentError(a.Name, input.Phase, "processing failed", err)
	}
	
	// Enhance output with ThinkAgent-specific insights
	output = a.enhanceOutput(output, input)
	
	return output, nil
}

// enhanceOutput adds ThinkAgent-specific enhancements
func (a *ThinkAgent) enhanceOutput(output *AgentOutput, input AgentInput) *AgentOutput {
	// Add thinking frameworks based on the phase
	switch input.Phase {
	case "foundation":
		output.Suggestions = append(output.Suggestions,
			"使用'5个为什么'深入挖掘问题根源",
			"考虑'如果没有任何限制'会怎么做",
			"从10年后回看现在的决策",
		)
		output.NextActions = append(output.NextActions,
			"列出所有假设并逐一验证",
			"寻找3个完全不同的解决方案",
			"与目标用户进行深度访谈",
		)
		
	case "differentiation":
		output.Suggestions = append(output.Suggestions,
			"寻找'蓝海'机会 - 未被满足的需求",
			"考虑反向定位策略",
			"探索跨界创新的可能性",
		)
		output.NextActions = append(output.NextActions,
			"绘制竞争对手能力图谱",
			"识别可组合的独特优势",
			"测试极端用户的反应",
		)
		
	case "approach":
		output.Suggestions = append(output.Suggestions,
			"使用'预见失败'方法识别风险",
			"考虑最小可行产品(MVP)策略",
			"设计多个实验验证关键假设",
		)
		output.NextActions = append(output.NextActions,
			"制定假设验证计划",
			"设计快速原型",
			"规划分阶段实施路线",
		)
	}
	
	// Add creative thinking prompts
	if output.Metadata == nil {
		output.Metadata = make(map[string]interface{})
	}
	output.Metadata["thinking_prompts"] = []string{
		"如果这个问题很容易解决，为什么还没有被解决？",
		"谁会最反对这个想法？他们的理由是什么？",
		"如果资源无限，最理想的解决方案是什么？",
		"这个问题在其他行业/文化中是如何解决的？",
		"什么样的技术突破会完全改变这个问题？",
	}
	
	// Add analogies and metaphors
	output.Metadata["creative_connections"] = []map[string]string{
		{
			"concept":     "产品定位",
			"analogy":     "就像在拥挤的市场中找到自己的声音",
			"insight":     "不是更大声，而是更独特",
		},
		{
			"concept":     "用户增长",
			"analogy":     "像培育花园，需要耐心和合适的条件",
			"insight":     "有机增长比强制增长更可持续",
		},
	}
	
	return output
}