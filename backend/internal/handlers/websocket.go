package handlers

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

// WebSocket 升级器
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		// 在生产环境中应该检查 origin
		return true
	},
}

// WebSocket 连接管理
type Hub struct {
	// 房间ID -> 连接集合
	rooms map[string]map[*Connection]bool
	
	// 注册新连接
	register chan *Connection
	
	// 注销连接
	unregister chan *Connection
	
	// 广播消息
	broadcast chan *Message
}

// WebSocket 连接
type Connection struct {
	ws       *websocket.Conn
	roomID   string
	userID   string
	userName string
}

// WebSocket 消息
type Message struct {
	RoomID string      `json:"room_id"`
	Type   string      `json:"type"`
	Data   interface{} `json:"data"`
}

// 全局 Hub 实例
var hub = &Hub{
	rooms:      make(map[string]map[*Connection]bool),
	register:   make(chan *Connection),
	unregister: make(chan *Connection),
	broadcast:  make(chan *Message),
}

// 启动 Hub
func init() {
	go hub.run()
}

func (h *Hub) run() {
	for {
		select {
		case conn := <-h.register:
			if h.rooms[conn.roomID] == nil {
				h.rooms[conn.roomID] = make(map[*Connection]bool)
			}
			h.rooms[conn.roomID][conn] = true
			log.Printf("User %s connected to room %s", conn.userID, conn.roomID)
			
			// 广播用户加入消息给房间内所有用户（包括自己）
			joinMsg := &Message{
				RoomID: conn.roomID,
				Type:   "user_join",
				Data: map[string]interface{}{
					"userId":   conn.userID,
					"userName": conn.userName,
				},
			}
			h.broadcast <- joinMsg
			
			// 发送当前房间所有用户列表给新加入的用户
			var users []map[string]interface{}
			for c := range h.rooms[conn.roomID] {
				users = append(users, map[string]interface{}{
					"userId":   c.userID,
					"userName": c.userName,
				})
			}
			userListMsg := &Message{
				RoomID: conn.roomID,
				Type:   "user_list",
				Data:   map[string]interface{}{"users": users},
			}
			// 只发给新加入的用户
			err := conn.ws.WriteJSON(userListMsg)
			if err != nil {
				log.Printf("Failed to send user list: %v", err)
			}
			
		case conn := <-h.unregister:
			if connections, exists := h.rooms[conn.roomID]; exists {
				if _, exists := connections[conn]; exists {
					delete(connections, conn)
					conn.ws.Close()
					log.Printf("User %s disconnected from room %s", conn.userID, conn.roomID)
					
					// 广播用户离开消息给房间内其他用户
					leaveMsg := &Message{
						RoomID: conn.roomID,
						Type:   "user_leave",
						Data: map[string]interface{}{
							"userId":   conn.userID,
							"userName": conn.userName,
						},
					}
					h.broadcast <- leaveMsg
				}
			}
			
		case message := <-h.broadcast:
			if connections, exists := h.rooms[message.RoomID]; exists {
				for conn := range connections {
					err := conn.ws.WriteJSON(message)
					if err != nil {
						log.Printf("WebSocket write error: %v", err)
						conn.ws.Close()
						delete(connections, conn)
					}
				}
			}
		}
	}
}

// HandleWebSocket 处理 WebSocket 连接
func HandleWebSocket(c *gin.Context) {
	roomID := c.Param("roomId")
	userID := c.Query("userId")
	userName := c.Query("userName")
	
	if roomID == "" || userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing roomId or userId"})
		return
	}
	
	// 如果没有提供userName，使用userID作为默认值
	if userName == "" {
		userName = userID
	}
	
	// 升级 HTTP 连接为 WebSocket
	ws, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("WebSocket upgrade failed: %v", err)
		return
	}
	
	// 创建连接对象
	conn := &Connection{
		ws:       ws,
		roomID:   roomID,
		userID:   userID,
		userName: userName,
	}
	
	// 注册连接
	hub.register <- conn
	
	// 处理消息
	go handleWebSocketMessages(conn)
}

func handleWebSocketMessages(conn *Connection) {
	defer func() {
		hub.unregister <- conn
	}()
	
	for {
		var msg Message
		err := conn.ws.ReadJSON(&msg)
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}
		
		// 设置消息的房间ID
		msg.RoomID = conn.roomID
		
		// 处理心跳ping消息
		if msg.Type == "ping" {
			// 直接回复pong给发送者，不广播
			pongMsg := Message{
				RoomID: conn.roomID,
				Type:   "pong",
				Data:   msg.Data, // 回传ping的数据
			}
			err := conn.ws.WriteJSON(pongMsg)
			if err != nil {
				log.Printf("Failed to send pong: %v", err)
				break
			}
			continue // 不广播ping消息
		}
		
		// 广播其他消息到房间内的所有连接
		hub.broadcast <- &msg
	}
}

// BroadcastToRoom 向特定房间广播消息
func BroadcastToRoom(roomID, msgType string, data interface{}) {
	message := &Message{
		RoomID: roomID,
		Type:   msgType,
		Data:   data,
	}
	hub.broadcast <- message
}