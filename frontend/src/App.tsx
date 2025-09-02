import { useState, useEffect } from 'react'
import { RoomEntry } from '@/components/RoomEntry'
import { RoomHeader } from '@/components/RoomHeader'
import { FoundationStage } from '@/components/workflows/FoundationStage'
import { DifferentiationStage } from '@/components/workflows/DifferentiationStage'
import { ApproachStage } from '@/components/workflows/ApproachStage'
import { ExportButton } from '@/components/export/ExportButton'
import { AgentsPanel } from '@/components/AgentsPanel'
import { Toaster } from '@/components/ui/toaster'
import { apiClient } from '@/lib/api/client'
import { webSocketService } from '@/lib/websocket'
import type { Room } from '@/lib/api/types'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/LanguageContext'

// Convert backend data format to frontend format for compatibility
const convertToFrontendFoundationData = (foundation: any) => {
  return {
    customers: foundation.customers || [],
    problems: foundation.problems?.map((problem: string, index: number) => ({
      id: `problem-${index}`,
      description: problem,
      severity: 5,
      impact: 'some' as const,
    })) || [],
    competition: foundation.competition?.map((comp: string, index: number) => ({
      id: `comp-${index}`,
      name: comp,
      type: 'direct' as const,
      description: comp,
    })) || [],
    advantages: foundation.advantages?.map((adv: string, index: number) => ({
      id: `adv-${index}`,
      description: adv,
      category: 'technical' as const,
    })) || [],
  }
}

const convertToBackendFoundationData = (data: any) => {
  return {
    customers: data.customers || [],
    problems: data.problems?.map((p: any) => p.description || p) || [],
    competition: data.competition?.map((c: any) => c.name || c.description || c) || [],
    advantages: data.advantages?.map((a: any) => a.description || a) || [],
  }
}

const convertToFrontendDifferentiationData = (differentiation: any) => {
  return {
    classicFactors: differentiation.classic_factors || [],
    customFactors: differentiation.custom_factors || [],
    matrix: {
      xAxis: differentiation.matrix?.x_axis || '',
      yAxis: differentiation.matrix?.y_axis || '',
      products: differentiation.matrix?.products || [],
      winningQuadrant: differentiation.matrix?.winning_quadrant || ''
    },
    principles: differentiation.principles || [],
  }
}

const convertToBackendDifferentiationData = (data: any) => {
  return {
    classic_factors: data.classicFactors || [],
    custom_factors: data.customFactors || [],
    matrix: {
      x_axis: data.matrix?.xAxis || '',
      y_axis: data.matrix?.yAxis || '',
      products: data.matrix?.products || [],
      winning_quadrant: data.matrix?.winningQuadrant || ''
    },
    principles: data.principles || [],
  }
}

const convertToBackendApproachData = (data: any) => {
  return {
    magic_lenses: data.magicLenses || [],
    selected_path: data.selectedPath || '',
    paths: data.paths || [],
    reasoning: data.reasoning || '',
  }
}

const convertToFrontendApproachData = (approach: any) => {
  return {
    magicLenses: approach.magic_lenses || [], // Convert backend magic_lenses to frontend magicLenses
    selectedPath: approach.selected_path, // Map backend selected_path to frontend selectedPath
    paths: approach.paths || [],
    reasoning: approach.reasoning || '',
  }
}

