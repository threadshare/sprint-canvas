// Translation system for bilingual support (Chinese/English)

export const translations = {
  zh: {
    // Common
    common: {
      save: '保存',
      cancel: '取消',
      confirm: '确认',
      edit: '编辑',
      delete: '删除',
      add: '添加',
      next: '下一步',
      previous: '上一步',
      loading: '加载中...',
      error: '错误',
      success: '成功',
      close: '关闭',
    },
    
    // Room
    room: {
      title: 'Foundation Sprint',
      subtitle: '10小时找到基础共识',
      createRoom: '创建房间',
      joinRoom: '加入房间',
      roomName: '房间名称',
      userName: '您的名字',
      roomCode: '房间代码',
      creating: '创建中...',
      joining: '加入中...',
      leaveRoom: '离开房间',
      participants: '参与者',
      connected: '已连接',
      disconnected: '已断开',
      fillRequiredFields: '请填写房间名称和您的姓名',
      createRoomError: '创建房间失败，请重试',
      joinRoomError: '加入房间失败，请检查房间ID是否正确',
      whatIsFS: '什么是 Foundation Sprint？',
      fsDesc1: '基于 Google Ventures 方法论的快速决策工具',
      fsDesc2: '通过3个阶段帮助团队达成核心战略共识',
      fsDesc3: '配备AI助手提供深度分析和建议',
      fsDesc4: '支持多人实时协作和投票决策',
      estimatedTime: '预计用时：2-3小时',
      inviteTeam: '创建房间后，您可以邀请团队成员一起参与',
      pasteRoomId: '输入房间创建者分享的ID即可加入讨论',
      poweredBy: 'Powered by Foundation Sprint AI',
      peopleOnline: '人在线',
      roomIdPrefix: '房间ID',
      share: '分享',
      inviteMembers: '邀请团队成员',
      shareRoomDesc: '分享房间ID或邀请链接让团队成员加入讨论',
      inviteLink: '邀请链接',
      copySuccess: '邀请链接已复制',
      copyDesc: '发送给团队成员快速加入',
      copyFailed: '复制失败',
      copyManual: '请手动复制邀请链接',
    },
    
    // Stages
    stages: {
      foundation: '基础阶段',
      differentiation: '差异化阶段',
      approach: '方法阶段',
      completed: '已完成',
      nextStage: '下一阶段',
      saveProgress: '保存进度',
    },
    
    // Foundation Stage
    foundation: {
      title: '基础阶段',
      subtitle: '明确基础要素',
      stageTitle: '第一阶段：奠定基础',
      stageDesc: '在这个阶段，我们将回答一些看似简单却至关重要的问题。每个人先独立思考并写下答案，然后通过投票达成团队共识。这个过程将帮助我们建立统一的"基础信息表"。',
      customers: '客户是谁？',
      customersDesc: '定义您的目标客户群体',
      problems: '解决什么问题？',
      problemsDesc: '明确要解决的核心问题，包括痛点强度和影响范围',
      competition: '竞争格局如何？',
      competitionDesc: '分析直接竞争对手、替代品和土办法',
      advantages: '我们的优势？',
      advantagesDesc: '团队的独特能力、洞察、资源或动机',
      addCustomer: '描述一个客户类型...',
      addProblem: '点击上方卡片添加要解决的问题',
      addCompetitor: '描述一个竞争对手或替代方案...',
      addCompetitorHint: '点击上方卡片添加竞争分析',
      addAdvantage: '描述一个独特优势...',
      addAdvantageHint: '点击上方卡片添加团队优势',
      addCustomerHint: '点击上方卡片添加客户类型',
      progress: '基础阶段进度',
      progressDesc: '已完成',
      ofParts: '个部分',
    },
    
    // Differentiation Stage
    differentiation: {
      title: '差异化阶段',
      subtitle: '找到差异化定位',
      stageTitle: '第二阶段：建立差异化',
      stageDesc: '在这个阶段，我们将探索产品的差异化定位。通过分析经典因素和自定义因素，创建2x2定位矩阵，最终确定产品的设计原则。',
      factors: '差异化因素',
      factorsTitle: '差异化因素是什么？',
      factorsDesc: '选择和定义产品的关键差异化维度',
      matrix: '定位矩阵',
      matrixTitle: '定位矩阵怎么选？',
      matrixDesc: '选择两个最重要的因素创建2x2矩阵',
      principles: '设计原则',
      principlesTitle: '设计原则是什么？',
      principlesDesc: '基于差异化定位确定的产品设计指导原则',
      classicFactors: '经典因素',
      customFactors: '自定义因素',
      addFactor: '添加因素',
      addPrinciple: '添加原则',
      xAxis: 'X轴',
      yAxis: 'Y轴',
      selectFactors: '选择因素',
      selectXAxis: '选择X轴因素',
      selectYAxis: '选择Y轴因素',
      addProduct: '添加产品/竞品',
      productPlaceholder: '产品名称',
      winningQuadrant: '制胜象限',
      selectQuadrant: '选择制胜象限',
      progress: '差异化阶段进度',
      progressDesc: '已完成',
      ofParts: '个部分',
      classicFactorsList: [
        '价格便宜 vs 价格昂贵',
        '功能简单 vs 功能复杂',
        '速度快 vs 速度慢',
        '易于使用 vs 难以使用',
        '通用 vs 专业',
        '个人 vs 团队',
      ],
    },
    
    // Approach Stage
    approach: {
      title: '方法阶段',
      subtitle: '确定执行路径',
      stageTitle: '第三阶段：选择方法',
      stageDesc: '在这个阶段，我们将确定产品的执行方法。通过魔法透镜探索不同的可能性，评估各种路径，最终选择最适合的执行方案。',
      magicLenses: '魔法透镜',
      magicLensesTitle: '魔法透镜是什么？',
      magicLensesDesc: '用不同视角探索产品可能性的思维工具',
      paths: '可能路径',
      pathsTitle: '可能的路径有哪些？',
      pathsDesc: '基于透镜分析得出的不同执行方案',
      selectedPath: '选定路径',
      selectedPathTitle: '选择哪条路径？',
      selectedPathDesc: '最终确定的执行方案和选择理由',
      reasoning: '选择理由',
      addLens: '添加透镜',
      addPath: '添加路径',
      selectPath: '选择路径',
      lensPlaceholder: '描述一个思考视角...',
      pathPlaceholder: '描述一个可能的执行路径...',
      reasoningPlaceholder: '解释为什么选择这条路径...',
      progress: '方法阶段进度',
      progressDesc: '已完成',
      ofParts: '个部分',
    },
    
    // AI Agents
    ai: {
      assistant: 'AI 助手',
      closeAssistant: '关闭助手',
      thinkAgent: '帮我想',
      thinkDesc: '补充思考',
      thinkLongDesc: '智能提问，补充思考维度，提供创意激发和案例推荐',
      critiqueAgent: '批判我',
      critiqueDesc: '批判分析',
      critiqueLongDesc: '挑战隐含假设，评估市场现实性，分析竞争威胁和执行难度',
      researchAgent: '查一查',
      researchDesc: '深度研究',
      researchLongDesc: '深度收集市场数据、竞品分析、技术可行性和用户洞察',
      selectAgent: '选择一个AI助手',
      startConversation: '从上方选择一个助手开始对话',
      inputPlaceholder: '输入您的问题...',
      send: '发送',
      thinking: '思考中...',
    },
    
    // Export
    export: {
      title: '导出报告',
      pdf: '导出 PDF',
      json: '导出 JSON',
      generating: '生成中...',
      foundationReport: 'Foundation Sprint 报告',
      hypothesis: '创始假设',
    },
  },
  
  en: {
    // Common
    common: {
      save: 'Save',
      cancel: 'Cancel',
      confirm: 'Confirm',
      edit: 'Edit',
      delete: 'Delete',
      add: 'Add',
      next: 'Next',
      previous: 'Previous',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      close: 'Close',
    },
    
    // Room
    room: {
      title: 'Foundation Sprint',
      subtitle: 'Find consensus in 10 hours',
      createRoom: 'Create Room',
      joinRoom: 'Join Room',
      roomName: 'Room Name',
      userName: 'Your Name',
      roomCode: 'Room Code',
      creating: 'Creating...',
      joining: 'Joining...',
      leaveRoom: 'Leave Room',
      participants: 'Participants',
      connected: 'Connected',
      disconnected: 'Disconnected',
      fillRequiredFields: 'Please fill in room name and your name',
      createRoomError: 'Failed to create room, please try again',
      joinRoomError: 'Failed to join room, please check room ID',
      whatIsFS: 'What is Foundation Sprint?',
      fsDesc1: 'Fast decision-making tool based on Google Ventures methodology',
      fsDesc2: 'Helps teams reach core strategic consensus through 3 stages',
      fsDesc3: 'Equipped with AI assistants for deep analysis and suggestions',
      fsDesc4: 'Supports real-time collaboration and voting decisions',
      estimatedTime: 'Estimated time: 2-3 hours',
      inviteTeam: 'After creating a room, you can invite team members to participate',
      pasteRoomId: 'Enter the room ID shared by the creator to join the discussion',
      poweredBy: 'Powered by Foundation Sprint AI',
      peopleOnline: 'people online',
      roomIdPrefix: 'Room ID',
      share: 'Share',
      inviteMembers: 'Invite Team Members',
      shareRoomDesc: 'Share room ID or invite link for team members to join',
      inviteLink: 'Invite Link',
      copySuccess: 'Invite link copied',
      copyDesc: 'Send to team members for quick access',
      copyFailed: 'Copy failed',
      copyManual: 'Please copy the invite link manually',
    },
    
    // Stages
    stages: {
      foundation: 'Foundation',
      differentiation: 'Differentiation',
      approach: 'Approach',
      completed: 'Completed',
      nextStage: 'Next Stage',
      saveProgress: 'Save Progress',
    },
    
    // Foundation Stage
    foundation: {
      title: 'Foundation Stage',
      subtitle: 'Define core elements',
      stageTitle: 'Stage 1: Build Foundation',
      stageDesc: 'In this stage, we will answer some seemingly simple but crucial questions. Everyone thinks independently and writes down their answers first, then reaches team consensus through voting. This process will help us build a unified "Foundation Information Sheet".',
      customers: 'Who are the customers?',
      customersDesc: 'Define your target customer groups',
      problems: 'What problems to solve?',
      problemsDesc: 'Clarify core problems to solve, including pain intensity and impact scope',
      competition: 'Competitive landscape?',
      competitionDesc: 'Analyze direct competitors, alternatives and workarounds',
      advantages: 'Our advantages?',
      advantagesDesc: "Team's unique capabilities, insights, resources or motivation",
      addCustomer: 'Describe a customer type...',
      addProblem: 'Click the card above to add problems to solve',
      addCompetitor: 'Describe a competitor or alternative...',
      addCompetitorHint: 'Click the card above to add competitive analysis',
      addAdvantage: 'Describe a unique advantage...',
      addAdvantageHint: 'Click the card above to add team advantages',
      addCustomerHint: 'Click the card above to add customer types',
      progress: 'Foundation Stage Progress',
      progressDesc: 'Completed',
      ofParts: 'parts',
    },
    
    // Differentiation Stage
    differentiation: {
      title: 'Differentiation Stage',
      subtitle: 'Find your positioning',
      stageTitle: 'Stage 2: Build Differentiation',
      stageDesc: 'In this stage, we will explore product differentiation positioning. By analyzing classic and custom factors, creating a 2x2 positioning matrix, and ultimately determining product design principles.',
      factors: 'Differentiation Factors',
      factorsTitle: 'What are differentiation factors?',
      factorsDesc: 'Select and define key differentiation dimensions for your product',
      matrix: 'Positioning Matrix',
      matrixTitle: 'How to choose positioning matrix?',
      matrixDesc: 'Select two most important factors to create a 2x2 matrix',
      principles: 'Design Principles',
      principlesTitle: 'What are design principles?',
      principlesDesc: 'Product design guidelines based on differentiation positioning',
      classicFactors: 'Classic Factors',
      customFactors: 'Custom Factors',
      addFactor: 'Add Factor',
      addPrinciple: 'Add Principle',
      xAxis: 'X Axis',
      yAxis: 'Y Axis',
      selectFactors: 'Select Factors',
      selectXAxis: 'Select X Axis Factor',
      selectYAxis: 'Select Y Axis Factor',
      addProduct: 'Add Product/Competitor',
      productPlaceholder: 'Product Name',
      winningQuadrant: 'Winning Quadrant',
      selectQuadrant: 'Select Winning Quadrant',
      progress: 'Differentiation Stage Progress',
      progressDesc: 'Completed',
      ofParts: 'parts',
      classicFactorsList: [
        'Cheap vs Expensive',
        'Simple vs Complex',
        'Fast vs Slow',
        'Easy to Use vs Hard to Use',
        'General vs Professional',
        'Individual vs Team',
      ],
    },
    
    // Approach Stage
    approach: {
      title: 'Approach Stage',
      subtitle: 'Define execution path',
      stageTitle: 'Stage 3: Choose Approach',
      stageDesc: 'In this stage, we will determine the product execution method. By exploring different possibilities through magic lenses, evaluating various paths, and ultimately selecting the most suitable execution plan.',
      magicLenses: 'Magic Lenses',
      magicLensesTitle: 'What are magic lenses?',
      magicLensesDesc: 'Thinking tools to explore product possibilities from different perspectives',
      paths: 'Possible Paths',
      pathsTitle: 'What are the possible paths?',
      pathsDesc: 'Different execution plans derived from lens analysis',
      selectedPath: 'Selected Path',
      selectedPathTitle: 'Which path to choose?',
      selectedPathDesc: 'Final execution plan and reasoning for selection',
      reasoning: 'Reasoning',
      addLens: 'Add Lens',
      addPath: 'Add Path',
      selectPath: 'Select Path',
      lensPlaceholder: 'Describe a thinking perspective...',
      pathPlaceholder: 'Describe a possible execution path...',
      reasoningPlaceholder: 'Explain why you chose this path...',
      progress: 'Approach Stage Progress',
      progressDesc: 'Completed',
      ofParts: 'parts',
    },
    
    // AI Agents
    ai: {
      assistant: 'AI Assistant',
      closeAssistant: 'Close Assistant',
      thinkAgent: 'Help Me Think',
      thinkDesc: 'Expand Thinking',
      thinkLongDesc: 'Smart questions, new perspectives, creative inspiration and case studies',
      critiqueAgent: 'Challenge Me',
      critiqueDesc: 'Critical Analysis',
      critiqueLongDesc: 'Challenge assumptions, assess market reality, analyze competition and execution risks',
      researchAgent: 'Research',
      researchDesc: 'Deep Research',
      researchLongDesc: 'Market data, competitor analysis, technical feasibility and user insights',
      selectAgent: 'Select an AI Assistant',
      startConversation: 'Choose an assistant above to start',
      inputPlaceholder: 'Enter your question...',
      send: 'Send',
      thinking: 'Thinking...',
    },
    
    // Export
    export: {
      title: 'Export Report',
      pdf: 'Export PDF',
      json: 'Export JSON',
      generating: 'Generating...',
      foundationReport: 'Foundation Sprint Report',
      hypothesis: 'Founding Hypothesis',
    },
  },
}

export type Language = keyof typeof translations
export type TranslationKey = string

export function getTranslation(lang: Language, key: string): string {
  const keys = key.split('.')
  let current: any = translations[lang]
  
  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k]
    } else {
      // Fallback to Chinese if translation not found
      current = translations.zh
      for (const fallbackKey of keys) {
        if (current && typeof current === 'object' && fallbackKey in current) {
          current = current[fallbackKey]
        } else {
          return key // Return the key itself if no translation found
        }
      }
      break
    }
  }
  
  return typeof current === 'string' ? current : key
}