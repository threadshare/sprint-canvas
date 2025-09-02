import { useState } from 'react'
import { Layout } from '@/components/Layout'
import { FoundationStage } from '@/components/workflows/FoundationStage'
import { DifferentiationStage } from '@/components/workflows/DifferentiationStage'
import { ApproachStage } from '@/components/workflows/ApproachStage'

interface ProblemItem {
  id: string;
  description: string;
  severity: number; // 1-10分痛点强度评分
  impact: 'few' | 'some' | 'many' | 'most'; // 影响范围
}

interface CompetitionItem {
  id: string;
  name: string;
  type: 'direct' | 'alternative' | 'workaround'; // 直接竞争者/替代方案/土办法
  description: string;
}

interface AdvantageItem {
  id: string;
  description: string;
  category: 'technical' | 'insight' | 'resource' | 'motivation'; // 技术能力/行业洞察/资源优势/团队动机
}

interface FoundationData {
  customers: string[];
  problems: ProblemItem[];
  competition: CompetitionItem[];
  advantages: AdvantageItem[];
}

interface DifferentiationFactor {
  id: string;
  name: string;
  description: string;
  weight: number;
}

interface ProductPosition {
  name: string;
  x: number;
  y: number;
  isUs: boolean;
}

interface Matrix2x2 {
  xAxis: string;
  yAxis: string;
  products: ProductPosition[];
  winningQuadrant: string;
}

interface DifferentiationData {
  classicFactors: DifferentiationFactor[];
  customFactors: DifferentiationFactor[];
  matrix: Matrix2x2;
  principles: string[];
}

interface Path {
  id: string;
  name: string;
  description: string;
  pros: string[];
  cons: string[];
}

interface PathEvaluation {
  pathId: string;
  score: number;
  notes: string;
}

interface MagicLens {
  name: string;
  description: string;
  evaluations: PathEvaluation[];
}

interface ApproachData {
  paths: Path[];
  magicLenses: MagicLens[];
  selectedPath: string;
  reasoning: string;
}

function App() {
  const [currentStage, setCurrentStage] = useState<'foundation' | 'differentiation' | 'approach' | 'completed'>('foundation')
  const [foundationData, setFoundationData] = useState<FoundationData>({
    customers: [],
    problems: [],
    competition: [],
    advantages: [],
  })
  
  const [differentiationData, setDifferentiationData] = useState<DifferentiationData>({
    classicFactors: [],
    customFactors: [],
    matrix: {
      xAxis: '',
      yAxis: '',
      products: [],
      winningQuadrant: '右上角',
    },
    principles: [],
  })
  
  const [approachData, setApproachData] = useState<ApproachData>({
    paths: [],
    magicLenses: [],
    selectedPath: '',
    reasoning: '',
  })

  const handleStageChange = (stage: string) => {
    setCurrentStage(stage as any)
  }

  const handleFoundationDataChange = (data: FoundationData) => {
    setFoundationData(data)
  }
  
  const handleDifferentiationDataChange = (data: DifferentiationData) => {
    setDifferentiationData(data)
  }
  
  const handleApproachDataChange = (data: ApproachData) => {
    setApproachData(data)
  }

  const handleNextStageFromFoundation = () => {
    setCurrentStage('differentiation')
  }
  
  const handleNextStageFromDifferentiation = () => {
    setCurrentStage('approach')
  }
  
  const handleCompleteFoundationSprint = () => {
    setCurrentStage('completed')
  }

  return (
    <Layout
      currentStage={currentStage}
      roomName="我的 Foundation Sprint"
      onStageChange={handleStageChange}
    >
      {currentStage === 'foundation' && (
        <FoundationStage
          data={foundationData}
          roomId="demo-room"
          currentUserId="user-1"
          currentUserName="演示用户"
          onDataChange={handleFoundationDataChange}
          onNextStage={handleNextStageFromFoundation}
        />
      )}
      
      {currentStage === 'differentiation' && (
        <DifferentiationStage
          data={differentiationData}
          roomId="demo-room"
          currentUserId="user-1"
          currentUserName="演示用户"
          onDataChange={handleDifferentiationDataChange}
          onNextStage={handleNextStageFromDifferentiation}
        />
      )}
      
      {currentStage === 'approach' && (
        <ApproachStage
          data={approachData}
          roomId="demo-room"
          currentUserId="user-1"
          currentUserName="演示用户"
          onDataChange={handleApproachDataChange}
          onComplete={handleCompleteFoundationSprint}
        />
      )}
      
      {currentStage === 'completed' && (
        <div className="text-center py-12">
          <h2 className="text-3xl font-bold text-green-800 mb-4">🎉 Foundation Sprint 完成！</h2>
          <p className="text-gray-600 mb-6">恭喜！您已经成功完成了 Foundation Sprint 的三个阶段。</p>
          
          <div className="max-w-2xl mx-auto text-left bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-gray-800 mb-4">创始假设 (Founding Hypothesis):</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>目标客户:</strong> {foundationData.customers.join(', ')}</p>
              <p><strong>解决问题:</strong> {foundationData.problems.join(', ')}</p>
              <p><strong>差异化优势:</strong> {differentiationData.principles.join(', ')}</p>
              <p><strong>执行方法:</strong> {approachData.paths.find(p => p.id === approachData.selectedPath)?.name}</p>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                接下来可以开始 Design Sprint 来验证这个假设！
              </p>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default App
