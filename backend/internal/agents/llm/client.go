package llm

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"
)

// Provider represents the LLM provider
type Provider string

const (
	ProviderOpenAI    Provider = "openai"
	ProviderAnthropic Provider = "anthropic"
)

// Client is the LLM client implementation
type Client struct {
	provider   Provider
	apiKey     string
	baseURL    string
	httpClient *http.Client
	model      string
}

// NewClient creates a new LLM client
func NewClient(provider Provider) (*Client, error) {
	var apiKey, baseURL, model string

	switch provider {
	case ProviderOpenAI:
		apiKey = os.Getenv("OPENAI_API_KEY")
		baseURL = os.Getenv("OPENAI_BASE_URL")
		if baseURL == "" {
			baseURL = "https://api.openai.com/v1"
		}
		model = os.Getenv("OPENAI_MODEL")
		if model == "" {
			model = "gpt-4o"
		}

	case ProviderAnthropic:
		apiKey = os.Getenv("ANTHROPIC_API_KEY")
		baseURL = os.Getenv("ANTHROPIC_BASE_URL")
		if baseURL == "" {
			baseURL = "https://api.anthropic.com/v1"
		}
		model = os.Getenv("ANTHROPIC_MODEL")
		if model == "" {
			model = "claude-3-opus-20240229"
		}

	default:
		return nil, fmt.Errorf("unsupported provider: %s", provider)
	}

	if apiKey == "" {
		return nil, fmt.Errorf("%s API key not found in environment", provider)
	}

	return &Client{
		provider: provider,
		apiKey:   apiKey,
		baseURL:  baseURL,
		httpClient: &http.Client{
			Timeout: 120 * time.Second, // Increased timeout for slower APIs
		},
		model: model,
	}, nil
}

// Complete generates a completion for the given prompt
func (c *Client) Complete(ctx context.Context, prompt string, options ...Option) (string, error) {
	config := &Config{
		Temperature: 0.7,
		MaxTokens:   1000,
		Model:       c.model,
	}

	for _, opt := range options {
		opt(config)
	}

	switch c.provider {
	case ProviderOpenAI:
		return c.completeOpenAI(ctx, prompt, config)
	case ProviderAnthropic:
		return c.completeAnthropic(ctx, prompt, config)
	default:
		return "", fmt.Errorf("unsupported provider: %s", c.provider)
	}
}

// CompleteWithTools generates a completion with tool support
func (c *Client) CompleteWithTools(ctx context.Context, prompt string, tools []Tool, options ...Option) (*Response, error) {
	config := &Config{
		Temperature: 0.7,
		MaxTokens:   1000,
		Model:       c.model,
	}

	for _, opt := range options {
		opt(config)
	}

	switch c.provider {
	case ProviderOpenAI:
		return c.completeWithToolsOpenAI(ctx, prompt, tools, config)
	case ProviderAnthropic:
		return c.completeWithToolsAnthropic(ctx, prompt, tools, config)
	default:
		return nil, fmt.Errorf("unsupported provider: %s", c.provider)
	}
}

// Stream generates a streaming completion
func (c *Client) Stream(ctx context.Context, prompt string, options ...Option) (<-chan string, error) {
	config := &Config{
		Temperature: 0.7,
		MaxTokens:   1000,
		Model:       c.model,
	}

	for _, opt := range options {
		opt(config)
	}

	switch c.provider {
	case ProviderOpenAI:
		return c.streamOpenAI(ctx, prompt, config)
	case ProviderAnthropic:
		return c.streamAnthropic(ctx, prompt, config)
	default:
		return nil, fmt.Errorf("unsupported provider: %s", c.provider)
	}
}

// completeOpenAI handles OpenAI completions
func (c *Client) completeOpenAI(ctx context.Context, prompt string, config *Config) (string, error) {
	messages := []map[string]string{
		{"role": "user", "content": prompt},
	}

	if config.SystemPrompt != "" {
		messages = append([]map[string]string{
			{"role": "system", "content": config.SystemPrompt},
		}, messages...)
	}

	requestBody := map[string]interface{}{
		"model":       config.Model,
		"messages":    messages,
		"temperature": config.Temperature,
		"max_tokens":  config.MaxTokens,
	}

	body, err := json.Marshal(requestBody)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", c.baseURL+"/chat/completions", bytes.NewReader(body))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.apiKey)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("API error (status %d): %s", resp.StatusCode, string(body))
	}

	var response struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return "", fmt.Errorf("failed to decode response: %w", err)
	}

	if len(response.Choices) == 0 {
		return "", fmt.Errorf("no response from API")
	}

	return response.Choices[0].Message.Content, nil
}

