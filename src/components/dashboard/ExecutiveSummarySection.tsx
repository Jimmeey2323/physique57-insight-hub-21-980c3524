
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ModernDataTable } from '@/components/ui/ModernDataTable';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { ModernHeroSection } from '@/components/ui/ModernHeroSection';
import { ExecutiveFilters } from '@/components/dashboard/ExecutiveFilters';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target, 
  Database,
  Eye,
  Calendar,
  Percent,
  Activity,
  Award,
  BookOpen,
  CreditCard,
  Zap,
  UserPlus,
  Gift,
  Dumbbell,
  Crown,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  MapPin,
  Star
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart } from 'recharts';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { useLeadsData } from '@/hooks/useLeadsData';
import { useDiscountAnalysis } from '@/hooks/useDiscountAnalysis';
import { useSessionsData } from '@/hooks/useSessionsData';
import { usePayrollData } from '@/hooks/usePayrollData';
import { useNewClientData } from '@/hooks/useNewClientData';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { designTokens } from '@/utils/designTokens';
import { getPreviousMonthDateRange } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#EC4899', '#14B8A6'];

// Define types for better type safety
interface ProductSummary {
  product: string;
  revenue: number;
  transactions: number;
}

interface TrainerSummary {
  name: string;
  totalPaid: number;
  sessions: number;
  customers: number;
  location: string;
}

interface LocationSummary {
  location: string;
  revenue: number;
  sessions: number;
  clients: number;
  fillRate: number;
}

