package agents

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"
)

// ReActProcessor implements the ReAct (Reasoning + Acting) pattern
type ReActProcessor struct {
	agent         Agent
	llmClient     LLMClient
	tools         map[string]Tool
	maxIterations int
}

// NewReActProcessor creates a new ReAct processor
func NewReActProcessor(agent Agent, llmClient LLMClient, tools []Tool, maxIterations int) *ReActProcessor {
	toolMap := make(map[string]Tool)
	for _, tool := range tools {
		toolMap[tool.GetName()] = tool
	}
	
	if maxIterations <= 0 {
		maxIterations = 5
	}
	
	return &ReActProcessor{
		agent:         agent,
		llmClient:     llmClient,
		tools:         toolMap,
		maxIterations: maxIterations,
	}
}

// Process executes the ReAct loop
func (r *ReActProcessor) Process(ctx context.Context, input AgentInput) (*AgentOutput, error) {
	output := &AgentOutput{
		Reasoning:   []ReActStep{},
		Tools:       []ToolExecution{},
		Suggestions: []string{},
		References:  []Reference{},
		Metadata:    make(map[string]interface{}),
	}
	
	// Build the initial prompt
	systemPrompt := r.buildSystemPrompt()
	userPrompt := r.buildUserPrompt(input)
	
	// Initialize conversation history for the ReAct loop
	conversation := []ConversationHistory{
		{Role: "system", Content: systemPrompt},
		{Role: "user", Content: userPrompt},
	}
	
	// Execute ReAct iterations
	for i := 0; i < r.maxIterations; i++ {
		step := ReActStep{
			StepNumber: i + 1,
		}
		
		// Generate thought and action
		thoughtPrompt := r.buildThoughtPrompt(conversation, i+1)
		response, err := r.llmClient.CompleteWithTools(
			ctx,
			thoughtPrompt,
			r.getToolList(),
			WithSystemPrompt(systemPrompt),
			WithTemperature(0.7),
			WithMaxTokens(1000),
		)
		if err != nil {
			return nil, fmt.Errorf("failed to generate thought: %w", err)
		}
		
		// Parse the response for thought and action
		thought, action, actionInput, isFinal := r.parseReActResponse(response.Content)
		step.Thought = thought
		step.Action = action
		step.ActionInput = actionInput
		
		// If this is the final answer, we're done
		if isFinal {
			output.Response = actionInput
			output.Reasoning = append(output.Reasoning, step)
			output.Confidence = r.calculateConfidence(output)
			break
		}
		
		// Execute the action if it's a tool call
		if action != "" && action != "Final Answer" {
			observation, toolExec := r.executeTool(ctx, action, actionInput)
			step.Observation = observation
			if toolExec != nil {
				output.Tools = append(output.Tools, *toolExec)
			}
			
			// Generate reflection on the observation
			reflectionPrompt := r.buildReflectionPrompt(step)
			reflection, err := r.llmClient.Complete(
				ctx,
				reflectionPrompt,
				WithTemperature(0.5),
				WithMaxTokens(200),
			)
			if err == nil {
				step.Reflection = reflection
			}
		}
		
		output.Reasoning = append(output.Reasoning, step)
		
		// Add to conversation history
		conversation = append(conversation, ConversationHistory{
			Role:    "assistant",
			Content: r.formatStepForHistory(step),
		})
		
		// Check if we have enough information to provide a final answer
		if r.shouldProvideAnswer(output) {
			finalAnswer := r.generateFinalAnswer(ctx, input, output)
			output.Response = finalAnswer
			output.Confidence = r.calculateConfidence(output)
			break
		}
	}
	
	// If we haven't generated a response yet, create one from the reasoning
	if output.Response == "" {
		output.Response = r.synthesizeResponse(ctx, input, output)
		output.Confidence = r.calculateConfidence(output)
	}
	
	// Extract suggestions and next actions
	output.Suggestions = r.extractSuggestions(output)
	output.NextActions = r.extractNextActions(input, output)
	
	return output, nil
}

