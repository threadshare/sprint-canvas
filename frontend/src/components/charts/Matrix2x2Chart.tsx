import React from 'react';
import { cn } from '@/lib/utils';

interface ProductPosition {
  name: string;
  x: number;
  y: number;
  is_us: boolean;
}

interface Matrix2x2ChartProps {
  xAxis: string;
  yAxis: string;
  products: ProductPosition[];
  winningQuadrant: string;
  className?: string;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Matrix2x2Chart: React.FC<Matrix2x2ChartProps> = ({
  xAxis,
  yAxis,
  products,
  winningQuadrant,
  className,
  showLabels = true,
  size = 'md',
}) => {
  const sizeMap = {
    sm: { width: 300, height: 300, padding: 40 },
    md: { width: 400, height: 400, padding: 50 },
    lg: { width: 500, height: 500, padding: 60 },
  };

  const dimensions = sizeMap[size];
  const { width, height, padding } = dimensions;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // 转换坐标到 SVG 坐标系
  const transformX = (x: number) => padding + (x / 100) * chartWidth;
  const transformY = (y: number) => padding + (1 - y / 100) * chartHeight;

  // 获取象限颜色
  const getQuadrantColor = (quadrant: string) => {
    const colors = {
      'top-right': winningQuadrant === 'top-right' ? '#dcfce7' : '#f3f4f6',
      'top-left': winningQuadrant === 'top-left' ? '#dcfce7' : '#f3f4f6',
      'bottom-right': winningQuadrant === 'bottom-right' ? '#dcfce7' : '#f3f4f6',
      'bottom-left': winningQuadrant === 'bottom-left' ? '#dcfce7' : '#f3f4f6',
    };
    return colors[quadrant as keyof typeof colors] || '#f3f4f6';
  };

  // 统计各象限产品数量
  const getQuadrantStats = () => {
    const stats = {
      'top-right': products.filter(p => p.x > 50 && p.y > 50).length,
      'top-left': products.filter(p => p.x <= 50 && p.y > 50).length,
      'bottom-right': products.filter(p => p.x > 50 && p.y <= 50).length,
      'bottom-left': products.filter(p => p.x <= 50 && p.y <= 50).length,
    };
    return stats;
  };

  const quadrantStats = getQuadrantStats();

  return (
    <div className={cn('relative', className)}>
      <svg width={width} height={height} className="bg-white rounded-lg shadow-sm">
        {/* 象限背景 */}
        <rect
          x={padding}
          y={padding}
          width={chartWidth / 2}
          height={chartHeight / 2}
          fill={getQuadrantColor('top-left')}
          opacity="0.5"
        />
        <rect
          x={padding + chartWidth / 2}
          y={padding}
          width={chartWidth / 2}
          height={chartHeight / 2}
          fill={getQuadrantColor('top-right')}
          opacity="0.5"
        />
        <rect
          x={padding}
          y={padding + chartHeight / 2}
          width={chartWidth / 2}
          height={chartHeight / 2}
          fill={getQuadrantColor('bottom-left')}
          opacity="0.5"
        />
        <rect
          x={padding + chartWidth / 2}
          y={padding + chartHeight / 2}
          width={chartWidth / 2}
          height={chartHeight / 2}
          fill={getQuadrantColor('bottom-right')}
          opacity="0.5"
        />

        {/* 坐标轴 */}
        <line
          x1={padding}
          y1={padding + chartHeight / 2}
          x2={padding + chartWidth}
          y2={padding + chartHeight / 2}
          stroke="#6b7280"
          strokeWidth="2"
        />
        <line
          x1={padding + chartWidth / 2}
          y1={padding}
          x2={padding + chartWidth / 2}
          y2={padding + chartHeight}
          stroke="#6b7280"
          strokeWidth="2"
        />

        {/* 坐标轴标签 */}
        <text
          x={padding + chartWidth}
          y={padding + chartHeight / 2 - 10}
          textAnchor="end"
          className="text-sm font-medium fill-gray-700"
        >
          {xAxis} 高
        </text>
        <text
          x={padding}
          y={padding + chartHeight / 2 - 10}
          textAnchor="start"
          className="text-sm font-medium fill-gray-700"
        >
          {xAxis} 低
        </text>
        <text
          x={padding + chartWidth / 2 + 10}
          y={padding}
          textAnchor="start"
          className="text-sm font-medium fill-gray-700"
        >
          {yAxis} 高
        </text>
        <text
          x={padding + chartWidth / 2 + 10}
          y={padding + chartHeight}
          textAnchor="start"
          className="text-sm font-medium fill-gray-700"
        >
          {yAxis} 低
        </text>

        {/* 象限标注 */}
        {showLabels && (
          <>
            <text
              x={padding + chartWidth / 4}
              y={padding + 20}
              textAnchor="middle"
              className="text-xs fill-gray-500"
            >
              左上 ({quadrantStats['top-left']}个)
            </text>
            <text
              x={padding + (chartWidth * 3) / 4}
              y={padding + 20}
              textAnchor="middle"
              className="text-xs fill-gray-500"
            >
              右上 ({quadrantStats['top-right']}个)
              {winningQuadrant === 'top-right' && ' ⭐'}
            </text>
            <text
              x={padding + chartWidth / 4}
              y={padding + chartHeight - 10}
              textAnchor="middle"
              className="text-xs fill-gray-500"
            >
              左下 ({quadrantStats['bottom-left']}个)
            </text>
            <text
              x={padding + (chartWidth * 3) / 4}
              y={padding + chartHeight - 10}
              textAnchor="middle"
              className="text-xs fill-gray-500"
            >
              右下 ({quadrantStats['bottom-right']}个)
              {winningQuadrant === 'bottom-right' && ' ⭐'}
            </text>
          </>
        )}

        {/* 产品点 */}
        {products.map((product, index) => {
          const x = transformX(product.x);
          const y = transformY(product.y);
          
          return (
            <g key={index}>
              <circle
                cx={x}
                cy={y}
                r={product.is_us ? 10 : 8}
                fill={product.is_us ? '#3b82f6' : '#ef4444'}
                opacity={product.is_us ? 1 : 0.7}
                stroke="white"
                strokeWidth="2"
              />
              {showLabels && (
                <text
                  x={x}
                  y={y - 15}
                  textAnchor="middle"
                  className={cn(
                    'text-xs font-medium',
                    product.is_us ? 'fill-blue-700' : 'fill-red-700'
                  )}
                >
                  {product.name}
                </text>
              )}
            </g>
          );
        })}

        {/* 图例 */}
        <g transform={`translate(${padding}, ${height - 25})`}>
          <circle cx={0} cy={0} r={6} fill="#3b82f6" />
          <text x={12} y={4} className="text-xs fill-gray-600">
            我们的产品
          </text>
          <circle cx={100} cy={0} r={6} fill="#ef4444" opacity="0.7" />
          <text x={112} y={4} className="text-xs fill-gray-600">
            竞争对手
          </text>
        </g>
      </svg>
    </div>
  );
};