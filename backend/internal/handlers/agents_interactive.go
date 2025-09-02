package handlers

import (
	"context"
	"foundation-sprint/internal/agents"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// Global session store
var SessionStore agents.SessionStore

// InitSessionStore initializes the session store
func InitSessionStore() {
	// Use memory store with 30 minute TTL
	SessionStore = agents.NewMemorySessionStore(30 * time.Minute)
}

// InteractiveAgentRequest represents a request for interactive agent processing
type InteractiveAgentRequest struct {
	AgentRequest
	SessionID string `json:"session_id,omitempty"`
	UserInput string `json:"user_input,omitempty"`
}

// InteractiveAgentResponse represents an interactive agent response
type InteractiveAgentResponse struct {
	AgentResponse
	
	// Interactive fields
	SessionID         string                      `json:"session_id"`
	NeedsInteraction  bool                        `json:"needs_interaction"`
	InteractionType   string                      `json:"interaction_type,omitempty"`
	InteractionPrompt string                      `json:"interaction_prompt,omitempty"`
	InteractionOptions []string                   `json:"interaction_options,omitempty"`
	CanContinue       bool                        `json:"can_continue"`
	SessionStatus     string                      `json:"session_status,omitempty"`
}

// ThinkAgentInteractive handles interactive ThinkAgent requests
func ThinkAgentInteractive(c *gin.Context) {
	var req InteractiveAgentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Initialize services if needed
	if AgentService == nil {
		if err := InitAgentService(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Agent service not initialized",
				"details": err.Error(),
			})
			return
		}
	}
	
	if SessionStore == nil {
		InitSessionStore()
	}

	// Get the agent
	agent, err := AgentService.GetAgent("ThinkAgent")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get agent",
			"details": err.Error(),
		})
		return
	}

	// Create interactive processor
	processor := agents.NewInteractiveReActProcessor(
		agent,
		AgentService.LLMClient,
		agents.GetToolsForAgent("ThinkAgent"),
		5,
		SessionStore,
	)

	// Convert request to agent input
	input := agents.AgentInput{
		Query:   req.Query,
		Context: req.Context,
		RoomID:  req.RoomID,
		Phase:   req.Phase,
		Data:    req.Data,
	}

	// If user input is provided, use it as the query
	if req.UserInput != "" {
		input.Query = req.UserInput
	}

	// Convert history
	for _, h := range req.History {
		input.History = append(input.History, agents.ConversationHistory{
			Role:    h.Role,
			Content: h.Content,
		})
	}

	// Create context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Process with interactive support
	output, err := processor.ProcessInteractive(ctx, input, req.SessionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to process request",
			"details": err.Error(),
		})
		return
	}

	// Convert to response
	response := InteractiveAgentResponse{
		AgentResponse: convertAgentOutput("think", req.Context, output.AgentOutput),
		SessionID: output.SessionID,
		NeedsInteraction: output.NeedsInteraction,
		InteractionType: string(output.InteractionType),
		InteractionPrompt: output.InteractionPrompt,
		InteractionOptions: output.InteractionOptions,
		CanContinue: output.CanContinue,
	}

	if output.SessionState != nil {
		response.SessionStatus = string(output.SessionState.Status)
	}

	c.JSON(http.StatusOK, response)
}

// CritiqueAgentInteractive handles interactive CritiqueAgent requests
func CritiqueAgentInteractive(c *gin.Context) {
	var req InteractiveAgentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Initialize services if needed
	if AgentService == nil {
		if err := InitAgentService(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Agent service not initialized",
				"details": err.Error(),
			})
			return
		}
	}
	
	if SessionStore == nil {
		InitSessionStore()
	}

	// Get the agent
	agent, err := AgentService.GetAgent("CritiqueAgent")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get agent",
			"details": err.Error(),
		})
		return
	}

	// Create interactive processor
	processor := agents.NewInteractiveReActProcessor(
		agent,
		AgentService.LLMClient,
		agents.GetToolsForAgent("CritiqueAgent"),
		5,
		SessionStore,
	)

	// Convert request to agent input
	input := agents.AgentInput{
		Query:   req.Query,
		Context: req.Context,
		RoomID:  req.RoomID,
		Phase:   req.Phase,
		Data:    req.Data,
	}

	// If user input is provided, use it as the query
	if req.UserInput != "" {
		input.Query = req.UserInput
	}

	// Convert history
	for _, h := range req.History {
		input.History = append(input.History, agents.ConversationHistory{
			Role:    h.Role,
			Content: h.Content,
		})
	}

	// Create context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Process with interactive support
	output, err := processor.ProcessInteractive(ctx, input, req.SessionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to process request",
			"details": err.Error(),
		})
		return
	}

	// Convert to response
	response := InteractiveAgentResponse{
		AgentResponse: convertAgentOutput("critique", req.Context, output.AgentOutput),
		SessionID: output.SessionID,
		NeedsInteraction: output.NeedsInteraction,
		InteractionType: string(output.InteractionType),
		InteractionPrompt: output.InteractionPrompt,
		InteractionOptions: output.InteractionOptions,
		CanContinue: output.CanContinue,
	}

	if output.SessionState != nil {
		response.SessionStatus = string(output.SessionState.Status)
	}

	c.JSON(http.StatusOK, response)
}

