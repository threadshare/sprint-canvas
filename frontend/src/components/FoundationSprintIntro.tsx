import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  ArrowRight, 
  Clock, 
  Users, 
  Target, 
  Lightbulb, 
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
    { id: 'hero', title: t('intro.nav.hero') },
    { id: 'problem', title: t('intro.nav.problem') },
    { id: 'science', title: t('intro.nav.science') },
    { id: 'process', title: t('intro.nav.process') },
    { id: 'ai-era', title: t('intro.nav.aiEra') },
    { id: 'results', title: t('intro.nav.results') }
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
                <h1 className="text-2xl font-bold text-gray-900">{t('intro.title')}</h1>
                <p className="text-gray-600">{t('intro.subtitle')}</p>
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
                      {t('intro.hero.fromGoogle')}
                    </Badge>
                  </div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">
                    {t('intro.hero.whatIs')}
                  </h2>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                    {t('intro.hero.description')}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                                      <Card className="border-2 border-blue-200 bg-blue-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-blue-900">
                        <Quote className="w-6 h-6" />
                        {t('intro.hero.coreIdea')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <blockquote className="text-blue-800 italic text-lg leading-relaxed">
                        "{t('intro.hero.coreQuote')}"
                      </blockquote>
                      <div className="mt-4 text-sm text-blue-600">
                        {t('intro.hero.coreSource')}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-4">
                    <Card className="border border-green-200 bg-green-50">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="font-semibold text-green-900">{t('intro.hero.verifiedResults')}</span>
                        </div>
                        <p className="text-green-800">{t('intro.hero.verifiedDesc')}</p>
                      </CardContent>
                    </Card>

                    <Card className="border border-purple-200 bg-purple-50">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3 mb-2">
                          <Clock className="w-5 h-5 text-purple-600" />
                          <span className="font-semibold text-purple-900">{t('intro.hero.efficientDecision')}</span>
                        </div>
                        <p className="text-purple-800">{t('intro.hero.efficientDesc')}</p>
                      </CardContent>
                    </Card>

                    <Card className="border border-orange-200 bg-orange-50">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3 mb-2">
                          <Target className="w-5 h-5 text-orange-600" />
                          <span className="font-semibold text-orange-900">{t('intro.hero.scientificVerification')}</span>
                        </div>
                        <p className="text-orange-800">{t('intro.hero.scientificDesc')}</p>
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
                    {t('intro.problem.whyNeed')}
                  </h2>
                  <p className="text-lg text-gray-600">
                    {t('intro.problem.description')}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-2xl font-bold text-red-600 mb-6 flex items-center gap-3">
                      <Shield className="w-6 h-6" />
                      {t('intro.problem.traditionalProblems')}
                    </h3>
                    <div className="space-y-4">
                      {[
                        { icon: "🔄", title: t('intro.problem.endlessDiscussion'), desc: t('intro.problem.endlessDesc') },
                        { icon: "❓", title: t('intro.problem.lackConsensus'), desc: t('intro.problem.lackDesc') },
                        { icon: "⏰", title: t('intro.problem.wasteTime'), desc: t('intro.problem.wasteDesc') },
                        { icon: "💸", title: t('intro.problem.blindDevelopment'), desc: t('intro.problem.blindDesc') }
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
                      {t('intro.problem.fsolutions')}
                    </h3>
                    <div className="space-y-4">
                      {[
                        { icon: "🎯", title: t('intro.problem.focusedDecision'), desc: t('intro.problem.focusedDesc') },
                        { icon: "📊", title: t('intro.problem.structuredProcess'), desc: t('intro.problem.structuredDesc') },
                        { icon: "⚡", title: t('intro.problem.rapidConsensus'), desc: t('intro.problem.rapidDesc') },
                        { icon: "🔬", title: t('intro.problem.hypothesisValidation'), desc: t('intro.problem.hypothesisDesc') }
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
                    {t('intro.science.title')}
                  </h2>
                  <p className="text-lg text-gray-600">
                    {t('intro.science.description')}
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                                      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-blue-900">
                        <Brain className="w-6 h-6" />
                        {t('intro.science.cognitiveScience')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-blue-800">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 mt-1 text-blue-600" />
                          <span className="text-sm">{t('intro.science.independentThinking')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 mt-1 text-blue-600" />
                          <span className="text-sm">{t('intro.science.timeLimit')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 mt-1 text-blue-600" />
                          <span className="text-sm">{t('intro.science.structuredReduction')}</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-purple-900">
                        <Users className="w-6 h-6" />
                        {t('intro.science.groupDecision')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-purple-800">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 mt-1 text-purple-600" />
                          <span className="text-sm">{t('intro.science.noteVote')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 mt-1 text-purple-600" />
                          <span className="text-sm">{t('intro.science.avoidAuthority')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 mt-1 text-purple-600" />
                          <span className="text-sm">{t('intro.science.multiPerspective')}</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-green-900">
                        <BarChart3 className="w-6 h-6" />
                        {t('intro.science.empiricalValidation')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-green-800">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 mt-1 text-green-600" />
                          <span className="text-sm">{t('intro.science.hundredsSuccess')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 mt-1 text-green-600" />
                          <span className="text-sm">{t('intro.science.googleValidation')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 mt-1 text-green-600" />
                          <span className="text-sm">{t('intro.science.characterPractice')}</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-2 border-yellow-200 bg-yellow-50">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-yellow-800 mb-2">{t('intro.science.timeComparison')}</div>
                      <p className="text-yellow-700 text-lg">
                        {t('intro.science.timeDesc')}
                      </p>
                      <div className="mt-4 flex justify-center gap-8 text-sm">
                        <div className="text-center">
                          <div className="font-bold text-red-600">{t('intro.science.traditionalMode')}</div>
                          <div className="text-red-500">{t('intro.science.traditionalTime')}</div>
                        </div>
                        <ArrowRight className="w-6 h-6 text-gray-400 self-center" />
                        <div className="text-center">
                          <div className="font-bold text-green-600">Foundation Sprint</div>
                          <div className="text-green-500">{t('intro.science.foundationTime')}</div>
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
                    {t('intro.process.title')}
                  </h2>
                  <p className="text-lg text-gray-600">
                    {t('intro.process.description')}
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
                          <h3 className="text-2xl font-bold">{t('intro.process.stage1.title')}</h3>
                          <p className="text-blue-100">{t('intro.process.stage1.subtitle')}</p>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Target className="w-5 h-5" />
                            {t('intro.process.stage1.coreQuestions')}
                          </h4>
                          <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                              <ChevronRight className="w-4 h-4 mt-1 text-blue-600" />
                              <span>{t('intro.process.stage1.whoCustomers')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <ChevronRight className="w-4 h-4 mt-1 text-blue-600" />
                              <span>{t('intro.process.stage1.whatProblems')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <ChevronRight className="w-4 h-4 mt-1 text-blue-600" />
                              <span>{t('intro.process.stage1.competitive')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <ChevronRight className="w-4 h-4 mt-1 text-blue-600" />
                              <span>{t('intro.process.stage1.advantages')}</span>
                            </li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Lightbulb className="w-5 h-5" />
                            {t('intro.process.stage1.methodFeatures')}
                          </h4>
                          <div className="space-y-3">
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <div className="font-semibold text-blue-900">{t('intro.process.stage1.noteVoteTitle')}</div>
                              <div className="text-sm text-blue-700">{t('intro.process.stage1.noteVoteDesc')}</div>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <div className="font-semibold text-blue-900">{t('intro.process.stage1.simultaneousDisplay')}</div>
                              <div className="text-sm text-blue-700">{t('intro.process.stage1.simultaneousDesc')}</div>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <div className="font-semibold text-blue-900">{t('intro.process.stage1.decisionMaker')}</div>
                              <div className="text-sm text-blue-700">{t('intro.process.stage1.decisionDesc')}</div>
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
                          <h3 className="text-2xl font-bold">{t('intro.process.stage2.title')}</h3>
                          <p className="text-purple-100">{t('intro.process.stage2.subtitle')}</p>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5" />
                            {t('intro.process.stage2.matrix')}
                          </h4>
                          <div className="bg-purple-50 p-4 rounded-lg mb-4">
                            <div className="text-center font-semibold text-purple-900 mb-2">
                              {t('intro.process.stage2.matrixGoal')}
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="bg-red-100 text-red-800 p-2 rounded text-center">
                                {t('intro.process.stage2.loserVillage')}
                              </div>
                              <div className="bg-green-100 text-green-800 p-2 rounded text-center font-bold">
                                {t('intro.process.stage2.winningQuadrant')}
                              </div>
                              <div className="bg-red-100 text-red-800 p-2 rounded text-center">
                                {t('intro.process.stage2.loserVillage')}
                              </div>
                              <div className="bg-red-100 text-red-800 p-2 rounded text-center">
                                {t('intro.process.stage2.loserVillage')}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Sparkles className="w-5 h-5" />
                            {t('intro.process.stage2.outputs')}
                          </h4>
                          <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 mt-1 text-green-600" />
                              <span>{t('intro.process.stage2.differentiationMatrix')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 mt-1 text-green-600" />
                              <span>{t('intro.process.stage2.northStar')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 mt-1 text-green-600" />
                              <span>{t('intro.process.stage2.miniManifesto')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 mt-1 text-green-600" />
                              <span>{t('intro.process.stage2.marketPosition')}</span>
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
                          <h3 className="text-2xl font-bold">{t('intro.process.stage3.title')}</h3>
                          <p className="text-green-100">{t('intro.process.stage3.subtitle')}</p>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Search className="w-5 h-5" />
                            {t('intro.process.stage3.magicLenses')}
                          </h4>
                          <div className="space-y-2">
                            {[
                              { name: t('intro.process.stage3.customerPerspective'), desc: t('intro.process.stage3.customerDesc') },
                              { name: t('intro.process.stage3.pragmaticPerspective'), desc: t('intro.process.stage3.pragmaticDesc') },
                              { name: t('intro.process.stage3.growthPerspective'), desc: t('intro.process.stage3.growthDesc') },
                              { name: t('intro.process.stage3.financialPerspective'), desc: t('intro.process.stage3.financialDesc') },
                              { name: t('intro.process.stage3.differentiationPerspective'), desc: t('intro.process.stage3.differentiationDesc') }
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
                            {t('intro.process.stage3.finalOutput')}
                          </h4>
                          <div className="bg-green-50 p-4 rounded-lg">
                            <h5 className="font-bold text-green-900 mb-2">{t('intro.process.stage3.foundingHypothesis')}</h5>
                            <div className="text-sm text-green-800 italic">
                              "{t('intro.process.stage3.hypothesisTemplate')}"
                            </div>
                            <div className="mt-3 text-xs text-green-600">
                              ✅ {t('intro.process.stage3.nextStep')}
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
                    {t('intro.aiEra.title')}
                  </h2>
                  <p className="text-lg text-gray-600">
                    {t('intro.aiEra.description')}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <Card className="border-2 border-red-200 bg-red-50">
                    <CardHeader>
                      <CardTitle className="text-red-900 flex items-center gap-3">
                        <Zap className="w-6 h-6" />
                        {t('intro.aiEra.aiTraps')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="border-l-4 border-red-500 pl-4">
                          <h4 className="font-semibold text-red-900">{t('intro.aiEra.speedTrap')}</h4>
                          <p className="text-red-700 text-sm">
                            {t('intro.aiEra.speedDesc')}
                          </p>
                        </div>
                        <div className="border-l-4 border-red-500 pl-4">
                          <h4 className="font-semibold text-red-900">{t('intro.aiEra.mediocrity')}</h4>
                          <p className="text-red-700 text-sm">
                            {t('intro.aiEra.mediocrityDesc')}
                          </p>
                        </div>
                        <div className="border-l-4 border-red-500 pl-4">
                          <h4 className="font-semibold text-red-900">{t('intro.aiEra.dataBlindness')}</h4>
                          <p className="text-red-700 text-sm">
                            {t('intro.aiEra.dataDesc')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="text-green-900 flex items-center gap-3">
                        <Shield className="w-6 h-6" />
                        {t('intro.aiEra.fsValue')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="border-l-4 border-green-500 pl-4">
                          <h4 className="font-semibold text-green-900">{t('intro.aiEra.strategyFirst')}</h4>
                          <p className="text-green-700 text-sm">
                            {t('intro.aiEra.strategyDesc')}
                          </p>
                        </div>
                        <div className="border-l-4 border-green-500 pl-4">
                          <h4 className="font-semibold text-green-900">{t('intro.aiEra.differentiationGuarantee')}</h4>
                          <p className="text-green-700 text-sm">
                            {t('intro.aiEra.differentiationGuaranteeDesc')}
                          </p>
                        </div>
                        <div className="border-l-4 border-green-500 pl-4">
                          <h4 className="font-semibold text-green-900">{t('intro.aiEra.validationMechanism')}</h4>
                          <p className="text-green-700 text-sm">
                            {t('intro.aiEra.validationDesc')}
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
                        "{t('intro.aiEra.quote')}"
                      </blockquote>
                      <div className="text-blue-600">
                        {t('intro.aiEra.quoteSource')}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-yellow-900 mb-4 flex items-center gap-3">
                    <Lightbulb className="w-6 h-6" />
                    {t('intro.aiEra.keyInsight')}
                  </h3>
                  <p className="text-yellow-800 text-lg leading-relaxed">
                    {t('intro.aiEra.keyInsightDesc')}
                  </p>
                </div>
              </div>
            )}

            {/* Results Section */}
            {currentSection === 5 && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    {t('intro.results.title')}
                  </h2>
                  <p className="text-lg text-gray-600">
                    {t('intro.results.description')}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-2xl font-bold text-blue-600 mb-6">{t('intro.results.directOutputs')}</h3>
                    <div className="space-y-4">
                      {[
                        {
                          title: t('intro.results.basicInfo'),
                          desc: t('intro.results.basicInfoDesc'),
                          icon: "📋"
                        },
                        {
                          title: t('intro.results.differentiationMatrix'),
                          desc: t('intro.results.differentiationMatrixDesc'),
                          icon: "📊"
                        },
                        {
                          title: t('intro.results.projectPrinciples'),
                          desc: t('intro.results.projectPrinciplesDesc'),
                          icon: "📜"
                        },
                        {
                          title: t('intro.results.foundingHypothesis'),
                          desc: t('intro.results.foundingHypothesisDesc'),
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
                    <h3 className="text-2xl font-bold text-green-600 mb-6">{t('intro.results.deepValue')}</h3>
                    <div className="space-y-4">
                      {[
                        {
                          title: t('intro.results.teamConsensus'),
                          desc: t('intro.results.teamConsensusDesc'),
                          icon: "🤝"
                        },
                        {
                          title: t('intro.results.decisionConfidence'),
                          desc: t('intro.results.decisionConfidenceDesc'),
                          icon: "💪"
                        },
                        {
                          title: t('intro.results.timeEfficiency'),
                          desc: t('intro.results.timeEfficiencyDesc'),
                          icon: "⚡"
                        },
                        {
                          title: t('intro.results.riskControl'),
                          desc: t('intro.results.riskControlDesc'),
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
                        {t('intro.results.caseStudy')}
                      </h3>
                      <div className="max-w-3xl mx-auto text-left">
                        <div className="grid md:grid-cols-3 gap-4 mb-6">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-red-600">{t('intro.results.week1')}</div>
                            <div className="text-sm text-red-700">{t('intro.results.week1Result')}</div>
                            <div className="text-xs text-gray-600">{t('intro.results.week1Desc')}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-yellow-600">{t('intro.results.week2')}</div>
                            <div className="text-sm text-yellow-700">{t('intro.results.week2Result')}</div>
                            <div className="text-xs text-gray-600">{t('intro.results.week2Desc')}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-green-600">{t('intro.results.week3')}</div>
                            <div className="text-sm text-green-700">{t('intro.results.week3Result')}</div>
                            <div className="text-xs text-gray-600">{t('intro.results.week3Desc')}</div>
                          </div>
                        </div>
                        <div className="bg-purple-100 p-4 rounded-lg">
                          <p className="text-purple-800 italic text-center">
                            {t('intro.results.caseQuote')}
                            <br />
                            <span className="text-sm">{t('intro.results.caseSource')}</span>
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
                        {t('intro.getStarted')}
                      </Button>
                      <p className="text-sm text-gray-500 mt-2">
                        {t('intro.results.finalDesc')}
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
                {t('intro.nav.previous')}
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
                {t('intro.nav.next')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
