import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { FoundationSprintReport } from './FoundationSprintReport';
import type { Room } from '@/lib/api/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Download,
  FileText,
  Share2,
  Mail,
  ChevronDown,
  FileImage,
} from 'lucide-react';

interface ExportButtonProps {
  room: Room;
  participants: Array<{ id: string; name: string; online: boolean }>;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  room,
  participants,
  className,
  variant = 'default',
  size = 'default',
}) => {
  const { t } = useLanguage();
  const [showReport, setShowReport] = useState(false);

  const handleExportJSON = () => {
    const exportData = {
      room,
      participants: participants.filter(p => p.online),
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${room.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_foundation_sprint.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleExportMarkdown = () => {
    const markdownContent = generateMarkdownReport();
    const dataUri = 'data:text/markdown;charset=utf-8,' + encodeURIComponent(markdownContent);
    
    const exportFileDefaultName = `${room.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_foundation_sprint.md`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleShareByEmail = () => {
    const subject = encodeURIComponent(`${room.name} - Foundation Sprint ${t('export.results')}`);
    const body = encodeURIComponent(generateEmailContent());
    const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
    window.open(mailtoLink);
  };

  const generateMarkdownReport = () => {
    // 计算各象限产品分布
    const getQuadrantDistribution = () => {
      const products = room.differentiation.matrix.products || [];
      return {
        'top-right': products.filter(p => p.x > 50 && p.y > 50),
        'top-left': products.filter(p => p.x <= 50 && p.y > 50),
        'bottom-right': products.filter(p => p.x > 50 && p.y <= 50),
        'bottom-left': products.filter(p => p.x <= 50 && p.y <= 50),
      };
    };

    // 计算路径综合评分
    const getPathScores = () => {
      return room.approach.paths.map(path => {
        let totalScore = 0;
        let count = 0;
        room.approach.magic_lenses.forEach(lens => {
          const evaluation = lens.evaluations.find(e => e.path_id === path.id);
          if (evaluation) {
            totalScore += evaluation.score;
            count++;
          }
        });
        return {
          ...path,
          avgScore: count > 0 ? (totalScore / count).toFixed(1) : 'N/A'
        };
      }).sort((a, b) => parseFloat(b.avgScore) - parseFloat(a.avgScore));
    };

    const quadrantDist = getQuadrantDistribution();
    const pathScores = getPathScores();

    return `# ${room.name} - Foundation Sprint ${t('export.report')}

> **${t('export.status')}**: ${getStatusText(room.status)} | **${t('export.participants')}**: ${participants.length} ${t('export.people')} | **${t('export.generatedAt')}**: ${new Date().toLocaleString('zh-CN')}

## 🎯 ${t('export.executiveSummary')}

${t('export.executiveSummaryContent')}

### ${t('export.keyData')}
- ${t('export.identifiedCustomers').replace('{{count}}', String(room.foundation.customers.length))}
- ${t('export.discoveredProblems').replace('{{count}}', String(room.foundation.problems.length))}
- ${t('export.analyzedCompetitors').replace('{{count}}', String(room.foundation.competition.length))}
- ${t('export.identifiedAdvantages').replace('{{count}}', String(room.foundation.advantages.length))}
- ${t('export.evaluatedPaths').replace('{{count}}', String(room.approach.paths.length))}
- ${t('export.appliedDimensions').replace('{{count}}', String(room.approach.magic_lenses.length))}

## 👥 ${t('foundation.title')} (Foundation)

### ${t('foundation.customers')}
${room.foundation.customers.map(c => `- ${c}`).join('\n') || `- *${t('export.toBeCompleted')}*`}

### ${t('foundation.problems')}
${room.foundation.problems.map(p => `- ${p}`).join('\n') || `- *${t('export.toBeCompleted')}*`}

### ${t('foundation.competition')}
${room.foundation.competition.map(c => `- ${c}`).join('\n') || `- *${t('export.toBeCompleted')}*`}

### ${t('foundation.advantages')}
${room.foundation.advantages.map(a => `- ${a}`).join('\n') || `- *${t('export.toBeCompleted')}*`}

## 🎨 ${t('differentiation.title')} (Differentiation)

### ${t('differentiation.principles')}
${room.differentiation.principles.map(p => `- **${p}**`).join('\n') || `- *${t('export.toBeDefined')}*`}

### 2x2 ${t('differentiation.matrix')}

#### ${t('export.matrixSettings')}
- **${t('export.xAxis')}**: ${room.differentiation.matrix.x_axis || `*${t('export.toBeDefined')}*`}
- **${t('export.yAxis')}**: ${room.differentiation.matrix.y_axis || `*${t('export.toBeDefined')}*`}
- **${t('differentiation.winningQuadrant')}**: ${room.differentiation.matrix.winning_quadrant || `*${t('export.toBeConfirmed')}*`}

#### 产品分布分析

| 象限 | 产品数量 | 产品列表 | 分析 |
|------|----------|----------|------|
| 右上 (高${room.differentiation.matrix.x_axis}/高${room.differentiation.matrix.y_axis}) | ${quadrantDist['top-right'].length} | ${quadrantDist['top-right'].map(p => p.name).join(', ') || '无'} | ${room.differentiation.matrix.winning_quadrant === 'top-right' ? '**目标象限** ⭐' : '竞争激烈'} |
| 左上 (低${room.differentiation.matrix.x_axis}/高${room.differentiation.matrix.y_axis}) | ${quadrantDist['top-left'].length} | ${quadrantDist['top-left'].map(p => p.name).join(', ') || '无'} | ${room.differentiation.matrix.winning_quadrant === 'top-left' ? '**目标象限** ⭐' : '潜在机会'} |
| 右下 (高${room.differentiation.matrix.x_axis}/低${room.differentiation.matrix.y_axis}) | ${quadrantDist['bottom-right'].length} | ${quadrantDist['bottom-right'].map(p => p.name).join(', ') || '无'} | ${room.differentiation.matrix.winning_quadrant === 'bottom-right' ? '**目标象限** ⭐' : '需要权衡'} |
| 左下 (低${room.differentiation.matrix.x_axis}/低${room.differentiation.matrix.y_axis}) | ${quadrantDist['bottom-left'].length} | ${quadrantDist['bottom-left'].map(p => p.name).join(', ') || '无'} | ${room.differentiation.matrix.winning_quadrant === 'bottom-left' ? '**目标象限** ⭐' : '避免进入'} |

## 🚀 方法阶段 (Approach)

### 执行路径全面对比

| 路径 | 综合评分 | 状态 | 描述 |
|------|----------|------|------|
${pathScores.map(path => 
  `| **${path.name}** | ${path.avgScore}/5 | ${path.id === room.approach.selected_path ? '✅ 已选定' : '⚪ 备选'} | ${path.description} |`
).join('\n')}

### 详细路径分析

${pathScores.map((path, index) => 
  `#### ${index + 1}. ${path.name} ${path.id === room.approach.selected_path ? '✅' : ''}

**描述**: ${path.description}

**优势**:
${path.pros.map(pro => `- ✓ ${pro}`).join('\n') || '- 待评估'}

**挑战**:
${path.cons.map(con => `- ✗ ${con}`).join('\n') || '- 待评估'}

**综合评分**: ${path.avgScore}/5
`
).join('\n')}

### 决策理由
${room.approach.reasoning || '*待完善*'}

## 📊 Magic Lenses 评估详情

### 评估矩阵

| 评估维度 | ${room.approach.paths.map(p => p.name).join(' | ')} |
|----------|${room.approach.paths.map(() => '------').join('|')}|
${room.approach.magic_lenses.map(lens => {
  const scores = room.approach.paths.map(path => {
    const evaluation = lens.evaluations.find(e => e.path_id === path.id);
    return evaluation ? `${evaluation.score}/5` : 'N/A';
  });
  return `| **${lens.name}** | ${scores.join(' | ')} |`;
}).join('\n')}

### 详细评估说明

${room.approach.magic_lenses.map((lens) => 
  `#### ${lens.name}

**评估视角**: ${lens.description}

**评分详情**:
${lens.evaluations.map(evaluation => {
  const pathName = room.approach.paths.find(p => p.id === evaluation.path_id)?.name || '未知路径';
  return `- **${pathName}**: ${evaluation.score}/5
  ${evaluation.notes ? `  - 说明: ${evaluation.notes}` : ''}`;
}).join('\n')}
`
).join('\n\n')}

## 📈 共识度分析

### 团队一致性
- 参与人数: ${participants.length} 人
- 在线参与: ${participants.filter(p => p.online).length} 人
- 决策参与度: ${((participants.filter(p => p.online).length / participants.length) * 100).toFixed(0)}%

### 关键共识点
1. **目标客户**: 团队对目标客户群体达成共识
2. **核心问题**: 明确了需要解决的关键问题
3. **差异化策略**: 确定了独特的市场定位
4. **执行路径**: 选定了最优的实施方案

## 🎯 下一步行动计划

### 立即行动 (1-2周)
1. **完善产品定义**: 基于选定路径，细化产品功能规格
2. **组建核心团队**: 根据执行需求，配置关键岗位人员
3. **制定MVP计划**: 确定最小可行产品的范围和时间表

### 短期目标 (1个月)
1. **启动 Design Sprint**: 进行用户体验设计和原型验证
2. **技术架构设计**: 完成技术选型和架构设计
3. **用户访谈**: 与5-10个目标客户进行深度访谈

### 中期目标 (3个月)
1. **MVP开发**: 完成核心功能开发
2. **内测反馈**: 收集早期用户反馈并迭代
3. **市场准备**: 制定上市策略和营销计划

## 💡 风险与机会

### 主要风险
- 技术实现复杂度可能超出预期
- 市场接受度需要验证
- 竞争对手可能快速跟进

### 关键机会
- 差异化定位清晰，市场空间明确
- 团队优势与执行路径匹配度高
- 目标客户痛点明确，需求强烈

---

*本报告由 Foundation Sprint 工具生成 • ${new Date().toLocaleDateString('zh-CN')}*
*基于 Google Ventures 设计冲刺方法论*
`;
  };

  const generateEmailContent = () => {
    return `Hi，

我们刚刚完成了 ${room.name} 的 Foundation Sprint，想与你分享我们的成果：

🎯 目标客户: ${room.foundation.customers.slice(0, 2).join(', ')}${room.foundation.customers.length > 2 ? '...' : ''}

🔥 核心问题: ${room.foundation.problems.slice(0, 2).join(', ')}${room.foundation.problems.length > 2 ? '...' : ''}

✨ 差异化原则: ${room.differentiation.principles.slice(0, 2).join(', ')}${room.differentiation.principles.length > 2 ? '...' : ''}

🚀 选定路径: ${room.approach.paths.find(p => p.id === room.approach.selected_path)?.name || '待确定'}

想了解详细信息或参与后续讨论吗？让我们安排时间深入交流！

最佳，
${participants.find(p => p.online)?.name || '团队'}
`;
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      foundation: t('foundation.title'),
      differentiation: t('differentiation.title'), 
      approach: t('approach.title'),
      completed: t('stages.completed'),
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size={size} className={className}>
            <Download className="h-4 w-4 mr-2" />
            {t('export.title')}
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => setShowReport(true)}>
            <FileText className="h-4 w-4 mr-2" />
            {t('export.professionalReport')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportMarkdown}>
            <FileText className="h-4 w-4 mr-2" />
            {t('export.markdownDoc')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportJSON}>
            <FileImage className="h-4 w-4 mr-2" />
            {t('export.dataBackup')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleShareByEmail}>
            <Mail className="h-4 w-4 mr-2" />
            {t('export.shareByEmail')}
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `${room.name} - Foundation Sprint`,
                  text: t('export.shareText'),
                  url: window.location.href,
                });
              }
            }}
            disabled={!navigator.share}
          >
            <Share2 className="h-4 w-4 mr-2" />
            {t('export.systemShare')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <FoundationSprintReport
        room={room}
        participants={participants}
        isOpen={showReport}
        onClose={() => setShowReport(false)}
      />
    </>
  );
};