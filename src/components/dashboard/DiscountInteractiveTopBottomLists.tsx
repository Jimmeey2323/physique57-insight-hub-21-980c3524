
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Award, Target, Zap, User, Package, Users } from 'lucide-react';
import { SalesData } from '@/types/dashboard';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface DiscountInteractiveTopBottomListsProps {
  data: SalesData[];
  filters?: any;
}

export const DiscountInteractiveTopBottomLists: React.FC<DiscountInteractiveTopBottomListsProps> = ({
  data,
  filters
}) => {
  const [leftPanelView, setLeftPanelView] = useState<'products' | 'categories' | 'customers'>('products');
  const [rightPanelView, setRightPanelView] = useState<'staff' | 'locations' | 'payment-methods'>('staff');

  const { leftPanelData, rightPanelData } = useMemo(() => {
    // Apply filters
    let filteredData = data.filter(item => (item.discountAmount || 0) > 0);
    
    if (filters) {
      filteredData = filteredData.filter(item => {
        if (filters.location && item.calculatedLocation !== filters.location) return false;
        if (filters.category && item.cleanedCategory !== filters.category) return false;
        if (filters.product && item.cleanedProduct !== filters.product) return false;
        if (filters.soldBy && (item.soldBy === '-' ? 'Online/System' : item.soldBy) !== filters.soldBy) return false;
        if (filters.paymentMethod && item.paymentMethod !== filters.paymentMethod) return false;
        if (filters.minDiscountAmount && (item.discountAmount || 0) < filters.minDiscountAmount) return false;
        if (filters.maxDiscountAmount && (item.discountAmount || 0) > filters.maxDiscountAmount) return false;
        if (filters.minDiscountPercent && (item.grossDiscountPercent || 0) < filters.minDiscountPercent) return false;
        if (filters.maxDiscountPercent && (item.grossDiscountPercent || 0) > filters.maxDiscountPercent) return false;
        if (filters.dateRange?.from || filters.dateRange?.to) {
          const itemDate = new Date(item.paymentDate);
          if (filters.dateRange.from && itemDate < filters.dateRange.from) return false;
          if (filters.dateRange.to && itemDate > filters.dateRange.to) return false;
        }
        return true;
      });
    }

    // Process left panel data
    const processGroupedData = (groupKey: string, nameKey: string) => {
      const grouped = filteredData.reduce((acc, item) => {
        const key = item[groupKey as keyof SalesData] as string || 'Unknown';
        if (!acc[key]) {
          acc[key] = {
            name: key,
            totalDiscount: 0,
            transactions: 0,
            uniqueCustomers: new Set(),
            totalRevenue: 0,
            unitsSold: 0,
            avgDiscountPercent: 0,
            discountPercentages: []
          };
        }
        acc[key].totalDiscount += item.discountAmount || 0;
        acc[key].transactions += 1;
        acc[key].uniqueCustomers.add(item.customerEmail);
        acc[key].totalRevenue += item.paymentValue || 0;
        acc[key].unitsSold += 1; // Each transaction represents units sold
        acc[key].discountPercentages.push(item.grossDiscountPercent || 0);
        return acc;
      }, {} as Record<string, any>);

      return Object.values(grouped)
        .map((item: any) => ({
          ...item,
          uniqueCustomers: item.uniqueCustomers.size,
          avgDiscount: item.totalDiscount / item.transactions,
          discountRate: item.totalRevenue > 0 ? (item.totalDiscount / (item.totalRevenue + item.totalDiscount)) * 100 : 0,
          avgDiscountPercent: item.discountPercentages.reduce((sum: number, val: number) => sum + val, 0) / item.discountPercentages.length
        }))
        .sort((a, b) => b.totalDiscount - a.totalDiscount)
        .slice(0, 10);
    };

    let leftData = [];
    switch (leftPanelView) {
      case 'products':
        leftData = processGroupedData('cleanedProduct', 'Product');
        break;
      case 'categories':
        leftData = processGroupedData('cleanedCategory', 'Category');
        break;
      case 'customers':
        leftData = processGroupedData('customerName', 'Customer');
        break;
    }

    let rightData = [];
    switch (rightPanelView) {
      case 'staff':
        rightData = processGroupedData('soldBy', 'Staff');
        break;
      case 'locations':
        rightData = processGroupedData('calculatedLocation', 'Location');
        break;
      case 'payment-methods':
        rightData = processGroupedData('paymentMethod', 'Payment Method');
        break;
    }

    return { leftPanelData: leftData, rightPanelData: rightData };
  }, [data, filters, leftPanelView, rightPanelView]);

  const renderPanel = (data: any[], title: string, icon: React.ElementType, gradient: string) => (
    <Card className={cn("border-0 shadow-xl h-full", gradient)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          {React.createElement(icon, { className: "w-5 h-5" })}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {data.map((item: any, index: number) => (
            <div
              key={item.name}
              className="flex items-center justify-between p-3 bg-white/60 rounded-lg hover:bg-white/80 transition-all duration-300 hover:scale-102 cursor-pointer"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-slate-800 truncate">
                    {item.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-600 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {item.transactions} txns
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {item.unitsSold} units
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {item.uniqueCustomers} customers
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right space-y-1 flex-shrink-0">
                <div className="font-bold text-red-600 text-sm">
                  {formatCurrency(item.totalDiscount)}
                </div>
                <div className="text-xs text-slate-600">
                  {item.discountRate?.toFixed(1)}% rate
                </div>
                <div className="text-xs text-slate-500">
                  {item.avgDiscountPercent?.toFixed(1)}% avg
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Panel - 50% width */}
      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={leftPanelView === 'products' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLeftPanelView('products')}
            className="flex items-center gap-2"
          >
            <Package className="w-4 h-4" />
            Products
          </Button>
          <Button
            variant={leftPanelView === 'categories' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLeftPanelView('categories')}
            className="flex items-center gap-2"
          >
            <Target className="w-4 h-4" />
            Categories
          </Button>
          <Button
            variant={leftPanelView === 'customers' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLeftPanelView('customers')}
            className="flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Customers
          </Button>
        </div>
        {renderPanel(
          leftPanelData,
          `Top ${leftPanelView.charAt(0).toUpperCase() + leftPanelView.slice(1)} by Discount`,
          Award,
          "bg-gradient-to-br from-white via-green-50/30 to-emerald-50/20"
        )}
      </div>

      {/* Right Panel - 50% width */}
      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={rightPanelView === 'staff' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRightPanelView('staff')}
            className="flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            Staff
          </Button>
          <Button
            variant={rightPanelView === 'locations' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRightPanelView('locations')}
            className="flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            Locations
          </Button>
          <Button
            variant={rightPanelView === 'payment-methods' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRightPanelView('payment-methods')}
            className="flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Payment Methods
          </Button>
        </div>
        {renderPanel(
          rightPanelData,
          `Top ${rightPanelView.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} by Discount`,
          TrendingDown,
          "bg-gradient-to-br from-white via-purple-50/30 to-violet-50/20"
        )}
      </div>
    </div>
  );
};
