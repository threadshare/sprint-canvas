import React, { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Room } from '@/lib/api/types';
import {
  Download,
  Edit3,
  Eye,
  FileText,
  Lightbulb,
  Target,
  Route,
  CheckCircle,
  Calendar,
  Users,
  Sparkles,
  Copy,
  BarChart2,
  Grid3x3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Matrix2x2Chart } from '@/components/charts/Matrix2x2Chart';
import { RadarChart } from '@/components/charts/RadarChart';
import { PathComparisonTable } from '@/components/charts/PathComparisonTable';

interface FoundationSprintReportProps {
  room: Room;
  participants: Array<{ id: string; name: string }>;
  isOpen: boolean;
  onClose: () => void;
}

interface EditableReportData {
  title: string;
  subtitle: string;
  executiveSummary: string;
  keyInsights: string[];
  recommendations: string[];
  nextSteps: string[];
}

export const FoundationSprintReport: React.FC<FoundationSprintReportProps> = ({
  room,
  participants,
  isOpen,
  onClose,
}) => {
  const { t } = useLanguage();
  const reportRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [reportData, setReportData] = useState<EditableReportData>({
    title: `${room.name} - Foundation Sprint ${t('export.report')}`,
    subtitle: t('export.reportSubtitle'),
    executiveSummary: t('export.executiveSummaryTemplate')
      .replace('{{customerCount}}', String(room.foundation.customers.length))
      .replace('{{problemCount}}', String(room.foundation.problems.length)),
    keyInsights: [
      t('export.insight1'),
      t('export.insight2'),
      t('export.insight3'),
    ],
    recommendations: [
      t('export.recommendation1'),
      t('export.recommendation2'),
      t('export.recommendation3'),
    ],
    nextSteps: [
      t('export.nextStep1'),
      t('export.nextStep2'),
      t('export.nextStep3'),
    ],
  });

  const handleExportPDF = async () => {
    // Using browser's print functionality for high-quality PDF export
    const printContent = reportRef.current;
    if (!printContent) return;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${reportData.title}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #1f2937;
              background: white;
            }
            .report-container {
              max-width: 210mm;
              margin: 0 auto;
              padding: 20mm;
              background: white;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #3b82f6;
              padding-bottom: 2rem;
              margin-bottom: 3rem;
            }
            .title {
              font-size: 2.5rem;
              font-weight: 700;
              color: #1e40af;
              margin-bottom: 0.5rem;
            }
            .subtitle {
              font-size: 1.25rem;
              color: #6b7280;
            }
            .section {
              margin-bottom: 2rem;
              page-break-inside: avoid;
            }
            .section-title {
              font-size: 1.5rem;
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 1rem;
              border-left: 4px solid #3b82f6;
              padding-left: 1rem;
            }
            .grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 2rem;
              margin: 2rem 0;
            }
            .card {
              background: #f9fafb;
              border-radius: 0.75rem;
              padding: 1.5rem;
              border-left: 4px solid #10b981;
            }
            .card-title {
              font-weight: 600;
              margin-bottom: 1rem;
              color: #059669;
            }
            .list {
              list-style: none;
            }
            .list li {
              margin-bottom: 0.5rem;
              padding-left: 1.5rem;
              position: relative;
            }
            .list li::before {
              content: '•';
              color: #3b82f6;
              font-weight: bold;
              position: absolute;
              left: 0;
            }
            .badge {
              display: inline-block;
              background: #dbeafe;
              color: #1e40af;
              padding: 0.25rem 0.75rem;
              border-radius: 1rem;
              font-size: 0.875rem;
              margin: 0.25rem 0.5rem 0.25rem 0;
            }
            .footer {
              margin-top: 4rem;
              padding-top: 2rem;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              color: #6b7280;
              font-size: 0.875rem;
            }
            .matrix-container {
              margin: 2rem 0;
              padding: 1.5rem;
              background: #f9fafb;
              border-radius: 0.75rem;
              border: 1px solid #e5e7eb;
            }
            .radar-container {
              margin: 2rem 0;
              padding: 1.5rem;
              background: #f0f9ff;
              border-radius: 0.75rem;
              border: 1px solid #bfdbfe;
            }
            .comparison-table {
              width: 100%;
              border-collapse: collapse;
              margin: 2rem 0;
            }
            .comparison-table th {
              background: #f3f4f6;
              padding: 0.75rem;
              text-align: left;
              font-weight: 600;
              border: 1px solid #e5e7eb;
            }
            .comparison-table td {
              padding: 0.75rem;
              border: 1px solid #e5e7eb;
            }
            .comparison-table tr:nth-child(even) {
              background: #f9fafb;
            }
            .score-badge {
              display: inline-block;
              padding: 0.25rem 0.75rem;
              border-radius: 1rem;
              font-size: 0.875rem;
              font-weight: 600;
            }
            .score-high {
              background: #dcfce7;
              color: #166534;
            }
            .score-medium {
              background: #fef3c7;
              color: #92400e;
            }
            .score-low {
              background: #fee2e2;
              color: #991b1b;
            }
            .quadrant-analysis {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 1rem;
              margin: 1rem 0;
            }
            .quadrant-card {
              padding: 1rem;
              background: white;
              border-radius: 0.5rem;
              border: 1px solid #e5e7eb;
            }
            .quadrant-card.winning {
              background: #dcfce7;
              border-color: #86efac;
            }
            .lens-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 1rem;
              margin: 2rem 0;
            }
            .lens-card {
              padding: 1rem;
              background: #fef3c7;
              border-radius: 0.5rem;
              border-left: 4px solid #f59e0b;
            }
            @media print {
              body { 
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
              .page-break { page-break-before: always; }
              .no-print { display: none; }
              .comparison-table { page-break-inside: avoid; }
              .matrix-container { page-break-inside: avoid; }
              .radar-container { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleCopyReport = async () => {
    const textContent = generateTextReport();
    try {
      await navigator.clipboard.writeText(textContent);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy report:', error);
    }
  };

  const generateTextReport = () => {
    return `
# ${reportData.title}

${reportData.subtitle}

## 执行摘要
${reportData.executiveSummary}

## 基础信息

### 目标客户
${(room.foundation.customers || []).map(c => `- ${c}`).join('\n')}

### 核心问题
${(room.foundation.problems || []).map(p => `- ${p}`).join('\n')}

### 竞争对手
${(room.foundation.competition || []).map(c => `- ${c}`).join('\n')}

### 团队优势
${(room.foundation.advantages || []).map(a => `- ${a}`).join('\n')}

## 差异化定位

### 核心原则
${(room.differentiation.principles || []).map(p => `- ${p}`).join('\n')}

## 执行路径

### 选定方案
${room.approach.paths.find(p => p.id === room.approach.selected_path)?.name || '待确定'}

### 决策理由
${room.approach.reasoning}

## 关键洞察
${reportData.keyInsights.map(i => `- ${i}`).join('\n')}

## 建议
${reportData.recommendations.map(r => `- ${r}`).join('\n')}

## 下一步行动
${reportData.nextSteps.map(s => `- ${s}`).join('\n')}

---
报告生成时间: ${new Date().toLocaleDateString('zh-CN', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}
`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Foundation Sprint 报告
          </DialogTitle>
          <DialogDescription>
            生成专业的产品战略分析报告，支持编辑和导出
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 mb-6">
          <Button
            variant={isEditing ? "secondary" : "outline"}
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? <Eye className="h-4 w-4 mr-1" /> : <Edit3 className="h-4 w-4 mr-1" />}
            {isEditing ? '预览模式' : '编辑模式'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-1" />
            导出 PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopyReport}>
            <Copy className="h-4 w-4 mr-1" />
            复制文本
          </Button>
        </div>

        <div ref={reportRef} className="report-container">
          {/* Report Header */}
          <div className="header text-center border-b-4 border-blue-500 pb-8 mb-12">
            {isEditing ? (
              <div className="space-y-4">
                <Input
                  value={reportData.title}
                  onChange={(e) => setReportData(prev => ({ ...prev, title: e.target.value }))}
                  className="text-2xl font-bold text-center border-none text-blue-700"
                />
                <Input
                  value={reportData.subtitle}
                  onChange={(e) => setReportData(prev => ({ ...prev, subtitle: e.target.value }))}
                  className="text-lg text-center border-none text-gray-600"
                />
              </div>
            ) : (
              <>
                <h1 className="title text-4xl font-bold text-blue-700 mb-2">
                  {reportData.title}
                </h1>
                <p className="subtitle text-xl text-gray-600">
                  {reportData.subtitle}
                </p>
              </>
            )}
            
            <div className="flex justify-center gap-8 mt-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date().toLocaleDateString('zh-CN')}
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {participants.length} 参与者
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="section">
            <h2 className="section-title">执行摘要</h2>
            {isEditing ? (
              <Textarea
                value={reportData.executiveSummary}
                onChange={(e) => setReportData(prev => ({ ...prev, executiveSummary: e.target.value }))}
                className="min-h-24"
              />
            ) : (
              <p className="text-gray-700 leading-relaxed bg-blue-50 p-6 rounded-lg border-l-4 border-blue-400">
                {reportData.executiveSummary}
              </p>
            )}
          </div>

          {/* Foundation Results */}
          <div className="section">
            <h2 className="section-title flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              基础阶段成果
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500">
                <h3 className="card-title text-blue-700">目标客户</h3>
                <ul className="list">
                  {(room.foundation.customers || []).map((customer, index) => (
                    <li key={index}>{customer}</li>
                  ))}
                </ul>
              </div>

              <div className="card bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-500">
                <h3 className="card-title text-red-700">核心问题</h3>
                <ul className="list">
                  {(room.foundation.problems || []).map((problem, index) => (
                    <li key={index}>{problem}</li>
                  ))}
                </ul>
              </div>

              <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 border-l-4 border-yellow-500">
                <h3 className="card-title text-yellow-700">竞争对手</h3>
                <ul className="list">
                  {(room.foundation.competition || []).map((comp, index) => (
                    <li key={index}>{comp}</li>
                  ))}
                </ul>
              </div>

              <div className="card bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500">
                <h3 className="card-title text-green-700">团队优势</h3>
                <ul className="list">
                  {(room.foundation.advantages || []).map((adv, index) => (
                    <li key={index}>{adv}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Differentiation Strategy */}
          <div className="section page-break">
            <h2 className="section-title flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              差异化策略
            </h2>
            
            <div className="bg-purple-50 p-6 rounded-lg border-l-4 border-purple-500">
              <h3 className="font-semibold text-purple-800 mb-4">核心原则</h3>
              <div className="flex flex-wrap gap-2">
                {(room.differentiation.principles || []).map((principle, index) => (
                  <Badge key={index} className="badge bg-purple-100 text-purple-800">
                    {principle}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* 2x2 Matrix Visualization */}
            {room.differentiation.matrix.x_axis && room.differentiation.matrix.y_axis && (
              <div className="mt-6">
                <h3 className="flex items-center gap-2 font-semibold text-purple-800 mb-4">
                  <Grid3x3 className="h-5 w-5" />
                  定位矩阵分析
                </h3>
                <div className="flex justify-center">
                  <Matrix2x2Chart
                    xAxis={room.differentiation.matrix.x_axis}
                    yAxis={room.differentiation.matrix.y_axis}
                    products={room.differentiation.matrix.products}
                    winningQuadrant={room.differentiation.matrix.winning_quadrant}
                    size="md"
                    showLabels={true}
                  />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white p-3 rounded border border-purple-200">
                    <h4 className="font-medium text-purple-700 mb-2">竞争态势</h4>
                    <p className="text-gray-600">
                      共分析 {room.differentiation.matrix.products.length} 个产品，
                      其中 {room.differentiation.matrix.products.filter(p => p.is_us).length} 个是我们的产品。
                      目标象限为 <span className="font-semibold">{room.differentiation.matrix.winning_quadrant || '待确定'}</span>。
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded border border-purple-200">
                    <h4 className="font-medium text-purple-700 mb-2">差异化优势</h4>
                    <p className="text-gray-600">
                      通过在 {room.differentiation.matrix.x_axis} 和 {room.differentiation.matrix.y_axis} 两个维度上的定位，
                      我们找到了独特的市场空间。
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Execution Path */}
          <div className="section">
            <h2 className="section-title flex items-center gap-2">
              <Route className="h-5 w-5 text-green-600" />
              执行路径
            </h2>
            
            <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
              <h3 className="font-semibold text-green-800 mb-4">
                选定方案: {room.approach.paths.find(p => p.id === room.approach.selected_path)?.name || '待确定'}
              </h3>
              {room.approach.reasoning && (
                <p className="text-green-700">{room.approach.reasoning}</p>
              )}
            </div>
            
            {/* Path Comparison Table */}
            {room.approach.paths.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-green-800 mb-4">路径全面对比</h3>
                <PathComparisonTable
                  paths={room.approach.paths}
                  magicLenses={room.approach.magic_lenses}
                  selectedPathId={room.approach.selected_path}
                />
              </div>
            )}
            
            {/* Magic Lenses Radar Chart */}
            {room.approach.magic_lenses.length > 0 && room.approach.paths.length > 0 && (
              <div className="mt-6">
                <h3 className="flex items-center gap-2 font-semibold text-green-800 mb-4">
                  <BarChart2 className="h-5 w-5" />
                  Magic Lenses 评估雷达图
                </h3>
                <div className="flex justify-center">
                  <RadarChart
                    data={room.approach.magic_lenses.map(lens => ({
                      label: lens.name,
                      values: room.approach.paths.map(path => {
                        const evaluation = lens.evaluations.find(e => e.path_id === path.id);
                        return evaluation?.score || 0;
                      })
                    }))}
                    pathNames={room.approach.paths.map(p => p.name)}
                    maxValue={5}
                    size="md"
                    showGrid={true}
                    showValues={false}
                  />
                </div>
                <div className="mt-4 p-4 bg-white rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-700 mb-2">评估说明</h4>
                  <p className="text-sm text-gray-600">
                    通过 {room.approach.magic_lenses.length} 个评估维度对 {room.approach.paths.length} 个执行路径进行了全面评估。
                    雷达图展示了各路径在不同维度上的表现，面积越大表示综合评分越高。
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Key Insights */}
          <div className="section">
            <h2 className="section-title flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-600" />
              关键洞察
            </h2>
            {isEditing ? (
              <div className="space-y-2">
                {reportData.keyInsights.map((insight, index) => (
                  <Input
                    key={index}
                    value={insight}
                    onChange={(e) => {
                      const newInsights = [...reportData.keyInsights];
                      newInsights[index] = e.target.value;
                      setReportData(prev => ({ ...prev, keyInsights: newInsights }));
                    }}
                  />
                ))}
              </div>
            ) : (
              <ul className="list">
                {reportData.keyInsights.map((insight, index) => (
                  <li key={index} className="text-amber-800">{insight}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Recommendations */}
          <div className="section">
            <h2 className="section-title flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              建议
            </h2>
            {isEditing ? (
              <div className="space-y-2">
                {reportData.recommendations.map((rec, index) => (
                  <Input
                    key={index}
                    value={rec}
                    onChange={(e) => {
                      const newRecs = [...reportData.recommendations];
                      newRecs[index] = e.target.value;
                      setReportData(prev => ({ ...prev, recommendations: newRecs }));
                    }}
                  />
                ))}
              </div>
            ) : (
              <ul className="list">
                {reportData.recommendations.map((rec, index) => (
                  <li key={index} className="text-indigo-800">{rec}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Next Steps */}
          <div className="section">
            <h2 className="section-title flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-teal-600" />
              下一步行动
            </h2>
            {isEditing ? (
              <div className="space-y-2">
                {reportData.nextSteps.map((step, index) => (
                  <Input
                    key={index}
                    value={step}
                    onChange={(e) => {
                      const newSteps = [...reportData.nextSteps];
                      newSteps[index] = e.target.value;
                      setReportData(prev => ({ ...prev, nextSteps: newSteps }));
                    }}
                  />
                ))}
              </div>
            ) : (
              <ul className="list">
                {reportData.nextSteps.map((step, index) => (
                  <li key={index} className="text-teal-800">{step}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          <div className="footer mt-16 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
            <p>Foundation Sprint 报告 • 生成于 {new Date().toLocaleString('zh-CN')}</p>
            <p className="mt-2">此报告基于 Google Ventures 设计冲刺方法论生成</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};