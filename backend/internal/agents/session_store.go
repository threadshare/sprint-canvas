package agents

import (
	"context"
	"fmt"
	"sync"
	"time"
)

// MemorySessionStore is an in-memory implementation of SessionStore
type MemorySessionStore struct {
	mu       sync.RWMutex
	sessions map[string]*ReActSessionState
	ttl      time.Duration
}

// NewMemorySessionStore creates a new in-memory session store
func NewMemorySessionStore(ttl time.Duration) *MemorySessionStore {
	store := &MemorySessionStore{
		sessions: make(map[string]*ReActSessionState),
		ttl:      ttl,
	}
	
	// Start cleanup goroutine
	go store.cleanupExpired()
	
	return store
}

// Save saves a session
func (s *MemorySessionStore) Save(ctx context.Context, session *ReActSessionState) error {
	if session == nil || session.SessionID == "" {
		return fmt.Errorf("invalid session")
	}
	
	s.mu.Lock()
	defer s.mu.Unlock()
	
	// Deep copy to avoid race conditions
	sessionCopy := s.deepCopySession(session)
	s.sessions[session.SessionID] = sessionCopy
	
	return nil
}

// Load loads a session
func (s *MemorySessionStore) Load(ctx context.Context, sessionID string) (*ReActSessionState, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	
	session, exists := s.sessions[sessionID]
	if !exists {
		return nil, fmt.Errorf("session not found: %s", sessionID)
	}
	
	// Check if session is expired
	if time.Since(session.LastUpdateTime) > s.ttl {
		// Mark as expired but still return it
		session.Status = SessionExpired
		return s.deepCopySession(session), nil
	}
	
	return s.deepCopySession(session), nil
}

// Delete deletes a session
func (s *MemorySessionStore) Delete(ctx context.Context, sessionID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	
	delete(s.sessions, sessionID)
	return nil
}

// List lists all sessions for an agent
func (s *MemorySessionStore) List(ctx context.Context, agentName string) ([]*ReActSessionState, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	
	var result []*ReActSessionState
	for _, session := range s.sessions {
		if session.AgentName == agentName {
			// Check expiration
			if time.Since(session.LastUpdateTime) > s.ttl {
				session.Status = SessionExpired
			}
			result = append(result, s.deepCopySession(session))
		}
	}
	
	return result, nil
}

// cleanupExpired periodically removes expired sessions
func (s *MemorySessionStore) cleanupExpired() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()
	
	for range ticker.C {
		s.mu.Lock()
		for id, session := range s.sessions {
			if time.Since(session.LastUpdateTime) > s.ttl*2 {
				// Delete sessions that are twice the TTL old
				delete(s.sessions, id)
			}
		}
		s.mu.Unlock()
	}
}

// deepCopySession creates a deep copy of a session
func (s *MemorySessionStore) deepCopySession(session *ReActSessionState) *ReActSessionState {
	if session == nil {
		return nil
	}
	
	// Create a new session with copied fields
	copiedSession := &ReActSessionState{
		SessionID:        session.SessionID,
		AgentName:        session.AgentName,
		StartTime:        session.StartTime,
		LastUpdateTime:   session.LastUpdateTime,
		CurrentIteration: session.CurrentIteration,
		MaxIterations:    session.MaxIterations,
		SystemPrompt:     session.SystemPrompt,
		OriginalInput:    session.OriginalInput,
		Status:          session.Status,
		Error:           session.Error,
	}
	
	// Deep copy slices
	copiedSession.Conversation = make([]ConversationHistory, len(session.Conversation))
	copy(copiedSession.Conversation, session.Conversation)
	
	copiedSession.CompletedSteps = make([]ReActStep, len(session.CompletedSteps))
	copy(copiedSession.CompletedSteps, session.CompletedSteps)
	
	copiedSession.Interactions = make([]InteractionRecord, len(session.Interactions))
	copy(copiedSession.Interactions, session.Interactions)
	
	// Deep copy maps
	if session.CollectedData != nil {
		copiedSession.CollectedData = make(map[string]interface{})
		for k, v := range session.CollectedData {
			copiedSession.CollectedData[k] = v
		}
	}
	
	// Copy pending action if exists
	if session.PendingAction != nil {
		copiedSession.PendingAction = &PendingAction{
			Action:      session.PendingAction.Action,
			ActionInput: session.PendingAction.ActionInput,
			WaitingFor:  session.PendingAction.WaitingFor,
			RequestedAt: session.PendingAction.RequestedAt,
			TimeoutAt:   session.PendingAction.TimeoutAt,
		}
		
		if session.PendingAction.RequiredFields != nil {
			copiedSession.PendingAction.RequiredFields = make([]string, len(session.PendingAction.RequiredFields))
			copy(copiedSession.PendingAction.RequiredFields, session.PendingAction.RequiredFields)
		}
		
		if session.PendingAction.ValidationRules != nil {
			copiedSession.PendingAction.ValidationRules = make(map[string]string)
			for k, v := range session.PendingAction.ValidationRules {
				copiedSession.PendingAction.ValidationRules[k] = v
			}
		}
	}
	
	return copiedSession
}

// RedisSessionStore is a Redis-based implementation of SessionStore
type RedisSessionStore struct {
	// TODO: Implement Redis-based session store for production
	// This would use Redis for persistent session storage across multiple servers
}

// PostgreSQLSessionStore is a PostgreSQL-based implementation of SessionStore  
type PostgreSQLSessionStore struct {
	// TODO: Implement PostgreSQL-based session store for production
	// This would use PostgreSQL for persistent session storage with full ACID guarantees
}