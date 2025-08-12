
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Calendar,
  Activity,
  Target,
  Percent,
  ExternalLink,
  ArrowRight,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import { useSalesData } from '@/hooks/useSalesData';
import { useSessionsData } from '@/hooks/useSessionsData';
import { useNewClientData } from '@/hooks/useNewClientData';
import { useLeadsData } from '@/hooks/useLeadsData';
import { usePayrollData } from '@/hooks/usePayrollData';
import { DrillDownModal } from '@/components/dashboard/DrillDownModal';
import { useNavigate } from 'react-router-dom';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  onClick?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend = 'neutral',
  onClick 
}) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3" />;
      case 'down': return <TrendingDown className="w-3 h-3" />;
      default: return null;
    }
  };

  return (
    <Card 
      className={`bg-white hover:shadow-lg transition-all duration-300 ${onClick ? 'cursor-pointer hover:scale-105' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {change !== undefined && (
              <div className={`flex items-center gap-1 ${getTrendColor()}`}>
                {getTrendIcon()}
                <span className="text-xs font-medium">
                  {change > 0 ? '+' : ''}{change}%
                </span>
              </div>
            )}
          </div>
          <div className="p-3 bg-blue-50 rounded-full">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const ExecutiveSummarySection: React.FC = () => {
  const navigate = useNavigate();
  const { data: salesData, loading: salesLoading } = useSalesData();
  const { data: sessionsData, loading: sessionsLoading } = useSessionsData();
  const { data: newClientData, loading: newClientLoading } = useNewClientData();
  const { data: leadsData, loading: leadsLoading } = useLeadsData();
  const { data: payrollData, isLoading: payrollLoading } = usePayrollData();

  // State for drill-down modals
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    data: any[];
    type: string;
    columns: any[];
  }>({
    isOpen: false,
    data: [],
    type: '',
    columns: []
  });

  // Calculate key metrics
  const totalRevenue = useMemo(() => {
    return salesData.reduce((sum, sale) => sum + (sale.paymentValue || 0), 0);
  }, [salesData]);

  const totalAttendance = useMemo(() => {
    return sessionsData.reduce((sum, session) => sum + (session.checkedIn || 0), 0);
  }, [sessionsData]);

  const totalNewClients = newClientData.length;
  const totalLeads = leadsData.length;

  // Calculate growth rates (mock data for demo)
  const revenueGrowth = 12.5;
  const attendanceGrowth = 8.3;
  const clientGrowth = 15.2;
  const leadGrowth = 22.1;

  // Top performing trainers
  const topTrainers = useMemo(() => {
    const trainerStats = payrollData.reduce((acc, trainer) => {
      const name = trainer.teacherName || 'Unknown';
      if (!acc[name]) {
        acc[name] = {
          name,
          totalHours: 0,
          totalSessions: 0,
          totalEarnings: 0
        };
      }
      acc[name].totalSessions += trainer.totalSessions || 0;
      acc[name].totalEarnings += trainer.totalPaid || 0;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(trainerStats)
      .sort((a: any, b: any) => b.totalEarnings - a.totalEarnings)
      .slice(0, 5);
  }, [payrollData]);

  // Top performing products
  const topProducts = useMemo(() => {
    const productStats = salesData.reduce((acc, sale) => {
      const product = sale.cleanedProduct || 'Unknown';
      if (!acc[product]) {
        acc[product] = {
          name: product,
          totalRevenue: 0,
          totalSales: 0,
          totalQuantity: 0
        };
      }
      acc[product].totalRevenue += sale.paymentValue || 0;
      acc[product].totalSales += 1;
      acc[product].totalQuantity += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(productStats)
      .sort((a: any, b: any) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);
  }, [salesData]);

  // Monthly revenue trend
  const monthlyRevenue = useMemo(() => {
    const monthlyData = salesData.reduce((acc, sale) => {
      const date = new Date(sale.paymentDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          revenue: 0,
          sales: 0
        };
      }
      acc[monthKey].revenue += sale.paymentValue || 0;
      acc[monthKey].sales += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(monthlyData)
      .sort((a: any, b: any) => a.month.localeCompare(b.month))
      .slice(-6); // Last 6 months
  }, [salesData]);

  // Lead conversion stats
  const leadConversionStats = useMemo(() => {
    const totalLeadsCount = leadsData.length;
    const convertedLeads = leadsData.filter(lead => 
      lead.conversionStatus === 'Converted' || lead.status === 'Converted'
    ).length;
    const conversionRate = totalLeadsCount > 0 ? (convertedLeads / totalLeadsCount) * 100 : 0;
    
    return {
      totalLeads: totalLeadsCount,
      convertedLeads,
      conversionRate: Math.round(conversionRate * 10) / 10
    };
  }, [leadsData]);

  const openDrillDown = (data: any[], type: string, columns: any[]) => {
    setModalState({
      isOpen: true,
      data,
      type,
      columns
    });
  };

  const closeDrillDown = () => {
    setModalState({
      isOpen: false,
      data: [],
      type: '',
      columns: []
    });
  };

  if (salesLoading || sessionsLoading || newClientLoading || leadsLoading || payrollLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-white animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Executive Summary</h1>
          <p className="text-gray-600 mt-2">Comprehensive overview of business performance</p>
        </div>
        <Button 
          onClick={() => navigate('/')}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
        >
          <BarChart3 className="w-4 h-4" />
          Open Dashboard
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          change={revenueGrowth}
          icon={DollarSign}
          trend="up"
          onClick={() => openDrillDown(
            salesData,
            'Revenue Breakdown',
            [
              { key: 'paymentDate', label: 'Date' },
              { key: 'cleanedProduct', label: 'Product' },
              { key: 'paymentValue', label: 'Amount' },
              { key: 'paymentMethod', label: 'Payment Method' }
            ]
          )}
        />
        
        <MetricCard
          title="Total Attendance"
          value={totalAttendance.toLocaleString()}
          change={attendanceGrowth}
          icon={Users}
          trend="up"
          onClick={() => openDrillDown(
            sessionsData,
            'Attendance Details',
            [
              { key: 'date', label: 'Date' },
              { key: 'classType', label: 'Class Type' },
              { key: 'checkedIn', label: 'Attendance' },
              { key: 'instructor', label: 'Trainer' }
            ]
          )}
        />
        
        <MetricCard
          title="New Clients"
          value={totalNewClients.toLocaleString()}
          change={clientGrowth}
          icon={Target}
          trend="up"
          onClick={() => openDrillDown(
            newClientData,
            'New Clients',
            [
              { key: 'firstVisitDate', label: 'Joining Date' },
              { key: 'firstName', label: 'Name' },
              { key: 'membershipUsed', label: 'Membership' },
              { key: 'ltv', label: 'Amount' }
            ]
          )}
        />
        
        <MetricCard
          title="Total Leads"
          value={totalLeads.toLocaleString()}
          change={leadGrowth}
          icon={Activity}
          trend="up"
          onClick={() => openDrillDown(
            leadsData,
            'Leads Overview',
            [
              { key: 'date', label: 'Date' },
              { key: 'source', label: 'Source' },
              { key: 'stage', label: 'Stage' },
              { key: 'status', label: 'Status' }
            ]
          )}
        />
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Monthly Revenue Trend */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5 text-blue-600" />
                Monthly Revenue Trend (Last 6 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium text-gray-600">Month</th>
                      <th className="text-right p-3 font-medium text-gray-600">Revenue</th>
                      <th className="text-right p-3 font-medium text-gray-600">Sales Count</th>
                      <th className="text-right p-3 font-medium text-gray-600">Avg Sale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyRevenue.map((month: any, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{month.month}</td>
                        <td className="p-3 text-right text-green-600 font-semibold">
                          ₹{month.revenue.toLocaleString()}
                        </td>
                        <td className="p-3 text-right">{month.sales}</td>
                        <td className="p-3 text-right">
                          ₹{Math.round(month.revenue / month.sales).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Lead Conversion Overview */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                Lead Conversion Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {leadConversionStats.totalLeads}
                  </div>
                  <div className="text-sm text-gray-600">Total Leads</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {leadConversionStats.convertedLeads}
                  </div>
                  <div className="text-sm text-gray-600">Converted</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {leadConversionStats.conversionRate}%
                  </div>
                  <div className="text-sm text-gray-600">Conversion Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          {/* Top Products Table */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-orange-600" />
                Top Performing Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium text-gray-600">Product</th>
                      <th className="text-right p-3 font-medium text-gray-600">Revenue</th>
                      <th className="text-right p-3 font-medium text-gray-600">Sales</th>
                      <th className="text-right p-3 font-medium text-gray-600">Avg Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((product: any, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{product.name}</td>
                        <td className="p-3 text-right text-green-600 font-semibold">
                          ₹{product.totalRevenue.toLocaleString()}
                        </td>
                        <td className="p-3 text-right">{product.totalSales}</td>
                        <td className="p-3 text-right">
                          ₹{Math.round(product.totalRevenue / product.totalSales).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Top Trainers Table */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Top Performing Trainers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium text-gray-600">Trainer</th>
                      <th className="text-right p-3 font-medium text-gray-600">Total Hours</th>
                      <th className="text-right p-3 font-medium text-gray-600">Sessions</th>
                      <th className="text-right p-3 font-medium text-gray-600">Earnings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topTrainers.map((trainer: any, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{trainer.name}</td>
                        <td className="p-3 text-right">{trainer.totalHours}</td>
                        <td className="p-3 text-right">{trainer.totalSessions}</td>
                        <td className="p-3 text-right text-green-600 font-semibold">
                          ₹{trainer.totalEarnings.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Conversion Rate by Source */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Percent className="w-5 h-5 text-indigo-600" />
                  Conversion by Source
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leadsData.reduce((acc: any[], lead) => {
                    const source = lead.source || 'Unknown';
                    const existing = acc.find(item => item.source === source);
                    if (existing) {
                      existing.total++;
                      if (lead.conversionStatus === 'Converted') existing.converted++;
                    } else {
                      acc.push({
                        source,
                        total: 1,
                        converted: lead.conversionStatus === 'Converted' ? 1 : 0
                      });
                    }
                    return acc;
                  }, []).map((sourceData: any, index) => {
                    const rate = (sourceData.converted / sourceData.total) * 100;
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span className="font-medium">{sourceData.source}</span>
                        <div className="text-right">
                          <div className="font-semibold text-indigo-600">{rate.toFixed(1)}%</div>
                          <div className="text-xs text-gray-500">
                            {sourceData.converted}/{sourceData.total}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Drill Down Modal */}
      <DrillDownModal
        isOpen={modalState.isOpen}
        onClose={closeDrillDown}
        data={modalState.data}
        type={'metric' as const}
        columns={modalState.columns}
      />
    </div>
  );
};

export default ExecutiveSummarySection;
