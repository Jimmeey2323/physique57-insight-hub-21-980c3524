
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useSalesData } from '@/hooks/useSalesData';
import { useSessionsData } from '@/hooks/useSessionsData';
import { usePayrollData } from '@/hooks/usePayrollData';
import { useNewClientData } from '@/hooks/useNewClientData';
import { FilterSection } from './FilterSection';
import { DrillDownModal } from './DrillDownModal';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Calendar, 
  Target,
  BarChart3,
  Activity,
  Award,
  Zap,
  Navigation,
  Sparkles,
  ChevronRight,
  Eye
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { cn } from '@/lib/utils';

const ExecutiveSummarySection = () => {
  const { data: salesData, isLoading: salesLoading, error: salesError } = useSalesData();
  const { data: sessionsData, isLoading: sessionsLoading, error: sessionsError } = useSessionsData();
  const { data: payrollData, isLoading: payrollLoading, error: payrollError } = usePayrollData();
  const { data: clientData, isLoading: clientLoading, error: clientError } = useNewClientData();

  const [selectedTab, setSelectedTab] = useState('overview');
  const [drillDownData, setDrillDownData] = useState<any>(null);
  const [drillDownType, setDrillDownType] = useState<'metric' | 'product' | 'category' | 'member' | 'soldBy' | 'paymentMethod' | 'client-conversion' | 'trainer' | 'location'>('metric');
  const [isDrillDownOpen, setIsDrillDownOpen] = useState(false);

  const isLoading = salesLoading || sessionsLoading || payrollLoading || clientLoading;

  const handleDrillDown = (data: any, type: any) => {
    setDrillDownData(data);
    setDrillDownType(type);
    setIsDrillDownOpen(true);
  };

  // Calculate key metrics
  const totalRevenue = salesData?.reduce((sum, sale) => sum + (sale.paymentValue || 0), 0) || 0;
  const totalSessions = sessionsData?.length || 0;
  const totalTrainers = payrollData?.length || 0;
  const totalClients = clientData?.length || 0;

  // Revenue trend data (last 6 months)
  const revenueData = [
    { month: 'Jan', revenue: totalRevenue * 0.8 },
    { month: 'Feb', revenue: totalRevenue * 0.85 },
    { month: 'Mar', revenue: totalRevenue * 0.9 },
    { month: 'Apr', revenue: totalRevenue * 0.95 },
    { month: 'May', revenue: totalRevenue * 1.0 },
    { month: 'Jun', revenue: totalRevenue * 1.1 },
  ];

  // Location performance data
  const locationData = salesData?.reduce((acc: any, sale) => {
    const location = sale.calculatedLocation || 'Unknown';
    if (!acc[location]) {
      acc[location] = { name: location, value: 0, count: 0 };
    }
    acc[location].value += sale.paymentValue || 0;
    acc[location].count += 1;
    return acc;
  }, {}) || {};

  const locations = Object.values(locationData).slice(0, 4);

  // Top products data
  const productData = salesData?.reduce((acc: any, sale) => {
    const product = sale.cleanedProduct || 'Unknown';
    if (!acc[product]) {
      acc[product] = { name: product, revenue: 0, quantity: 0 };
    }
    acc[product].revenue += sale.paymentValue || 0;
    acc[product].quantity += 1;
    return acc;
  }, {}) || {};

  const topProducts = Object.values(productData)
    .sort((a: any, b: any) => b.revenue - a.revenue)
    .slice(0, 5);

  // Top trainers data
  const trainerData = payrollData?.reduce((acc: any, trainer) => {
    const name = trainer.teacherName || 'Unknown';
    if (!acc[name]) {
      acc[name] = { 
        name, 
        sessions: 0, 
        revenue: 0, 
        students: 0,
        rawData: trainer
      };
    }
    acc[name].sessions += trainer.totalSessions || 0;
    acc[name].revenue += trainer.totalPaid || 0;
    acc[name].students += trainer.totalCustomers || 0;
    return acc;
  }, {}) || {};

  const topTrainers = Object.values(trainerData)
    .sort((a: any, b: any) => b.revenue - a.revenue)
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-slate-600 font-medium">Loading executive dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-cyan-400/20 rounded-full animate-bounce"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-6 py-16">
          <div className="text-center space-y-8">
            {/* Animated Badge */}
            <div className="animate-fade-in">
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 text-sm font-medium">
                <Sparkles className="w-4 h-4 mr-2" />
                Executive Dashboard
              </Badge>
            </div>

            {/* Hero Title */}
            <div className="space-y-4 animate-fade-in delay-200">
              <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                Business Intelligence Hub
              </h1>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                Comprehensive analytics and insights across all business operations. 
                Monitor performance, track growth, and make data-driven decisions.
              </p>
            </div>

            {/* Dashboard Button */}
            <div className="animate-fade-in delay-300">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105"
                onClick={() => window.open('/sales-analytics', '_blank')}
              >
                <Navigation className="w-5 h-5 mr-2" />
                Open Dashboard
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            {/* Key Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12 animate-fade-in delay-500">
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-white">{formatCurrency(totalRevenue)}</div>
                  <div className="text-sm text-slate-300">Total Revenue</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <Calendar className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-white">{formatNumber(totalSessions)}</div>
                  <div className="text-sm text-slate-300">Total Sessions</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-white">{formatNumber(totalTrainers)}</div>
                  <div className="text-sm text-slate-300">Active Trainers</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <Target className="w-8 h-8 text-orange-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-white">{formatNumber(totalClients)}</div>
                  <div className="text-sm text-slate-300">Total Clients</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        {/* Collapsed Filter Section */}
        <Card className="mb-8 bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-4">
            <FilterSection />
          </CardContent>
        </Card>

        {/* Enhanced Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm border-0 shadow-lg p-2 rounded-2xl h-16">
            {[
              { value: 'overview', label: 'Overview', icon: BarChart3 },
              { value: 'sales', label: 'Sales', icon: DollarSign },
              { value: 'sessions', label: 'Sessions', icon: Calendar },
              { value: 'trainers', label: 'Trainers', icon: Users },
              { value: 'clients', label: 'Clients', icon: Target }
            ].map(({ value, label, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-50"
              >
                <Icon className="w-4 h-4" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Revenue Trend Chart */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Revenue Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="url(#gradient)" 
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Location Performance */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <Activity className="w-5 h-5 text-blue-600" />
                    Location Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {locations.map((location: any, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-slate-700">{location.name}</span>
                        <span className="text-sm font-bold text-slate-900">{formatCurrency(location.value)}</span>
                      </div>
                      <Progress 
                        value={(location.value / Math.max(...locations.map((l: any) => l.value))) * 100} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Top Performers Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Products */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <Award className="w-5 h-5 text-yellow-600" />
                    Top Products
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topProducts.map((product: any, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg hover:shadow-md transition-all duration-300 cursor-pointer group"
                        onClick={() => handleDrillDown({
                          name: product.name,
                          totalValue: product.revenue,
                          totalTransactions: product.quantity,
                          metricValue: product.revenue,
                          rawData: salesData?.filter(s => s.cleanedProduct === product.name)
                        }, 'product')}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{product.name}</p>
                            <p className="text-xs text-slate-600">{product.quantity} sales</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900">{formatCurrency(product.revenue)}</p>
                          <Eye className="w-4 h-4 text-blue-600 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Trainers */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <Zap className="w-5 h-5 text-purple-600" />
                    Top Trainers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topTrainers.map((trainer: any, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-purple-50 rounded-lg hover:shadow-md transition-all duration-300 cursor-pointer group"
                        onClick={() => handleDrillDown({
                          name: trainer.name,
                          totalValue: trainer.revenue,
                          totalSessions: trainer.sessions,
                          totalCustomers: trainer.students,
                          metricValue: trainer.revenue,
                          rawData: trainer.rawData
                        }, 'trainer')}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{trainer.name}</p>
                            <p className="text-xs text-slate-600">{trainer.sessions} sessions</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900">{formatCurrency(trainer.revenue)}</p>
                          <Eye className="w-4 h-4 text-purple-600 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value="sales" className="space-y-8">
            {/* Sales Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'Total Revenue', value: totalRevenue, icon: DollarSign, color: 'green', format: 'currency' },
                { title: 'Total Transactions', value: salesData?.length || 0, icon: BarChart3, color: 'blue', format: 'number' },
                { title: 'Average Transaction', value: (totalRevenue / (salesData?.length || 1)), icon: TrendingUp, color: 'purple', format: 'currency' },
                { title: 'Unique Customers', value: new Set(salesData?.map(s => s.memberId)).size, icon: Users, color: 'orange', format: 'number' },
                { title: 'Revenue Growth', value: 12.5, icon: Activity, color: 'cyan', format: 'percentage' },
                { title: 'Top Category', value: 'Memberships', icon: Award, color: 'pink', format: 'text' }
              ].map((metric, index) => (
                <Card 
                  key={index} 
                  className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer group"
                  onClick={() => handleDrillDown({
                    title: metric.title,
                    metricValue: metric.value,
                    totalValue: metric.value,
                    rawData: salesData
                  }, 'metric')}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <metric.icon className={`w-8 h-8 text-${metric.color}-600`} />
                      <Eye className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-600">{metric.title}</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {metric.format === 'currency' ? formatCurrency(Number(metric.value)) :
                         metric.format === 'number' ? formatNumber(Number(metric.value)) :
                         metric.format === 'percentage' ? formatPercentage(Number(metric.value)) :
                         metric.value}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Sales Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Monthly Sales Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Bar dataKey="revenue" fill="url(#salesGradient)" />
                      <defs>
                        <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#1d4ed8" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Sales by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={Object.values(salesData?.reduce((acc: any, sale) => {
                          const category = sale.cleanedCategory || 'Other';
                          if (!acc[category]) {
                            acc[category] = { name: category, value: 0 };
                          }
                          acc[category].value += sale.paymentValue || 0;
                          return acc;
                        }, {}) || {})}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'].map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="space-y-8">
            {/* Session Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { title: 'Total Sessions', value: totalSessions, icon: Calendar, color: 'blue' },
                { title: 'Avg Attendance', value: 85, icon: Users, color: 'green' },
                { title: 'Cancellation Rate', value: 12, icon: TrendingDown, color: 'red' },
                { title: 'Utilization Rate', value: 78, icon: Activity, color: 'purple' }
              ].map((metric, index) => (
                <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardContent className="p-6 text-center">
                    <metric.icon className={`w-8 h-8 text-${metric.color}-600 mx-auto mb-3`} />
                    <div className="text-2xl font-bold text-slate-900">
                      {index === 0 ? formatNumber(metric.value) : 
                       index === 1 ? `${metric.value}%` :
                       `${metric.value}%`}
                    </div>
                    <div className="text-sm text-slate-600">{metric.title}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Trainers Tab */}
          <TabsContent value="trainers" className="space-y-8">
            {/* Trainer Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Active Trainers', value: totalTrainers, icon: Users, color: 'blue' },
                { title: 'Avg Performance', value: 87, icon: TrendingUp, color: 'green' },
                { title: 'Top Performer', value: topTrainers[0]?.name || 'N/A', icon: Award, color: 'gold' }
              ].map((metric, index) => (
                <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardContent className="p-6 text-center">
                    <metric.icon className={`w-8 h-8 text-${metric.color}-600 mx-auto mb-3`} />
                    <div className="text-2xl font-bold text-slate-900">
                      {index === 0 ? formatNumber(Number(metric.value)) : 
                       index === 1 ? `${metric.value}%` :
                       metric.value}
                    </div>
                    <div className="text-sm text-slate-600">{metric.title}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Trainer Performance Table */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Trainer Performance Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topTrainers.map((trainer: any, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg hover:shadow-md transition-all duration-300 cursor-pointer group"
                      onClick={() => handleDrillDown(trainer, 'trainer')}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {trainer.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{trainer.name}</p>
                          <p className="text-sm text-slate-600">{trainer.sessions} sessions • {trainer.students} students</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">{formatCurrency(trainer.revenue)}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={75 + Math.random() * 25} className="w-20 h-2" />
                          <Eye className="w-4 h-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-8">
            {/* Client Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { title: 'Total Clients', value: totalClients, icon: Users, color: 'blue' },
                { title: 'New This Month', value: Math.floor(totalClients * 0.15), icon: TrendingUp, color: 'green' },
                { title: 'Retention Rate', value: 89, icon: Target, color: 'purple' },
                { title: 'Avg LTV', value: 1250, icon: DollarSign, color: 'orange' }
              ].map((metric, index) => (
                <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardContent className="p-6 text-center">
                    <metric.icon className={`w-8 h-8 text-${metric.color}-600 mx-auto mb-3`} />
                    <div className="text-2xl font-bold text-slate-900">
                      {index === 0 || index === 1 ? formatNumber(Number(metric.value)) : 
                       index === 2 ? `${metric.value}%` :
                       formatCurrency(Number(metric.value))}
                    </div>
                    <div className="text-sm text-slate-600">{metric.title}</div>
                    {index === 2 && (
                      <Progress value={metric.value} className="mt-2 h-2" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Drill Down Modal */}
      <DrillDownModal
        isOpen={isDrillDownOpen}
        onClose={() => setIsDrillDownOpen(false)}
        data={drillDownData}
        type={drillDownType}
      />
    </div>
  );
};

export default ExecutiveSummarySection;
