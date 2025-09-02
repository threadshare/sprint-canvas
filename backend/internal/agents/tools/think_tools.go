package tools

import (
	"context"
	"fmt"
	"strings"
)

// BrainstormTool generates ideas and perspectives
type BrainstormTool struct {
	BaseTool
}

// NewBrainstormTool creates a new brainstorm tool
func NewBrainstormTool() *BrainstormTool {
	return &BrainstormTool{
		BaseTool: BaseTool{
			Name:        "brainstorm",
			Description: "Generate creative ideas and alternative perspectives on a topic",
			Required:    []string{"topic"},
			Optional:    []string{"constraints", "domain"},
		},
	}
}

// Execute runs the brainstorm tool
func (t *BrainstormTool) Execute(ctx context.Context, input map[string]interface{}) (interface{}, error) {
	topic, ok := input["topic"].(string)
	if !ok {
		return nil, fmt.Errorf("topic must be a string")
	}
	
	// In production, this would call an LLM or use more sophisticated logic
	ideas := []string{
		fmt.Sprintf("What if we approach %s from a completely opposite angle?", topic),
		fmt.Sprintf("Consider %s from the perspective of different stakeholders", topic),
		fmt.Sprintf("How would %s work in different industries or contexts?", topic),
		fmt.Sprintf("What are the hidden assumptions in %s that we can challenge?", topic),
		fmt.Sprintf("How can we combine %s with unrelated concepts for innovation?", topic),
	}
	
	// Add domain-specific ideas if provided
	if domain, ok := input["domain"].(string); ok {
		ideas = append(ideas, fmt.Sprintf("Apply %s best practices to %s", domain, topic))
	}
	
	return map[string]interface{}{
		"ideas":       ideas,
		"topic":       topic,
		"suggestions": "Consider each idea and explore the most promising ones further",
	}, nil
}

// PerspectiveAnalysisTool analyzes different perspectives
type PerspectiveAnalysisTool struct {
	BaseTool
}

// NewPerspectiveAnalysisTool creates a new perspective analysis tool
func NewPerspectiveAnalysisTool() *PerspectiveAnalysisTool {
	return &PerspectiveAnalysisTool{
		BaseTool: BaseTool{
			Name:        "perspective_analysis",
			Description: "Analyze a problem from multiple stakeholder perspectives",
			Required:    []string{"problem"},
			Optional:    []string{"stakeholders"},
		},
	}
}

// Execute runs the perspective analysis
func (t *PerspectiveAnalysisTool) Execute(ctx context.Context, input map[string]interface{}) (interface{}, error) {
	problem, ok := input["problem"].(string)
	if !ok {
		return nil, fmt.Errorf("problem must be a string")
	}
	
	// Default stakeholders
	stakeholders := []string{"用户", "企业", "投资者", "员工", "社会"}
	
	// Use custom stakeholders if provided
	if customStakeholders, ok := input["stakeholders"].([]string); ok {
		stakeholders = customStakeholders
	}
	
	perspectives := make(map[string]interface{})
	for _, stakeholder := range stakeholders {
		perspectives[stakeholder] = map[string]string{
			"concern":     fmt.Sprintf("%s 最关心的是什么？", stakeholder),
			"benefit":     fmt.Sprintf("%s 能获得什么好处？", stakeholder),
			"risk":        fmt.Sprintf("%s 面临什么风险？", stakeholder),
			"expectation": fmt.Sprintf("%s 的期望是什么？", stakeholder),
		}
	}
	
	return map[string]interface{}{
		"problem":      problem,
		"perspectives": perspectives,
		"insight":      "不同利益相关者有不同的关注点，需要平衡各方利益",
	}, nil
}

// BlindSpotDetectionTool identifies potential blind spots
type BlindSpotDetectionTool struct {
	BaseTool
}

// NewBlindSpotDetectionTool creates a new blind spot detection tool
func NewBlindSpotDetectionTool() *BlindSpotDetectionTool {
	return &BlindSpotDetectionTool{
		BaseTool: BaseTool{
			Name:        "blind_spot_detection",
			Description: "Identify potential blind spots and overlooked aspects",
			Required:    []string{"concept"},
			Optional:    []string{"context"},
		},
	}
}

// Execute detects blind spots
func (t *BlindSpotDetectionTool) Execute(ctx context.Context, input map[string]interface{}) (interface{}, error) {
	concept, ok := input["concept"].(string)
	if !ok {
		return nil, fmt.Errorf("concept must be a string")
	}
	
	blindSpots := []map[string]string{
		{
			"area":     "技术可行性",
			"question": "是否过于乐观地估计了技术实现的难度？",
			"risk":     "技术瓶颈可能导致项目延期或失败",
		},
		{
			"area":     "市场需求",
			"question": "是否真正验证了用户需求的真实性和强度？",
			"risk":     "可能在解决一个不存在或不重要的问题",
		},
		{
			"area":     "竞争环境",
			"question": "是否充分了解直接和间接竞争对手？",
			"risk":     "可能低估了市场竞争的激烈程度",
		},
		{
			"area":     "资源需求",
			"question": "是否准确评估了所需的时间、资金和人力？",
			"risk":     "资源不足可能导致项目无法完成",
		},
		{
			"area":     "法律合规",
			"question": "是否考虑了相关的法律法规要求？",
			"risk":     "合规问题可能带来法律风险",
		},
	}
	
	// Add context-specific blind spots
	if context, ok := input["context"].(string); ok {
		if strings.Contains(strings.ToLower(context), "ai") {
			blindSpots = append(blindSpots, map[string]string{
				"area":     "AI伦理",
				"question": "是否考虑了AI系统的伦理和偏见问题？",
				"risk":     "AI偏见可能导致用户信任危机",
			})
		}
	}
	
	return map[string]interface{}{
		"concept":     concept,
		"blind_spots": blindSpots,
		"recommendation": "仔细检查每个盲点，并制定相应的缓解措施",
	}, nil
}