// buildSystemPrompt creates the system prompt for the agent
func (r *ReActProcessor) buildSystemPrompt() string {
	toolDescriptions := []string{}
	for name, tool := range r.tools {
		toolDescriptions = append(toolDescriptions, 
			fmt.Sprintf("- %s: %s", name, tool.GetDescription()))
	}
	
	return fmt.Sprintf(`You are %s, an AI agent with the following characteristics:

Role: %s
Background Knowledge: %s
Responsibility: %s

You operate using the ReAct (Reasoning + Acting) framework. For each query:
1. THINK about what you need to do
2. Decide on an ACTION (use a tool or provide final answer)
3. OBSERVE the result
4. REFLECT on what you learned
5. Repeat until you have enough information

Available Tools:
%s

Response Format:
Thought: [Your reasoning about the current situation]
Action: [Tool name or "Final Answer"]
Action Input: [Input for the tool or your final answer]

When you have sufficient information, use:
Action: Final Answer
Action Input: [Your complete response to the user]

Be thorough but concise. Focus on providing actionable insights.`,
		r.agent.GetName(),
		r.agent.GetRole(),
		r.agent.GetBackgroundKnowledge(),
		r.agent.GetResponsibility(),
		strings.Join(toolDescriptions, "\n"))
}

// buildUserPrompt creates the user prompt from input
func (r *ReActProcessor) buildUserPrompt(input AgentInput) string {
	contextInfo := ""
	if input.Context != "" {
		contextInfo = fmt.Sprintf("\nContext: %s", input.Context)
	}
	
	phaseInfo := ""
	if input.Phase != "" {
		phaseInfo = fmt.Sprintf("\nCurrent Phase: %s", input.Phase)
	}
	
	return fmt.Sprintf(`Query: %s%s%s

Please help with this request using your expertise and available tools.`,
		input.Query, contextInfo, phaseInfo)
}

// buildThoughtPrompt creates a prompt for generating the next thought
func (r *ReActProcessor) buildThoughtPrompt(conversation []ConversationHistory, stepNum int) string {
	historyText := ""
	for _, h := range conversation {
		historyText += fmt.Sprintf("%s: %s\n\n", h.Role, h.Content)
	}
	
	return fmt.Sprintf(`%s

Step %d: What should I think about and do next? Please respond with:
Thought: [Your reasoning]
Action: [Tool name or "Final Answer"]
Action Input: [Input for the tool or final answer]`,
		historyText, stepNum)
}

// parseReActResponse parses the LLM response for ReAct components
func (r *ReActProcessor) parseReActResponse(response string) (thought, action, actionInput string, isFinal bool) {
	lines := strings.Split(response, "\n")
	
	for _, line := range lines {
		line = strings.TrimSpace(line)
		
		if strings.HasPrefix(line, "Thought:") {
			thought = strings.TrimSpace(strings.TrimPrefix(line, "Thought:"))
		} else if strings.HasPrefix(line, "Action:") {
			action = strings.TrimSpace(strings.TrimPrefix(line, "Action:"))
			if action == "Final Answer" {
				isFinal = true
			}
		} else if strings.HasPrefix(line, "Action Input:") {
			actionInput = strings.TrimSpace(strings.TrimPrefix(line, "Action Input:"))
			// Continue reading multi-line input
			for i := range lines {
				if lines[i] == line {
					for j := i + 1; j < len(lines); j++ {
						if !strings.HasPrefix(lines[j], "Thought:") && 
						   !strings.HasPrefix(lines[j], "Action:") {
							actionInput += "\n" + lines[j]
						} else {
							break
						}
					}
					break
				}
			}
			actionInput = strings.TrimSpace(actionInput)
		}
	}
	
	return
}

