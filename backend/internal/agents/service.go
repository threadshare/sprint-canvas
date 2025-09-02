package agents

import (
	"context"
	"fmt"
	"foundation-sprint/internal/agents/llm"
	"foundation-sprint/internal/agents/tools"
	"sync"
)

// Service manages all agents
type Service struct {
	agents    map[string]Agent
	LLMClient LLMClient  // Exported for use in handlers
	mu        sync.RWMutex
}

// NewService creates a new agent service
func NewService() (*Service, error) {
	// Initialize tools
	if err := tools.RegisterThinkTools(); err != nil {
		return nil, fmt.Errorf("failed to register think tools: %w", err)
	}
	if err := tools.RegisterCritiqueTools(); err != nil {
		return nil, fmt.Errorf("failed to register critique tools: %w", err)
	}
	if err := tools.RegisterResearchTools(); err != nil {
		return nil, fmt.Errorf("failed to register research tools: %w", err)
	}
	
	// Create LLM client adapter
	llmClient, err := NewLLMClientAdapter()
	if err != nil {
		return nil, fmt.Errorf("failed to create LLM client: %w", err)
	}
	
	// Create service
	service := &Service{
		agents:    make(map[string]Agent),
		LLMClient: llmClient,
	}
	
	// Register agents
	service.RegisterAgent(NewThinkAgent(llmClient))
	service.RegisterAgent(NewCritiqueAgent(llmClient))
	service.RegisterAgent(NewResearchAgent(llmClient))
	
	return service, nil
}

// RegisterAgent registers an agent
func (s *Service) RegisterAgent(agent Agent) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.agents[agent.GetName()] = agent
}

// GetAgent retrieves an agent by name
func (s *Service) GetAgent(name string) (Agent, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	
	agent, exists := s.agents[name]
	if !exists {
		return nil, fmt.Errorf("agent '%s' not found", name)
	}
	return agent, nil
}

// ProcessThink handles ThinkAgent requests
func (s *Service) ProcessThink(ctx context.Context, input AgentInput) (*AgentOutput, error) {
	agent, err := s.GetAgent("ThinkAgent")
	if err != nil {
		return nil, err
	}
	return agent.Process(ctx, input)
}

// ProcessCritique handles CritiqueAgent requests
func (s *Service) ProcessCritique(ctx context.Context, input AgentInput) (*AgentOutput, error) {
	agent, err := s.GetAgent("CritiqueAgent")
	if err != nil {
		return nil, err
	}
	return agent.Process(ctx, input)
}

// ProcessResearch handles ResearchAgent requests
func (s *Service) ProcessResearch(ctx context.Context, input AgentInput) (*AgentOutput, error) {
	agent, err := s.GetAgent("ResearchAgent")
	if err != nil {
		return nil, err
	}
	return agent.Process(ctx, input)
}

// GetToolsForAgent returns tools for a specific agent
func GetToolsForAgent(agentName string) []Tool {
	toolList := tools.GetToolsForAgent(agentName)
	agentTools := make([]Tool, len(toolList))
	for i, t := range toolList {
		agentTools[i] = t
	}
	return agentTools
}

// ProcessMultiAgent runs multiple agents in parallel
func (s *Service) ProcessMultiAgent(ctx context.Context, input AgentInput, agentNames []string) (map[string]*AgentOutput, error) {
	results := make(map[string]*AgentOutput)
	var mu sync.Mutex
	var wg sync.WaitGroup
	
	errChan := make(chan error, len(agentNames))
	
	for _, name := range agentNames {
		wg.Add(1)
		go func(agentName string) {
			defer wg.Done()
			
			agent, err := s.GetAgent(agentName)
			if err != nil {
				errChan <- fmt.Errorf("agent %s: %w", agentName, err)
				return
			}
			
			output, err := agent.Process(ctx, input)
			if err != nil {
				errChan <- fmt.Errorf("agent %s processing: %w", agentName, err)
				return
			}
			
			mu.Lock()
			results[agentName] = output
			mu.Unlock()
		}(name)
	}
	
	wg.Wait()
	close(errChan)
	
	// Check for errors
	for err := range errChan {
		if err != nil {
			return results, err // Return partial results with error
		}
	}
	
	return results, nil
}

