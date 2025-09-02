package tools

import (
	"context"
	"fmt"
	"strings"
)

// AssumptionCheckerTool validates assumptions
type AssumptionCheckerTool struct {
	BaseTool
}

// NewAssumptionCheckerTool creates a new assumption checker tool
func NewAssumptionCheckerTool() *AssumptionCheckerTool {
	return &AssumptionCheckerTool{
		BaseTool: BaseTool{
			Name:        "assumption_checker",
			Description: "Identify and validate assumptions in a business idea or plan",
			Required:    []string{"statement"},
			Optional:    []string{"domain", "evidence"},
		},
	}
}

// Execute checks assumptions
func (t *AssumptionCheckerTool) Execute(ctx context.Context, input map[string]interface{}) (interface{}, error) {
	statement, ok := input["statement"].(string)
	if !ok {
		return nil, fmt.Errorf("statement must be a string")
	}
	
	assumptions := []map[string]interface{}{
		{
			"assumption": "用户愿意为此付费",
			"type":       "市场假设",
			"risk_level": "高",
			"validation": "需要通过用户访谈和支付意愿测试验证",
			"questions": []string{
				"用户现在如何解决这个问题？",
				"他们为现有解决方案支付多少钱？",
				"什么会让他们转换到新方案？",
			},
		},
		{
			"assumption": "技术可以实现预期功能",
			"type":       "技术假设",
			"risk_level": "中",
			"validation": "需要技术原型和可行性研究",
			"questions": []string{
				"核心技术是否已经成熟？",
				"是否有类似的技术实现案例？",
				"技术瓶颈在哪里？",
			},
		},
		{
			"assumption": "市场规模足够大",
			"type":       "市场假设",
			"risk_level": "高",
			"validation": "需要市场研究和数据分析",
			"questions": []string{
				"目标市场有多大？",
				"增长趋势如何？",
				"市场渗透率能达到多少？",
			},
		},
		{
			"assumption": "团队能够执行",
			"type":       "执行假设",
			"risk_level": "中",
			"validation": "评估团队能力和资源",
			"questions": []string{
				"团队是否有相关经验？",
				"是否有足够的资源？",
				"执行的最大挑战是什么？",
			},
		},
	}
	
	// Analyze the statement for specific assumptions
	criticalAssumptions := []string{}
	if strings.Contains(strings.ToLower(statement), "用户") || strings.Contains(strings.ToLower(statement), "客户") {
		criticalAssumptions = append(criticalAssumptions, "用户行为假设需要重点验证")
	}
	if strings.Contains(strings.ToLower(statement), "ai") || strings.Contains(strings.ToLower(statement), "自动") {
		criticalAssumptions = append(criticalAssumptions, "技术成熟度假设需要验证")
	}
	
	return map[string]interface{}{
		"statement":            statement,
		"identified_assumptions": assumptions,
		"critical_assumptions": criticalAssumptions,
		"recommendation":      "优先验证高风险假设，使用最小成本的验证方法",
	}, nil
}

// MarketValidatorTool validates market demand
type MarketValidatorTool struct {
	BaseTool
}

// NewMarketValidatorTool creates a new market validator tool
func NewMarketValidatorTool() *MarketValidatorTool {
	return &MarketValidatorTool{
		BaseTool: BaseTool{
			Name:        "market_validator",
			Description: "Validate market demand and competitive landscape",
			Required:    []string{"product_idea"},
			Optional:    []string{"target_market", "competitors"},
		},
	}
}

// Execute validates market
func (t *MarketValidatorTool) Execute(ctx context.Context, input map[string]interface{}) (interface{}, error) {
	productIdea, ok := input["product_idea"].(string)
	if !ok {
		return nil, fmt.Errorf("product_idea must be a string")
	}
	
	validation := map[string]interface{}{
		"demand_indicators": map[string]interface{}{
			"search_volume":    "需要检查相关关键词的搜索量",
			"community_activity": "相关社区和论坛的讨论热度",
			"competitor_growth": "竞争对手的增长速度",
			"funding_trends":   "该领域的投资趋势",
		},
		"market_risks": []map[string]string{
			{
				"risk":       "市场教育成本",
				"assessment": "用户是否理解产品价值？",
				"mitigation": "通过内容营销和用户教育降低认知门槛",
			},
			{
				"risk":       "竞争激烈度",
				"assessment": "是否有强大的现有玩家？",
				"mitigation": "找到差异化定位和细分市场",
			},
			{
				"risk":       "市场时机",
				"assessment": "市场是否已经准备好？",
				"mitigation": "关注早期采用者，逐步扩展",
			},
		},
		"validation_methods": []string{
			"1. 进行100个潜在用户访谈",
			"2. 创建落地页测试转化率",
			"3. 分析竞品的用户评论",
			"4. 参与行业活动获取反馈",
			"5. 运行小规模付费广告测试",
		},
	}
	
	// Add target market specific insights
	if targetMarket, ok := input["target_market"].(string); ok {
		validation["target_market_analysis"] = fmt.Sprintf("针对%s市场的特定验证策略", targetMarket)
	}
	
	return map[string]interface{}{
		"product_idea": productIdea,
		"validation":   validation,
		"next_steps":   "选择2-3个验证方法立即开始测试",
	}, nil
}