// executeTool executes a tool and returns the observation
func (r *ReActProcessor) executeTool(ctx context.Context, toolName, input string) (string, *ToolExecution) {
	tool, exists := r.tools[toolName]
	if !exists {
		return fmt.Sprintf("Error: Tool '%s' not found", toolName), nil
	}
	
	// Parse input as JSON if possible
	var inputMap map[string]interface{}
	if err := json.Unmarshal([]byte(input), &inputMap); err != nil {
		// If not JSON, create a simple map with the input as a "query" field
		inputMap = map[string]interface{}{
			"query": input,
		}
	}
	
	// Validate input
	if err := tool.ValidateInput(inputMap); err != nil {
		return fmt.Sprintf("Error: Invalid input for tool '%s': %v", toolName, err), nil
	}
	
	// Execute the tool
	startTime := time.Now()
	result, err := tool.Execute(ctx, inputMap)
	duration := time.Since(startTime).Milliseconds()
	
	execution := &ToolExecution{
		ToolName: toolName,
		Input:    inputMap,
		Output:   result,
		Duration: duration,
		Success:  err == nil,
	}
	
	if err != nil {
		execution.Error = err.Error()
		return fmt.Sprintf("Error executing tool '%s': %v", toolName, err), execution
	}
	
	// Convert result to string
	resultStr := ""
	switch v := result.(type) {
	case string:
		resultStr = v
	case []byte:
		resultStr = string(v)
	default:
		if b, err := json.Marshal(result); err == nil {
			resultStr = string(b)
		} else {
			resultStr = fmt.Sprintf("%v", result)
		}
	}
	
	return resultStr, execution
}

// buildReflectionPrompt creates a prompt for reflection
func (r *ReActProcessor) buildReflectionPrompt(step ReActStep) string {
	return fmt.Sprintf(`Based on this ReAct step:
Thought: %s
Action: %s
Action Input: %s
Observation: %s

Provide a brief reflection (1-2 sentences) on what was learned and how it helps answer the query.`,
		step.Thought, step.Action, step.ActionInput, step.Observation)
}

// formatStepForHistory formats a ReAct step for conversation history
func (r *ReActProcessor) formatStepForHistory(step ReActStep) string {
	result := fmt.Sprintf("Step %d:\nThought: %s\nAction: %s\nAction Input: %s",
		step.StepNumber, step.Thought, step.Action, step.ActionInput)
	
	if step.Observation != "" {
		result += fmt.Sprintf("\nObservation: %s", step.Observation)
	}
	
	if step.Reflection != "" {
		result += fmt.Sprintf("\nReflection: %s", step.Reflection)
	}
	
	return result
}

// shouldProvideAnswer determines if we have enough information
func (r *ReActProcessor) shouldProvideAnswer(output *AgentOutput) bool {
	// If we have multiple tool executions and observations, we likely have enough
	if len(output.Tools) >= 2 {
		return true
	}
	
	// If we've done many reasoning steps
	if len(output.Reasoning) >= r.maxIterations-1 {
		return true
	}
	
	// Check if the last step indicated readiness
	if len(output.Reasoning) > 0 {
		lastStep := output.Reasoning[len(output.Reasoning)-1]
		if strings.Contains(strings.ToLower(lastStep.Thought), "sufficient") ||
		   strings.Contains(strings.ToLower(lastStep.Thought), "ready") ||
		   strings.Contains(strings.ToLower(lastStep.Thought), "complete") {
			return true
		}
	}
	
	return false
}

// generateFinalAnswer creates the final answer from all reasoning
func (r *ReActProcessor) generateFinalAnswer(ctx context.Context, input AgentInput, output *AgentOutput) string {
	// Build a summary of findings
	findings := []string{}
	for _, step := range output.Reasoning {
		if step.Observation != "" && step.Reflection != "" {
			findings = append(findings, fmt.Sprintf("- %s", step.Reflection))
		}
	}
	
	prompt := fmt.Sprintf(`Based on the following query and findings, provide a comprehensive answer:

Query: %s
Context: %s

Key Findings:
%s

Provide a clear, actionable response that directly addresses the query.`,
		input.Query, input.Context, strings.Join(findings, "\n"))
	
	response, err := r.llmClient.Complete(ctx, prompt,
		WithTemperature(0.7),
		WithMaxTokens(500))
	
	if err != nil {
		return r.synthesizeResponse(ctx, input, output)
	}
	
	return response
}

