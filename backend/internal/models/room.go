package models

import (
	"time"
	"github.com/google/uuid"
)

// Room 代表一个 Foundation Sprint 会议室
type Room struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	CreatedBy   string    `json:"created_by"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	Foundation  Foundation  `json:"foundation"`
	Differentiation Differentiation `json:"differentiation"`
	Approach    Approach  `json:"approach"`
	Status      string    `json:"status"` // "foundation", "differentiation", "approach", "completed"
}

// Foundation 第一阶段：基础信息
type Foundation struct {
	Customers   []string `json:"customers"`
	Problems    []string `json:"problems"`
	Competition []string `json:"competition"`
	Advantages  []string `json:"advantages"`
}

// Differentiation 第二阶段：差异化
type Differentiation struct {
	ClassicFactors []DifferentiationFactor `json:"classic_factors"`
	CustomFactors  []DifferentiationFactor `json:"custom_factors"`
	Matrix         Matrix2x2               `json:"matrix"`
	Principles     []string                `json:"principles"`
}

// DifferentiationFactor 差异化因素
type DifferentiationFactor struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Weight      int    `json:"weight"`
}

// Matrix2x2 2x2 分析矩阵
type Matrix2x2 struct {
	XAxis     string               `json:"x_axis"`
	YAxis     string               `json:"y_axis"`
	Products  []ProductPosition    `json:"products"`
	WinningQuadrant string          `json:"winning_quadrant"`
}

// ProductPosition 产品在矩阵中的位置
type ProductPosition struct {
	Name string  `json:"name"`
	X    float64 `json:"x"`
	Y    float64 `json:"y"`
	IsUs bool    `json:"is_us"`
}

// Approach 第三阶段：方法
type Approach struct {
	Paths       []Path       `json:"paths"`
	MagicLenses []MagicLens  `json:"magic_lenses"`
	SelectedPath string      `json:"selected_path"`
	Reasoning   string       `json:"reasoning"`
}

// Path 执行路径
type Path struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Pros        []string `json:"pros"`
	Cons        []string `json:"cons"`
}

// MagicLens 魔术镜头评估视角
type MagicLens struct {
	Name        string             `json:"name"`
	Description string             `json:"description"`
	Evaluations []PathEvaluation   `json:"evaluations"`
}

// PathEvaluation 路径评估
type PathEvaluation struct {
	PathID string  `json:"path_id"`
	Score  float64 `json:"score"`
	Notes  string  `json:"notes"`
}

// NewRoom 创建新房间
func NewRoom(name, createdBy string) *Room {
	return &Room{
		ID:        uuid.New().String(),
		Name:      name,
		CreatedBy: createdBy,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
		Status:    "foundation",
		Foundation: Foundation{
			Customers:   make([]string, 0),
			Problems:    make([]string, 0),
			Competition: make([]string, 0),
			Advantages:  make([]string, 0),
		},
		Differentiation: Differentiation{
			ClassicFactors: make([]DifferentiationFactor, 0),
			CustomFactors:  make([]DifferentiationFactor, 0),
			Principles:     make([]string, 0),
		},
		Approach: Approach{
			Paths:       make([]Path, 0),
			MagicLenses: make([]MagicLens, 0),
		},
	}
}