// FeasibilityAnalyzerTool analyzes feasibility
type FeasibilityAnalyzerTool struct {
	BaseTool
}

// NewFeasibilityAnalyzerTool creates a new feasibility analyzer tool
func NewFeasibilityAnalyzerTool() *FeasibilityAnalyzerTool {
	return &FeasibilityAnalyzerTool{
		BaseTool: BaseTool{
			Name:        "feasibility_analyzer",
			Description: "Analyze technical, financial, and operational feasibility",
			Required:    []string{"project"},
			Optional:    []string{"resources", "timeline"},
		},
	}
}

// Execute analyzes feasibility
func (t *FeasibilityAnalyzerTool) Execute(ctx context.Context, input map[string]interface{}) (interface{}, error) {
	project, ok := input["project"].(string)
	if !ok {
		return nil, fmt.Errorf("project must be a string")
	}
	
	analysis := map[string]interface{}{
		"technical_feasibility": map[string]interface{}{
			"score":      0.7,
			"challenges": []string{
				"技术栈选择和集成",
				"扩展性设计",
				"性能优化",
			},
			"requirements": []string{
				"高级工程师2-3名",
				"6-9个月开发时间",
				"云基础设施",
			},
		},
		"financial_feasibility": map[string]interface{}{
			"score": 0.6,
			"costs": map[string]string{
				"development": "30-50万元",
				"marketing":   "20-30万元",
				"operations":  "10万元/月",
			},
			"revenue_model": []string{
				"订阅制",
				"交易佣金",
				"增值服务",
			},
			"break_even": "预计18-24个月",
		},
		"operational_feasibility": map[string]interface{}{
			"score": 0.75,
			"requirements": []string{
				"客户支持团队",
				"运营流程设计",
				"质量保证体系",
			},
			"risks": []string{
				"团队扩张速度",
				"流程标准化",
				"服务质量保持",
			},
		},
		"overall_assessment": map[string]interface{}{
			"feasibility_score": 0.68,
			"recommendation":   "可行但需要谨慎规划",
			"critical_factors": []string{
				"确保充足的资金储备",
				"分阶段实施降低风险",
				"建立强大的技术团队",
			},
		},
	}
	
	return map[string]interface{}{
		"project":  project,
		"analysis": analysis,
		"advice":   "建议先进行MVP验证，降低初期投入风险",
	}, nil
}

// RiskAssessorTool assesses risks
type RiskAssessorTool struct {
	BaseTool
}

// NewRiskAssessorTool creates a new risk assessor tool
func NewRiskAssessorTool() *RiskAssessorTool {
	return &RiskAssessorTool{
		BaseTool: BaseTool{
			Name:        "risk_assessor",
			Description: "Identify and assess potential risks",
			Required:    []string{"venture"},
			Optional:    []string{"industry", "stage"},
		},
	}
}

