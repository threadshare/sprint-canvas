package main

import (
	"context"
	"foundation-sprint/internal/database"
	"foundation-sprint/internal/handlers"
	"foundation-sprint/internal/middleware"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	} else {
		log.Println("Loaded .env file")
	}
	
	// Log OpenAI configuration for debugging
	log.Printf("OpenAI API Key: %s...", os.Getenv("OPENAI_API_KEY")[:10])
	log.Printf("OpenAI Base URL: %s", os.Getenv("OPENAI_BASE_URL"))
	log.Printf("OpenAI Model: %s", os.Getenv("OPENAI_MODEL"))
	
	// Initialize database
	log.Println("Initializing database...")
	db, err := database.GetDatabase()
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	
	// Test database connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := db.Ping(ctx); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}
	log.Println("Database connected successfully")
	
	// 创建 Gin 路由器
	r := gin.Default()

	// 配置 CORS
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:5173"} // Vite 默认端口
	config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	config.AllowCredentials = true
	r.Use(cors.New(config))

	// 添加中间件
	r.Use(middleware.Logger())
	r.Use(gin.Recovery())

	// API 路由组
	api := r.Group("/api/v1")
	{
		// 健康检查
		api.GET("/health", handlers.HealthCheck)
		
		// Foundation Sprint 工作流
		foundation := api.Group("/foundation")
		{
			foundation.POST("/rooms", handlers.CreateRoom)
			foundation.GET("/rooms/:id", handlers.GetRoom)
			foundation.PUT("/rooms/:id/foundation", handlers.UpdateFoundation)
			foundation.PUT("/rooms/:id/differentiation", handlers.UpdateDifferentiation)
			foundation.PUT("/rooms/:id/approach", handlers.UpdateApproach)
			foundation.PUT("/rooms/:id/status", handlers.UpdateRoomStatus)
		}
		
		// AI Agents
		agents := api.Group("/agents")
		{
			// Standard endpoints
			agents.POST("/think", handlers.ThinkAgent)
			agents.POST("/critique", handlers.CritiqueAgent)
			agents.POST("/research", handlers.ResearchAgent)
			
			// Interactive endpoints (support multi-turn dialogue)
			agents.POST("/think/interactive", handlers.ThinkAgentInteractive)
			agents.POST("/critique/interactive", handlers.CritiqueAgentInteractive)
			agents.POST("/research/interactive", handlers.ResearchAgentInteractive)
			
			// Session management
			agents.GET("/:agent/sessions", handlers.GetAgentSessions)
			agents.GET("/sessions/:session_id", handlers.GetSessionDetails)
			agents.DELETE("/sessions/:session_id", handlers.DeleteSession)
		}
		
		// 协作功能
		collaboration := api.Group("/collaboration")
		{
			collaboration.POST("/rooms/:id/vote", handlers.CreateVote)
			collaboration.GET("/rooms/:id/votes", handlers.GetVotes)
			collaboration.PUT("/votes/:id", handlers.UpdateVote)
		}
	}

	// WebSocket 路由
	r.GET("/ws/:roomId", handlers.HandleWebSocket)

	log.Println("Starting Foundation Sprint API server on :8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}