
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ModernDataTable } from '@/components/ui/ModernDataTable';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
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
  Dumbbell
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
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

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6366F1'];

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

  const loading = salesLoading || leadsLoading || discountLoading || sessionsLoading || payrollLoading || newClientLoading;

  // Filter data to previous month
  const previousMonthRange = getPreviousMonthDateRange();

  // Sales Metrics
  const salesMetrics = useMemo(() => {
    if (!salesData) return null;

    const filteredData = salesData.filter(item => {
      if (!item.paymentDate) return false;
      const itemDate = new Date(item.paymentDate);
      const startDate = new Date(previousMonthRange.start);
      const endDate = new Date(previousMonthRange.end);
      return itemDate >= startDate && itemDate <= endDate;
    });

    const totalRevenue = filteredData.reduce((sum: number, item: any) => sum + (item.paymentValue || 0), 0);
    const totalTransactions = filteredData.length;
    const uniqueMembers = new Set(filteredData.map((item: any) => item.memberId)).size;

    return {
      revenue: totalRevenue,
      transactions: totalTransactions,
      members: uniqueMembers,
      avgOrderValue: totalTransactions > 0 ? totalRevenue / totalTransactions : 0
    };
  }, [salesData, previousMonthRange]);

  // Sessions Metrics
  const sessionMetrics = useMemo(() => {
    if (!sessionsData) return null;

    const totalSessions = sessionsData.length;
    const totalCheckedIn = sessionsData.reduce((sum: number, item: any) => sum + (item.checkedIn || 0), 0);
    const totalCapacity = sessionsData.reduce((sum: number, item: any) => sum + (item.capacity || 0), 0);
    const fillRate = totalCapacity > 0 ? (totalCheckedIn / totalCapacity) * 100 : 0;

    return {
      totalSessions,
      totalCheckedIn,
      totalCapacity,
      fillRate,
      avgAttendance: totalSessions > 0 ? totalCheckedIn / totalSessions : 0
    };
  }, [sessionsData]);

  // Trainer Metrics
  const trainerMetrics = useMemo(() => {
    if (!payrollData) return null;

    const uniqueTrainers = new Set(payrollData.map((item: any) => item.teacherName)).size;
    const totalPaid = payrollData.reduce((sum: number, item: any) => sum + (item.totalPaid || 0), 0);
    const totalSessions = payrollData.reduce((sum: number, item: any) => sum + (item.totalSessions || 0), 0);

    return {
      uniqueTrainers,
      totalPaid,
      totalSessions,
      avgPayPerTrainer: uniqueTrainers > 0 ? totalPaid / uniqueTrainers : 0
    };
  }, [payrollData]);

  // New Client Metrics
  const clientMetrics = useMemo(() => {
    if (!newClientData) return null;

    const totalNewClients = newClientData.length;
    const totalLTV = newClientData.reduce((sum: number, item: any) => sum + (item.ltv || 0), 0);
    const convertedClients = newClientData.filter(item => item.conversionStatus === 'Converted').length;

    return {
      totalNewClients,
      avgLTV: totalNewClients > 0 ? totalLTV / totalNewClients : 0,
      conversionRate: totalNewClients > 0 ? (convertedClients / totalNewClients) * 100 : 0,
      totalLTV
    };
  }, [newClientData]);

  // Chart data
  const revenueChartData = useMemo(() => {
    if (!salesData) return [];
    
    const monthlyData = salesData.reduce((acc: Record<string, { month: string; revenue: number; transactions: number }>, item: any) => {
      const date = new Date(item.paymentDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthKey, revenue: 0, transactions: 0 };
      }
      
      acc[monthKey].revenue += item.paymentValue || 0;
      acc[monthKey].transactions += 1;
      
      return acc;
    }, {});

    return Object.values(monthlyData).slice(-6);
  }, [salesData]);

  const sessionFillRateData = useMemo(() => {
    if (!sessionsData) return [];

    const classTypeData = sessionsData.reduce((acc: Record<string, { name: string; value: number; count: number }>, item: any) => {
      const classType = item.cleanedClass || 'Unknown';
      if (!acc[classType]) {
        acc[classType] = { name: classType, value: 0, count: 0 };
      }
      acc[classType].value += item.fillPercentage || 0;
      acc[classType].count += 1;
      return acc;
    }, {});

    return Object.values(classTypeData).map((item: any) => ({
      name: item.name,
      value: item.count > 0 ? item.value / item.count : 0
    })).slice(0, 6);
  }, [sessionsData]);

  // Top performers data
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
        customers: trainer.totalCustomers || 0
      }));
  }, [payrollData]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <LoadingSkeleton type="full-page" />
      </div>
    );
  }

  const MetricCard = ({ title, value, subtitle, icon: Icon, color, trend }: any) => (
    <Card className={cn(
      "group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105",
      "bg-gradient-to-br from-white to-slate-50 border-0 shadow-lg animate-fade-in"
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
            {title}
          </CardTitle>
          {trend && (
            <Badge className="text-xs bg-green-100 text-green-700">
              {trend}
            </Badge>
          )}
        </div>
        <div className={cn(
          'p-3 rounded-xl group-hover:scale-110 transition-transform',
          color === 'blue' ? 'bg-blue-50 text-blue-600' :
          color === 'green' ? 'bg-green-50 text-green-600' :
          color === 'purple' ? 'bg-purple-50 text-purple-600' :
          'bg-orange-50 text-orange-600'
        )}>
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-2xl font-bold text-slate-900">
          {value}
        </div>
        <div className="text-sm text-slate-600">
          {subtitle}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Executive Dashboard</h1>
              <p className="text-slate-300">Comprehensive business performance overview - Previous Month</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-white/10 text-white border-white/30">
              Previous Month Data
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSourceModal(true)}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Sources
            </Button>
          </div>
        </div>

        {/* Source Data Info */}
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-5 h-5" />
            <span className="font-medium">Data Sources:</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-400" />
              <span>Sales</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-400" />
              <span>Sessions</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span>New Clients</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-orange-400" />
              <span>Trainers</span>
            </div>
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-pink-400" />
              <span>Leads</span>
            </div>
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-yellow-400" />
              <span>Discounts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="sales" className="gap-2">
            <DollarSign className="w-4 h-4" />
            Sales
          </TabsTrigger>
          <TabsTrigger value="sessions" className="gap-2">
            <Activity className="w-4 h-4" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="trainers" className="gap-2">
            <Dumbbell className="w-4 h-4" />
            Trainers
          </TabsTrigger>
          <TabsTrigger value="clients" className="gap-2">
            <UserPlus className="w-4 h-4" />
            Clients
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Revenue"
              value={formatCurrency(salesMetrics?.revenue || 0)}
              subtitle={`${salesMetrics?.transactions || 0} transactions`}
              icon={DollarSign}
              color="blue"
              trend="+12.5%"
            />
            <MetricCard
              title="Session Fill Rate"
              value={`${sessionMetrics?.fillRate.toFixed(1) || 0}%`}
              subtitle={`${sessionMetrics?.totalSessions || 0} sessions`}
              icon={Activity}
              color="green"
              trend="+8.2%"
            />
            <MetricCard
              title="New Clients"
              value={formatNumber(clientMetrics?.totalNewClients || 0)}
              subtitle={`${clientMetrics?.conversionRate.toFixed(1) || 0}% conversion`}
              icon={UserPlus}
              color="purple"
              trend="+15.3%"
            />
            <MetricCard
              title="Active Trainers"
              value={formatNumber(trainerMetrics?.uniqueTrainers || 0)}
              subtitle={`${formatCurrency(trainerMetrics?.avgPayPerTrainer || 0)} avg pay`}
              icon={Dumbbell}
              color="orange"
              trend="+5.7%"
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Revenue Trend (Last 6 Months)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value) => [formatCurrency(value as number), 'Revenue']} />
                    <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="#93C5FD" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  Class Fill Rates by Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sessionFillRateData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                    >
                      {sessionFillRateData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${(value as number).toFixed(1)}%`, 'Fill Rate']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Revenue"
                value={formatCurrency(salesMetrics?.revenue || 0)}
                subtitle="Previous month revenue"
                icon={DollarSign}
                color="blue"
              />
              <MetricCard
                title="Average Order"
                value={formatCurrency(salesMetrics?.avgOrderValue || 0)}
                subtitle="Per transaction"
                icon={Target}
                color="green"
              />
            </div>

            <ModernDataTable
              title="Top Performing Products"
              data={topProducts}
              columns={[
                { key: 'product', header: 'Product', align: 'left' },
                { key: 'revenue', header: 'Revenue', align: 'right', render: (value) => formatCurrency(value) },
                { key: 'transactions', header: 'Transactions', align: 'center', render: (value) => formatNumber(value) },
              ]}
            />
          </div>
        </TabsContent>

        <TabsContent value="sessions">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Sessions"
                value={formatNumber(sessionMetrics?.totalSessions || 0)}
                subtitle="Previous month"
                icon={Activity}
                color="green"
              />
              <MetricCard
                title="Fill Rate"
                value={`${sessionMetrics?.fillRate.toFixed(1) || 0}%`}
                subtitle="Average attendance"
                icon={Percent}
                color="blue"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Session Performance Chart</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sessionFillRateData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${(value as number).toFixed(1)}%`, 'Fill Rate']} />
                    <Bar dataKey="value" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trainers">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Active Trainers"
                value={formatNumber(trainerMetrics?.uniqueTrainers || 0)}
                subtitle="Total trainers"
                icon={Users}
                color="purple"
              />
              <MetricCard
                title="Total Payout"
                value={formatCurrency(trainerMetrics?.totalPaid || 0)}
                subtitle="Previous month"
                icon={DollarSign}
                color="green"
              />
            </div>

            <ModernDataTable
              title="Top Performing Trainers"
              data={topTrainers}
              columns={[
                { key: 'name', header: 'Trainer', align: 'left' },
                { key: 'totalPaid', header: 'Total Paid', align: 'right', render: (value) => formatCurrency(value) },
                { key: 'sessions', header: 'Sessions', align: 'center', render: (value) => formatNumber(value) },
                { key: 'customers', header: 'Customers', align: 'center', render: (value) => formatNumber(value) },
              ]}
            />
          </div>
        </TabsContent>

        <TabsContent value="clients">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="New Clients"
                value={formatNumber(clientMetrics?.totalNewClients || 0)}
                subtitle="Previous month"
                icon={UserPlus}
                color="blue"
              />
              <MetricCard
                title="Conversion Rate"
                value={`${clientMetrics?.conversionRate.toFixed(1) || 0}%`}
                subtitle="Lead to client"
                icon={TrendingUp}
                color="green"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Client Metrics Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-lg font-bold text-blue-900">
                      {formatCurrency(clientMetrics?.avgLTV || 0)}
                    </div>
                    <div className="text-sm text-blue-700">Average LTV</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-900">
                      {formatCurrency(clientMetrics?.totalLTV || 0)}
                    </div>
                    <div className="text-sm text-green-700">Total LTV</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader>
                <CardTitle className="text-green-800">Key Performance Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-green-700">
                <div>
                  <strong>Revenue Growth:</strong> Previous month revenue was {formatCurrency(salesMetrics?.revenue || 0)}
                </div>
                <div>
                  <strong>Session Utilization:</strong> {sessionMetrics?.fillRate.toFixed(1)}% average fill rate
                </div>
                <div>
                  <strong>Client Acquisition:</strong> {formatNumber(clientMetrics?.totalNewClients || 0)} new clients acquired
                </div>
                <div>
                  <strong>Staff Performance:</strong> {formatNumber(trainerMetrics?.uniqueTrainers || 0)} active trainers
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="text-blue-800">Growth Opportunities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-blue-700">
                <div>
                  <strong>Session Capacity:</strong> Potential to increase utilization by {(100 - (sessionMetrics?.fillRate || 0)).toFixed(1)}%
                </div>
                <div>
                  <strong>Average Order Value:</strong> {formatCurrency(salesMetrics?.avgOrderValue || 0)} per transaction
                </div>
                <div>
                  <strong>Trainer Efficiency:</strong> {formatCurrency(trainerMetrics?.avgPayPerTrainer || 0)} average payout per trainer
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExecutiveSummarySection;
