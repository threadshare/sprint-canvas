package agents

import (
	"context"
	"foundation-sprint/internal/agents/tools"
)

// ResearchAgent is the "查一查" agent that conducts deep research and data collection
type ResearchAgent struct {
	BaseAgent
	processor *ReActProcessor
}

// NewResearchAgent creates a new ResearchAgent
func NewResearchAgent(llmClient LLMClient) *ResearchAgent {
	agent := &ResearchAgent{
		BaseAgent: BaseAgent{
			Name: "ResearchAgent",
			Role: "深度研究专家",
			BackgroundKnowledge: `我是一位专业的市场研究和数据分析专家，擅长：
- 市场调研和竞品分析
- 行业趋势研究
- 用户行为分析
- 数据收集和验证
- 技术可行性研究
我能够从多个来源收集信息，交叉验证数据，并提供有洞察力的分析报告。`,
			Responsibility: `帮助用户：
1. 收集相关市场数据和行业信息
2. 分析竞争对手和市场格局
3. 研究用户需求和行为模式
4. 验证信息来源和数据准确性
5. 提供基于数据的洞察和建议`,
			LLMClient:     llmClient,
			MaxIterations: 5,
		},
	}
	
	// Get tools for this agent
	agentTools := tools.GetToolsForAgent("ResearchAgent")
	
	// Create ReAct processor
	agent.processor = NewReActProcessor(agent, llmClient, agentTools, 5)
	
	return agent
}

// Process executes the ResearchAgent's logic
func (a *ResearchAgent) Process(ctx context.Context, input AgentInput) (*AgentOutput, error) {
	// Use the ReAct processor to handle the request
	output, err := a.processor.Process(ctx, input)
	if err != nil {
		return nil, NewAgentError(a.Name, input.Phase, "processing failed", err)
	}
	
	// Enhance output with ResearchAgent-specific insights
	output = a.enhanceOutput(output, input)
	
	return output, nil
}

// enhanceOutput adds ResearchAgent-specific enhancements
func (a *ResearchAgent) enhanceOutput(output *AgentOutput, input AgentInput) *AgentOutput {
	// Add research recommendations based on the phase
	switch input.Phase {
	case "foundation":
		output.Suggestions = append(output.Suggestions,
			"研究目标用户的人口统计学特征",
			"分析相似产品的成功和失败案例",
			"收集行业专家的观点和预测",
		)
		output.NextActions = append(output.NextActions,
			"创建用户画像和旅程地图",
			"编制竞品功能对比矩阵",
			"分析市场进入壁垒",
		)
		
	case "differentiation":
		output.Suggestions = append(output.Suggestions,
			"研究细分市场的特定需求",
			"分析竞争对手的定位策略",
			"调查用户对创新功能的接受度",
		)
		output.NextActions = append(output.NextActions,
			"进行定价敏感度分析",
			"测试不同价值主张的吸引力",
			"研究潜在合作伙伴和渠道",
		)
		
	case "approach":
		output.Suggestions = append(output.Suggestions,
			"研究类似项目的实施案例",
			"分析所需技术的成熟度",
			"调查潜在供应商和合作方",
		)
		output.NextActions = append(output.NextActions,
			"制定数据收集和分析计划",
			"建立关键指标监测体系",
			"研究相关法规和合规要求",
		)
	}
	
	// Add research insights
	if output.Metadata == nil {
		output.Metadata = make(map[string]interface{})
	}
	
	// Market insights
	output.Metadata["market_insights"] = map[string]interface{}{
		"market_size": map[string]string{
			"TAM": "总体可触达市场 - 需要具体行业数据",
			"SAM": "可服务市场 - 基于能力和地理限制",
			"SOM": "可获得市场 - 现实的市场份额目标",
		},
		"growth_drivers": []string{
			"数字化转型加速",
			"用户习惯改变",
			"新技术普及",
			"监管政策变化",
		},
		"market_barriers": []string{
			"用户教育成本",
			"转换成本",
			"现有解决方案惯性",
			"信任和安全顾虑",
		},
	}
	
	// Competitive landscape
	output.Metadata["competitive_analysis"] = map[string]interface{}{
		"market_structure": "需要具体分析市场集中度",
		"key_players": []map[string]string{
			{
				"type":     "直接竞争者",
				"strategy": "相同问题，相似解决方案",
				"threat":   "高",
			},
			{
				"type":     "间接竞争者",
				"strategy": "相同问题，不同解决方案",
				"threat":   "中",
			},
			{
				"type":     "潜在进入者",
				"strategy": "可能进入的新玩家",
				"threat":   "未知",
			},
		},
		"differentiation_opportunities": []string{
			"未被满足的细分需求",
			"更好的用户体验",
			"创新的商业模式",
			"独特的技术优势",
		},
	}
	
	// User research
	output.Metadata["user_research"] = map[string]interface{}{
		"research_methods": []string{
			"深度访谈 - 理解深层需求和动机",
			"问卷调查 - 量化验证假设",
			"观察研究 - 发现未表达的需求",
			"A/B测试 - 验证解决方案偏好",
			"焦点小组 - 收集集体反馈",
		},
		"key_questions": []string{
			"用户真正的痛点是什么？",
			"现有解决方案的不足在哪里？",
			"用户愿意支付多少？",
			"什么因素影响购买决策？",
			"如何建立用户信任？",
		},
		"data_sources": []string{
			"行业报告和白皮书",
			"用户论坛和社交媒体",
			"竞品用户评论",
			"政府统计数据",
			"学术研究论文",
		},
	}
	
	// Add data quality indicators
	output.Metadata["data_quality"] = map[string]string{
		"completeness": "需要补充更多数据源",
		"accuracy":     "建议交叉验证关键数据",
		"timeliness":   "确保使用最新数据",
		"relevance":    "聚焦于决策相关信息",
	}
	
	// Add references if available
	output.References = append(output.References,
		Reference{
			Type:  "report",
			Title: "行业研究报告",
			Date:  "2024",
			Quote: "需要查找具体行业的最新研究报告",
		},
		Reference{
			Type:  "article",
			Title: "市场趋势分析",
			Date:  "2024",
			Quote: "关注最新的市场动态和用户行为变化",
		},
	)
	
	return output
}