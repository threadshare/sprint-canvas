package main

import (
	"foundation-sprint/internal/handlers"
	"foundation-sprint/internal/middleware"
	"log"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
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
		}
		
		// AI Agents
		agents := api.Group("/agents")
		{
			agents.POST("/think", handlers.ThinkAgent)
			agents.POST("/critique", handlers.CritiqueAgent)
			agents.POST("/research", handlers.ResearchAgent)
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