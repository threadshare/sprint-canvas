package agents

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"
)

// InteractionType represents the type of interaction needed
type InteractionType string

const (
	InteractionNone         InteractionType = "none"
	InteractionNeedInput    InteractionType = "need_input"
	InteractionConfirmation InteractionType = "confirmation"
	InteractionChoice       InteractionType = "choice"
	InteractionClarification InteractionType = "clarification"
)

// InteractiveOutput extends AgentOutput with interaction support
type InteractiveOutput struct {
	*AgentOutput
	
	// Interaction fields
	NeedsInteraction bool                   `json:"needs_interaction"`
	InteractionType  InteractionType        `json:"interaction_type,omitempty"`
	InteractionPrompt string                `json:"interaction_prompt,omitempty"`
	InteractionOptions []string              `json:"interaction_options,omitempty"`
	InteractionContext map[string]interface{} `json:"interaction_context,omitempty"`
	
	// Session management
	SessionID     string                 `json:"session_id"`
	SessionState  *ReActSessionState     `json:"session_state,omitempty"`
	CanContinue   bool                   `json:"can_continue"`
}

// ReActSessionState stores the state of an ongoing ReAct session
type ReActSessionState struct {
	SessionID        string                 `json:"session_id"`
	AgentName        string                 `json:"agent_name"`
	StartTime        time.Time              `json:"start_time"`
	LastUpdateTime   time.Time              `json:"last_update_time"`
	CurrentIteration int                    `json:"current_iteration"`
	MaxIterations    int                    `json:"max_iterations"`
	
	// Conversation state
	Conversation     []ConversationHistory  `json:"conversation"`
	SystemPrompt     string                 `json:"system_prompt"`
	OriginalInput    AgentInput             `json:"original_input"`
	
	// Progress tracking
	CompletedSteps   []ReActStep            `json:"completed_steps"`
	PendingAction    *PendingAction         `json:"pending_action,omitempty"`
	CollectedData    map[string]interface{} `json:"collected_data"`
	
	// Interaction history
	Interactions     []InteractionRecord    `json:"interactions"`
	
	// Status
	Status          SessionStatus          `json:"status"`
	Error           string                 `json:"error,omitempty"`
}

// SessionStatus represents the status of a ReAct session
type SessionStatus string

const (
	SessionActive    SessionStatus = "active"
	SessionPaused    SessionStatus = "paused"
	SessionCompleted SessionStatus = "completed"
	SessionFailed    SessionStatus = "failed"
	SessionExpired   SessionStatus = "expired"
)

// PendingAction represents an action waiting for user input
type PendingAction struct {
	Action          string                 `json:"action"`
	ActionInput     string                 `json:"action_input"`
	WaitingFor      InteractionType        `json:"waiting_for"`
	RequestedAt     time.Time              `json:"requested_at"`
	TimeoutAt       time.Time              `json:"timeout_at"`
	RequiredFields  []string               `json:"required_fields,omitempty"`
	ValidationRules map[string]string      `json:"validation_rules,omitempty"`
}

// InteractionRecord records a user interaction
type InteractionRecord struct {
	Timestamp       time.Time              `json:"timestamp"`
	Type            InteractionType        `json:"type"`
	Prompt          string                 `json:"prompt"`
	UserResponse    string                 `json:"user_response"`
	Validated       bool                   `json:"validated"`
	UsedInStep      int                    `json:"used_in_step"`
}

// InteractiveReActProcessor extends ReActProcessor with interactive capabilities
type InteractiveReActProcessor struct {
	*ReActProcessor
	sessionStore    SessionStore
	interactionMode bool
	sessionTimeout  time.Duration
}

// SessionStore interface for storing ReAct sessions
type SessionStore interface {
	Save(ctx context.Context, session *ReActSessionState) error
	Load(ctx context.Context, sessionID string) (*ReActSessionState, error)
	Delete(ctx context.Context, sessionID string) error
	List(ctx context.Context, agentName string) ([]*ReActSessionState, error)
}

// NewInteractiveReActProcessor creates a new interactive ReAct processor
func NewInteractiveReActProcessor(
	agent Agent,
	llmClient LLMClient,
	tools []Tool,
	maxIterations int,
	sessionStore SessionStore,
) *InteractiveReActProcessor {
	return &InteractiveReActProcessor{
		ReActProcessor: NewReActProcessor(agent, llmClient, tools, maxIterations),
		sessionStore:   sessionStore,
		interactionMode: true,
		sessionTimeout: 30 * time.Minute,
	}
}

