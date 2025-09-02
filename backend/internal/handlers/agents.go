package handlers

import (
	"context"
	"foundation-sprint/internal/agents"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// AgentService is the global agent service instance
var AgentService *agents.Service

// InitAgentService initializes the agent service
func InitAgentService() error {
	service, err := agents.NewService()
	if err != nil {
		return err
	}
	AgentService = service
	return nil
}

// AgentRequest AI Agent 请求结构
type AgentRequest struct {
	Context string                 `json:"context" binding:"required"`
	Query   string                 `json:"query" binding:"required"`
	RoomID  string                 `json:"room_id"`
	Phase   string                 `json:"phase"`
	History []HistoryItem          `json:"history"`
	Data    map[string]interface{} `json:"data"`
}

// HistoryItem represents a conversation history item
type HistoryItem struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// AgentResponse AI Agent 响应结构
type AgentResponse struct {
	Agent       string                 `json:"agent"`
	Response    string                 `json:"response"`
	Context     string                 `json:"context"`
	Reasoning   []ReasoningStep        `json:"reasoning,omitempty"`
	Tools       []ToolExecution        `json:"tools,omitempty"`
	Suggestions []string               `json:"suggestions,omitempty"`
	NextActions []string               `json:"next_actions,omitempty"`
	Confidence  float64                `json:"confidence"`
	Metadata    map[string]interface{} `json:"metadata,omitempty"`
}

// ReasoningStep represents a step in the reasoning process
type ReasoningStep struct {
	StepNumber  int    `json:"step_number"`
	Thought     string `json:"thought"`
	Action      string `json:"action"`
	Observation string `json:"observation,omitempty"`
	Reflection  string `json:"reflection,omitempty"`
}

// ToolExecution represents a tool execution
type ToolExecution struct {
	ToolName string      `json:"tool_name"`
	Duration int64       `json:"duration_ms"`
	Success  bool        `json:"success"`
	Error    string      `json:"error,omitempty"`
}

// ThinkAgent "帮我想" Agent - 补充思考角度
func ThinkAgent(c *gin.Context) {
	var req AgentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if service is initialized
	if AgentService == nil {
		// Try to initialize if not already done
		if err := InitAgentService(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Agent service not initialized",
				"details": err.Error(),
			})
			return
		}
	}

	// Convert request to agent input
	input := agents.AgentInput{
		Query:   req.Query,
		Context: req.Context,
		RoomID:  req.RoomID,
		Phase:   req.Phase,
		Data:    req.Data,
	}

	// Convert history
	for _, h := range req.History {
		input.History = append(input.History, agents.ConversationHistory{
			Role:    h.Role,
			Content: h.Content,
		})
	}

	// Create context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 90*time.Second)  // Increased for API calls
	defer cancel()

	// Process with ThinkAgent
	output, err := AgentService.ProcessThink(ctx, input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to process request",
			"details": err.Error(),
		})
		return
	}

	// Convert output to response
	response := convertAgentOutput("think", req.Context, output)
	c.JSON(http.StatusOK, response)
}

// CritiqueAgent "批判我" Agent - 挑战理想主义想法
func CritiqueAgent(c *gin.Context) {
	var req AgentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if service is initialized
	if AgentService == nil {
		if err := InitAgentService(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Agent service not initialized",
				"details": err.Error(),
			})
			return
		}
	}

	// Convert request to agent input
	input := agents.AgentInput{
		Query:   req.Query,
		Context: req.Context,
		RoomID:  req.RoomID,
		Phase:   req.Phase,
		Data:    req.Data,
	}

	// Convert history
	for _, h := range req.History {
		input.History = append(input.History, agents.ConversationHistory{
			Role:    h.Role,
			Content: h.Content,
		})
	}

	// Create context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 90*time.Second)  // Increased for API calls
	defer cancel()

	// Process with CritiqueAgent
	output, err := AgentService.ProcessCritique(ctx, input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to process request",
			"details": err.Error(),
		})
		return
	}

	// Convert output to response
	response := convertAgentOutput("critique", req.Context, output)
	c.JSON(http.StatusOK, response)
}

// ResearchAgent "查一查" Agent - 深度研究收集资料
func ResearchAgent(c *gin.Context) {
	var req AgentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if service is initialized
	if AgentService == nil {
		if err := InitAgentService(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Agent service not initialized",
				"details": err.Error(),
			})
			return
		}
	}

	// Convert request to agent input
	input := agents.AgentInput{
		Query:   req.Query,
		Context: req.Context,
		RoomID:  req.RoomID,
		Phase:   req.Phase,
		Data:    req.Data,
	}

	// Convert history
	for _, h := range req.History {
		input.History = append(input.History, agents.ConversationHistory{
			Role:    h.Role,
			Content: h.Content,
		})
	}

	// Create context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 90*time.Second)  // Increased for API calls
	defer cancel()

	// Process with ResearchAgent
	output, err := AgentService.ProcessResearch(ctx, input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to process request",
			"details": err.Error(),
		})
		return
	}

	// Convert output to response
	response := convertAgentOutput("research", req.Context, output)
	c.JSON(http.StatusOK, response)
}

// convertAgentOutput converts agent output to HTTP response
func convertAgentOutput(agentName, context string, output *agents.AgentOutput) AgentResponse {
	response := AgentResponse{
		Agent:       agentName,
		Response:    output.Response,
		Context:     context,
		Suggestions: output.Suggestions,
		NextActions: output.NextActions,
		Confidence:  output.Confidence,
		Metadata:    output.Metadata,
	}

	// Convert reasoning steps
	for _, step := range output.Reasoning {
		response.Reasoning = append(response.Reasoning, ReasoningStep{
			StepNumber:  step.StepNumber,
			Thought:     step.Thought,
			Action:      step.Action,
			Observation: step.Observation,
			Reflection:  step.Reflection,
		})
	}

	// Convert tool executions
	for _, tool := range output.Tools {
		response.Tools = append(response.Tools, ToolExecution{
			ToolName: tool.ToolName,
			Duration: tool.Duration,
			Success:  tool.Success,
			Error:    tool.Error,
		})
	}

	return response
}