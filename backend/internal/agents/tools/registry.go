package tools

import (
	"context"
	"fmt"
)

// Tool represents an MCP tool that agents can use
type Tool interface {
	GetName() string
	GetDescription() string
	Execute(ctx context.Context, input map[string]interface{}) (interface{}, error)
	ValidateInput(input map[string]interface{}) error
}

// BaseTool provides common functionality for tools
type BaseTool struct {
	Name        string
	Description string
	Required    []string // Required input fields
	Optional    []string // Optional input fields
}

// GetName returns the tool name
func (t *BaseTool) GetName() string {
	return t.Name
}

// GetDescription returns the tool description
func (t *BaseTool) GetDescription() string {
	return t.Description
}

// ValidateInput validates that required fields are present
func (t *BaseTool) ValidateInput(input map[string]interface{}) error {
	for _, field := range t.Required {
		if _, exists := input[field]; !exists {
			return fmt.Errorf("required field '%s' is missing", field)
		}
	}
	return nil
}

// Registry manages available tools
type Registry struct {
	tools map[string]Tool
}

// NewRegistry creates a new tool registry
func NewRegistry() *Registry {
	return &Registry{
		tools: make(map[string]Tool),
	}
}

// Register adds a tool to the registry
func (r *Registry) Register(tool Tool) error {
	if tool == nil {
		return fmt.Errorf("cannot register nil tool")
	}
	
	name := tool.GetName()
	if name == "" {
		return fmt.Errorf("tool name cannot be empty")
	}
	
	if _, exists := r.tools[name]; exists {
		return fmt.Errorf("tool '%s' is already registered", name)
	}
	
	r.tools[name] = tool
	return nil
}

// Get retrieves a tool by name
func (r *Registry) Get(name string) (Tool, bool) {
	tool, exists := r.tools[name]
	return tool, exists
}

// List returns all registered tools
func (r *Registry) List() []Tool {
	tools := make([]Tool, 0, len(r.tools))
	for _, tool := range r.tools {
		tools = append(tools, tool)
	}
	return tools
}

// GetToolsForAgent returns tools appropriate for a specific agent
func (r *Registry) GetToolsForAgent(agentName string) []Tool {
	var tools []Tool
	
	switch agentName {
	case "ThinkAgent":
		// Tools for expanding thinking
		tools = append(tools, r.getToolsByNames([]string{
			"brainstorm",
			"perspective_analysis",
			"blind_spot_detection",
			"analogy_finder",
			"question_generator",
		})...)
		
	case "CritiqueAgent":
		// Tools for critical analysis
		tools = append(tools, r.getToolsByNames([]string{
			"assumption_checker",
			"market_validator",
			"feasibility_analyzer",
			"risk_assessor",
			"competitor_analyzer",
		})...)
		
	case "ResearchAgent":
		// Tools for research and data collection
		tools = append(tools, r.getToolsByNames([]string{
			"web_search",
			"market_research",
			"trend_analyzer",
			"data_collector",
			"source_validator",
		})...)
	}
	
	return tools
}

// getToolsByNames retrieves multiple tools by their names
func (r *Registry) getToolsByNames(names []string) []Tool {
	var tools []Tool
	for _, name := range names {
		if tool, exists := r.tools[name]; exists {
			tools = append(tools, tool)
		}
	}
	return tools
}

// DefaultRegistry is the global tool registry
var DefaultRegistry = NewRegistry()

// Register adds a tool to the default registry
func Register(tool Tool) error {
	return DefaultRegistry.Register(tool)
}

// Get retrieves a tool from the default registry
func Get(name string) (Tool, bool) {
	return DefaultRegistry.Get(name)
}

// List returns all tools from the default registry
func List() []Tool {
	return DefaultRegistry.List()
}

// GetToolsForAgent returns tools for a specific agent from the default registry
func GetToolsForAgent(agentName string) []Tool {
	return DefaultRegistry.GetToolsForAgent(agentName)
}