// ProcessInteractive executes the ReAct loop with interaction support
func (p *InteractiveReActProcessor) ProcessInteractive(
	ctx context.Context,
	input AgentInput,
	sessionID string,
) (*InteractiveOutput, error) {
	
	var session *ReActSessionState
	var err error
	
	// Check if this is a continuation of an existing session
	if sessionID != "" {
		session, err = p.sessionStore.Load(ctx, sessionID)
		if err != nil {
			// Session not found or expired, start new
			session = nil
		} else if session.Status != SessionActive && session.Status != SessionPaused {
			// Session is not continuable
			return &InteractiveOutput{
				AgentOutput: &AgentOutput{
					Response: "Session has ended and cannot be continued",
				},
				NeedsInteraction: false,
				CanContinue: false,
				SessionID: sessionID,
			}, nil
		}
	}
	
	// Start new session if needed
	if session == nil {
		session = p.initializeSession(input)
	} else {
		// Merge new input with existing session
		session = p.mergeInputWithSession(session, input)
	}
	
	// Execute ReAct loop with interruption points
	output, needsInteraction, err := p.executeInteractiveLoop(ctx, session)
	
	// Save session state
	if err := p.sessionStore.Save(ctx, session); err != nil {
		// Log error but don't fail the request
		fmt.Printf("Failed to save session: %v\n", err)
	}
	
	// Build interactive output
	interactiveOutput := &InteractiveOutput{
		AgentOutput:      output,
		SessionID:        session.SessionID,
		SessionState:     session,
		NeedsInteraction: needsInteraction,
		CanContinue:      session.Status == SessionActive || session.Status == SessionPaused,
	}
	
	// Add interaction details if needed
	if needsInteraction && session.PendingAction != nil {
		interactiveOutput.InteractionType = session.PendingAction.WaitingFor
		interactiveOutput.InteractionPrompt = p.generateInteractionPrompt(session)
		interactiveOutput.InteractionOptions = p.generateInteractionOptions(session)
		// Convert ValidationRules to map[string]interface{}
		if session.PendingAction.ValidationRules != nil {
			interactiveOutput.InteractionContext = make(map[string]interface{})
			for k, v := range session.PendingAction.ValidationRules {
				interactiveOutput.InteractionContext[k] = v
			}
		}
	}
	
	return interactiveOutput, err
}

// executeInteractiveLoop runs the ReAct loop with interruption support
func (p *InteractiveReActProcessor) executeInteractiveLoop(
	ctx context.Context,
	session *ReActSessionState,
) (*AgentOutput, bool, error) {
	
	output := &AgentOutput{
		Reasoning:   session.CompletedSteps,
		Tools:       []ToolExecution{},
		Suggestions: []string{},
		References:  []Reference{},
		Metadata:    session.CollectedData,
	}
	
	// Check if we're resuming from a pending action
	if session.PendingAction != nil {
		// Process the pending action with user input
		if err := p.processPendingAction(ctx, session, output); err != nil {
			return output, false, err
		}
	}
	
	// Continue ReAct iterations
	for session.CurrentIteration < session.MaxIterations {
		session.CurrentIteration++
		
		step := ReActStep{
			StepNumber: session.CurrentIteration,
		}
		
		// Generate thought and action
		thoughtPrompt := p.buildThoughtPromptWithHistory(session)
		response, err := p.llmClient.CompleteWithTools(
			ctx,
			thoughtPrompt,
			p.getToolList(),
			WithSystemPrompt(session.SystemPrompt),
			WithTemperature(0.7),
			WithMaxTokens(1000),
		)
		if err != nil {
			session.Status = SessionFailed
			session.Error = err.Error()
			return output, false, err
		}
		
		// Parse response
		thought, action, actionInput, isFinal := p.parseReActResponse(response.Content)
		step.Thought = thought
		step.Action = action
		step.ActionInput = actionInput
		
		// Check if we need user interaction
		if needsInteraction, interactionType := p.checkNeedsInteraction(thought, action); needsInteraction {
			// Save pending action
			session.PendingAction = &PendingAction{
				Action:      action,
				ActionInput: actionInput,
				WaitingFor:  interactionType,
				RequestedAt: time.Now(),
				TimeoutAt:   time.Now().Add(p.sessionTimeout),
			}
			session.Status = SessionPaused
			session.LastUpdateTime = time.Now()
			
			// Save partial step
			session.CompletedSteps = append(session.CompletedSteps, step)
			output.Reasoning = session.CompletedSteps
			
			return output, true, nil
		}
		
		// If final answer, complete
		if isFinal {
			output.Response = actionInput
			session.CompletedSteps = append(session.CompletedSteps, step)
			output.Reasoning = session.CompletedSteps
			output.Confidence = p.calculateConfidence(output)
			session.Status = SessionCompleted
			break
		}
		
		// Execute tool
		if action != "" && action != "Final Answer" {
			observation, toolExec := p.executeTool(ctx, action, actionInput)
			step.Observation = observation
			if toolExec != nil {
				output.Tools = append(output.Tools, *toolExec)
			}
			
			// Generate reflection
			reflectionPrompt := p.buildReflectionPrompt(step)
			reflection, _ := p.llmClient.Complete(
				ctx,
				reflectionPrompt,
				WithTemperature(0.5),
				WithMaxTokens(200),
			)
			step.Reflection = reflection
		}
		
		// Save completed step
		session.CompletedSteps = append(session.CompletedSteps, step)
		output.Reasoning = session.CompletedSteps
		
		// Update conversation
		session.Conversation = append(session.Conversation, ConversationHistory{
			Role:    "assistant",
			Content: p.formatStepForHistory(step),
		})
		
		// Check if ready to provide answer
		if p.shouldProvideAnswer(output) {
			finalAnswer := p.generateFinalAnswer(ctx, session.OriginalInput, output)
			output.Response = finalAnswer
			output.Confidence = p.calculateConfidence(output)
			session.Status = SessionCompleted
			break
		}
		
		session.LastUpdateTime = time.Now()
	}
	
	// If we've exhausted iterations without completion
	if session.CurrentIteration >= session.MaxIterations && output.Response == "" {
		output.Response = p.synthesizeResponse(ctx, session.OriginalInput, output)
		output.Confidence = p.calculateConfidence(output)
		session.Status = SessionCompleted
	}
	
	return output, false, nil
}

