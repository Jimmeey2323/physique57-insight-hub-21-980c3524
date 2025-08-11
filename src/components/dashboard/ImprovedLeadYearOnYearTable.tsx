
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModernDataTable } from '@/components/ui/ModernDataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, TrendingUp, TrendingDown, Users, Target, DollarSign, BarChart3, Info, Eye } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ImprovedLeadYearOnYearTableProps {
  data: Record<string, Record<string, any>>;
  years: string[];
  sources: string[];
}

export const ImprovedLeadYearOnYearTable: React.FC<ImprovedLeadYearOnYearTableProps> = ({
  data,
  years,
  sources
}) => {
  const [activeView, setActiveView] = useState<'leads' | 'conversions' | 'growth'>('leads');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const processTableData = (viewType: string) => {
    return sources.map(source => {
      const row: any = { source };
      
      years.forEach((year, index) => {
        const yearData = data[source]?.[year];
        if (yearData) {
          const totalLeads = yearData.totalLeads || 0;
          const convertedLeads = yearData.convertedLeads || 0;
          const totalRevenue = yearData.totalRevenue || 0;
          const trialsCompleted = yearData.trialsCompleted || 0;
          const lostLeads = yearData.lostLeads || 0;
          
          switch (viewType) {
            case 'leads':
              row[year] = {
                value: totalLeads,
                trials: trialsCompleted,
                converted: convertedLeads,
                lost: lostLeads,
                revenue: totalRevenue
              };
              break;
            case 'conversions':
              const conversionRate = totalLeads > 0 
                ? ((convertedLeads / totalLeads) * 100).toFixed(1)
                : '0.0';
              const trialRate = totalLeads > 0
                ? ((trialsCompleted / totalLeads) * 100).toFixed(1)
                : '0.0';
              row[year] = {
                value: `${convertedLeads} (${conversionRate}%)`,
                trials: `${trialsCompleted} (${trialRate}%)`,
                totalLeads,
                revenue: totalRevenue
              };
              break;
            case 'growth':
              if (index > 0) {
                const prevYear = years[index - 1];
                const prevYearData = data[source]?.[prevYear];
                if (prevYearData && prevYearData.totalLeads > 0) {
                  const growth = ((totalLeads - prevYearData.totalLeads) / prevYearData.totalLeads * 100);
                  const revenueGrowth = prevYearData.totalRevenue > 0
                    ? ((totalRevenue - prevYearData.totalRevenue) / prevYearData.totalRevenue * 100)
                    : 0;
                  row[year] = {
                    value: `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`,
                    revenueGrowth: `${revenueGrowth > 0 ? '+' : ''}${revenueGrowth.toFixed(1)}%`,
                    totalLeads,
                    prevLeads: prevYearData.totalLeads
                  };
                } else {
                  row[year] = { value: 'N/A', revenueGrowth: 'N/A' };
                }
              } else {
                row[year] = { value: 'Baseline', revenueGrowth: 'Baseline' };
              }
              break;
            default:
              row[year] = { value: 0 };
          }
        } else {
          row[year] = viewType === 'conversions' 
            ? { value: '0 (0.0%)', trials: '0 (0.0%)' }
            : { value: viewType === 'growth' ? 'N/A' : 0 };
        }
      });
      
      return row;
    });
  };

  const toggleRowExpansion = (source: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(source)) {
      newExpanded.delete(source);
    } else {
      newExpanded.add(source);
    }
    setExpandedRows(newExpanded);
  };

  const getColumns = (viewType: string) => {
    const baseColumns = [
      {
        key: 'source' as keyof any,
        header: 'Lead Source/Stage',
        render: (value: string) => (
          <div className="flex items-center gap-2 font-medium">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleRowExpansion(value)}
              className="p-1 h-6 w-6 opacity-60 hover:opacity-100"
            >
              <Eye className="w-3 h-3" />
            </Button>
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-blue-600" />
            <span className="text-slate-800">{value}</span>
          </div>
        ),
        className: 'min-w-[200px] sticky left-0 bg-white z-10'
      }
    ];

    const yearColumns = years.map(year => ({
      key: year as keyof any,
      header: year,
      render: (value: any) => {
        if (viewType === 'conversions') {
          const conversionData = typeof value === 'object' ? value : { value: '0 (0.0%)', trials: '0 (0.0%)' };
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-center cursor-pointer">
                    <div className="font-bold text-base text-slate-900">{conversionData.value.split(' ')[0]}</div>
                    <Badge 
                      variant="secondary" 
                      className="text-xs mt-1 bg-green-100 text-green-700"
                    >
                      {conversionData.value.split(' ')[1]?.replace('(', '').replace(')', '') || '0%'}
                    </Badge>
                    <div className="mt-1 text-xs text-slate-600">
                      Trials: {conversionData.trials}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <p>Total Leads: {conversionData.totalLeads || 0}</p>
                    <p>Revenue: {formatCurrency(conversionData.revenue || 0)}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        } else if (viewType === 'growth') {
          const growthData = typeof value === 'object' ? value : { value: 'N/A' };
          if (growthData.value === 'N/A' || growthData.value === 'Baseline') {
            return <div className="text-center text-gray-500 font-medium">{growthData.value}</div>;
          }
          const growthRate = parseFloat(growthData.value.replace('%', '').replace('+', ''));
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-center gap-1 cursor-pointer">
                    {growthRate > 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`font-bold ${growthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {growthData.value}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <p>Current: {growthData.totalLeads || 0} leads</p>
                    <p>Previous: {growthData.prevLeads || 0} leads</p>
                    <p>Revenue Growth: {growthData.revenueGrowth || 'N/A'}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        } else {
          // Leads view
          const leadData = typeof value === 'object' ? value : { value: 0 };
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-center cursor-pointer">
                    <div className="font-bold text-lg text-slate-900">{formatNumber(leadData.value || 0)}</div>
                    <div className="flex justify-center gap-1 mt-1">
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                        T: {leadData.trials || 0}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                        C: {leadData.converted || 0}
                      </Badge>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <p>Trials: {leadData.trials || 0}</p>
                    <p>Converted: {leadData.converted || 0}</p>
                    <p>Lost: {leadData.lost || 0}</p>
                    <p>Revenue: {formatCurrency(leadData.revenue || 0)}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }
      },
      align: 'center' as const,
      className: 'min-w-[160px]'
    }));

    return [...baseColumns, ...yearColumns];
  };

  const calculateTotals = () => {
    return {
      totalLeads: Object.values(data).reduce((sum, sourceData) => 
        sum + Object.values(sourceData).reduce((yearSum: number, yearData: any) => 
          yearSum + (yearData.totalLeads || 0), 0), 0),
      totalConversions: Object.values(data).reduce((sum, sourceData) => 
        sum + Object.values(sourceData).reduce((yearSum: number, yearData: any) => 
          yearSum + (yearData.convertedLeads || 0), 0), 0),
      totalRevenue: Object.values(data).reduce((sum, sourceData) => 
        sum + Object.values(sourceData).reduce((yearSum: number, yearData: any) => 
          yearSum + (yearData.totalRevenue || 0), 0), 0)
    };
  };

  const totals = calculateTotals();

  return (
    <Card className="bg-white shadow-xl border-0 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2 text-xl font-bold">
            <BarChart3 className="w-6 h-6" />
            Year-on-Year Lead Performance
          </CardTitle>
          <Badge variant="secondary" className="bg-white/20 border-white/30 text-white">
            Multi-Year Analysis
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)} className="w-full">
          <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 px-6 py-4 border-b">
            <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm">
              <TabsTrigger value="leads" className="gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                <Users className="w-4 h-4" />
                Total Leads
              </TabsTrigger>
              <TabsTrigger value="conversions" className="gap-2 data-[state=active]:bg-teal-600 data-[state=active]:text-white">
                <Target className="w-4 h-4" />
                Conversions
              </TabsTrigger>
              <TabsTrigger value="growth" className="gap-2 data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
                <TrendingUp className="w-4 h-4" />
                Growth Rate
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="max-h-[600px] overflow-auto">
            <TabsContent value="leads" className="m-0">
              <ModernDataTable
                data={processTableData('leads')}
                columns={getColumns('leads')}
                loading={false}
                stickyHeader={true}
                maxHeight="500px"
                className="rounded-none"
              />
            </TabsContent>

            <TabsContent value="conversions" className="m-0">
              <ModernDataTable
                data={processTableData('conversions')}
                columns={getColumns('conversions')}
                loading={false}
                stickyHeader={true}
                maxHeight="500px"
                className="rounded-none"
              />
            </TabsContent>

            <TabsContent value="growth" className="m-0">
              <ModernDataTable
                data={processTableData('growth')}
                columns={getColumns('growth')}
                loading={false}
                stickyHeader={true}
                maxHeight="500px"
                className="rounded-none"
              />
            </TabsContent>
          </div>
        </Tabs>

        {/* Expanded Row Details */}
        {Array.from(expandedRows).map(source => (
          <div key={source} className="bg-slate-50 border-t p-6">
            <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600" />
              Detailed Year-on-Year Analysis: {source}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {years.map(year => {
                const yearData = data[source]?.[year] || {};
                return (
                  <div key={year} className="bg-white p-4 rounded-lg shadow-sm border">
                    <p className="text-slate-600 text-sm font-medium mb-3">{year}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Total Leads:</span>
                        <span className="font-bold text-blue-600">{formatNumber(yearData.totalLeads || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Converted:</span>
                        <span className="font-bold text-green-600">{formatNumber(yearData.convertedLeads || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Revenue:</span>
                        <span className="font-bold text-emerald-600">{formatCurrency(yearData.totalRevenue || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Conv Rate:</span>
                        <span className="font-bold">
                          {yearData.totalLeads > 0 
                            ? ((yearData.convertedLeads || 0) / yearData.totalLeads * 100).toFixed(1)
                            : '0.0'
                          }%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>

      {/* Enhanced Summary with better text visibility */}
      <div className="bg-white border-t px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-slate-900">
              {formatNumber(totals.totalLeads)}
            </div>
            <div className="text-sm text-slate-700">Total Leads (All Years)</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-emerald-600">
              {formatNumber(totals.totalConversions)}
            </div>
            <div className="text-sm text-slate-700">Total Conversions</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-teal-600">
              {totals.totalLeads > 0 ? (totals.totalConversions / totals.totalLeads * 100).toFixed(1) : '0.0'}%
            </div>
            <div className="text-sm text-slate-700">Overall Conversion Rate</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-cyan-600">
              {formatCurrency(totals.totalRevenue)}
            </div>
            <div className="text-sm text-slate-700">Total Revenue</div>
          </div>
        </div>
      </div>
    </Card>
  );
};
