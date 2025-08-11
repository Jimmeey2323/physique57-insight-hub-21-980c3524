
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart, ComposedChart } from 'recharts';
import { TrendingUp, PieChart as PieChartIcon, BarChart3, Activity, Download, Maximize2, Users } from 'lucide-react';
import { NewClientData } from '@/types/dashboard';
import { formatCurrency, formatNumber } from '@/utils/formatters';

interface ClientConversionChartsProps {
  data: NewClientData[];
}

export const ClientConversionCharts: React.FC<ClientConversionChartsProps> = ({ data }) => {
  const [activeChart, setActiveChart] = useState('trends');
  const [animateCharts, setAnimateCharts] = useState(true);

  // Monthly conversion data with enhanced metrics
  const monthlyData = data.reduce((acc, client) => {
    if (!client.firstVisitDate) return acc;
    const date = new Date(client.firstVisitDate);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!acc[month]) {
      acc[month] = {
        month: new Date(date.getFullYear(), date.getMonth()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        newClients: 0,
        conversions: 0,
        retained: 0,
        totalLTV: 0,
        avgConversionSpan: 0,
        conversionRate: 0
      };
    }
    
    acc[month].newClients++;
    if (client.conversionStatus === 'Converted') acc[month].conversions++;
    if (client.retentionStatus === 'Retained') acc[month].retained++;
    acc[month].totalLTV += client.ltv || 0;
    acc[month].avgConversionSpan += client.conversionSpan || 0;
    
    return acc;
  }, {} as Record<string, any>);

  const monthlyChartData = Object.values(monthlyData)
    .map((item: any) => ({
      ...item,
      conversionRate: item.newClients > 0 ? (item.conversions / item.newClients) * 100 : 0,
      retentionRate: item.newClients > 0 ? (item.retained / item.newClients) * 100 : 0,
      avgLTV: item.newClients > 0 ? item.totalLTV / item.newClients : 0,
      avgConversionSpan: item.newClients > 0 ? item.avgConversionSpan / item.newClients : 0
    }))
    .sort((a: any, b: any) => new Date(a.month).getTime() - new Date(b.month).getTime());

  // Location performance data
  const locationData = data.reduce((acc, client) => {
    const location = client.firstVisitLocation || 'Unknown';
    if (!acc[location]) {
      acc[location] = {
        name: location,
        newClients: 0,
        conversions: 0,
        retained: 0,
        totalLTV: 0,
        conversionRate: 0,
        retentionRate: 0
      };
    }
    
    acc[location].newClients++;
    if (client.conversionStatus === 'Converted') acc[location].conversions++;
    if (client.retentionStatus === 'Retained') acc[location].retained++;
    acc[location].totalLTV += client.ltv || 0;
    
    return acc;
  }, {} as Record<string, any>);

  const locationChartData = Object.values(locationData).map((item: any) => ({
    ...item,
    conversionRate: item.newClients > 0 ? (item.conversions / item.newClients) * 100 : 0,
    retentionRate: item.newClients > 0 ? (item.retained / item.newClients) * 100 : 0
  }));

  // Conversion funnel data
  const funnelData = [
    { stage: 'New Clients', value: data.length, fill: '#3B82F6', percentage: 100 },
    { stage: 'Trial Completed', value: data.filter(c => c.visitsPostTrial > 0).length, fill: '#10B981', percentage: 0 },
    { stage: 'Converted', value: data.filter(c => c.conversionStatus === 'Converted').length, fill: '#F59E0B', percentage: 0 },
    { stage: 'Retained', value: data.filter(c => c.retentionStatus === 'Retained').length, fill: '#EF4444', percentage: 0 }
  ].map((item, index, arr) => ({
    ...item,
    percentage: index === 0 ? 100 : arr[0].value > 0 ? (item.value / arr[0].value) * 100 : 0
  }));

  // Trainer performance data
  const trainerData = data.reduce((acc, client) => {
    const trainer = client.trainerName || 'Unknown';
    if (!acc[trainer]) {
      acc[trainer] = { name: trainer, conversions: 0, retained: 0, totalLTV: 0 };
    }
    if (client.conversionStatus === 'Converted') acc[trainer].conversions++;
    if (client.retentionStatus === 'Retained') acc[trainer].retained++;
    acc[trainer].totalLTV += client.ltv || 0;
    return acc;
  }, {} as Record<string, any>);

  const trainerChartData = Object.values(trainerData)
    .sort((a: any, b: any) => b.totalLTV - a.totalLTV)
    .slice(0, 10);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 text-white p-4 rounded-lg shadow-xl border border-gray-700">
          <p className="font-semibold text-lg mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm">
                {entry.name}: {
                  entry.dataKey.includes('Rate') || entry.dataKey.includes('percentage') 
                    ? `${entry.value.toFixed(1)}%`
                    : entry.dataKey.includes('LTV') || entry.dataKey.includes('totalLTV')
                    ? formatCurrency(entry.value)
                    : formatNumber(entry.value)
                }
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Chart Navigation */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Tabs value={activeChart} onValueChange={setActiveChart} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-lg">
                <TabsTrigger value="trends" className="text-sm font-medium">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Trends
                </TabsTrigger>
                <TabsTrigger value="performance" className="text-sm font-medium">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Performance
                </TabsTrigger>
                <TabsTrigger value="funnel" className="text-sm font-medium">
                  <PieChartIcon className="w-4 h-4 mr-2" />
                  Funnel
                </TabsTrigger>
                <TabsTrigger value="analysis" className="text-sm font-medium">
                  <Activity className="w-4 h-4 mr-2" />
                  Analysis
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAnimateCharts(!animateCharts)}
                className="gap-2"
              >
                {animateCharts ? 'Disable' : 'Enable'} Animation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeChart} onValueChange={setActiveChart}>
        {/* Monthly Trends Tab */}
        <TabsContent value="trends" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-white shadow-xl border-0 overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-800 text-xl flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Monthly Conversion Trends
                </CardTitle>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="newClients" 
                    stackId="1"
                    stroke="#3B82F6" 
                    fill="#3B82F6" 
                    fillOpacity={0.3}
                    name="New Clients"
                    animationDuration={animateCharts ? 1000 : 0}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="conversionRate" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                    name="Conversion Rate (%)"
                    animationDuration={animateCharts ? 1500 : 0}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-xl border-0 overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
              <CardTitle className="text-gray-800 text-xl flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-600" />
                LTV & Retention Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    yAxisId="left"
                    dataKey="totalLTV" 
                    fill="#F59E0B" 
                    name="Total LTV"
                    animationDuration={animateCharts ? 1000 : 0}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="retentionRate" 
                    stroke="#8B5CF6" 
                    strokeWidth={3}
                    dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                    name="Retention Rate (%)"
                    animationDuration={animateCharts ? 1500 : 0}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-white shadow-xl border-0 overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-purple-50 to-violet-50">
              <CardTitle className="text-gray-800 text-xl flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Location Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={locationChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="newClients" fill="#3B82F6" name="New Clients" animationDuration={animateCharts ? 1000 : 0} />
                  <Bar dataKey="conversions" fill="#10B981" name="Conversions" animationDuration={animateCharts ? 1200 : 0} />
                  <Bar dataKey="retained" fill="#F59E0B" name="Retained" animationDuration={animateCharts ? 1400 : 0} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-xl border-0 overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-orange-50 to-red-50">
              <CardTitle className="text-gray-800 text-xl flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-600" />
                Top Trainer Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={trainerChartData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="totalLTV" fill="#F59E0B" name="Total LTV" animationDuration={animateCharts ? 1000 : 0} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Funnel Tab */}
        <TabsContent value="funnel" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-white shadow-xl border-0 overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-pink-50 to-rose-50">
              <CardTitle className="text-gray-800 text-xl flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-pink-600" />
                Conversion Funnel
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={funnelData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    animationDuration={animateCharts ? 1000 : 0}
                  >
                    {funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-xl border-0 overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-teal-50 to-cyan-50">
              <CardTitle className="text-gray-800 text-xl flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-600" />
                Funnel Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {funnelData.map((stage, index) => (
                  <div key={stage.stage} className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-700">{stage.stage}</span>
                      <span className="font-bold text-gray-900">
                        {formatNumber(stage.value)} ({stage.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="h-3 rounded-full transition-all duration-1000 ease-out"
                        style={{ 
                          width: `${stage.percentage}%`,
                          backgroundColor: stage.fill
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="grid grid-cols-1 gap-8">
          <Card className="bg-white shadow-xl border-0 overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-blue-50">
              <CardTitle className="text-gray-800 text-xl flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                Advanced Conversion Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="newClients" 
                    stackId="1"
                    stroke="#3B82F6" 
                    fill="#3B82F6" 
                    fillOpacity={0.3}
                    name="New Clients"
                    animationDuration={animateCharts ? 1000 : 0}
                  />
                  <Bar 
                    yAxisId="left"
                    dataKey="conversions" 
                    fill="#10B981" 
                    name="Conversions"
                    animationDuration={animateCharts ? 1200 : 0}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="conversionRate" 
                    stroke="#F59E0B" 
                    strokeWidth={3}
                    dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                    name="Conversion Rate (%)"
                    animationDuration={animateCharts ? 1500 : 0}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="avgConversionSpan" 
                    stroke="#8B5CF6" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 3 }}
                    name="Avg Conversion Days"
                    animationDuration={animateCharts ? 1700 : 0}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