// checkNeedsInteraction determines if user interaction is needed
func (p *InteractiveReActProcessor) checkNeedsInteraction(thought, action string) (bool, InteractionType) {
	// Check for explicit interaction markers in thought
	thoughtLower := strings.ToLower(thought)
	
	if strings.Contains(thoughtLower, "need to ask") || 
	   strings.Contains(thoughtLower, "需要询问") ||
	   strings.Contains(thoughtLower, "require clarification") ||
	   strings.Contains(thoughtLower, "需要澄清") {
		return true, InteractionClarification
	}
	
	if strings.Contains(thoughtLower, "need confirmation") ||
	   strings.Contains(thoughtLower, "需要确认") ||
	   strings.Contains(thoughtLower, "should confirm") {
		return true, InteractionConfirmation
	}
	
	if strings.Contains(thoughtLower, "need more information") ||
	   strings.Contains(thoughtLower, "需要更多信息") ||
	   strings.Contains(thoughtLower, "missing details") {
		return true, InteractionNeedInput
	}
	
	if strings.Contains(thoughtLower, "multiple options") ||
	   strings.Contains(thoughtLower, "user should choose") ||
	   strings.Contains(thoughtLower, "用户选择") {
		return true, InteractionChoice
	}
	
	// Check for specific actions that might need interaction
	actionLower := strings.ToLower(action)
	if actionLower == "ask_user" || actionLower == "request_input" {
		return true, InteractionNeedInput
	}
	
	return false, InteractionNone
}

// initializeSession creates a new ReAct session
func (p *InteractiveReActProcessor) initializeSession(input AgentInput) *ReActSessionState {
	sessionID := fmt.Sprintf("%s_%d", p.agent.GetName(), time.Now().UnixNano())
	
	return &ReActSessionState{
		SessionID:        sessionID,
		AgentName:        p.agent.GetName(),
		StartTime:        time.Now(),
		LastUpdateTime:   time.Now(),
		CurrentIteration: 0,
		MaxIterations:    p.maxIterations,
		Conversation: []ConversationHistory{
			{Role: "system", Content: p.buildSystemPrompt()},
			{Role: "user", Content: p.buildUserPrompt(input)},
		},
		SystemPrompt:     p.buildSystemPrompt(),
		OriginalInput:    input,
		CompletedSteps:   []ReActStep{},
		CollectedData:    make(map[string]interface{}),
		Interactions:     []InteractionRecord{},
		Status:          SessionActive,
	}
}