// completeAnthropic handles Anthropic completions
func (c *Client) completeAnthropic(ctx context.Context, prompt string, config *Config) (string, error) {
	messages := []map[string]string{
		{"role": "user", "content": prompt},
	}

	requestBody := map[string]interface{}{
		"model":       config.Model,
		"messages":    messages,
		"temperature": config.Temperature,
		"max_tokens":  config.MaxTokens,
	}

	if config.SystemPrompt != "" {
		requestBody["system"] = config.SystemPrompt
	}

	body, err := json.Marshal(requestBody)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", c.baseURL+"/messages", bytes.NewReader(body))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", c.apiKey)
	req.Header.Set("anthropic-version", "2023-06-01")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("API error (status %d): %s", resp.StatusCode, string(body))
	}

	var response struct {
		Content []struct {
			Text string `json:"text"`
		} `json:"content"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return "", fmt.Errorf("failed to decode response: %w", err)
	}

	if len(response.Content) == 0 {
		return "", fmt.Errorf("no response from API")
	}

	return response.Content[0].Text, nil
}

// completeWithToolsOpenAI handles OpenAI completions with tools
func (c *Client) completeWithToolsOpenAI(ctx context.Context, prompt string, tools []Tool, config *Config) (*Response, error) {
	// Convert tools to OpenAI format
	openAITools := make([]map[string]interface{}, len(tools))
	for i, tool := range tools {
		openAITools[i] = map[string]interface{}{
			"type": "function",
			"function": map[string]interface{}{
				"name":        tool.GetName(),
				"description": tool.GetDescription(),
				"parameters": map[string]interface{}{
					"type":       "object",
					"properties": tool.GetParameters(),
					"required":   tool.GetRequired(),
				},
			},
		}
	}

	messages := []map[string]string{
		{"role": "user", "content": prompt},
	}

	if config.SystemPrompt != "" {
		messages = append([]map[string]string{
			{"role": "system", "content": config.SystemPrompt},
		}, messages...)
	}

	requestBody := map[string]interface{}{
		"model":       config.Model,
		"messages":    messages,
		"tools":       openAITools,
		"temperature": config.Temperature,
		"max_tokens":  config.MaxTokens,
	}

	body, err := json.Marshal(requestBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", c.baseURL+"/chat/completions", bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.apiKey)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("API error (status %d): %s", resp.StatusCode, string(body))
	}

	var apiResponse struct {
		Choices []struct {
			Message struct {
				Content   string `json:"content"`
				ToolCalls []struct {
					ID       string `json:"id"`
					Function struct {
						Name      string `json:"name"`
						Arguments string `json:"arguments"`
					} `json:"function"`
				} `json:"tool_calls"`
			} `json:"message"`
			FinishReason string `json:"finish_reason"`
		} `json:"choices"`
		Usage struct {
			PromptTokens     int `json:"prompt_tokens"`
			CompletionTokens int `json:"completion_tokens"`
			TotalTokens      int `json:"total_tokens"`
		} `json:"usage"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&apiResponse); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	if len(apiResponse.Choices) == 0 {
		return nil, fmt.Errorf("no response from API")
	}

	choice := apiResponse.Choices[0]
	response := &Response{
		Content:      choice.Message.Content,
		FinishReason: choice.FinishReason,
		Usage: TokenUsage{
			PromptTokens:     apiResponse.Usage.PromptTokens,
			CompletionTokens: apiResponse.Usage.CompletionTokens,
			TotalTokens:      apiResponse.Usage.TotalTokens,
		},
	}

	// Convert tool calls
	for _, tc := range choice.Message.ToolCalls {
		var args map[string]interface{}
		if err := json.Unmarshal([]byte(tc.Function.Arguments), &args); err != nil {
			continue
		}
		response.ToolCalls = append(response.ToolCalls, ToolCall{
			ID:        tc.ID,
			Name:      tc.Function.Name,
			Arguments: args,
		})
	}

	return response, nil
}

