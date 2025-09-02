import React from 'react';
import { cn } from '@/lib/utils';

interface RadarData {
  label: string;
  values: number[]; // 每个路径的分数
}

interface RadarChartProps {
  data: RadarData[];
  pathNames: string[];
  maxValue?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showGrid?: boolean;
  showValues?: boolean;
}

export const RadarChart: React.FC<RadarChartProps> = ({
  data,
  pathNames,
  maxValue = 5,
  className,
  size = 'md',
  showGrid = true,
  showValues = true,
}) => {
  const sizeMap = {
    sm: { width: 300, height: 300, radius: 100 },
    md: { width: 400, height: 400, radius: 140 },
    lg: { width: 500, height: 500, radius: 180 },
  };

  const dimensions = sizeMap[size];
  const { width, height, radius } = dimensions;
  const centerX = width / 2;
  const centerY = height / 2;

  // 计算角度
  const angleStep = (2 * Math.PI) / data.length;

  // 获取点的坐标
  const getPoint = (value: number, index: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / maxValue) * radius;
    return {
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle),
    };
  };

  // 生成多边形路径
  const generatePath = (values: number[]) => {
    return values
      .map((value, index) => {
        const point = getPoint(value, index);
        return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
      })
      .join(' ') + ' Z';
  };

  // 路径颜色
  const pathColors = [
    '#3b82f6', // 蓝色
    '#10b981', // 绿色
    '#f59e0b', // 黄色
    '#ef4444', // 红色
    '#8b5cf6', // 紫色
  ];

  return (
    <div className={cn('relative', className)}>
      <svg width={width} height={height} className="bg-white rounded-lg">
        {/* 网格线 */}
        {showGrid && (
          <g className="opacity-30">
            {[1, 2, 3, 4, 5].map((level) => (
              <polygon
                key={level}
                points={data
                  .map((_, index) => {
                    const point = getPoint((level / 5) * maxValue, index);
                    return `${point.x},${point.y}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="#6b7280"
                strokeWidth="1"
              />
            ))}
          </g>
        )}

        {/* 轴线 */}
        {data.map((_, index) => {
          const endPoint = getPoint(maxValue, index);
          return (
            <line
              key={index}
              x1={centerX}
              y1={centerY}
              x2={endPoint.x}
              y2={endPoint.y}
              stroke="#9ca3af"
              strokeWidth="1"
              opacity="0.5"
            />
          );
        })}

        {/* 数据区域 */}
        {pathNames.map((pathName, pathIndex) => {
          const values = data.map(d => d.values[pathIndex] || 0);
          return (
            <g key={pathIndex}>
              <path
                d={generatePath(values)}
                fill={pathColors[pathIndex % pathColors.length]}
                fillOpacity="0.2"
                stroke={pathColors[pathIndex % pathColors.length]}
                strokeWidth="2"
              />
              
              {/* 数据点 */}
              {values.map((value, index) => {
                const point = getPoint(value, index);
                return (
                  <g key={index}>
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="4"
                      fill={pathColors[pathIndex % pathColors.length]}
                      stroke="white"
                      strokeWidth="2"
                    />
                    {showValues && (
                      <text
                        x={point.x}
                        y={point.y - 8}
                        textAnchor="middle"
                        className="text-xs font-medium fill-gray-700"
                      >
                        {value.toFixed(1)}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* 标签 */}
        {data.map((item, index) => {
          const labelPoint = getPoint(maxValue + 20, index);
          const angle = index * angleStep - Math.PI / 2;
          const textAnchor = 
            Math.abs(Math.cos(angle)) < 0.01 ? 'middle' :
            Math.cos(angle) > 0 ? 'start' : 'end';
          
          return (
            <text
              key={index}
              x={labelPoint.x}
              y={labelPoint.y}
              textAnchor={textAnchor}
              dominantBaseline="middle"
              className="text-sm font-medium fill-gray-700"
            >
              {item.label}
            </text>
          );
        })}

        {/* 图例 */}
        <g transform={`translate(20, ${height - 30 * pathNames.length - 10})`}>
          {pathNames.map((name, index) => (
            <g key={index} transform={`translate(0, ${index * 25})`}>
              <rect
                x={0}
                y={0}
                width={15}
                height={15}
                fill={pathColors[index % pathColors.length]}
                fillOpacity="0.3"
                stroke={pathColors[index % pathColors.length]}
                strokeWidth="2"
              />
              <text x={20} y={12} className="text-xs fill-gray-600">
                {name}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
};