// mergeInputWithSession merges new input with existing session
func (p *InteractiveReActProcessor) mergeInputWithSession(
	session *ReActSessionState,
	input AgentInput,
) *ReActSessionState {
	// Add user response to conversation
	session.Conversation = append(session.Conversation, ConversationHistory{
		Role:    "user",
		Content: input.Query,
	})
	
	// Record interaction
	if session.PendingAction != nil {
		interaction := InteractionRecord{
			Timestamp:    time.Now(),
			Type:        session.PendingAction.WaitingFor,
			Prompt:      session.PendingAction.ActionInput,
			UserResponse: input.Query,
			Validated:   true,
			UsedInStep:  session.CurrentIteration,
		}
		session.Interactions = append(session.Interactions, interaction)
		
		// Store user response in collected data
		session.CollectedData[fmt.Sprintf("user_input_%d", len(session.Interactions))] = input.Query
	}
	
	// Update last update time
	session.LastUpdateTime = time.Now()
	session.Status = SessionActive
	
	return session
}

// processPendingAction processes a pending action with user input
func (p *InteractiveReActProcessor) processPendingAction(
	ctx context.Context,
	session *ReActSessionState,
	output *AgentOutput,
) error {
	if session.PendingAction == nil {
		return nil
	}
	
	// Get the last user input
	if len(session.Interactions) > 0 {
		lastInteraction := session.Interactions[len(session.Interactions)-1]
		
		// Update the last step with user input as observation
		if len(session.CompletedSteps) > 0 {
			lastStep := &session.CompletedSteps[len(session.CompletedSteps)-1]
			lastStep.Observation = fmt.Sprintf("User provided: %s", lastInteraction.UserResponse)
			
			// Generate reflection on user input
			reflectionPrompt := p.buildReflectionPrompt(*lastStep)
			reflection, _ := p.llmClient.Complete(
				ctx,
				reflectionPrompt,
				WithTemperature(0.5),
				WithMaxTokens(200),
			)
			lastStep.Reflection = reflection
		}
	}
	
	// Clear pending action
	session.PendingAction = nil
	
	return nil
}

// generateInteractionPrompt generates a prompt for user interaction
func (p *InteractiveReActProcessor) generateInteractionPrompt(session *ReActSessionState) string {
	if session.PendingAction == nil {
		return ""
	}
	
	switch session.PendingAction.WaitingFor {
	case InteractionClarification:
		return fmt.Sprintf("为了更好地帮助您，我需要了解：%s", session.PendingAction.ActionInput)
	case InteractionConfirmation:
		return fmt.Sprintf("请确认：%s (是/否)", session.PendingAction.ActionInput)
	case InteractionChoice:
		return fmt.Sprintf("请选择：%s", session.PendingAction.ActionInput)
	case InteractionNeedInput:
		return fmt.Sprintf("请提供以下信息：%s", session.PendingAction.ActionInput)
	default:
		return session.PendingAction.ActionInput
	}
}

// generateInteractionOptions generates options for user interaction
func (p *InteractiveReActProcessor) generateInteractionOptions(session *ReActSessionState) []string {
	if session.PendingAction == nil {
		return nil
	}
	
	switch session.PendingAction.WaitingFor {
	case InteractionConfirmation:
		return []string{"是", "否", "需要修改"}
	case InteractionChoice:
		// Parse options from action input if available
		var options []string
		if err := json.Unmarshal([]byte(session.PendingAction.ActionInput), &options); err == nil {
			return options
		}
		return nil
	default:
		return nil
	}
}

// buildThoughtPromptWithHistory builds thought prompt with session history
func (p *InteractiveReActProcessor) buildThoughtPromptWithHistory(session *ReActSessionState) string {
	historyText := ""
	for _, h := range session.Conversation {
		historyText += fmt.Sprintf("%s: %s\n\n", h.Role, h.Content)
	}
	
	// Add completed steps
	for _, step := range session.CompletedSteps {
		historyText += p.formatStepForHistory(step) + "\n\n"
	}
	
	return fmt.Sprintf(`%s

Step %d: Based on the conversation so far, what should I think about and do next?

If you need user input, you can use:
- "I need to ask the user for..." to request information
- "I need confirmation about..." to confirm something
- "The user should choose between..." for choices

Please respond with:
Thought: [Your reasoning]
Action: [Tool name, "ask_user", or "Final Answer"]
Action Input: [Input for the tool, question for user, or final answer]`,
		historyText, session.CurrentIteration + 1)
}