// LLMClientAdapter adapts the llm.Client to the agents.LLMClient interface
type LLMClientAdapter struct {
	client *llm.Client
}

// NewLLMClientAdapter creates a new LLM client adapter
func NewLLMClientAdapter() (*LLMClientAdapter, error) {
	// Try OpenAI first, then Anthropic
	client, err := llm.NewClient(llm.ProviderOpenAI)
	if err != nil {
		// Try Anthropic as fallback
		client, err = llm.NewClient(llm.ProviderAnthropic)
		if err != nil {
			return nil, fmt.Errorf("failed to initialize LLM client: %w", err)
		}
	}
	
	return &LLMClientAdapter{client: client}, nil
}

// Complete implements the LLMClient interface
func (a *LLMClientAdapter) Complete(ctx context.Context, prompt string, options ...LLMOption) (string, error) {
	// Convert agent options to llm options
	llmOpts := a.convertOptions(options)
	return a.client.Complete(ctx, prompt, llmOpts...)
}

// CompleteWithTools implements the LLMClient interface
func (a *LLMClientAdapter) CompleteWithTools(ctx context.Context, prompt string, tools []Tool, options ...LLMOption) (*LLMResponse, error) {
	// Convert tools to llm tools
	llmTools := make([]llm.Tool, len(tools))
	for i, tool := range tools {
		llmTools[i] = &ToolAdapter{tool: tool}
	}
	
	// Convert options
	llmOpts := a.convertOptions(options)
	
	// Call LLM client
	response, err := a.client.CompleteWithTools(ctx, prompt, llmTools, llmOpts...)
	if err != nil {
		return nil, err
	}
	
	// Convert response
	return &LLMResponse{
		Content:      response.Content,
		ToolCalls:    a.convertToolCalls(response.ToolCalls),
		FinishReason: response.FinishReason,
		Usage: TokenUsage{
			PromptTokens:     response.Usage.PromptTokens,
			CompletionTokens: response.Usage.CompletionTokens,
			TotalTokens:      response.Usage.TotalTokens,
		},
	}, nil
}

// Stream implements the LLMClient interface
func (a *LLMClientAdapter) Stream(ctx context.Context, prompt string, options ...LLMOption) (<-chan string, error) {
	llmOpts := a.convertOptions(options)
	return a.client.Stream(ctx, prompt, llmOpts...)
}

// convertOptions converts agent options to llm options
func (a *LLMClientAdapter) convertOptions(options []LLMOption) []llm.Option {
	config := &LLMConfig{}
	for _, opt := range options {
		opt(config)
	}
	
	var llmOpts []llm.Option
	if config.Temperature > 0 {
		llmOpts = append(llmOpts, llm.WithTemperature(config.Temperature))
	}
	if config.MaxTokens > 0 {
		llmOpts = append(llmOpts, llm.WithMaxTokens(config.MaxTokens))
	}
	if config.SystemPrompt != "" {
		llmOpts = append(llmOpts, llm.WithSystemPrompt(config.SystemPrompt))
	}
	if config.Model != "" {
		llmOpts = append(llmOpts, llm.WithModel(config.Model))
	}
	
	return llmOpts
}

// convertToolCalls converts llm tool calls to agent tool calls
func (a *LLMClientAdapter) convertToolCalls(llmCalls []llm.ToolCall) []ToolCall {
	calls := make([]ToolCall, len(llmCalls))
	for i, call := range llmCalls {
		calls[i] = ToolCall{
			ID:        call.ID,
			Name:      call.Name,
			Arguments: call.Arguments,
		}
	}
	return calls
}

// ToolAdapter adapts an agent Tool to an llm Tool
type ToolAdapter struct {
	tool Tool
}

// GetName returns the tool name
func (t *ToolAdapter) GetName() string {
	return t.tool.GetName()
}

// GetDescription returns the tool description
func (t *ToolAdapter) GetDescription() string {
	return t.tool.GetDescription()
}

// GetParameters returns the tool parameters
func (t *ToolAdapter) GetParameters() map[string]interface{} {
	// For simplicity, return a basic schema
	// In production, this should be more sophisticated
	return map[string]interface{}{
		"query": map[string]string{
			"type":        "string",
			"description": "The input for the tool",
		},
	}
}

// GetRequired returns required parameters
func (t *ToolAdapter) GetRequired() []string {
	return []string{"query"}
}