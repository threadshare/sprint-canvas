package agents

import (
	"context"
	"foundation-sprint/internal/agents/tools"
)

// CritiqueAgent is the "批判我" agent that challenges assumptions and evaluates feasibility
type CritiqueAgent struct {
	BaseAgent
	processor *ReActProcessor
}

// NewCritiqueAgent creates a new CritiqueAgent
func NewCritiqueAgent(llmClient LLMClient) *CritiqueAgent {
	agent := &CritiqueAgent{
		BaseAgent: BaseAgent{
			Name: "CritiqueAgent",
			Role: "批判性分析专家",
			BackgroundKnowledge: `我是一位经验丰富的创业顾问和风险评估专家，专长包括：
- 市场可行性分析
- 商业模式评估
- 风险识别和管理
- 竞争战略分析
- 投资尽职调查
我见过许多创业项目的成功和失败，深知常见的陷阱和误区。`,
			Responsibility: `帮助用户：
1. 识别和挑战隐含假设
2. 评估市场真实需求
3. 分析竞争威胁和风险
4. 验证商业模式可行性
5. 提供现实的改进建议`,
			LLMClient:     llmClient,
			MaxIterations: 5,
		},
	}
	
	// Get tools for this agent
	agentToolsRaw := tools.GetToolsForAgent("CritiqueAgent")
	
	// Convert tools.Tool to agents.Tool
	var agentTools []Tool
	for _, t := range agentToolsRaw {
		agentTools = append(agentTools, t)
	}
	
	// Create ReAct processor
	agent.processor = NewReActProcessor(agent, llmClient, agentTools, 5)
	
	return agent
}

// Process executes the CritiqueAgent's logic
func (a *CritiqueAgent) Process(ctx context.Context, input AgentInput) (*AgentOutput, error) {
	// Use the ReAct processor to handle the request
	output, err := a.processor.Process(ctx, input)
	if err != nil {
		return nil, NewAgentError(a.Name, input.Phase, "processing failed", err)
	}
	
	// Enhance output with CritiqueAgent-specific insights
	output = a.enhanceOutput(output, input)
	
	return output, nil
}

// enhanceOutput adds CritiqueAgent-specific enhancements
func (a *CritiqueAgent) enhanceOutput(output *AgentOutput, input AgentInput) *AgentOutput {
	// Add critical questions based on the phase
	switch input.Phase {
	case "foundation":
		output.Suggestions = append(output.Suggestions,
			"验证问题是否真实存在，而非臆想",
			"确认用户愿意为解决方案付费",
			"评估团队是否有能力执行",
		)
		output.NextActions = append(output.NextActions,
			"进行100个用户访谈验证需求",
			"分析用户当前的替代解决方案",
			"计算潜在市场规模(TAM/SAM/SOM)",
		)
		
	case "differentiation":
		output.Suggestions = append(output.Suggestions,
			"警惕过度差异化导致市场太小",
			"确保差异化点对用户真正重要",
			"评估差异化的可防御性",
		)
		output.NextActions = append(output.NextActions,
			"测试用户对差异化点的支付意愿",
			"分析竞争对手可能的反击策略",
			"评估建立护城河的可能性",
		)
		
	case "approach":
		output.Suggestions = append(output.Suggestions,
			"避免过度工程化的解决方案",
			"考虑资源限制和时间窗口",
			"准备应对最坏情况",
		)
		output.NextActions = append(output.NextActions,
			"制定风险缓解计划",
			"设置清晰的成功/失败标准",
			"准备Plan B和退出策略",
		)
	}
	
	// Add reality checks
	if output.Metadata == nil {
		output.Metadata = make(map[string]interface{})
	}
	output.Metadata["reality_checks"] = []map[string]interface{}{
		{
			"area":     "市场需求",
			"question": "有多少人真正愿意改变现有习惯？",
			"red_flag": "如果答案是'教育市场'，要格外谨慎",
		},
		{
			"area":     "竞争优势",
			"question": "为什么现有玩家没有做这个？",
			"red_flag": "可能有你不知道的原因",
		},
		{
			"area":     "执行能力",
			"question": "团队是否有相关成功经验？",
			"red_flag": "首次创业者成功率较低",
		},
		{
			"area":     "资金需求",
			"question": "资金耗尽前能否达到关键里程碑？",
			"red_flag": "大多数创业失败于资金链断裂",
		},
	}
	
	// Add common pitfalls
	output.Metadata["common_pitfalls"] = []string{
		"过早扩张 - 在产品市场契合前就开始扩大规模",
		"忽视客户 - 基于假设而非真实反馈构建产品",
		"完美主义 - 追求完美产品而错过市场时机",
		"单点依赖 - 过度依赖单一客户、供应商或渠道",
		"团队不和 - 创始团队理念不合导致内耗",
	}
	
	// Add risk matrix
	output.Metadata["risk_assessment"] = map[string]string{
		"market_risk":     "中-高",
		"technical_risk":  "中",
		"execution_risk":  "高",
		"financial_risk":  "高",
		"overall_risk":    "需要谨慎管理风险",
	}
	
	return output
}