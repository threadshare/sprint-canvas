// API Types - matching backend models exactly

export interface Room {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  foundation: Foundation;
  differentiation: Differentiation;
  approach: Approach;
  status: 'foundation' | 'differentiation' | 'approach' | 'completed';
}

export interface Foundation {
  customers: string[];
  problems: string[];
  competition: string[];
  advantages: string[];
}

export interface Differentiation {
  classic_factors: DifferentiationFactor[];
  custom_factors: DifferentiationFactor[];
  matrix: Matrix2x2;
  principles: string[];
}

export interface DifferentiationFactor {
  id: string;
  name: string;
  description: string;
  weight: number;
}

export interface Matrix2x2 {
  x_axis: string;
  y_axis: string;
  products: ProductPosition[];
  winning_quadrant: string;
}

export interface ProductPosition {
  name: string;
  x: number;
  y: number;
  is_us: boolean;
}

export interface Approach {
  paths: Path[];
  magic_lenses: MagicLens[];
  selected_path: string;
  reasoning: string;
}

export interface Path {
  id: string;
  name: string;
  description: string;
  pros: string[];
  cons: string[];
}

export interface MagicLens {
  name: string;
  description: string;
  evaluations: PathEvaluation[];
}

export interface PathEvaluation {
  path_id: string;
  score: number;
  notes: string;
}

// Agent Types
export interface AgentRequest {
  context: string;
  query: string;
  room_id?: string;
  phase?: string;
  history?: ConversationHistory[];
  data?: Record<string, any>;
}

export interface ConversationHistory {
  role: 'user' | 'assistant';
  content: string;
}

export interface AgentResponse {
  agent: string;
  response: string;
  context: string;
  reasoning?: ReasoningStep[];
  tools?: ToolExecution[];
  suggestions?: string[];
  next_actions?: string[];
  confidence: number;
  metadata?: Record<string, any>;
}

export interface ReasoningStep {
  step_number: number;
  thought: string;
  action: string;
  observation?: string;
  reflection?: string;
}

export interface ToolExecution {
  tool_name: string;
  duration_ms: number;
  success: boolean;
  error?: string;
}

// WebSocket Types
export interface WebSocketMessage {
  room_id: string;
  type: string;
  data: any;
}

// API Request/Response types
export interface CreateRoomRequest {
  name: string;
  created_by: string;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface ApiError {
  error: string;
  details?: string;
}