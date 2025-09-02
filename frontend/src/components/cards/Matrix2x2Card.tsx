import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Move } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductPosition {
  name: string;
  x: number; // 0-100
  y: number; // 0-100
  isUs: boolean;
}

interface Matrix2x2Props {
  title?: string;
  xAxis: string;
  yAxis: string;
  products: ProductPosition[];
  onProductMove?: (productIndex: number, x: number, y: number) => void;
  onAxisChange?: (axis: 'x' | 'y', label: string) => void;
  readOnly?: boolean;
  className?: string;
}

export const Matrix2x2Card: React.FC<Matrix2x2Props> = ({
  title = '2x2 差异化矩阵',
  xAxis,
  yAxis,
  products,
  onProductMove,
  onAxisChange,
  readOnly = false,
  className,
}) => {
  const [draggedProduct, setDraggedProduct] = useState<number | null>(null);
  const [editingAxis, setEditingAxis] = useState<'x' | 'y' | null>(null);
  const [tempAxisLabel, setTempAxisLabel] = useState('');

  const handleMouseDown = (productIndex: number) => {
    if (readOnly) return;
    setDraggedProduct(productIndex);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggedProduct === null || readOnly) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((rect.bottom - e.clientY) / rect.height) * 100; // 翻转Y轴

    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    onProductMove?.(draggedProduct, clampedX, clampedY);
  };

  const handleMouseUp = () => {
    setDraggedProduct(null);
  };

  const startEditAxis = (axis: 'x' | 'y') => {
    if (readOnly) return;
    setEditingAxis(axis);
    setTempAxisLabel(axis === 'x' ? xAxis : yAxis);
  };

  const saveAxisLabel = () => {
    if (editingAxis && tempAxisLabel.trim()) {
      onAxisChange?.(editingAxis, tempAxisLabel.trim());
    }
    setEditingAxis(null);
    setTempAxisLabel('');
  };

  const getQuadrantColor = (x: number, y: number) => {
    if (x > 50 && y > 50) return 'bg-green-100 border-green-200'; // 胜利象限
    if (x > 50 && y <= 50) return 'bg-yellow-100 border-yellow-200';
    if (x <= 50 && y > 50) return 'bg-blue-100 border-blue-200';
    return 'bg-gray-100 border-gray-200'; // 失败者村
  };

  return (
    <Card className={cn(
      'transition-all duration-200 hover:shadow-card-hover',
      'border-purple-200 bg-purple-50',
      className
    )}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg text-purple-800">
          <Target className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 矩阵容器 */}
        <div className="relative">
          {/* Y轴标签 */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 -translate-x-8">
            {editingAxis === 'y' ? (
              <input
                value={tempAxisLabel}
                onChange={(e) => setTempAxisLabel(e.target.value)}
                onBlur={saveAxisLabel}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveAxisLabel();
                  if (e.key === 'Escape') setEditingAxis(null);
                }}
                className="text-sm font-medium text-center bg-transparent border-b border-purple-300 outline-none w-20"
                autoFocus
              />
            ) : (
              <span
                className={cn(
                  'text-sm font-medium text-purple-700 whitespace-nowrap',
                  !readOnly && 'cursor-pointer hover:text-purple-900'
                )}
                onClick={() => startEditAxis('y')}
              >
                {yAxis}
              </span>
            )}
          </div>

          {/* 矩阵区域 */}
          <div
            className="relative w-80 h-80 border-2 border-purple-300 bg-white mx-8"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* 象限分割线 */}
            <div className="absolute inset-0">
              <div className="absolute top-1/2 left-0 w-full h-px bg-purple-200 -translate-y-px" />
              <div className="absolute left-1/2 top-0 h-full w-px bg-purple-200 -translate-x-px" />
            </div>

            {/* 象限标签 */}
            <div className="absolute top-2 right-2 text-xs font-medium text-green-600">
              胜利象限
            </div>
            <div className="absolute bottom-2 left-2 text-xs font-medium text-gray-500">
              失败者村
            </div>

            {/* 产品位置点 */}
            {products.map((product, index) => (
              <div
                key={index}
                className={cn(
                  'absolute w-3 h-3 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all',
                  product.isUs
                    ? 'bg-purple-600 ring-2 ring-purple-300 scale-125'
                    : 'bg-gray-500 hover:bg-gray-600',
                  draggedProduct === index && 'scale-150 ring-4 ring-purple-200'
                )}
                style={{
                  left: `${product.x}%`,
                  bottom: `${product.y}%`, // 使用bottom而不是top来翻转Y轴
                }}
                onMouseDown={() => handleMouseDown(index)}
                title={product.name}
              >
                {/* 产品名称标签 */}
                <div className={cn(
                  'absolute top-4 left-1/2 transform -translate-x-1/2',
                  'text-xs font-medium whitespace-nowrap',
                  'bg-white px-2 py-1 rounded shadow-sm border',
                  product.isUs ? 'text-purple-800 border-purple-200' : 'text-gray-700 border-gray-200'
                )}>
                  {product.name}
                  {product.isUs && (
                    <span className="ml-1 text-purple-600">★</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* X轴标签 */}
          <div className="flex justify-center mt-2">
            {editingAxis === 'x' ? (
              <input
                value={tempAxisLabel}
                onChange={(e) => setTempAxisLabel(e.target.value)}
                onBlur={saveAxisLabel}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveAxisLabel();
                  if (e.key === 'Escape') setEditingAxis(null);
                }}
                className="text-sm font-medium text-center bg-transparent border-b border-purple-300 outline-none w-32"
                autoFocus
              />
            ) : (
              <span
                className={cn(
                  'text-sm font-medium text-purple-700',
                  !readOnly && 'cursor-pointer hover:text-purple-900'
                )}
                onClick={() => startEditAxis('x')}
              >
                {xAxis}
              </span>
            )}
          </div>
        </div>

        {/* 说明文字 */}
        <div className="text-xs text-gray-600 space-y-1">
          <p className="flex items-center gap-1">
            <Move className="h-3 w-3" />
            拖拽产品点来调整位置，目标是让我们的产品（★）独占右上角的"胜利象限"
          </p>
          {!readOnly && (
            <p>点击坐标轴标签可以编辑差异化维度</p>
          )}
        </div>

        {/* 产品列表 */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-purple-800">产品对比</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {products.map((product, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-center gap-2 p-2 rounded border',
                  product.isUs
                    ? 'bg-purple-100 border-purple-200'
                    : 'bg-gray-50 border-gray-200'
                )}
              >
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  product.isUs ? 'bg-purple-600' : 'bg-gray-500'
                )} />
                <span className="font-medium">{product.name}</span>
                {product.isUs && <span className="text-purple-600">★</span>}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};