// Execute assesses risks
func (t *RiskAssessorTool) Execute(ctx context.Context, input map[string]interface{}) (interface{}, error) {
	venture, ok := input["venture"].(string)
	if !ok {
		return nil, fmt.Errorf("venture must be a string")
	}
	
	risks := []map[string]interface{}{
		{
			"category":    "市场风险",
			"risk":        "需求不如预期",
			"probability": "中",
			"impact":      "高",
			"mitigation":  "进行充分的市场验证，采用精益创业方法",
		},
		{
			"category":    "技术风险",
			"risk":        "技术实现困难",
			"probability": "中",
			"impact":      "高",
			"mitigation":  "建立技术原型，引入技术顾问",
		},
		{
			"category":    "竞争风险",
			"risk":        "巨头进入市场",
			"probability": "低",
			"impact":      "极高",
			"mitigation":  "快速建立护城河，专注细分市场",
		},
		{
			"category":    "财务风险",
			"risk":        "资金链断裂",
			"probability": "中",
			"impact":      "极高",
			"mitigation":  "控制烧钱速度，多元化融资渠道",
		},
		{
			"category":    "团队风险",
			"risk":        "核心成员流失",
			"probability": "低",
			"impact":      "高",
			"mitigation":  "股权激励，建立良好文化",
		},
		{
			"category":    "法律风险",
			"risk":        "合规问题",
			"probability": "低",
			"impact":      "中",
			"mitigation":  "提前咨询法律顾问，建立合规体系",
		},
	}
	
	// Calculate risk score
	riskScore := 0.0
	for _, risk := range risks {
		prob := map[string]float64{"低": 0.3, "中": 0.5, "高": 0.7}
		impact := map[string]float64{"低": 0.3, "中": 0.5, "高": 0.7, "极高": 0.9}
		
		p, _ := prob[risk["probability"].(string)]
		i, _ := impact[risk["impact"].(string)]
		riskScore += p * i
	}
	riskScore = riskScore / float64(len(risks))
	
	return map[string]interface{}{
		"venture":      venture,
		"risks":        risks,
		"risk_score":   fmt.Sprintf("%.2f", riskScore),
		"risk_level":   getRiskLevel(riskScore),
		"priority_actions": []string{
			"优先处理高概率高影响的风险",
			"建立风险监控机制",
			"制定应急预案",
		},
	}, nil
}

func getRiskLevel(score float64) string {
	if score < 0.3 {
		return "低风险"
	} else if score < 0.5 {
		return "中等风险"
	} else if score < 0.7 {
		return "高风险"
	}
	return "极高风险"
}

// CompetitorAnalyzerTool analyzes competitors
type CompetitorAnalyzerTool struct {
	BaseTool
}

// NewCompetitorAnalyzerTool creates a new competitor analyzer tool
func NewCompetitorAnalyzerTool() *CompetitorAnalyzerTool {
	return &CompetitorAnalyzerTool{
		BaseTool: BaseTool{
			Name:        "competitor_analyzer",
			Description: "Analyze competitors and competitive positioning",
			Required:    []string{"market"},
			Optional:    []string{"competitors", "our_solution"},
		},
	}
}

// Execute analyzes competitors
func (t *CompetitorAnalyzerTool) Execute(ctx context.Context, input map[string]interface{}) (interface{}, error) {
	market, ok := input["market"].(string)
	if !ok {
		return nil, fmt.Errorf("market must be a string")
	}
	
	analysis := map[string]interface{}{
		"competitive_landscape": map[string]interface{}{
			"market_leaders": []string{
				"需要识别3-5个主要竞争者",
				"分析他们的市场份额",
				"了解他们的优势和劣势",
			},
			"market_gaps": []string{
				"用户抱怨最多的问题",
				"现有解决方案未覆盖的需求",
				"可以差异化的机会点",
			},
		},
		"competitive_analysis_framework": map[string]interface{}{
			"product_features": "功能对比矩阵",
			"pricing":          "价格策略分析",
			"target_market":    "目标用户群体对比",
			"go_to_market":     "市场推广策略分析",
			"technology":       "技术架构和优势",
		},
		"positioning_strategy": []map[string]string{
			{
				"strategy":    "差异化定位",
				"description": "找到独特的价值主张",
				"example":     "更简单、更快速、更专业",
			},
			{
				"strategy":    "细分市场",
				"description": "专注特定用户群体",
				"example":     "只服务中小企业",
			},
			{
				"strategy":    "低成本领先",
				"description": "提供更经济的解决方案",
				"example":     "开源或免费增值模式",
			},
		},
		"competitive_advantages": []string{
			"需要建立的护城河",
			"网络效应",
			"规模经济",
			"品牌认知",
			"技术壁垒",
		},
	}
	
	return map[string]interface{}{
		"market":   market,
		"analysis": analysis,
		"action_items": []string{
			"创建详细的竞品对比表",
			"识别可防御的市场定位",
			"制定差异化策略",
		},
	}, nil
}

// RegisterCritiqueTools registers all critique tools
func RegisterCritiqueTools() error {
	tools := []Tool{
		NewAssumptionCheckerTool(),
		NewMarketValidatorTool(),
		NewFeasibilityAnalyzerTool(),
		NewRiskAssessorTool(),
		NewCompetitorAnalyzerTool(),
	}
	
	for _, tool := range tools {
		if err := Register(tool); err != nil {
			return fmt.Errorf("failed to register tool %s: %w", tool.GetName(), err)
		}
	}
	
	return nil
}