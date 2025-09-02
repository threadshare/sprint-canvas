import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  ArrowRight, 
  Clock, 
  Users, 
  Target, 
  Lightbulb, 
  TrendingUp, 
  CheckCircle,
  Zap,
  Brain,
  Search,
  Sparkles,
  ArrowDown,
  Quote,
  ChevronRight,
  BarChart3,
  Rocket,
  Shield,
  X
} from 'lucide-react';

interface FoundationSprintIntroProps {
  onGetStarted: () => void;
  onClose: () => void;
}

export const FoundationSprintIntro: React.FC<FoundationSprintIntroProps> = ({ 
  onGetStarted, 
  onClose 
}) => {
  const { t } = useLanguage();
  const [currentSection, setCurrentSection] = useState(0);

  const sections = [
    { id: 'hero', title: '什么是Foundation Sprint' },
    { id: 'problem', title: '解决的问题' },
    { id: 'science', title: '科学原理' },
    { id: 'process', title: '三大阶段' },
    { id: 'ai-era', title: 'AI时代的价值' },
    { id: 'results', title: '预期成果' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 bg-white rounded-t-2xl border-b p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Foundation Sprint 方法指南</h1>
                <p className="text-gray-600">来自Google Ventures的科学创新方法</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <div className="px-6 py-4 border-b">
            <div className="flex gap-2 overflow-x-auto">
              {sections.map((section, index) => (
                <Button
                  key={section.id}
                  variant={currentSection === index ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentSection(index)}
                  className="whitespace-nowrap"
                >
                  {section.title}
                </Button>
              ))}
            </div>
          </div>

          <div className="p-8">
            {/* Hero Section */}
            {currentSection === 0 && (
              <div className="space-y-8">
                <div className="text-center">
                  <div className="mb-6">
                    <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">
                      来自Google Ventures
                    </Badge>
                  </div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">
                    什么是 Foundation Sprint？
                  </h2>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                    一个仅需 <span className="font-bold text-blue-600">10小时</span>，就能完成传统模式下 
                    <span className="font-bold text-red-600">数月工作</span> 的科学方法论
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <Card className="border-2 border-blue-200 bg-blue-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-blue-900">
                        <Quote className="w-6 h-6" />
                        核心理念
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <blockquote className="text-blue-800 italic text-lg leading-relaxed">
                        "让项目最核心的成员清空所有日程安排，完全投入进来，
                        通过结构化流程在最早阶段奠定坚实的战略基础。"
                      </blockquote>
                      <div className="mt-4 text-sm text-blue-600">
                        — Jake Knapp & John Zeratsky, Google Ventures
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-4">
                    <Card className="border border-green-200 bg-green-50">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="font-semibold text-green-900">验证成果</span>
                        </div>
                        <p className="text-green-800">数百家创业公司成功实践</p>
                      </CardContent>
                    </Card>

                    <Card className="border border-purple-200 bg-purple-50">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3 mb-2">
                          <Clock className="w-5 h-5 text-purple-600" />
                          <span className="font-semibold text-purple-900">高效决策</span>
                        </div>
                        <p className="text-purple-800">10小时 vs 传统数月讨论</p>
                      </CardContent>
                    </Card>

                    <Card className="border border-orange-200 bg-orange-50">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3 mb-2">
                          <Target className="w-5 h-5 text-orange-600" />
                          <span className="font-semibold text-orange-900">科学验证</span>
                        </div>
                        <p className="text-orange-800">结构化流程确保客观决策</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* Problem Section */}
            {currentSection === 1 && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    为什么需要 Foundation Sprint？
                  </h2>
                  <p className="text-lg text-gray-600">
                    解决创业团队最根本的战略分歧问题
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-2xl font-bold text-red-600 mb-6 flex items-center gap-3">
                      <Shield className="w-6 h-6" />
                      传统模式的问题
                    </h3>
                    <div className="space-y-4">
                      {[
                        { icon: "🔄", title: "反复纠结", desc: "在最根本的问题上无休止讨论" },
                        { icon: "❓", title: "缺乏共识", desc: "客户是谁？解决什么问题？" },
                        { icon: "⏰", title: "浪费时间", desc: "数月时间仍无法达成战略共识" },
                        { icon: "💸", title: "盲目开发", desc: "没有验证假设就开始大量投入" }
                      ].map((item, i) => (
                        <Card key={i} className="border border-red-200 bg-red-50">
                          <CardContent className="pt-4">
                            <div className="flex items-start gap-3">
                              <span className="text-2xl">{item.icon}</span>
                              <div>
                                <h4 className="font-semibold text-red-900">{item.title}</h4>
                                <p className="text-red-700 text-sm">{item.desc}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-green-600 mb-6 flex items-center gap-3">
                      <Sparkles className="w-6 h-6" />
                      Foundation Sprint的解决方案
                    </h3>
                    <div className="space-y-4">
                      {[
                        { icon: "🎯", title: "聚焦决策", desc: "强制团队专注于最关键的战略问题" },
                        { icon: "📊", title: "结构化流程", desc: "Note and Vote机制确保科学决策" },
                        { icon: "⚡", title: "快速共识", desc: "10小时内达成所有核心战略共识" },
                        { icon: "🔬", title: "假设验证", desc: "形成明确假设，后续Design Sprint验证" }
                      ].map((item, i) => (
                        <Card key={i} className="border border-green-200 bg-green-50">
                          <CardContent className="pt-4">
                            <div className="flex items-start gap-3">
                              <span className="text-2xl">{item.icon}</span>
                              <div>
                                <h4 className="font-semibold text-green-900">{item.title}</h4>
                                <p className="text-green-700 text-sm">{item.desc}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Science Section */}
            {currentSection === 2 && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    科学原理：为什么如此有效？
                  </h2>
                  <p className="text-lg text-gray-600">
                    基于认知科学和群体决策理论的方法设计
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-blue-900">
                        <Brain className="w-6 h-6" />
                        认知科学基础
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-blue-800">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 mt-1 text-blue-600" />
                          <span className="text-sm">独立思考避免群体偏见</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 mt-1 text-blue-600" />
                          <span className="text-sm">时间限制提升专注度</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 mt-1 text-blue-600" />
                          <span className="text-sm">结构化减少认知负担</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-purple-900">
                        <Users className="w-6 h-6" />
                        群体决策理论
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-purple-800">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 mt-1 text-purple-600" />
                          <span className="text-sm">Note and Vote机制</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 mt-1 text-purple-600" />
                          <span className="text-sm">避免权威影响决策</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 mt-1 text-purple-600" />
                          <span className="text-sm">多元观点整合</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-green-900">
                        <BarChart3 className="w-6 h-6" />
                        实证验证
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-green-800">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 mt-1 text-green-600" />
                          <span className="text-sm">数百家公司成功案例</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 mt-1 text-green-600" />
                          <span className="text-sm">Google Ventures验证</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 mt-1 text-green-600" />
                          <span className="text-sm">Character Capital实践</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-2 border-yellow-200 bg-yellow-50">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-yellow-800 mb-2">10小时 vs 数月</div>
                      <p className="text-yellow-700 text-lg">
                        通过结构化流程，将传统需要数月的战略讨论压缩到10小时
                      </p>
                      <div className="mt-4 flex justify-center gap-8 text-sm">
                        <div className="text-center">
                          <div className="font-bold text-red-600">传统模式</div>
                          <div className="text-red-500">3-6个月</div>
                        </div>
                        <ArrowRight className="w-6 h-6 text-gray-400 self-center" />
                        <div className="text-center">
                          <div className="font-bold text-green-600">Foundation Sprint</div>
                          <div className="text-green-500">10小时</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Process Section */}
            {currentSection === 3 && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    三大核心阶段
                  </h2>
                  <p className="text-lg text-gray-600">
                    环环相扣的结构化流程，确保每个环节都有科学依据
                  </p>
                </div>

                <div className="space-y-8">
                  {/* Stage 1 */}
                  <Card className="border-2 border-blue-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                          <span className="text-2xl font-bold">1</span>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold">基础阶段 (Foundation)</h3>
                          <p className="text-blue-100">回答看似简单却至关重要的基础问题</p>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Target className="w-5 h-5" />
                            核心问题
                          </h4>
                          <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                              <ChevronRight className="w-4 h-4 mt-1 text-blue-600" />
                              <span>你的客户是谁？</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <ChevronRight className="w-4 h-4 mt-1 text-blue-600" />
                              <span>你为他们解决什么问题？</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <ChevronRight className="w-4 h-4 mt-1 text-blue-600" />
                              <span>市场上的竞争格局如何？</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <ChevronRight className="w-4 h-4 mt-1 text-blue-600" />
                              <span>你的团队有哪些独特优势？</span>
                            </li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Lightbulb className="w-5 h-5" />
                            方法特色
                          </h4>
                          <div className="space-y-3">
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <div className="font-semibold text-blue-900">Note and Vote</div>
                              <div className="text-sm text-blue-700">独自思考，避免群体偏见</div>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <div className="font-semibold text-blue-900">同时展示</div>
                              <div className="text-sm text-blue-700">所有想法一起展示讨论</div>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <div className="font-semibold text-blue-900">决策者拍板</div>
                              <div className="text-sm text-blue-700">CEO最终决定，避免无尽讨论</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-center">
                    <ArrowDown className="w-8 h-8 text-gray-400" />
                  </div>

                  {/* Stage 2 */}
                  <Card className="border-2 border-purple-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                          <span className="text-2xl font-bold">2</span>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold">差异化阶段 (Differentiation)</h3>
                          <p className="text-purple-100">找到产品的独特定位和竞争优势</p>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5" />
                            2x2 分析矩阵
                          </h4>
                          <div className="bg-purple-50 p-4 rounded-lg mb-4">
                            <div className="text-center font-semibold text-purple-900 mb-2">
                              目标：独占右上角"胜利象限"
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="bg-red-100 text-red-800 p-2 rounded text-center">
                                失败者村
                              </div>
                              <div className="bg-green-100 text-green-800 p-2 rounded text-center font-bold">
                                胜利象限
                              </div>
                              <div className="bg-red-100 text-red-800 p-2 rounded text-center">
                                失败者村
                              </div>
                              <div className="bg-red-100 text-red-800 p-2 rounded text-center">
                                失败者村
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Sparkles className="w-5 h-5" />
                            输出成果
                          </h4>
                          <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 mt-1 text-green-600" />
                              <span>差异化优势矩阵</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 mt-1 text-green-600" />
                              <span>产品"北极星"指导原则</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 mt-1 text-green-600" />
                              <span>迷你宣言和项目原则</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 mt-1 text-green-600" />
                              <span>清晰的市场定位</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-center">
                    <ArrowDown className="w-8 h-8 text-gray-400" />
                  </div>

                  {/* Stage 3 */}
                  <Card className="border-2 border-green-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                          <span className="text-2xl font-bold">3</span>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold">方法阶段 (Approach)</h3>
                          <p className="text-green-100">确定具体的执行路径和验证方案</p>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Search className="w-5 h-5" />
                            Magic Lenses 评估
                          </h4>
                          <div className="space-y-2">
                            {[
                              { name: "客户视角", desc: "对用户最友好" },
                              { name: "务实视角", desc: "开发最高效" },
                              { name: "增长视角", desc: "获客最容易" },
                              { name: "财务视角", desc: "商业价值最大" },
                              { name: "差异化视角", desc: "最体现优势" }
                            ].map((lens, i) => (
                              <div key={i} className="bg-green-50 p-2 rounded-lg">
                                <div className="font-medium text-green-900">{lens.name}</div>
                                <div className="text-xs text-green-700">{lens.desc}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Rocket className="w-5 h-5" />
                            最终产出
                          </h4>
                          <div className="bg-green-50 p-4 rounded-lg">
                            <h5 className="font-bold text-green-900 mb-2">创始假设 (Founding Hypothesis)</h5>
                            <div className="text-sm text-green-800 italic">
                              "如果我们用 [某个方法] 为 [某类客户] 解决 [某个问题]，
                              我们相信，他们会因为 [差异化因素] 而选择我们，
                              而不是 [竞争对手]。"
                            </div>
                            <div className="mt-3 text-xs text-green-600">
                              ✅ 接下来通过 Design Sprint 验证这个假设
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* AI Era Section */}
            {currentSection === 4 && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    AI 时代，为什么更需要 Foundation Sprint？
                  </h2>
                  <p className="text-lg text-gray-600">
                    在AI工具让开发变得容易的今天，战略思考变得更加重要
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <Card className="border-2 border-red-200 bg-red-50">
                    <CardHeader>
                      <CardTitle className="text-red-900 flex items-center gap-3">
                        <Zap className="w-6 h-6" />
                        AI时代的陷阱
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="border-l-4 border-red-500 pl-4">
                          <h4 className="font-semibold text-red-900">速度陷阱</h4>
                          <p className="text-red-700 text-sm">
                            AI让开发变快，但也容易让人陷入"快即是好"的误区，
                            忽略了方向的正确性
                          </p>
                        </div>
                        <div className="border-l-4 border-red-500 pl-4">
                          <h4 className="font-semibold text-red-900">平庸化风险</h4>
                          <p className="text-red-700 text-sm">
                            LLM基于相同数据训练，容易产生千篇一律的解决方案，
                            缺乏独特性
                          </p>
                        </div>
                        <div className="border-l-4 border-red-500 pl-4">
                          <h4 className="font-semibold text-red-900">数据盲区</h4>
                          <p className="text-red-700 text-sm">
                            只能获得使用产品用户的数据，无法知道为什么更多人
                            看了一眼就离开
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="text-green-900 flex items-center gap-3">
                        <Shield className="w-6 h-6" />
                        Foundation Sprint的价值
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="border-l-4 border-green-500 pl-4">
                          <h4 className="font-semibold text-green-900">战略先行</h4>
                          <p className="text-green-700 text-sm">
                            强制在开发之前完成最难的战略思考，
                            确保正确的方向再加速
                          </p>
                        </div>
                        <div className="border-l-4 border-green-500 pl-4">
                          <h4 className="font-semibold text-green-900">差异化保障</h4>
                          <p className="text-green-700 text-sm">
                            通过结构化流程找到独特定位，
                            避免AI生成的平庸方案
                          </p>
                        </div>
                        <div className="border-l-4 border-green-500 pl-4">
                          <h4 className="font-semibold text-green-900">验证机制</h4>
                          <p className="text-green-700 text-sm">
                            形成明确假设后再开发，
                            通过Design Sprint系统验证
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-2 border-blue-200 bg-blue-50">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Quote className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                      <blockquote className="text-xl text-blue-900 font-medium mb-4">
                        "可以把开发原型的工作'外包'给AI，但永远不能把战略思考也'外包'出去。
                        完成了思考这一步，才能真正全速前进。"
                      </blockquote>
                      <div className="text-blue-600">
                        — Bob Baxley, Apple & Yahoo产品专家
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-yellow-900 mb-4 flex items-center gap-3">
                    <Lightbulb className="w-6 h-6" />
                    关键洞察
                  </h3>
                  <p className="text-yellow-800 text-lg leading-relaxed">
                    在AI时代，<span className="font-bold">先慢下来，才能真的快起来</span>。
                    Foundation Sprint正是这样一个强制先思考的机制，
                    让你在正确的方向上享受AI带来的速度优势。
                  </p>
                </div>
              </div>
            )}

            {/* Results Section */}
            {currentSection === 5 && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    预期成果与价值
                  </h2>
                  <p className="text-lg text-gray-600">
                    一次完整的Foundation Sprint能为您的团队带来什么？
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-2xl font-bold text-blue-600 mb-6">直接产出</h3>
                    <div className="space-y-4">
                      {[
                        {
                          title: "基础信息表",
                          desc: "客户画像、问题定义、竞争分析、团队优势的完整梳理",
                          icon: "📋"
                        },
                        {
                          title: "差异化矩阵",
                          desc: "2x2分析图表，明确产品的独特定位和竞争优势",
                          icon: "📊"
                        },
                        {
                          title: "项目原则",
                          desc: "3-5条核心原则，指导后续所有产品决策",
                          icon: "📜"
                        },
                        {
                          title: "创始假设",
                          desc: "结构化的核心假设，为Design Sprint验证做准备",
                          icon: "🎯"
                        }
                      ].map((item, i) => (
                        <Card key={i} className="border border-blue-200 bg-blue-50">
                          <CardContent className="pt-4">
                            <div className="flex items-start gap-3">
                              <span className="text-2xl">{item.icon}</span>
                              <div>
                                <h4 className="font-semibold text-blue-900">{item.title}</h4>
                                <p className="text-blue-700 text-sm">{item.desc}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-green-600 mb-6">深层价值</h3>
                    <div className="space-y-4">
                      {[
                        {
                          title: "团队共识",
                          desc: "所有核心成员对战略方向达成一致，消除分歧",
                          icon: "🤝"
                        },
                        {
                          title: "决策信心",
                          desc: "基于科学流程的决策，增强团队执行信心",
                          icon: "💪"
                        },
                        {
                          title: "时间效率",
                          desc: "10小时完成数月工作，大幅提升决策效率",
                          icon: "⚡"
                        },
                        {
                          title: "风险控制",
                          desc: "在大量投入前验证核心假设，降低失败风险",
                          icon: "🛡️"
                        }
                      ].map((item, i) => (
                        <Card key={i} className="border border-green-200 bg-green-50">
                          <CardContent className="pt-4">
                            <div className="flex items-start gap-3">
                              <span className="text-2xl">{item.icon}</span>
                              <div>
                                <h4 className="font-semibold text-green-900">{item.title}</h4>
                                <p className="text-green-700 text-sm">{item.desc}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>

                <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-purple-900 mb-4">
                        真实案例：Latchet公司的成功实践
                      </h3>
                      <div className="max-w-3xl mx-auto text-left">
                        <div className="grid md:grid-cols-3 gap-4 mb-6">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-red-600">第1周</div>
                            <div className="text-sm text-red-700">计分卡全红</div>
                            <div className="text-xs text-gray-600">方案完全不被认可</div>
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-yellow-600">第2周</div>
                            <div className="text-sm text-yellow-700">开始出现黄色</div>
                            <div className="text-xs text-gray-600">差异化方向变清晰</div>
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-green-600">第3周</div>
                            <div className="text-sm text-green-700">奇迹般全绿</div>
                            <div className="text-xs text-gray-600">强烈共鸣的产品方向</div>
                          </div>
                        </div>
                        <div className="bg-purple-100 p-4 rounded-lg">
                          <p className="text-purple-800 italic text-center">
                            "这个流程将我们原本需要3-4个月才能完成的工作，
                            压缩在了短短三周之内。"
                            <br />
                            <span className="text-sm">— Latchet创始人</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="text-center">
                  <Button 
                    onClick={onGetStarted}
                    size="lg" 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
                  >
                    <Rocket className="w-5 h-5 mr-2" />
                    立即开始 Foundation Sprint
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">
                    10小时找到产品基础，科学验证创业想法
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center mt-12 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                disabled={currentSection === 0}
              >
                上一节
              </Button>
              
              <div className="flex gap-2">
                {sections.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full cursor-pointer ${
                      index === currentSection ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                    onClick={() => setCurrentSection(index)}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                onClick={() => setCurrentSection(Math.min(sections.length - 1, currentSection + 1))}
                disabled={currentSection === sections.length - 1}
              >
                下一节
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