// synthesizeResponse creates a response from reasoning steps
func (r *ReActProcessor) synthesizeResponse(ctx context.Context, input AgentInput, output *AgentOutput) string {
	if len(output.Reasoning) == 0 {
		return "I need more information to provide a helpful response."
	}
	
	// Collect all observations and reflections
	insights := []string{}
	for _, step := range output.Reasoning {
		if step.Reflection != "" {
			insights = append(insights, step.Reflection)
		} else if step.Observation != "" {
			insights = append(insights, step.Observation)
		}
	}
	
	if len(insights) == 0 {
		return "I'm still processing your request. Please try again."
	}
	
	return fmt.Sprintf("Based on my analysis:\n\n%s", strings.Join(insights, "\n\n"))
}

// calculateConfidence calculates confidence score based on reasoning
func (r *ReActProcessor) calculateConfidence(output *AgentOutput) float64 {
	confidence := 0.5 // Base confidence
	
	// More tool executions increase confidence
	confidence += float64(len(output.Tools)) * 0.1
	
	// Successful tool executions increase confidence
	for _, tool := range output.Tools {
		if tool.Success {
			confidence += 0.05
		}
	}
	
	// More reasoning steps with observations increase confidence
	for _, step := range output.Reasoning {
		if step.Observation != "" {
			confidence += 0.05
		}
	}
	
	// Cap at 0.95
	if confidence > 0.95 {
		confidence = 0.95
	}
	
	return confidence
}

// extractSuggestions extracts suggestions from the reasoning
func (r *ReActProcessor) extractSuggestions(output *AgentOutput) []string {
	suggestions := []string{}
	
	// Look for suggestion patterns in reasoning
	for _, step := range output.Reasoning {
		text := step.Thought + " " + step.Reflection
		if strings.Contains(strings.ToLower(text), "suggest") ||
		   strings.Contains(strings.ToLower(text), "recommend") ||
		   strings.Contains(strings.ToLower(text), "consider") {
			// Extract the suggestion (simple heuristic)
			sentences := strings.Split(text, ".")
			for _, sentence := range sentences {
				if strings.Contains(strings.ToLower(sentence), "suggest") ||
				   strings.Contains(strings.ToLower(sentence), "recommend") ||
				   strings.Contains(strings.ToLower(sentence), "consider") {
					suggestions = append(suggestions, strings.TrimSpace(sentence))
				}
			}
		}
	}
	
	return suggestions
}

// extractNextActions extracts recommended next actions
func (r *ReActProcessor) extractNextActions(input AgentInput, output *AgentOutput) []string {
	actions := []string{}
	
	// Based on the agent type and phase, suggest next actions
	switch r.agent.GetName() {
	case "ThinkAgent":
		if input.Phase == "foundation" {
			actions = append(actions, "验证客户定义的准确性")
			actions = append(actions, "深入分析问题的根本原因")
		}
	case "CritiqueAgent":
		actions = append(actions, "收集市场数据验证假设")
		actions = append(actions, "与潜在用户进行访谈")
	case "ResearchAgent":
		actions = append(actions, "分析竞争对手的具体策略")
		actions = append(actions, "研究行业发展趋势")
	}
	
	return actions
}

// getToolList returns the list of tools as a slice
func (r *ReActProcessor) getToolList() []Tool {
	tools := make([]Tool, 0, len(r.tools))
	for _, tool := range r.tools {
		tools = append(tools, tool)
	}
	return tools
}