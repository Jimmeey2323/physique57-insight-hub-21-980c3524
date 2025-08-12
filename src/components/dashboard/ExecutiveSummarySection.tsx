
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useSalesData } from '@/hooks/useSalesData';
import { useSessionsData } from '@/hooks/useSessionsData';
import { usePayrollData } from '@/hooks/usePayrollData';
import { useNewClientData } from '@/hooks/useNewClientData';
import { AutoCloseFilterSection } from './AutoCloseFilterSection';
import { OptimizedTable } from '@/components/ui/OptimizedTable';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Calendar, 
  Target,
  BarChart3,
  Home,
  ArrowRight,
  Sparkles,
  Star,
  Crown,
  Award,
  Zap,
  Activity,
  PieChart,
  LineChart,
  ShoppingCart,
  CreditCard,
  UserCheck,
  Clock,
  MapPin,
  Filter
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { cn } from '@/lib/utils';

interface FilterOptions {
  dateRange: { start: string; end: string };
  location: string[];
  category: string[];
  product: string[];
  soldBy: string[];
  paymentMethod: string[];
}

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'];

const ExecutiveSummarySection: React.FC = () => {
  const navigate = useNavigate();
  const { data: salesData, loading: salesLoading } = useSalesData();
  const { data: sessionsData, loading: sessionsLoading } = useSessionsData();
  const { data: payrollData, loading: payrollLoading } = usePayrollData();
  const { data: clientData, loading: clientLoading } = useNewClientData();
  
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: { start: '', end: '' },
    location: [],
    category: [],
    product: [],
    soldBy: [],
    paymentMethod: []
  });

  // Comprehensive Sales Metrics
  const salesMetrics = useMemo(() => {
    if (!salesData?.length) return null;
    
    const totalRevenue = salesData.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
    const totalTransactions = salesData.length;
    const uniqueMembers = new Set(salesData.map(item => item.memberId)).size;
    const averageTicketValue = totalRevenue / totalTransactions;
    const totalVAT = salesData.reduce((sum, item) => sum + (item.paymentVAT || 0), 0);
    const netRevenue = totalRevenue - totalVAT;
    
    // Location breakdown
    const locationBreakdown = salesData.reduce((acc, item) => {
      const location = item.calculatedLocation || 'Unknown';
      if (!acc[location]) acc[location] = { revenue: 0, transactions: 0, members: new Set() };
      acc[location].revenue += item.paymentValue || 0;
      acc[location].transactions += 1;
      acc[location].members.add(item.memberId);
      return acc;
    }, {} as Record<string, any>);

    // Monthly trends (last 12 months)
    const monthlyTrends = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthData = salesData.filter(item => {
        const itemDate = new Date(item.paymentDate);
        return itemDate.getFullYear() === date.getFullYear() && 
               itemDate.getMonth() === date.getMonth();
      });
      
      monthlyTrends.push({
        month: date.toLocaleDateString('en', { month: 'short', year: 'numeric' }),
        revenue: monthData.reduce((sum, item) => sum + (item.paymentValue || 0), 0),
        transactions: monthData.length,
        members: new Set(monthData.map(item => item.memberId)).size
      });
    }

    return {
      totalRevenue,
      netRevenue,
      totalTransactions,
      uniqueMembers,
      averageTicketValue,
      totalVAT,
      locationBreakdown: Object.entries(locationBreakdown).map(([name, data]: [string, any]) => ({
        name,
        revenue: data.revenue,
        transactions: data.transactions,
        members: data.members.size
      })),
      monthlyTrends
    };
  }, [salesData]);

  // Session Analytics
  const sessionMetrics = useMemo(() => {
    if (!sessionsData?.length) return null;
    
    const totalSessions = sessionsData.length;
    const totalBookings = sessionsData.reduce((sum, session) => sum + (session.checkedInCount || 0), 0);
    const totalCheckins = sessionsData.reduce((sum, session) => sum + (session.checkedInCount || 0), 0);
    const averageFillRate = sessionsData.reduce((sum, session) => sum + (session.fillPercentage || 0), 0) / totalSessions;
    
    const classTypeBreakdown = sessionsData.reduce((acc, session) => {
      const type = session.cleanedClass || session.classType || 'Unknown';
      if (!acc[type]) acc[type] = { sessions: 0, bookings: 0, checkins: 0 };
      acc[type].sessions += 1;
      acc[type].bookings += session.checkedInCount || 0;
      acc[type].checkins += session.checkedInCount || 0;
      return acc;
    }, {} as Record<string, any>);

    return {
      totalSessions,
      totalBookings,
      totalCheckins,
      averageFillRate,
      attendanceRate: totalBookings > 0 ? (totalCheckins / totalBookings) * 100 : 0,
      classTypeBreakdown: Object.entries(classTypeBreakdown).slice(0, 5)
    };
  }, [sessionsData]);

  // Trainer Performance
  const trainerMetrics = useMemo(() => {
    if (!payrollData?.length) return null;
    
    const totalTrainers = new Set(payrollData.map(trainer => trainer.teacherId)).size;
    const totalSessions = payrollData.reduce((sum, trainer) => sum + (trainer.totalSessions || 0), 0);
    const totalCustomers = payrollData.reduce((sum, trainer) => sum + (trainer.totalCustomers || 0), 0);
    const averageClassSize = totalSessions > 0 ? totalCustomers / totalSessions : 0;

    const topTrainers = payrollData
      .sort((a, b) => (b.totalCustomers || 0) - (a.totalCustomers || 0))
      .slice(0, 5)
      .map(trainer => ({
        name: trainer.teacherName,
        customers: trainer.totalCustomers || 0,
        sessions: trainer.totalSessions || 0,
        retention: trainer.retention || 'N/A'
      }));

    return {
      totalTrainers,
      totalSessions,
      totalCustomers,
      averageClassSize,
      topTrainers
    };
  }, [payrollData]);

  // Client Insights
  const clientMetrics = useMemo(() => {
    if (!clientData?.length) return null;
    
    const totalNewClients = clientData.length;
    const convertedClients = clientData.filter(client => client.conversionStatus === 'Converted').length;
    const retainedClients = clientData.filter(client => client.retentionStatus === 'Retained').length;
    const averageLTV = clientData.reduce((sum, client) => sum + (client.ltv || 0), 0) / totalNewClients;
    
    const conversionRate = (convertedClients / totalNewClients) * 100;
    const retentionRate = (retainedClients / totalNewClients) * 100;

    return {
      totalNewClients,
      convertedClients,
      retainedClients,
      conversionRate,
      retentionRate,
      averageLTV
    };
  }, [clientData]);

  const resetFilters = () => {
    setFilters({
      dateRange: { start: '', end: '' },
      location: [],
      category: [],
      product: [],
      soldBy: [],
      paymentMethod: []
    });
  };

  const isLoading = salesLoading || sessionsLoading || payrollLoading || clientLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-slate-600">Loading comprehensive analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20">
      {/* Animated Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-purple-800 to-indigo-700">
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -left-4 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-10 w-24 h-24 bg-indigo-300/20 rounded-full animate-bounce delay-1000"></div>
          <div className="absolute bottom-10 left-20 w-40 h-40 bg-purple-300/10 rounded-full animate-pulse delay-500"></div>
          <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-blue-300/15 rounded-full animate-ping delay-700"></div>
        </div>
        
        <div className="relative px-8 py-16">
          <div className="max-w-7xl mx-auto">
            {/* Navigation */}
            <div className="flex items-center justify-between mb-12">
              <Button 
                onClick={() => navigate('/')} 
                variant="outline" 
                size="lg"
                className="gap-3 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300 group"
              >
                <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Dashboard
              </Button>
              
              <div className="flex items-center gap-4">
                <Badge className="bg-white/10 backdrop-blur-sm text-white border-white/20 px-4 py-2">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Executive Summary
                </Badge>
              </div>
            </div>
            
            {/* Hero Content */}
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-white via-indigo-100 to-purple-100 bg-clip-text text-transparent animate-fade-in-up">
                  Executive Dashboard
                </h1>
                <p className="text-2xl text-indigo-100 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-200">
                  Comprehensive business intelligence across all key performance indicators
                </p>
              </div>

              {/* Key Stats Cards */}
              {salesMetrics && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12 animate-fade-in-up delay-300">
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/15 transition-all duration-300 group">
                    <CardContent className="p-6 text-center">
                      <DollarSign className="w-8 h-8 mx-auto mb-3 text-green-300 group-hover:scale-110 transition-transform" />
                      <div className="text-3xl font-bold">{formatCurrency(salesMetrics.totalRevenue)}</div>
                      <div className="text-indigo-200 text-sm">Total Revenue</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/15 transition-all duration-300 group">
                    <CardContent className="p-6 text-center">
                      <ShoppingCart className="w-8 h-8 mx-auto mb-3 text-blue-300 group-hover:scale-110 transition-transform" />
                      <div className="text-3xl font-bold">{formatNumber(salesMetrics.totalTransactions)}</div>
                      <div className="text-indigo-200 text-sm">Transactions</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/15 transition-all duration-300 group">
                    <CardContent className="p-6 text-center">
                      <Users className="w-8 h-8 mx-auto mb-3 text-purple-300 group-hover:scale-110 transition-transform" />
                      <div className="text-3xl font-bold">{formatNumber(salesMetrics.uniqueMembers)}</div>
                      <div className="text-indigo-200 text-sm">Active Members</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/15 transition-all duration-300 group">
                    <CardContent className="p-6 text-center">
                      <Target className="w-8 h-8 mx-auto mb-3 text-orange-300 group-hover:scale-110 transition-transform" />
                      <div className="text-3xl font-bold">{formatCurrency(salesMetrics.averageTicketValue)}</div>
                      <div className="text-indigo-200 text-sm">Avg Ticket</div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 space-y-12">
        {/* Filters Section */}
        <Card className="bg-gradient-to-r from-white to-slate-50 border-0 shadow-xl">
          <CardHeader className="flex flex-row items-center gap-4">
            <Filter className="w-6 h-6 text-blue-600" />
            <CardTitle className="text-xl">Advanced Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <AutoCloseFilterSection 
              filters={filters} 
              onFiltersChange={setFilters} 
              onReset={resetFilters} 
            />
          </CardContent>
        </Card>

        {/* Comprehensive Analytics Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-white/90 backdrop-blur-sm p-2 rounded-2xl shadow-xl border-0 grid grid-cols-5 w-full max-w-4xl mx-auto">
            <TabsTrigger value="overview" className="rounded-xl">📊 Overview</TabsTrigger>
            <TabsTrigger value="sales" className="rounded-xl">💰 Sales</TabsTrigger>
            <TabsTrigger value="sessions" className="rounded-xl">🏋️ Sessions</TabsTrigger>
            <TabsTrigger value="trainers" className="rounded-xl">👥 Trainers</TabsTrigger>
            <TabsTrigger value="clients" className="rounded-xl">🎯 Clients</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Revenue Trend Chart */}
              {salesMetrics?.monthlyTrends && (
                <Card className="bg-gradient-to-br from-white to-slate-50 border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LineChart className="w-5 h-5 text-blue-600" />
                      Revenue Trend (12 Months)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsLineChart data={salesMetrics.monthlyTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(value) => formatCurrency(value)} />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Location Performance */}
              {salesMetrics?.locationBreakdown && (
                <Card className="bg-gradient-to-br from-white to-slate-50 border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-green-600" />
                      Location Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {salesMetrics.locationBreakdown.map((location, index) => (
                        <div key={location.name} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white rounded-lg border">
                          <div>
                            <div className="font-semibold text-slate-800">{location.name}</div>
                            <div className="text-sm text-slate-600">{location.transactions} transactions • {location.members} members</div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">{formatCurrency(location.revenue)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Sales Metrics */}
              {salesMetrics && (
                <>
                  <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-emerald-600 text-sm font-medium">Net Revenue</p>
                          <p className="text-2xl font-bold text-emerald-800">{formatCurrency(salesMetrics.netRevenue)}</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-emerald-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-600 text-sm font-medium">VAT Collected</p>
                          <p className="text-2xl font-bold text-blue-800">{formatCurrency(salesMetrics.totalVAT)}</p>
                        </div>
                        <CreditCard className="w-8 h-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Session Metrics */}
              {sessionMetrics && (
                <>
                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-600 text-sm font-medium">Attendance Rate</p>
                          <p className="text-2xl font-bold text-purple-800">{sessionMetrics.attendanceRate.toFixed(1)}%</p>
                        </div>
                        <UserCheck className="w-8 h-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-600 text-sm font-medium">Avg Fill Rate</p>
                          <p className="text-2xl font-bold text-orange-800">{sessionMetrics.averageFillRate.toFixed(1)}%</p>
                        </div>
                        <Activity className="w-8 h-8 text-orange-600" />
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </TabsContent>

          {/* Sales Analytics Tab */}
          <TabsContent value="sales" className="space-y-8">
            {salesMetrics && (
              <>
                {/* Sales Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                    <CardContent className="p-4 text-center">
                      <DollarSign className="w-6 h-6 mx-auto text-emerald-600 mb-2" />
                      <div className="text-lg font-bold text-emerald-800">{formatCurrency(salesMetrics.totalRevenue)}</div>
                      <div className="text-xs text-emerald-600">Total Revenue</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4 text-center">
                      <ShoppingCart className="w-6 h-6 mx-auto text-blue-600 mb-2" />
                      <div className="text-lg font-bold text-blue-800">{formatNumber(salesMetrics.totalTransactions)}</div>
                      <div className="text-xs text-blue-600">Transactions</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4 text-center">
                      <Users className="w-6 h-6 mx-auto text-purple-600 mb-2" />
                      <div className="text-lg font-bold text-purple-800">{formatNumber(salesMetrics.uniqueMembers)}</div>
                      <div className="text-xs text-purple-600">Members</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-4 text-center">
                      <Target className="w-6 h-6 mx-auto text-orange-600 mb-2" />
                      <div className="text-lg font-bold text-orange-800">{formatCurrency(salesMetrics.averageTicketValue)}</div>
                      <div className="text-xs text-orange-600">Avg Ticket</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
                    <CardContent className="p-4 text-center">
                      <Activity className="w-6 h-6 mx-auto text-teal-600 mb-2" />
                      <div className="text-lg font-bold text-teal-800">{formatCurrency(salesMetrics.netRevenue)}</div>
                      <div className="text-xs text-teal-600">Net Revenue</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
                    <CardContent className="p-4 text-center">
                      <CreditCard className="w-6 h-6 mx-auto text-pink-600 mb-2" />
                      <div className="text-lg font-bold text-pink-800">{formatCurrency(salesMetrics.totalVAT)}</div>
                      <div className="text-xs text-pink-600">VAT Collected</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Revenue Trend and Location Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="bg-white border-0 shadow-xl">
                    <CardHeader>
                      <CardTitle>Monthly Revenue Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsLineChart data={salesMetrics.monthlyTrends}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis tickFormatter={(value) => formatCurrency(value)} />
                          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                          <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-0 shadow-xl">
                    <CardHeader>
                      <CardTitle>Location Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <OptimizedTable
                        data={salesMetrics.locationBreakdown}
                        columns={[
                          { key: 'name', header: 'Location', align: 'left' },
                          { key: 'revenue', header: 'Revenue', render: (value) => formatCurrency(value), align: 'right' },
                          { key: 'transactions', header: 'Transactions', render: (value) => formatNumber(value), align: 'center' },
                          { key: 'members', header: 'Members', render: (value) => formatNumber(value), align: 'center' }
                        ]}
                        maxHeight="300px"
                      />
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="space-y-8">
            {sessionMetrics && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-600 text-sm font-medium">Total Sessions</p>
                          <p className="text-3xl font-bold text-blue-800">{formatNumber(sessionMetrics.totalSessions)}</p>
                        </div>
                        <Calendar className="w-8 h-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-600 text-sm font-medium">Total Bookings</p>
                          <p className="text-3xl font-bold text-green-800">{formatNumber(sessionMetrics.totalBookings)}</p>
                        </div>
                        <Users className="w-8 h-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-600 text-sm font-medium">Check-ins</p>
                          <p className="text-3xl font-bold text-purple-800">{formatNumber(sessionMetrics.totalCheckins)}</p>
                        </div>
                        <UserCheck className="w-8 h-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-600 text-sm font-medium">Attendance Rate</p>
                          <p className="text-3xl font-bold text-orange-800">{sessionMetrics.attendanceRate.toFixed(1)}%</p>
                        </div>
                        <Activity className="w-8 h-8 text-orange-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-white border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle>Class Type Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <OptimizedTable
                      data={sessionMetrics.classTypeBreakdown.map(([type, data]: [string, any]) => ({
                        classType: type,
                        sessions: data.sessions,
                        bookings: data.bookings,
                        checkins: data.checkins,
                        fillRate: data.bookings > 0 ? ((data.checkins / data.bookings) * 100).toFixed(1) + '%' : '0%'
                      }))}
                      columns={[
                        { key: 'classType', header: 'Class Type', align: 'left' },
                        { key: 'sessions', header: 'Sessions', render: (value) => formatNumber(value), align: 'center' },
                        { key: 'bookings', header: 'Bookings', render: (value) => formatNumber(value), align: 'center' },
                        { key: 'checkins', header: 'Check-ins', render: (value) => formatNumber(value), align: 'center' },
                        { key: 'fillRate', header: 'Fill Rate', align: 'center' }
                      ]}
                      maxHeight="400px"
                    />
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Trainers Tab */}
          <TabsContent value="trainers" className="space-y-8">
            {trainerMetrics && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-indigo-600 text-sm font-medium">Total Trainers</p>
                          <p className="text-3xl font-bold text-indigo-800">{formatNumber(trainerMetrics.totalTrainers)}</p>
                        </div>
                        <Users className="w-8 h-8 text-indigo-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-emerald-600 text-sm font-medium">Total Sessions</p>
                          <p className="text-3xl font-bold text-emerald-800">{formatNumber(trainerMetrics.totalSessions)}</p>
                        </div>
                        <Activity className="w-8 h-8 text-emerald-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-600 text-sm font-medium">Total Customers</p>
                          <p className="text-3xl font-bold text-blue-800">{formatNumber(trainerMetrics.totalCustomers)}</p>
                        </div>
                        <Target className="w-8 h-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-600 text-sm font-medium">Avg Class Size</p>
                          <p className="text-3xl font-bold text-purple-800">{trainerMetrics.averageClassSize.toFixed(1)}</p>
                        </div>
                        <Users className="w-8 h-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-white border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-yellow-600" />
                      Top Performing Trainers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <OptimizedTable
                      data={trainerMetrics.topTrainers}
                      columns={[
                        { key: 'name', header: 'Trainer Name', align: 'left' },
                        { key: 'customers', header: 'Total Customers', render: (value) => formatNumber(value), align: 'center' },
                        { key: 'sessions', header: 'Sessions', render: (value) => formatNumber(value), align: 'center' },
                        { key: 'retention', header: 'Retention', align: 'center' }
                      ]}
                      maxHeight="400px"
                    />
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-8">
            {clientMetrics && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-600 text-sm font-medium">New Clients</p>
                          <p className="text-3xl font-bold text-blue-800">{formatNumber(clientMetrics.totalNewClients)}</p>
                        </div>
                        <Users className="w-8 h-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-600 text-sm font-medium">Conversion Rate</p>
                          <p className="text-3xl font-bold text-green-800">{clientMetrics.conversionRate.toFixed(1)}%</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-600 text-sm font-medium">Retention Rate</p>
                          <p className="text-3xl font-bold text-purple-800">{clientMetrics.retentionRate.toFixed(1)}%</p>
                        </div>
                        <Award className="w-8 h-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="bg-white border-0 shadow-xl">
                    <CardHeader>
                      <CardTitle>Client Metrics Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-blue-700 font-medium">Total New Clients</span>
                        <span className="text-blue-900 font-bold">{formatNumber(clientMetrics.totalNewClients)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="text-green-700 font-medium">Converted Clients</span>
                        <span className="text-green-900 font-bold">{formatNumber(clientMetrics.convertedClients)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                        <span className="text-purple-700 font-medium">Retained Clients</span>
                        <span className="text-purple-900 font-bold">{formatNumber(clientMetrics.retainedClients)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                        <span className="text-orange-700 font-medium">Average LTV</span>
                        <span className="text-orange-900 font-bold">{formatCurrency(clientMetrics.averageLTV)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-0 shadow-xl">
                    <CardHeader>
                      <CardTitle>Performance Indicators</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Conversion Rate</span>
                            <span className="text-sm font-bold">{clientMetrics.conversionRate.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                              style={{ width: `${Math.min(clientMetrics.conversionRate, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Retention Rate</span>
                            <span className="text-sm font-bold">{clientMetrics.retentionRate.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-500 h-2 rounded-full transition-all duration-1000"
                              style={{ width: `${Math.min(clientMetrics.retentionRate, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        
        .delay-200 {
          animation-delay: 0.2s;
        }
        
        .delay-300 {
          animation-delay: 0.3s;
        }
      `}</style>
    </div>
  );
};

export default ExecutiveSummarySection;