// ResearchAgentInteractive handles interactive ResearchAgent requests
func ResearchAgentInteractive(c *gin.Context) {
	var req InteractiveAgentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Initialize services if needed
	if AgentService == nil {
		if err := InitAgentService(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Agent service not initialized",
				"details": err.Error(),
			})
			return
		}
	}
	
	if SessionStore == nil {
		InitSessionStore()
	}

	// Get the agent
	agent, err := AgentService.GetAgent("ResearchAgent")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get agent",
			"details": err.Error(),
		})
		return
	}

	// Create interactive processor
	processor := agents.NewInteractiveReActProcessor(
		agent,
		AgentService.LLMClient,
		agents.GetToolsForAgent("ResearchAgent"),
		5,
		SessionStore,
	)

	// Convert request to agent input
	input := agents.AgentInput{
		Query:   req.Query,
		Context: req.Context,
		RoomID:  req.RoomID,
		Phase:   req.Phase,
		Data:    req.Data,
	}

	// If user input is provided, use it as the query
	if req.UserInput != "" {
		input.Query = req.UserInput
	}

	// Convert history
	for _, h := range req.History {
		input.History = append(input.History, agents.ConversationHistory{
			Role:    h.Role,
			Content: h.Content,
		})
	}

	// Create context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Process with interactive support
	output, err := processor.ProcessInteractive(ctx, input, req.SessionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to process request",
			"details": err.Error(),
		})
		return
	}

	// Convert to response
	response := InteractiveAgentResponse{
		AgentResponse: convertAgentOutput("research", req.Context, output.AgentOutput),
		SessionID: output.SessionID,
		NeedsInteraction: output.NeedsInteraction,
		InteractionType: string(output.InteractionType),
		InteractionPrompt: output.InteractionPrompt,
		InteractionOptions: output.InteractionOptions,
		CanContinue: output.CanContinue,
	}

	if output.SessionState != nil {
		response.SessionStatus = string(output.SessionState.Status)
	}

	c.JSON(http.StatusOK, response)
}

// GetAgentSessions returns all sessions for an agent
func GetAgentSessions(c *gin.Context) {
	agentName := c.Param("agent")
	
	if SessionStore == nil {
		InitSessionStore()
	}
	
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	
	sessions, err := SessionStore.List(ctx, agentName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get sessions",
			"details": err.Error(),
		})
		return
	}
	
	// Convert to simplified response
	var response []map[string]interface{}
	for _, session := range sessions {
		response = append(response, map[string]interface{}{
			"session_id": session.SessionID,
			"agent_name": session.AgentName,
			"start_time": session.StartTime,
			"last_update": session.LastUpdateTime,
			"status": session.Status,
			"current_iteration": session.CurrentIteration,
			"max_iterations": session.MaxIterations,
			"interactions_count": len(session.Interactions),
		})
	}
	
	c.JSON(http.StatusOK, gin.H{
		"agent": agentName,
		"sessions": response,
		"total": len(response),
	})
}

// GetSessionDetails returns details of a specific session
func GetSessionDetails(c *gin.Context) {
	sessionID := c.Param("session_id")
	
	if SessionStore == nil {
		InitSessionStore()
	}
	
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	
	session, err := SessionStore.Load(ctx, sessionID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Session not found",
			"session_id": sessionID,
		})
		return
	}
	
	c.JSON(http.StatusOK, session)
}

// DeleteSession deletes a session
func DeleteSession(c *gin.Context) {
	sessionID := c.Param("session_id")
	
	if SessionStore == nil {
		InitSessionStore()
	}
	
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	
	if err := SessionStore.Delete(ctx, sessionID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to delete session",
			"details": err.Error(),
		})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"message": "Session deleted successfully",
		"session_id": sessionID,
	})
}