function App() {
  const { t } = useLanguage()
  
  // Room state
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [currentUserName, setCurrentUserName] = useState<string>('')
  const [isConnected, setIsConnected] = useState(false)
  const [participants, setParticipants] = useState<Array<{ id: string; name: string; online: boolean }>>([])
  
  // Loading and error state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // AI Panel state
  const [showAIPanel, setShowAIPanel] = useState(false)

  // Check URL parameters on load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const roomIdFromUrl = urlParams.get('roomId')
    
    if (roomIdFromUrl) {
      // TODO: Show join room dialog with pre-filled room ID
      console.log('Room ID from URL:', roomIdFromUrl)
    }
  }, [])

  // WebSocket connection management
  useEffect(() => {
    if (!currentRoom || !currentUserId) return

    const handleConnect = () => {
      console.log('🟢 WebSocket连接成功:', {
        roomId: currentRoom?.id,
        userId: currentUserId,
        timestamp: new Date().toISOString()
      })
      setIsConnected(true)
    }

    const handleDisconnect = () => {
      console.log('🔴 WebSocket断开连接:', {
        roomId: currentRoom?.id,
        userId: currentUserId,
        timestamp: new Date().toISOString()
      })
      setIsConnected(false)
    }

    const handleMessage = (message: any) => {
      console.log('📨 收到WebSocket消息:', {
        type: message.type,
        fromUser: message.data?.userId,
        currentUser: currentUserId,
        timestamp: new Date().toISOString()
      })
      
      switch (message.type) {
        case 'user_join':
          setParticipants(prev => [...prev.filter(p => p.id !== message.data.userId), {
            id: message.data.userId,
            name: message.data.userName,
            online: true,
          }])
          break
        
        case 'user_leave':
          setParticipants(prev => prev.map(p => 
            p.id === message.data.userId 
              ? { ...p, online: false }
              : p
          ))
          break
        
        case 'foundation_update':
        case 'differentiation_update':
        case 'approach_update':
        case 'status_update':
          // Only refresh room data when OTHER users make changes
          // Skip if the message is from current user to prevent loops
          if (message.data?.userId !== currentUserId) {
            console.log('📨 收到其他用户的更新，刷新房间数据')
            // 直接在这里调用API，避免依赖外部函数
            apiClient.getRoom(currentRoom.id).then(updatedRoom => {
              setCurrentRoom(updatedRoom)
            }).catch(error => {
              console.error('Failed to refresh room data:', error)
            })
          }
          break
      }
    }

    const handleError = (error: Event) => {
      console.error('WebSocket error:', error)
      setIsConnected(false)
    }

    webSocketService.on('connect', handleConnect)
    webSocketService.on('disconnect', handleDisconnect)
    webSocketService.on('message', handleMessage)
    webSocketService.on('error', handleError)

    // Connect to WebSocket
    webSocketService.connect(currentRoom.id, currentUserId)

    // Cleanup
    return () => {
      webSocketService.off('connect', handleConnect)
      webSocketService.off('disconnect', handleDisconnect)
      webSocketService.off('message', handleMessage)
      webSocketService.off('error', handleError)
      webSocketService.disconnect()
    }
  }, [currentRoom?.id, currentUserId]) // 只依赖roomId，而不是整个currentRoom对象

  // 移除refreshRoomData，直接在需要的地方调用API

  const handleRoomJoined = (room: Room, userId: string, userName: string) => {
    setCurrentRoom(room)
    setCurrentUserId(userId)
    setCurrentUserName(userName)
    setError(null)
    
    // Add current user to participants
    setParticipants([{
      id: userId,
      name: userName,
      online: true,
    }])

    // Clear URL parameters
    window.history.replaceState({}, '', window.location.pathname)
  }

  const handleLeaveRoom = () => {
    webSocketService.disconnect()
    setCurrentRoom(null)
    setCurrentUserId('')
    setCurrentUserName('')
    setIsConnected(false)
    setParticipants([])
    setError(null)
  }


  const handleFoundationDataChange = async (data: any) => {
    if (!currentRoom) return
    
    console.log('🔄 Foundation数据变化:', {
      beforeStatus: currentRoom.status,
      data,
      roomId: currentRoom.id
    })
    
    setLoading(true)
    try {
      const backendData = convertToBackendFoundationData(data)
      console.log('📤 发送Foundation更新到后端:', backendData)
      
      const updatedRoom = await apiClient.updateFoundation(currentRoom.id, backendData)
      console.log('📥 收到后端响应:', {
        oldStatus: currentRoom.status,
        newStatus: updatedRoom.status,
        roomId: updatedRoom.id
      })
      
      setCurrentRoom(updatedRoom)
      
      // Broadcast update to other users
      webSocketService.send('foundation_update', { ...backendData, userId: currentUserId })
    } catch (error) {
      console.error('❌ Foundation更新失败:', error)
      setError(error instanceof Error ? error.message : '更新基础阶段数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDifferentiationDataChange = async (data: any) => {
    if (!currentRoom) return
    
    setLoading(true)
    try {
      const backendData = convertToBackendDifferentiationData(data)
      const updatedRoom = await apiClient.updateDifferentiation(currentRoom.id, backendData)
      setCurrentRoom(updatedRoom)
      
      // Broadcast update to other users
      webSocketService.send('differentiation_update', { ...data, userId: currentUserId })
    } catch (error) {
      setError(error instanceof Error ? error.message : '更新差异化阶段数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleApproachDataChange = async (data: any) => {
    if (!currentRoom) return
    
    setLoading(true)
    try {
      const backendData = convertToBackendApproachData(data)
      const updatedRoom = await apiClient.updateApproach(currentRoom.id, backendData)
      setCurrentRoom(updatedRoom)
      
      // Broadcast update to other users
      webSocketService.send('approach_update', { ...data, userId: currentUserId })
    } catch (error) {
      setError(error instanceof Error ? error.message : '更新方法阶段数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleNextStage = async (nextStatus: 'differentiation' | 'approach' | 'completed') => {
    if (!currentRoom) return
    
    console.log('🚀 切换到下一阶段:', nextStatus)
    setLoading(true)
    
    try {
      const updatedRoom = await apiClient.updateRoomStatus(currentRoom.id, nextStatus)
      console.log('✅ 房间状态更新成功:', updatedRoom.status)
      setCurrentRoom(updatedRoom)
      
      // Broadcast status change to other users
      webSocketService.send('status_update', { 
        status: nextStatus, 
        userId: currentUserId 
      })
    } catch (error) {
      console.error('❌ 状态更新失败:', error)
      setError(error instanceof Error ? error.message : '切换阶段失败')
    } finally {
      setLoading(false)
    }
  }

  // Show room entry if no room is joined
  if (!currentRoom) {
    return (
      <>
        <RoomEntry onRoomJoined={handleRoomJoined} />
        <Toaster />
      </>
    )
  }

  const foundationData = convertToFrontendFoundationData(currentRoom.foundation)

  return (
    <>
      <div className={`min-h-screen gradient-foundation transition-all duration-300 ${showAIPanel ? 'mr-96' : ''}`}>
        <RoomHeader
          room={currentRoom}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          isConnected={isConnected}
          participants={participants}
          onLeaveRoom={handleLeaveRoom}
        />

        {/* AI Assistant Button - Fixed Position */}
        <div className={`fixed bottom-8 z-40 transition-all duration-300 ${showAIPanel ? 'right-[25rem]' : 'right-8'}`}>
          <Button
            onClick={() => setShowAIPanel(!showAIPanel)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
            size="lg"
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            {showAIPanel ? t('ai.closeAssistant') : t('ai.assistant')}
          </Button>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
              <span className="text-foundation/70">同步数据中...</span>
            </div>
          )}

          <div className="flex gap-8">
            {/* Left sidebar can show stage navigation */}
            <aside className="w-64 flex-shrink-0">
              {/* Stage progress will be handled by Layout component */}
            </aside>

            {/* Main content */}
            <main className="flex-1 min-w-0">
              {/* 房间状态检查 */}
              
              {currentRoom.status === 'foundation' && (
                <FoundationStage
                  data={foundationData}
                  roomId={currentRoom.id}
                  currentUserId={currentUserId}
                  currentUserName={currentUserName}
                  onDataChange={handleFoundationDataChange}
                  onNextStage={() => handleNextStage('differentiation')}
                />
              )}
              
              {currentRoom.status === 'differentiation' && (
                <DifferentiationStage
                  data={convertToFrontendDifferentiationData(currentRoom.differentiation)}
                  roomId={currentRoom.id}
                  currentUserId={currentUserId}
                  currentUserName={currentUserName}
                  onDataChange={handleDifferentiationDataChange}
                  onNextStage={() => handleNextStage('approach')}
                />
              )}
              
              {currentRoom.status === 'approach' && (
                <ApproachStage
                  data={convertToFrontendApproachData(currentRoom.approach)}
                  roomId={currentRoom.id}
                  currentUserId={currentUserId}
                  currentUserName={currentUserName}
                  onDataChange={handleApproachDataChange}
                  onComplete={() => handleNextStage('completed')}
                />
              )}
              
              {currentRoom.status === 'completed' && (
                <div className="text-center py-12">
                  <h2 className="text-3xl font-bold text-green-800 mb-4">🎉 Foundation Sprint 完成！</h2>
                  <p className="text-gray-600 mb-6">恭喜！您的团队已经成功完成了 Foundation Sprint 的三个阶段。</p>
                  
                  <div className="max-w-4xl mx-auto">
                    {/* Summary Card */}
                    <div className="bg-white p-8 rounded-xl shadow-lg border border-green-200 mb-8">
                      <h3 className="font-semibold text-gray-800 mb-6 text-xl">创始假设 (Founding Hypothesis)</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-blue-700 mb-2">🎯 目标客户</h4>
                            <div className="text-sm text-gray-600">
                              {currentRoom.foundation.customers.length > 0 ? 
                                currentRoom.foundation.customers.map((customer, i) => (
                                  <span key={i} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-md mr-2 mb-1">
                                    {customer}
                                  </span>
                                )) : 
                                <span className="text-gray-400 italic">待完善</span>
                              }
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-red-700 mb-2">❗ 解决问题</h4>
                            <div className="text-sm text-gray-600">
                              {currentRoom.foundation.problems.length > 0 ? 
                                currentRoom.foundation.problems.map((problem, i) => (
                                  <div key={i} className="bg-red-50 text-red-800 p-2 rounded-md mb-2">
                                    {problem}
                                  </div>
                                )) : 
                                <span className="text-gray-400 italic">待完善</span>
                              }
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-purple-700 mb-2">✨ 差异化优势</h4>
                            <div className="text-sm text-gray-600">
                              {currentRoom.differentiation.principles.length > 0 ? 
                                currentRoom.differentiation.principles.map((principle, i) => (
                                  <span key={i} className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded-md mr-2 mb-1">
                                    {principle}
                                  </span>
                                )) : 
                                <span className="text-gray-400 italic">待完善</span>
                              }
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-green-700 mb-2">🚀 执行方法</h4>
                            <div className="text-sm text-gray-600">
                              {currentRoom.approach.selected_path ? (
                                <div className="bg-green-50 text-green-800 p-2 rounded-md">
                                  {currentRoom.approach.paths.find(p => p.id === currentRoom.approach.selected_path)?.name}
                                </div>
                              ) : (
                                <span className="text-gray-400 italic">待确定</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                      <ExportButton
                        room={currentRoom}
                        participants={participants}
                        size="lg"
                        className="min-w-48"
                      />
                      
                      <div className="text-center">
                        <p className="text-sm text-gray-500 mb-2">
                          接下来可以开始 Design Sprint 来验证这个假设！
                        </p>
                        <div className="flex gap-2 justify-center">
                          <button className="text-xs text-blue-600 hover:text-blue-800 underline">
                            了解 Design Sprint
                          </button>
                          <span className="text-gray-300">|</span>
                          <button className="text-xs text-blue-600 hover:text-blue-800 underline">
                            开始新的 Sprint
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
      
      {/* AI Agents Panel */}
      <AgentsPanel
        isOpen={showAIPanel}
        onClose={() => setShowAIPanel(false)}
        roomContext={currentRoom ? `房间: ${currentRoom.name}, 当前阶段: ${currentRoom.status}, 用户: ${currentUserName}` : ''}
      />
      
      <Toaster />
    </>
  )
}

export default App
