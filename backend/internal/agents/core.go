package agents

import (
	"context"
	"fmt"
)

// Agent represents a Sub-Agent with specific role and capabilities
type Agent interface {
	// GetName returns the agent's identifier
	GetName() string
	
	// GetRole returns the agent's role description
	GetRole() string
	
	// GetBackgroundKnowledge returns the agent's domain expertise
	GetBackgroundKnowledge() string
	
	// GetResponsibility returns what the agent is responsible for
	GetResponsibility() string
	
	// Process executes the agent's main logic using ReAct pattern
	Process(ctx context.Context, input AgentInput) (*AgentOutput, error)
}

// AgentInput represents input to an agent
type AgentInput struct {
	Query   string                 `json:"query"`    // User's question or request
	Context string                 `json:"context"`  // Current sprint context
	RoomID  string                 `json:"room_id"`  // Room identifier for collaboration
	History []ConversationHistory  `json:"history"`  // Previous conversation
	Phase   string                 `json:"phase"`    // Current sprint phase (foundation/differentiation/approach)
	Data    map[string]interface{} `json:"data"`     // Additional phase-specific data
}

// AgentOutput represents output from an agent
type AgentOutput struct {
	Response     string                 `json:"response"`      // Main response text
	Reasoning    []ReActStep            `json:"reasoning"`     // ReAct reasoning steps
	Tools        []ToolExecution        `json:"tools"`         // Tools used during processing
	Suggestions  []string               `json:"suggestions"`   // Additional suggestions
	References   []Reference            `json:"references"`    // External references or sources
	Confidence   float64                `json:"confidence"`    // Confidence score (0-1)
	NextActions  []string               `json:"next_actions"`  // Recommended next steps
	Metadata     map[string]interface{} `json:"metadata"`      // Additional metadata
}

// ReActStep represents a single step in the ReAct reasoning process
type ReActStep struct {
	StepNumber  int    `json:"step_number"`
	Thought     string `json:"thought"`     // What the agent is thinking
	Action      string `json:"action"`      // What action to take
	ActionInput string `json:"action_input"`// Input for the action
	Observation string `json:"observation"` // Result of the action
	Reflection  string `json:"reflection"`  // Reflection on the observation
}

// ToolExecution represents a tool execution record
type ToolExecution struct {
	ToolName   string                 `json:"tool_name"`
	Input      map[string]interface{} `json:"input"`
	Output     interface{}            `json:"output"`
	Duration   int64                  `json:"duration_ms"`
	Success    bool                   `json:"success"`
	Error      string                 `json:"error,omitempty"`
}

// ConversationHistory represents a previous conversation turn
type ConversationHistory struct {
	Role    string `json:"role"`    // "user" or "assistant"
	Content string `json:"content"` // Message content
	Agent   string `json:"agent,omitempty"` // Which agent responded
}

// Reference represents an external reference or source
type Reference struct {
	Type   string `json:"type"`   // "article", "website", "paper", etc.
	Title  string `json:"title"`
	URL    string `json:"url,omitempty"`
	Author string `json:"author,omitempty"`
	Date   string `json:"date,omitempty"`
	Quote  string `json:"quote,omitempty"`
}

// BaseAgent provides common functionality for all agents
type BaseAgent struct {
	Name               string
	Role               string
	BackgroundKnowledge string
	Responsibility     string
	Tools              []Tool
	LLMClient          LLMClient
	MaxIterations      int
}

// GetName returns the agent's name
func (a *BaseAgent) GetName() string {
	return a.Name
}

// GetRole returns the agent's role
func (a *BaseAgent) GetRole() string {
	return a.Role
}

// GetBackgroundKnowledge returns the agent's background knowledge
func (a *BaseAgent) GetBackgroundKnowledge() string {
	return a.BackgroundKnowledge
}

// GetResponsibility returns the agent's responsibility
func (a *BaseAgent) GetResponsibility() string {
	return a.Responsibility
}

// Tool represents an MCP tool that agents can use
type Tool interface {
	GetName() string
	GetDescription() string
	Execute(ctx context.Context, input map[string]interface{}) (interface{}, error)
	ValidateInput(input map[string]interface{}) error
}

// LLMClient represents the interface to communicate with LLM providers
type LLMClient interface {
	Complete(ctx context.Context, prompt string, options ...LLMOption) (string, error)
	CompleteWithTools(ctx context.Context, prompt string, tools []Tool, options ...LLMOption) (*LLMResponse, error)
	Stream(ctx context.Context, prompt string, options ...LLMOption) (<-chan string, error)
}

// LLMResponse represents a response from the LLM
type LLMResponse struct {
	Content      string         `json:"content"`
	ToolCalls    []ToolCall     `json:"tool_calls,omitempty"`
	FinishReason string         `json:"finish_reason"`
	Usage        TokenUsage     `json:"usage"`
}

// ToolCall represents a tool call request from the LLM
type ToolCall struct {
	ID       string                 `json:"id"`
	Name     string                 `json:"name"`
	Arguments map[string]interface{} `json:"arguments"`
}

// TokenUsage represents token usage statistics
type TokenUsage struct {
	PromptTokens     int `json:"prompt_tokens"`
	CompletionTokens int `json:"completion_tokens"`
	TotalTokens      int `json:"total_tokens"`
}

// LLMOption represents options for LLM calls
type LLMOption func(*LLMConfig)

// LLMConfig represents configuration for LLM calls
type LLMConfig struct {
	Temperature      float64
	MaxTokens        int
	TopP             float64
	FrequencyPenalty float64
	PresencePenalty  float64
	SystemPrompt     string
	Model            string
}

// WithTemperature sets the temperature for LLM generation
func WithTemperature(temp float64) LLMOption {
	return func(c *LLMConfig) {
		c.Temperature = temp
	}
}

// WithMaxTokens sets the maximum tokens for LLM generation
func WithMaxTokens(tokens int) LLMOption {
	return func(c *LLMConfig) {
		c.MaxTokens = tokens
	}
}

// WithSystemPrompt sets the system prompt for LLM
func WithSystemPrompt(prompt string) LLMOption {
	return func(c *LLMConfig) {
		c.SystemPrompt = prompt
	}
}

// WithModel sets the model to use
func WithModel(model string) LLMOption {
	return func(c *LLMConfig) {
		c.Model = model
	}
}

// AgentError represents an error from an agent
type AgentError struct {
	Agent   string
	Phase   string
	Message string
	Cause   error
}

func (e *AgentError) Error() string {
	if e.Cause != nil {
		return fmt.Sprintf("agent %s error in phase %s: %s (caused by: %v)", 
			e.Agent, e.Phase, e.Message, e.Cause)
	}
	return fmt.Sprintf("agent %s error in phase %s: %s", e.Agent, e.Phase, e.Message)
}

// NewAgentError creates a new agent error
func NewAgentError(agent, phase, message string, cause error) *AgentError {
	return &AgentError{
		Agent:   agent,
		Phase:   phase,
		Message: message,
		Cause:   cause,
	}
}