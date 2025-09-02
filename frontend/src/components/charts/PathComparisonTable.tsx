import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, AlertCircle, TrendingUp } from 'lucide-react';
import type { Path, MagicLens } from '@/lib/api/types';

interface PathComparisonTableProps {
  paths: Path[];
  magicLenses: MagicLens[];
  selectedPathId: string;
  className?: string;
}

export const PathComparisonTable: React.FC<PathComparisonTableProps> = ({
  paths,
  magicLenses,
  selectedPathId,
  className,
}) => {
  // 计算每个路径的综合评分
  const getPathScore = (pathId: string) => {
    let totalScore = 0;
    let count = 0;
    
    magicLenses.forEach(lens => {
      const evaluation = lens.evaluations.find(e => e.path_id === pathId);
      if (evaluation) {
        totalScore += evaluation.score;
        count++;
      }
    });
    
    return count > 0 ? (totalScore / count).toFixed(1) : '-';
  };

  // 获取评分颜色
  const getScoreColor = (score: string) => {
    const numScore = parseFloat(score);
    if (isNaN(numScore)) return 'text-gray-500';
    if (numScore >= 4) return 'text-green-600';
    if (numScore >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  // 获取评分图标
  const getScoreIcon = (score: string) => {
    const numScore = parseFloat(score);
    if (isNaN(numScore)) return <AlertCircle className="h-4 w-4 text-gray-400" />;
    if (numScore >= 4) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (numScore >= 3) return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">
              执行路径
            </th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 border-b">
              综合评分
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">
              优势
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">
              劣势
            </th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 border-b">
              状态
            </th>
          </tr>
        </thead>
        <tbody>
          {paths.map((path, index) => {
            const score = getPathScore(path.id);
            const isSelected = path.id === selectedPathId;
            
            return (
              <tr
                key={path.id}
                className={cn(
                  'border-b transition-colors',
                  isSelected ? 'bg-blue-50' : 'hover:bg-gray-50',
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                )}
              >
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className={cn(
                      'font-medium text-sm',
                      isSelected ? 'text-blue-700' : 'text-gray-900'
                    )}>
                      {path.name}
                      {isSelected && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          已选定
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      {path.description}
                    </span>
                  </div>
                </td>
                
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {getScoreIcon(score)}
                    <span className={cn('text-lg font-semibold', getScoreColor(score))}>
                      {score}
                    </span>
                    <span className="text-xs text-gray-500">/5</span>
                  </div>
                </td>
                
                <td className="px-4 py-3">
                  <ul className="space-y-1">
                    {path.pros.slice(0, 3).map((pro, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-gray-700">{pro}</span>
                      </li>
                    ))}
                    {path.pros.length > 3 && (
                      <li className="text-xs text-gray-500 ml-4">
                        +{path.pros.length - 3} 更多...
                      </li>
                    )}
                  </ul>
                </td>
                
                <td className="px-4 py-3">
                  <ul className="space-y-1">
                    {path.cons.slice(0, 3).map((con, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <XCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-gray-700">{con}</span>
                      </li>
                    ))}
                    {path.cons.length > 3 && (
                      <li className="text-xs text-gray-500 ml-4">
                        +{path.cons.length - 3} 更多...
                      </li>
                    )}
                  </ul>
                </td>
                
                <td className="px-4 py-3 text-center">
                  {isSelected ? (
                    <div className="flex flex-col items-center">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <span className="text-xs text-green-600 font-medium mt-1">
                        执行中
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <AlertCircle className="h-5 w-5 text-gray-400" />
                      <span className="text-xs text-gray-500 mt-1">
                        备选
                      </span>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {/* 评分详情 */}
      {magicLenses.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">评估维度详情</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {magicLenses.map((lens) => (
              <div key={lens.name} className="text-xs">
                <span className="font-medium text-gray-600">{lens.name}:</span>
                <div className="mt-1 space-y-0.5">
                  {paths.map((path) => {
                    const evaluation = lens.evaluations.find(e => e.path_id === path.id);
                    return (
                      <div key={path.id} className="flex justify-between">
                        <span className="text-gray-500">{path.name.substring(0, 10)}...</span>
                        <span className={cn('font-medium', getScoreColor(evaluation?.score.toString() || '-'))}>
                          {evaluation?.score || '-'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};