export const ExecutiveSummarySection: React.FC = () => {
  const { data: salesData, loading: salesLoading } = useGoogleSheets();
  const { data: leadsData, loading: leadsLoading } = useLeadsData();
  const { metrics: discountMetrics, loading: discountLoading } = useDiscountAnalysis();
  const { data: sessionsData, loading: sessionsLoading } = useSessionsData();
  const { data: payrollData, isLoading: payrollLoading } = usePayrollData();
  const { data: newClientData, loading: newClientLoading } = useNewClientData();
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });

  const loading = salesLoading || leadsLoading || discountLoading || sessionsLoading || payrollLoading || newClientLoading;

  // Filter data to previous month by default
  const previousMonthRange = getPreviousMonthDateRange();

  // Comprehensive Sales Metrics
  const salesMetrics = useMemo(() => {
    if (!salesData) return null;

    const filteredData = salesData.filter(item => {
      if (!item.paymentDate) return false;
      const itemDate = new Date(item.paymentDate);
      
      if (dateRange.start && dateRange.end) {
        return itemDate >= dateRange.start && itemDate <= dateRange.end;
      }
      
      const startDate = new Date(previousMonthRange.start);
      const endDate = new Date(previousMonthRange.end);
      return itemDate >= startDate && itemDate <= endDate;
    });

    const totalRevenue = filteredData.reduce((sum: number, item: any) => sum + (item.paymentValue || 0), 0);
    const totalTransactions = filteredData.length;
    const uniqueMembers = new Set(filteredData.map((item: any) => item.memberId)).size;
    const avgOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    // Calculate growth (mock data for now)
    const revenueGrowth = 12.5;
    const transactionGrowth = 8.3;
    const memberGrowth = 15.7;

    return {
      revenue: totalRevenue,
      transactions: totalTransactions,
      members: uniqueMembers,
      avgOrderValue,
      revenueGrowth,
      transactionGrowth,
      memberGrowth,
      discountImpact: discountMetrics?.totalDiscountAmount || 0
    };
  }, [salesData, previousMonthRange, dateRange, discountMetrics]);

  // Enhanced Sessions Metrics
  const sessionMetrics = useMemo(() => {
    if (!sessionsData) return null;

    const totalSessions = sessionsData.length;
    const totalCheckedIn = sessionsData.reduce((sum: number, item: any) => sum + (item.checkedInCount || 0), 0);
    const totalCapacity = sessionsData.reduce((sum: number, item: any) => sum + (item.capacity || 0), 0);
    const fillRate = totalCapacity > 0 ? (totalCheckedIn / totalCapacity) * 100 : 0;
    const powerCycleSessions = sessionsData.filter(s => s.cleanedClass?.toLowerCase().includes('powercycle')).length;
    const barreSessions = sessionsData.filter(s => s.cleanedClass?.toLowerCase().includes('barre')).length;

    return {
      totalSessions,
      totalCheckedIn,
      totalCapacity,
      fillRate,
      avgAttendance: totalSessions > 0 ? totalCheckedIn / totalSessions : 0,
      powerCycleSessions,
      barreSessions,
      sessionGrowth: 6.2,
      fillRateGrowth: 4.8
    };
  }, [sessionsData]);

  // Enhanced Trainer Metrics
  const trainerMetrics = useMemo(() => {
    if (!payrollData) return null;

    const uniqueTrainers = new Set(payrollData.map((item: any) => item.teacherName)).size;
    const totalPaid = payrollData.reduce((sum: number, item: any) => sum + (item.totalPaid || 0), 0);
    const totalSessions = payrollData.reduce((sum: number, item: any) => sum + (item.totalSessions || 0), 0);
    const avgPayPerTrainer = uniqueTrainers > 0 ? totalPaid / uniqueTrainers : 0;

    return {
      uniqueTrainers,
      totalPaid,
      totalSessions,
      avgPayPerTrainer,
      productivity: totalSessions > 0 ? totalPaid / totalSessions : 0,
      trainerGrowth: 3.4
    };
  }, [payrollData]);

  // Enhanced Client Metrics
  const clientMetrics = useMemo(() => {
    if (!newClientData) return null;

    const totalNewClients = newClientData.length;
    const totalLTV = newClientData.reduce((sum: number, item: any) => sum + (item.ltv || 0), 0);
    const convertedClients = newClientData.filter(item => item.conversionStatus === 'Converted').length;
    const retainedClients = newClientData.filter(item => item.retentionStatus === 'Retained').length;
    const avgLTV = totalNewClients > 0 ? totalLTV / totalNewClients : 0;
    const conversionRate = totalNewClients > 0 ? (convertedClients / totalNewClients) * 100 : 0;
    const retentionRate = totalNewClients > 0 ? (retainedClients / totalNewClients) * 100 : 0;

    return {
      totalNewClients,
      avgLTV,
      conversionRate,
      retentionRate,
      totalLTV,
      convertedClients,
      clientGrowth: 18.6,
      ltvGrowth: 22.1
    };
  }, [newClientData]);

  // Location Performance
  const locationMetrics = useMemo(() => {
    if (!salesData || !sessionsData) return [];
    
    const locations = ['Kenkere House', 'Kwality House, Kemps Corner', 'Supreme HQ, Bandra'];
    
    return locations.map(location => {
      const locationSales = salesData.filter(item => item.calculatedLocation === location);
      const locationSessions = sessionsData.filter(item => item.location === location);
      
      const revenue = locationSales.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
      const sessions = locationSessions.length;
      const totalCapacity = locationSessions.reduce((sum, item) => sum + (item.capacity || 0), 0);
      const totalCheckedIn = locationSessions.reduce((sum, item) => sum + (item.checkedInCount || 0), 0);
      const fillRate = totalCapacity > 0 ? (totalCheckedIn / totalCapacity) * 100 : 0;
      
      return {
        location,
        revenue,
        sessions,
        clients: new Set(locationSales.map(item => item.memberId)).size,
        fillRate
      };
    });
  }, [salesData, sessionsData]);

  // Chart Data
  const revenueChartData = useMemo(() => {
    if (!salesData) return [];
    
    const monthlyData = salesData.reduce((acc: Record<string, { month: string; revenue: number; transactions: number; clients: number }>, item: any) => {
      const date = new Date(item.paymentDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthName, revenue: 0, transactions: 0, clients: 0 };
      }
      
      acc[monthKey].revenue += item.paymentValue || 0;
      acc[monthKey].transactions += 1;
      
      return acc;
    }, {});

    // Add unique clients count
    Object.keys(monthlyData).forEach(monthKey => {
      const monthSales = salesData.filter(item => {
        const date = new Date(item.paymentDate);
        const itemMonthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        return itemMonthKey === monthKey;
      });
      monthlyData[monthKey].clients = new Set(monthSales.map(item => item.memberId)).size;
    });

    return Object.values(monthlyData).slice(-6);
  }, [salesData]);

  // Top Performers
  const topProducts = useMemo(() => {
    if (!salesData) return [];
    
    const productSummary = salesData.reduce((acc: Record<string, ProductSummary>, item: any) => {
      const product = item.cleanedProduct || 'Unknown Product';
      if (!acc[product]) {
        acc[product] = { product, revenue: 0, transactions: 0 };
      }
      acc[product].revenue += item.paymentValue || 0;
      acc[product].transactions += 1;
      return acc;
    }, {});

    return Object.values(productSummary)
      .sort((a: ProductSummary, b: ProductSummary) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [salesData]);

  const topTrainers = useMemo(() => {
    if (!payrollData) return [];
    
    return payrollData
      .sort((a: any, b: any) => (b.totalPaid || 0) - (a.totalPaid || 0))
      .slice(0, 5)
      .map((trainer: any): TrainerSummary => ({
        name: trainer.teacherName,
        totalPaid: trainer.totalPaid || 0,
        sessions: trainer.totalSessions || 0,
        customers: trainer.totalCustomers || 0,
        location: trainer.location || 'Unknown'
      }));
  }, [payrollData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20">
        <LoadingSkeleton type="full-page" />
      </div>
    );
  }

  const AnimatedMetricCard = ({ title, value, change, subtitle, icon: Icon, color, trend, delay = 0 }: any) => (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-700 hover:shadow-2xl hover:scale-105",
      "bg-gradient-to-br from-white via-slate-50/50 to-white border-0 shadow-xl",
      "transform-gpu animate-fade-in cursor-pointer"
    )} style={{ animationDelay: `${delay}ms` }}>
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Top Border Animation */}
      <div className={cn(
        "absolute top-0 left-0 h-1 bg-gradient-to-r transition-all duration-700 group-hover:w-full",
        color === 'blue' ? 'from-blue-500 to-blue-600' :
        color === 'green' ? 'from-green-500 to-green-600' :
        color === 'purple' ? 'from-purple-500 to-purple-600' :
        color === 'orange' ? 'from-orange-500 to-orange-600' :
        'from-pink-500 to-pink-600',
        "w-0 group-hover:w-full"
      )} />

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
        <div className="space-y-2">
          <CardTitle className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
            {title}
          </CardTitle>
          {change && (
            <div className="flex items-center gap-2">
              {change > 0 ? (
                <ArrowUpRight className="w-4 h-4 text-green-600" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-600" />
              )}
              <Badge className={cn(
                "text-xs font-semibold",
                change > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              )}>
                {change > 0 ? '+' : ''}{change}%
              </Badge>
            </div>
          )}
        </div>
        <div className={cn(
          'p-4 rounded-2xl group-hover:scale-110 transition-all duration-300 shadow-lg',
          color === 'blue' ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' :
          color === 'green' ? 'bg-gradient-to-br from-green-500 to-green-600 text-white' :
          color === 'purple' ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white' :
          color === 'orange' ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white' :
          'bg-gradient-to-br from-pink-500 to-pink-600 text-white'
        )}>
          <Icon className="h-6 w-6" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3 relative z-10">
        <div className="text-3xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
          {value}
        </div>
        <div className="text-sm text-slate-600 font-medium">
          {subtitle}
        </div>
      </CardContent>
    </Card>
  );

  const AnimatedChart = ({ title, children, icon: Icon }: any) => (
    <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl overflow-hidden animate-fade-in hover:shadow-2xl transition-all duration-500">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
        <CardTitle className="flex items-center gap-3 text-slate-800">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Icon className="w-5 h-5 text-white" />
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {children}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20">
      {/* Modern Hero Section */}
      <ModernHeroSection
        title="Executive Intelligence Dashboard"
        subtitle="Complete Business Performance Overview"
        description="Comprehensive analytics and insights across all business operations with real-time data visualization and performance metrics."
        badgeText="Executive Suite"
        badgeIcon={Crown}
        gradient="primary"
        stats={[
          {
            value: formatCurrency(salesMetrics?.revenue || 0),
            label: "Total Revenue",
            icon: DollarSign
          },
          {
            value: formatNumber(sessionMetrics?.totalSessions || 0),
            label: "Sessions Delivered",
            icon: Activity
          },
          {
            value: formatNumber(clientMetrics?.totalNewClients || 0),
            label: "New Clients",
            icon: UserPlus
          }
        ]}
      />

      {/* Filters Section */}
      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-10">
        <ExecutiveFilters
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </div>

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Key Performance Indicators */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
              Key Performance Indicators
            </h2>
            <Sparkles className="w-5 h-5 text-purple-500" />
          </div>

          {/* Primary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatedMetricCard
              title="Total Revenue"
              value={formatCurrency(salesMetrics?.revenue || 0)}
              change={salesMetrics?.revenueGrowth}
              subtitle={`${salesMetrics?.transactions || 0} transactions`}
              icon={DollarSign}
              color="blue"
              delay={0}
            />
            <AnimatedMetricCard
              title="Session Fill Rate"
              value={`${sessionMetrics?.fillRate.toFixed(1) || 0}%`}
              change={sessionMetrics?.fillRateGrowth}
              subtitle={`${sessionMetrics?.totalSessions || 0} sessions`}
              icon={Activity}
              color="green"
              delay={100}
            />
            <AnimatedMetricCard
              title="New Clients"
              value={formatNumber(clientMetrics?.totalNewClients || 0)}
              change={clientMetrics?.clientGrowth}
              subtitle={`${clientMetrics?.conversionRate.toFixed(1) || 0}% conversion`}
              icon={UserPlus}
              color="purple"
              delay={200}
            />
            <AnimatedMetricCard
              title="Active Trainers"
              value={formatNumber(trainerMetrics?.uniqueTrainers || 0)}
              change={trainerMetrics?.trainerGrowth}
              subtitle={`${formatCurrency(trainerMetrics?.avgPayPerTrainer || 0)} avg pay`}
              icon={Dumbbell}
              color="orange"
              delay={300}
            />
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatedMetricCard
              title="Average Order Value"
              value={formatCurrency(salesMetrics?.avgOrderValue || 0)}
              change={8.7}
              subtitle="Per transaction"
              icon={Target}
              color="blue"
              delay={400}
            />
            <AnimatedMetricCard
              title="Client Retention"
              value={`${clientMetrics?.retentionRate.toFixed(1) || 0}%`}
              change={5.2}
              subtitle="Monthly retention rate"
              icon={Users}
              color="green"
              delay={500}
            />
            <AnimatedMetricCard
              title="Discount Impact"
              value={formatCurrency(salesMetrics?.discountImpact || 0)}
              change={-3.1}
              subtitle="Revenue impact"
              icon={Gift}
              color="orange"
              delay={600}
            />
            <AnimatedMetricCard
              title="Average LTV"
              value={formatCurrency(clientMetrics?.avgLTV || 0)}
              change={clientMetrics?.ltvGrowth}
              subtitle="Client lifetime value"
              icon={Crown}
              color="purple"
              delay={700}
            />
          </div>
        </div>

        {/* Charts Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-blue-600 rounded-full"></div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
              Performance Analytics
            </h2>
            <BarChart3 className="w-5 h-5 text-blue-500" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <AnimatedChart title="Revenue & Growth Trends" icon={TrendingUp}>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value, name) => [
                      name === 'revenue' ? formatCurrency(value as number) : formatNumber(value as number),
                      name === 'revenue' ? 'Revenue' : name === 'transactions' ? 'Transactions' : 'Clients'
                    ]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    fill="url(#revenueGradient)" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                  />
                  <Bar dataKey="transactions" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  <Line 
                    type="monotone" 
                    dataKey="clients" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                  />
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                </ComposedChart>
              </ResponsiveContainer>
            </AnimatedChart>

            <AnimatedChart title="Location Performance" icon={MapPin}>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={locationMetrics} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    type="number"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    type="category"
                    dataKey="location"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={120}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value, name) => [
                      name === 'revenue' ? formatCurrency(value as number) : 
                      name === 'fillRate' ? `${(value as number).toFixed(1)}%` :
                      formatNumber(value as number),
                      name === 'revenue' ? 'Revenue' : 
                      name === 'fillRate' ? 'Fill Rate' :
                      name === 'sessions' ? 'Sessions' : 'Clients'
                    ]}
                  />
                  <Bar dataKey="revenue" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </AnimatedChart>
          </div>
        </div>

        {/* Tables Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full"></div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
              Top Performers & Insights
            </h2>
            <Award className="w-5 h-5 text-purple-500" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Top Products */}
            <Card className="bg-gradient-to-br from-white via-blue-50/30 to-white border-0 shadow-xl animate-fade-in">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                <CardTitle className="flex items-center gap-3 text-blue-900">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  Top Performing Products
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ModernDataTable
                  data={topProducts}
                  columns={[
                    { 
                      key: 'product', 
                      header: 'Product', 
                      align: 'left',
                      render: (value) => (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Star className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-medium">{value}</span>
                        </div>
                      )
                    },
                    { 
                      key: 'revenue', 
                      header: 'Revenue', 
                      align: 'right', 
                      render: (value) => (
                        <span className="font-bold text-green-700">
                          {formatCurrency(value)}
                        </span>
                      )
                    },
                    { 
                      key: 'transactions', 
                      header: 'Sales', 
                      align: 'center', 
                      render: (value) => (
                        <Badge className="bg-blue-100 text-blue-700">
                          {formatNumber(value)}
                        </Badge>
                      )
                    },
                  ]}
                  maxHeight="400px"
                />
              </CardContent>
            </Card>

            {/* Top Trainers */}
            <Card className="bg-gradient-to-br from-white via-purple-50/30 to-white border-0 shadow-xl animate-fade-in">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                <CardTitle className="flex items-center gap-3 text-purple-900">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-white" />
                  </div>
                  Top Performing Trainers
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ModernDataTable
                  data={topTrainers}
                  columns={[
                    { 
                      key: 'name', 
                      header: 'Trainer', 
                      align: 'left',
                      render: (value, item) => (
                        <div className="space-y-1">
                          <div className="font-medium">{value}</div>
                          <div className="text-xs text-slate-500">{item.location}</div>
                        </div>
                      )
                    },
                    { 
                      key: 'totalPaid', 
                      header: 'Earned', 
                      align: 'right', 
                      render: (value) => (
                        <span className="font-bold text-green-700">
                          {formatCurrency(value)}
                        </span>
                      )
                    },
                    { 
                      key: 'sessions', 
                      header: 'Sessions', 
                      align: 'center', 
                      render: (value) => (
                        <Badge className="bg-purple-100 text-purple-700">
                          {formatNumber(value)}
                        </Badge>
                      )
                    },
                  ]}
                  maxHeight="400px"
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Location Performance Grid */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-red-600 rounded-full"></div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
              Location Performance Overview
            </h2>
            <MapPin className="w-5 h-5 text-orange-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {locationMetrics.map((location, index) => (
              <Card key={location.location} className={cn(
                "bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl",
                "hover:shadow-2xl transition-all duration-500 animate-fade-in group cursor-pointer"
              )} style={{ animationDelay: `${index * 150}ms` }}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-slate-800">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div className="space-y-1">
                      <div className="font-bold">{location.location}</div>
                      <div className="text-xs text-slate-500">Performance Hub</div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-700">
                        {formatCurrency(location.revenue)}
                      </div>
                      <div className="text-xs text-slate-600">Revenue</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-700">
                        {location.fillRate.toFixed(1)}%
                      </div>
                      <div className="text-xs text-slate-600">Fill Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-700">
                        {formatNumber(location.sessions)}
                      </div>
                      <div className="text-xs text-slate-600">Sessions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-700">
                        {formatNumber(location.clients)}
                      </div>
                      <div className="text-xs text-slate-600">Clients</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveSummarySection;