// completeWithToolsAnthropic handles Anthropic completions with tools
func (c *Client) completeWithToolsAnthropic(ctx context.Context, prompt string, tools []Tool, config *Config) (*Response, error) {
	// For Anthropic, we'll simulate tool calling through prompting
	// since Claude doesn't have native function calling like OpenAI

	toolDescriptions := []string{}
	for _, tool := range tools {
		toolDescriptions = append(toolDescriptions,
			fmt.Sprintf("- %s: %s", tool.GetName(), tool.GetDescription()))
	}

	enhancedPrompt := fmt.Sprintf(`%s

Available tools:
%s

If you need to use a tool, respond with:
Tool: [tool_name]
Arguments: [JSON arguments]

Otherwise, provide your response directly.`, prompt, strings.Join(toolDescriptions, "\n"))

	content, err := c.completeAnthropic(ctx, enhancedPrompt, config)
	if err != nil {
		return nil, err
	}

	// Parse for tool calls
	response := &Response{
		Content:      content,
		FinishReason: "stop",
		Usage: TokenUsage{
			// Anthropic doesn't provide token usage in the same way
			TotalTokens: len(content) / 4, // Rough estimate
		},
	}

	// Simple parsing for tool calls
	if strings.Contains(content, "Tool:") && strings.Contains(content, "Arguments:") {
		lines := strings.Split(content, "\n")
		var toolName string
		var arguments string

		for i, line := range lines {
			if strings.HasPrefix(line, "Tool:") {
				toolName = strings.TrimSpace(strings.TrimPrefix(line, "Tool:"))
			}
			if strings.HasPrefix(line, "Arguments:") {
				arguments = strings.TrimSpace(strings.TrimPrefix(line, "Arguments:"))
				// Try to get multi-line JSON
				for j := i + 1; j < len(lines); j++ {
					if !strings.HasPrefix(lines[j], "Tool:") {
						arguments += "\n" + lines[j]
					} else {
						break
					}
				}
			}
		}

		if toolName != "" && arguments != "" {
			var args map[string]interface{}
			if err := json.Unmarshal([]byte(arguments), &args); err == nil {
				response.ToolCalls = append(response.ToolCalls, ToolCall{
					ID:        fmt.Sprintf("call_%d", time.Now().Unix()),
					Name:      toolName,
					Arguments: args,
				})
			}
		}
	}

	return response, nil
}

// streamOpenAI handles OpenAI streaming
func (c *Client) streamOpenAI(ctx context.Context, prompt string, config *Config) (<-chan string, error) {
	ch := make(chan string)

	// For simplicity, using non-streaming API with channel
	// In production, implement SSE streaming
	go func() {
		defer close(ch)

		content, err := c.completeOpenAI(ctx, prompt, config)
		if err != nil {
			ch <- fmt.Sprintf("Error: %v", err)
			return
		}

		// Simulate streaming by sending chunks
		words := strings.Fields(content)
		for i, word := range words {
			select {
			case <-ctx.Done():
				return
			case ch <- word:
				if i < len(words)-1 {
					ch <- " "
				}
			}
			time.Sleep(50 * time.Millisecond) // Simulate streaming delay
		}
	}()

	return ch, nil
}

// streamAnthropic handles Anthropic streaming
func (c *Client) streamAnthropic(ctx context.Context, prompt string, config *Config) (<-chan string, error) {
	ch := make(chan string)

	// Similar to OpenAI, using non-streaming with simulated streaming
	go func() {
		defer close(ch)

		content, err := c.completeAnthropic(ctx, prompt, config)
		if err != nil {
			ch <- fmt.Sprintf("Error: %v", err)
			return
		}

		// Simulate streaming by sending chunks
		words := strings.Fields(content)
		for i, word := range words {
			select {
			case <-ctx.Done():
				return
			case ch <- word:
				if i < len(words)-1 {
					ch <- " "
				}
			}
			time.Sleep(50 * time.Millisecond)
		}
	}()

	return ch, nil
}
