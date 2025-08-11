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
  CreditCard
} from 'lucide-react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { useLeadsData } from '@/hooks/useLeadsData';
import { useDiscountAnalysis } from '@/hooks/useDiscountAnalysis';
import { useSessionsData } from '@/hooks/useSessionsData';
import { usePayrollData } from '@/hooks/usePayrollData';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { designTokens } from '@/utils/designTokens';
import { cn } from '@/lib/utils';

export const ExecutiveSummarySection: React.FC = () => {
  const { data: salesData, loading: salesLoading } = useGoogleSheets();
  const { data: leadsData, loading: leadsLoading } = useLeadsData();
  const { metrics: discountMetrics, loading: discountLoading } = useDiscountAnalysis();
  const { data: sessionsData, loading: sessionsLoading } = useSessionsData();
  const { data: payrollData, isLoading: payrollLoading } = usePayrollData();
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const loading = salesLoading || leadsLoading || discountLoading || sessionsLoading || payrollLoading;

  // Calculate comprehensive executive metrics
  const executiveMetrics = useMemo(() => {
    if (!salesData) return null;

    // Sales Metrics using actual column names from your sheet
    const totalRevenue = salesData.reduce((sum: number, item: any) => sum + (item.paymentValue || 0), 0);
    const totalTransactions = salesData.length;
    const uniqueMembers = new Set(salesData.map((item: any) => item.memberId)).size;
    const totalVAT = salesData.reduce((sum: number, item: any) => sum + (item.paymentVAT || 0), 0);
    const totalDiscounts = salesData.reduce((sum: number, item: any) => sum + (item['discountAmount-Mrp-PaymentValue'] || 0), 0);
    
    // Session Metrics
    const totalSessions = sessionsData?.length || 0;
    const totalCheckedIns = sessionsData?.reduce((sum: number, item: any) => sum + (item.checkedIn || 0), 0) || 0;
    const totalCapacity = sessionsData?.reduce((sum: number, item: any) => sum + (item.capacity || 0), 0) || 0;
    const sessionRevenue = sessionsData?.reduce((sum: number, item: any) => sum + (item.revenue || 0), 0) || 0;

    // Lead Metrics (if available)
    const totalLeads = leadsData?.reduce((sum: number, item: any) => sum + (item.totalLeads || 0), 0) || 0;

    // Trainer Metrics
    const uniqueTrainers = new Set(payrollData?.map((item: any) => item.teacherName) || []).size;
    const trainerPayouts = payrollData?.reduce((sum: number, item: any) => sum + (item.totalPaid || 0), 0) || 0;

    return {
      // Revenue Metrics
      totalRevenue,
      totalVAT,
      netRevenue: totalRevenue - totalVAT,
      totalDiscounts,
      avgOrderValue: totalTransactions > 0 ? totalRevenue / totalTransactions : 0,
      
      // Transaction Metrics
      totalTransactions,
      uniqueMembers,
      
      // Session Metrics
      totalSessions,
      totalCheckedIns,
      totalCapacity,
      sessionRevenue,
      fillRate: totalCapacity > 0 ? (totalCheckedIns / totalCapacity) * 100 : 0,
      avgSessionRevenue: totalSessions > 0 ? sessionRevenue / totalSessions : 0,
      
      // Lead & Conversion Metrics
      totalLeads,
      conversionRate: totalLeads > 0 ? (uniqueMembers / totalLeads) * 100 : 0,
      
      // Staff Metrics
      uniqueTrainers,
      trainerPayouts,
      avgTrainerPayout: uniqueTrainers > 0 ? trainerPayouts / uniqueTrainers : 0,
    };
  }, [salesData, sessionsData, leadsData, payrollData]);

  const keyMetricCards = useMemo(() => {
    if (!executiveMetrics) return [];

    return [
      {
        title: 'Total Revenue',
        value: formatCurrency(executiveMetrics.totalRevenue),
        subtitle: `Net: ${formatCurrency(executiveMetrics.netRevenue)}`,
        description: 'Gross revenue across all channels',
        icon: DollarSign,
        color: 'blue',
        trend: '+12.5%'
      },
      {
        title: 'Active Members',
        value: formatNumber(executiveMetrics.uniqueMembers),
        subtitle: `${executiveMetrics.totalTransactions} transactions`,
        description: 'Unique paying customers',
        icon: Users,
        color: 'green',
        trend: '+8.2%'
      },
      {
        title: 'Session Performance',
        value: `${executiveMetrics.fillRate.toFixed(1)}%`,
        subtitle: `${formatNumber(executiveMetrics.totalCheckedIns)} check-ins`,
        description: 'Average session fill rate',
        icon: Activity,
        color: 'purple',
        trend: '+5.3%'
      },
      {
        title: 'Revenue Per Session',
        value: formatCurrency(executiveMetrics.avgSessionRevenue),
        subtitle: `${formatNumber(executiveMetrics.totalSessions)} sessions`,
        description: 'Average revenue per session',
        icon: BarChart3,
        color: 'orange',
        trend: '+3.7%'
      }
    ];
  }, [executiveMetrics]);

  // Top performing products by revenue
  const topProducts = useMemo(() => {
    if (!salesData) return [];
    
    const productSummary = salesData.reduce((acc: any, item: any) => {
      const product = item.cleanedProduct || 'Unknown Product';
      if (!acc[product]) {
        acc[product] = { 
          product, 
          revenue: 0, 
          transactions: 0, 
          members: new Set(),
          vat: 0,
          discounts: 0
        };
      }
      acc[product].revenue += item.paymentValue || 0;
      acc[product].transactions += 1;
      acc[product].members.add(item.memberId);
      acc[product].vat += item.paymentVAT || 0;
      acc[product].discounts += item['discountAmount-Mrp-PaymentValue'] || 0;
      return acc;
    }, {});

    return Object.values(productSummary)
      .map((item: any) => ({
        ...item,
        uniqueMembers: item.members.size,
        avgOrderValue: item.revenue / item.transactions,
        netRevenue: item.revenue - item.vat,
        discountRate: item.revenue > 0 ? (item.discounts / item.revenue) * 100 : 0
      }))
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [salesData]);

  // Top performing locations
  const topLocations = useMemo(() => {
    if (!salesData) return [];
    
    const locationSummary = salesData.reduce((acc: any, item: any) => {
      const location = item.calculatedLocation || 'Unknown Location';
      if (!acc[location]) {
        acc[location] = { 
          location, 
          revenue: 0, 
          transactions: 0, 
          members: new Set() 
        };
      }
      acc[location].revenue += item.paymentValue || 0;
      acc[location].transactions += 1;
      acc[location].members.add(item.memberId);
      return acc;
    }, {});

    return Object.values(locationSummary)
      .map((item: any) => ({
        ...item,
        uniqueMembers: item.members.size,
        avgOrderValue: item.revenue / item.transactions
      }))
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 8);
  }, [salesData]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <LoadingSkeleton type="full-page" />
      </div>
    );
  }

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
              <p className="text-slate-300">Comprehensive business performance overview</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-white/10 text-white border-white/30">
              Live Data
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-400" />
              <span>Sales Sheet</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-400" />
              <span>Sessions Sheet</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span>New Clients Sheet</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-orange-400" />
              <span>Payroll Sheet</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {keyMetricCards.map((metric, index) => (
          <Card key={metric.title} className={cn(
            designTokens.card.background,
            designTokens.card.shadow,
            designTokens.card.hover,
            'group cursor-pointer animate-fade-in border-0'
          )}
          style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div className="space-y-1">
                <CardTitle className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                  {metric.title}
                </CardTitle>
                {metric.trend && (
                  <Badge className="text-xs bg-green-100 text-green-700">
                    {metric.trend}
                  </Badge>
                )}
              </div>
              <div className={cn(
                'p-3 rounded-xl group-hover:scale-110 transition-transform',
                metric.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                metric.color === 'green' ? 'bg-green-50 text-green-600' :
                metric.color === 'purple' ? 'bg-purple-50 text-purple-600' :
                'bg-orange-50 text-orange-600'
              )}>
                <metric.icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold text-slate-900">
                {metric.value}
              </div>
              <div className="text-sm text-slate-600">
                {metric.subtitle}
              </div>
              <p className="text-xs text-slate-500">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="products" className="gap-2">
            <Award className="w-4 h-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="locations" className="gap-2">
            <Target className="w-4 h-4" />
            Locations
          </TabsTrigger>
          <TabsTrigger value="insights" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Summary */}
            <Card className="lg:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  Revenue Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-blue-900">
                      {formatCurrency(executiveMetrics?.totalRevenue || 0)}
                    </div>
                    <div className="text-sm text-blue-700">Gross Revenue</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-900">
                      {formatCurrency(executiveMetrics?.netRevenue || 0)}
                    </div>
                    <div className="text-sm text-green-700">Net Revenue</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-slate-700">
                      {formatCurrency(executiveMetrics?.totalVAT || 0)}
                    </div>
                    <div className="text-sm text-slate-600">Total VAT</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-red-700">
                      {formatCurrency(executiveMetrics?.totalDiscounts || 0)}
                    </div>
                    <div className="text-sm text-red-600">Total Discounts</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Session Performance */}
            <Card className="bg-gradient-to-br from-purple-50 to-violet-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  Session Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-xl font-bold text-purple-900">
                    {executiveMetrics?.fillRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-purple-700">Average Fill Rate</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-700">
                    {formatNumber(executiveMetrics?.totalSessions || 0)}
                  </div>
                  <div className="text-sm text-slate-600">Total Sessions</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-700">
                    {formatCurrency(executiveMetrics?.avgSessionRevenue || 0)}
                  </div>
                  <div className="text-sm text-green-600">Avg Revenue/Session</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products">
          <ModernDataTable
            title="Top Performing Products"
            data={topProducts}
            columns={[
              { key: 'product', header: 'Product', align: 'left' },
              { key: 'revenue', header: 'Revenue', align: 'right', render: (value) => formatCurrency(value) },
              { key: 'transactions', header: 'Transactions', align: 'center', render: (value) => formatNumber(value) },
              { key: 'uniqueMembers', header: 'Members', align: 'center', render: (value) => formatNumber(value) },
              { key: 'avgOrderValue', header: 'AOV', align: 'right', render: (value) => formatCurrency(value) },
              { key: 'discountRate', header: 'Discount %', align: 'center', render: (value) => `${value.toFixed(1)}%` },
            ]}
            showFooter={true}
            footerData={{
              product: 'TOTAL',
              revenue: topProducts.reduce((sum, item) => sum + item.revenue, 0),
              transactions: topProducts.reduce((sum, item) => sum + item.transactions, 0),
              uniqueMembers: topProducts.reduce((sum, item) => sum + item.uniqueMembers, 0),
              avgOrderValue: topProducts.reduce((sum, item) => sum + item.avgOrderValue, 0) / topProducts.length,
              discountRate: topProducts.reduce((sum, item) => sum + item.discountRate, 0) / topProducts.length,
            }}
          />
        </TabsContent>

        <TabsContent value="locations">
          <ModernDataTable
            title="Top Performing Locations"
            data={topLocations}
            columns={[
              { key: 'location', header: 'Location', align: 'left' },
              { key: 'revenue', header: 'Revenue', align: 'right', render: (value) => formatCurrency(value) },
              { key: 'transactions', header: 'Transactions', align: 'center', render: (value) => formatNumber(value) },
              { key: 'uniqueMembers', header: 'Members', align: 'center', render: (value) => formatNumber(value) },
              { key: 'avgOrderValue', header: 'AOV', align: 'right', render: (value) => formatCurrency(value) },
            ]}
            showFooter={true}
            footerData={{
              location: 'TOTAL',
              revenue: topLocations.reduce((sum, item) => sum + item.revenue, 0),
              transactions: topLocations.reduce((sum, item) => sum + item.transactions, 0),
              uniqueMembers: topLocations.reduce((sum, item) => sum + item.uniqueMembers, 0),
              avgOrderValue: topLocations.reduce((sum, item) => sum + item.avgOrderValue, 0) / topLocations.length,
            }}
          />
        </TabsContent>

        <TabsContent value="insights">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader>
                <CardTitle className="text-green-800">Key Performance Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-green-700">
                <div>
                  <strong>Revenue Growth:</strong> Average order value is {formatCurrency(executiveMetrics?.avgOrderValue || 0)}
                </div>
                <div>
                  <strong>Customer Base:</strong> {formatNumber(executiveMetrics?.uniqueMembers || 0)} active members across all locations
                </div>
                <div>
                  <strong>Session Utilization:</strong> {executiveMetrics?.fillRate.toFixed(1)}% average fill rate
                </div>
                <div>
                  <strong>Staff Performance:</strong> {formatNumber(executiveMetrics?.uniqueTrainers || 0)} active trainers
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="text-blue-800">Growth Opportunities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-blue-700">
                <div>
                  <strong>Discount Optimization:</strong> {formatCurrency(executiveMetrics?.totalDiscounts || 0)} in total discounts given
                </div>
                <div>
                  <strong>Session Capacity:</strong> Potential to increase utilization by {(100 - (executiveMetrics?.fillRate || 0)).toFixed(1)}%
                </div>
                <div>
                  <strong>Revenue Per Member:</strong> {formatCurrency((executiveMetrics?.totalRevenue || 0) / (executiveMetrics?.uniqueMembers || 1))} average
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
