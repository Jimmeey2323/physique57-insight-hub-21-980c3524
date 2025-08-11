
import React, { memo, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { designTokens } from '@/utils/designTokens';
import { cn } from '@/lib/utils';

interface ModernDataTableProps<T> {
  data: T[];
  columns: Array<{
    key: keyof T;
    header: string;
    render?: (value: any, item: T) => React.ReactNode;
    className?: string;
    align?: 'left' | 'center' | 'right';
    width?: string;
  }>;
  title?: string;
  loading?: boolean;
  maxHeight?: string;
  stickyHeader?: boolean;
  onRowClick?: (item: T) => void;
  showFooter?: boolean;
  footerData?: any;
  className?: string;
}

function ModernDataTableComponent<T extends Record<string, any>>({
  data,
  columns,
  title,
  loading = false,
  maxHeight = "600px",
  stickyHeader = true,
  onRowClick,
  showFooter = false,
  footerData,
  className
}: ModernDataTableProps<T>) {
  const formatCellValue = (value: any, column: any, item: T) => {
    if (column.render) {
      return column.render(value, item);
    }
    
    if (typeof value === 'number') {
      if (value > 1000000) {
        return (value / 1000000).toFixed(1) + 'M';
      } else if (value > 1000) {
        return (value / 1000).toFixed(1) + 'K';
      }
      return value.toLocaleString();
    }
    
    if (typeof value === 'string' && value.includes('%')) {
      const numValue = parseFloat(value.replace('%', ''));
      const colorClass = numValue > 0 ? 'text-green-600 bg-green-50' : numValue < 0 ? 'text-red-600 bg-red-50' : 'text-slate-600 bg-slate-50';
      return (
        <Badge variant="secondary" className={cn('font-medium text-xs px-2 py-1', colorClass)}>
          {value}
        </Badge>
      );
    }
    
    return value || '-';
  };

  const getCellAlignment = (align?: string) => {
    switch (align) {
      case 'center': return 'text-center justify-center';
      case 'right': return 'text-right justify-end';
      default: return 'text-left justify-start';
    }
  };

  if (loading) {
    return (
      <Card className={cn(designTokens.card.background, designTokens.card.shadow, designTokens.card.radius, className)}>
        {title && (
          <div className="p-6 border-b border-slate-100">
            <Skeleton className="h-6 w-48" />
          </div>
        )}
        <div className="p-6 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn(
      designTokens.card.background,
      designTokens.card.shadow,
      designTokens.card.border,
      designTokens.card.radius,
      'overflow-hidden',
      className
    )}>
      {title && (
        <div className="px-6 py-4 border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-white">
          <h3 className={cn(designTokens.typography.h4, 'text-slate-900')}>{title}</h3>
        </div>
      )}
      
      <div 
        className="overflow-auto"
        style={{ maxHeight }}
      >
        <Table>
          <TableHeader className={cn(
            stickyHeader && "sticky top-0 z-20",
            designTokens.table.header
          )}>
            <TableRow className="border-b-2 border-slate-200 hover:bg-transparent">
              {columns.map((column) => (
                <TableHead 
                  key={String(column.key)} 
                  className={cn(
                    designTokens.table.headerText,
                    'py-4 px-4 font-bold',
                    getCellAlignment(column.align),
                    column.width && `w-[${column.width}]`
                  )}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow 
                key={index} 
                className={cn(
                  designTokens.table.row,
                  'cursor-pointer group border-b border-slate-100 h-[25px]',
                  onRowClick && 'hover:bg-blue-50/50'
                )}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <TableCell 
                    key={String(column.key)} 
                    className={cn(
                      designTokens.table.cell,
                      designTokens.table.maxHeight,
                      getCellAlignment(column.align),
                      'group-hover:text-slate-900 transition-colors',
                      column.className
                    )}
                  >
                    <div className="flex items-center h-full">
                      {formatCellValue(item[column.key], column, item)}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
          {showFooter && footerData && (
            <tfoot className="sticky bottom-0 z-20">
              <TableRow className="bg-slate-900 text-white border-t-4 border-blue-600 hover:bg-slate-900 h-[30px]">
                {columns.map((column) => (
                  <TableCell 
                    key={String(column.key)}
                    className={cn(
                      'py-3 px-4 font-bold text-sm',
                      getCellAlignment(column.align)
                    )}
                  >
                    <div className="flex items-center h-full text-white">
                      {formatCellValue(footerData[column.key], column, footerData)}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            </tfoot>
          )}
        </Table>
      </div>
    </Card>
  );
}

export const ModernDataTable = memo(ModernDataTableComponent) as <T extends Record<string, any>>(
  props: ModernDataTableProps<T>
) => JSX.Element;