// AnalogyFinderTool finds analogies from other domains
type AnalogyFinderTool struct {
	BaseTool
}

// NewAnalogyFinderTool creates a new analogy finder tool
func NewAnalogyFinderTool() *AnalogyFinderTool {
	return &AnalogyFinderTool{
		BaseTool: BaseTool{
			Name:        "analogy_finder",
			Description: "Find analogies from other industries or domains",
			Required:    []string{"concept"},
			Optional:    []string{"target_domain"},
		},
	}
}

// Execute finds analogies
func (t *AnalogyFinderTool) Execute(ctx context.Context, input map[string]interface{}) (interface{}, error) {
	concept, ok := input["concept"].(string)
	if !ok {
		return nil, fmt.Errorf("concept must be a string")
	}
	
	analogies := []map[string]string{
		{
			"domain":      "自然界",
			"analogy":     "蜂群协作",
			"application": "去中心化的协同工作模式",
			"insight":     "个体简单规则可以产生复杂的集体智慧",
		},
		{
			"domain":      "军事",
			"analogy":     "特种部队",
			"application": "小而精的团队执行关键任务",
			"insight":     "专业化和高度训练比规模更重要",
		},
		{
			"domain":      "体育",
			"analogy":     "马拉松训练",
			"application": "长期项目的节奏控制",
			"insight":     "持续性和耐力比短期爆发更重要",
		},
		{
			"domain":      "建筑",
			"analogy":     "模块化建筑",
			"application": "产品的模块化设计",
			"insight":     "标准化组件可以灵活组合满足不同需求",
		},
	}
	
	return map[string]interface{}{
		"concept":   concept,
		"analogies": analogies,
		"value":     "跨领域的类比可以激发创新思维",
	}, nil
}

// QuestionGeneratorTool generates probing questions
type QuestionGeneratorTool struct {
	BaseTool
}

// NewQuestionGeneratorTool creates a new question generator tool
func NewQuestionGeneratorTool() *QuestionGeneratorTool {
	return &QuestionGeneratorTool{
		BaseTool: BaseTool{
			Name:        "question_generator",
			Description: "Generate probing questions to deepen understanding",
			Required:    []string{"topic"},
			Optional:    []string{"depth_level"},
		},
	}
}

// Execute generates questions
func (t *QuestionGeneratorTool) Execute(ctx context.Context, input map[string]interface{}) (interface{}, error) {
	topic, ok := input["topic"].(string)
	if !ok {
		return nil, fmt.Errorf("topic must be a string")
	}
	
	questions := map[string][]string{
		"foundational": {
			fmt.Sprintf("What is the core problem that %s is trying to solve?", topic),
			fmt.Sprintf("Who are the primary stakeholders affected by %s?", topic),
			fmt.Sprintf("What assumptions are we making about %s?", topic),
		},
		"exploratory": {
			fmt.Sprintf("What would happen if %s didn't exist?", topic),
			fmt.Sprintf("How would %s work in a completely different context?", topic),
			fmt.Sprintf("What are the second-order effects of %s?", topic),
		},
		"critical": {
			fmt.Sprintf("What evidence do we have that %s is necessary?", topic),
			fmt.Sprintf("What are the biggest risks associated with %s?", topic),
			fmt.Sprintf("How might %s fail or be misused?", topic),
		},
		"creative": {
			fmt.Sprintf("How can we reimagine %s from first principles?", topic),
			fmt.Sprintf("What unexpected combinations could enhance %s?", topic),
			fmt.Sprintf("How would %s evolve in the next 10 years?", topic),
		},
	}
	
	return map[string]interface{}{
		"topic":     topic,
		"questions": questions,
		"usage":     "Use these questions to explore different aspects and uncover new insights",
	}, nil
}

// RegisterThinkTools registers all thinking tools
func RegisterThinkTools() error {
	tools := []Tool{
		NewBrainstormTool(),
		NewPerspectiveAnalysisTool(),
		NewBlindSpotDetectionTool(),
		NewAnalogyFinderTool(),
		NewQuestionGeneratorTool(),
	}
	
	for _, tool := range tools {
		if err := Register(tool); err != nil {
			return fmt.Errorf("failed to register tool %s: %w", tool.GetName(), err)
		}
	}
	
	return nil
}