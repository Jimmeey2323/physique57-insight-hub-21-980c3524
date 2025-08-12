import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar,
  DollarSign,
  Activity,
  Target,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Home,
  ExternalLink,
  UserPlus,
  Building,
  CreditCard,
  Clock,
  Award,
  Zap,
  MapPin,
  Star,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { useSalesData } from '@/hooks/useSalesData';
import { useSessionsData } from '@/hooks/useSessionsData';
import { useNewClientData } from '@/hooks/useNewClientData';
import { useNavigate } from 'react-router-dom';
import { DrillDownModal } from './DrillDownModal';
import { cn } from '@/lib/utils';

const ExecutiveSummarySection = () => {
  const navigate = useNavigate();
  const { data: salesData, loading: salesLoading } = useSalesData();
  const { data: sessionsData, loading: sessionsLoading } = useSessionsData();
  const { data: newClientData, loading: newClientLoading } = useNewClientData();

  const [drillDownModal, setDrillDownModal] = useState({
    isOpen: false,
    title: '',
    data: [],
    type: 'metric' as const,
    columns: []
  });

  const calculateMetrics = () => {
    if (!salesData || !sessionsData || !newClientData) {
      return {
        totalRevenue: 0,
        totalTransactions: 0,
        totalSessions: 0,
        totalNewClients: 0,
        avgSessionAttendance: 0,
        conversionRate: 0,
        topPerformingLocation: 'N/A',
        topPerformingTrainer: 'N/A'
      };
    }

    const totalRevenue = salesData.reduce((sum, sale) => sum + (sale.netRevenue || 0), 0);
    const totalTransactions = salesData.length;
    const totalSessions = sessionsData.length;
    const totalNewClients = newClientData.length;
    const avgSessionAttendance = sessionsData.length > 0 
      ? sessionsData.reduce((sum, session) => sum + session.checkedIn, 0) / sessionsData.length 
      : 0;

    const convertedClients = newClientData.filter(client => client.conversionStatus === 'Converted').length;
    const conversionRate = totalNewClients > 0 ? (convertedClients / totalNewClients) * 100 : 0;

    // Location performance
    const locationRevenue = salesData.reduce((acc, sale) => {
      const location = sale.calculatedLocation || 'Unknown';
      acc[location] = (acc[location] || 0) + (sale.netRevenue || 0);
      return acc;
    }, {} as Record<string, number>);

    const topPerformingLocation = Object.entries(locationRevenue)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

    // Trainer performance - fix the type error
    const trainerRevenue = salesData.reduce((acc, sale) => {
      const trainer = sale.soldBy || 'Unknown';
      acc[trainer] = (acc[trainer] || 0) + (sale.netRevenue || 0);
      return acc;
    }, {} as Record<string, number>);

    const topPerformingTrainer = Object.entries(trainerRevenue)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

    return {
      totalRevenue,
      totalTransactions,
      totalSessions,
      totalNewClients,
      avgSessionAttendance,
      conversionRate,
      topPerformingLocation,
      topPerformingTrainer
    };
  };

  const metrics = calculateMetrics();

  const handleDrillDown = (title: string, data: any[], type: any, columns: any[]) => {
    setDrillDownModal({
      isOpen: true,
      title,
      data,
      type,
      columns
    });
  };

  // Enhanced metric cards with drill-down
  const metricCards = [
    {
      title: 'Total Revenue',
      value: `₹${metrics.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      trend: '+12.5%',
      trendUp: true,
      description: 'Total revenue across all locations',
      onClick: () => handleDrillDown(
        'Revenue Breakdown',
        salesData || [],
        'metric',
        [
          { key: 'customerName', header: 'Customer' },
          { key: 'paymentDate', header: 'Date' },
          { key: 'netRevenue', header: 'Revenue', render: (value: number) => `₹${value?.toLocaleString() || 0}` },
          { key: 'calculatedLocation', header: 'Location' },
          { key: 'soldBy', header: 'Sold By' }
        ]
      )
    },
    {
      title: 'Total Transactions',
      value: metrics.totalTransactions.toLocaleString(),
      icon: CreditCard,
      trend: '+8.2%',
      trendUp: true,
      description: 'Number of completed transactions',
      onClick: () => handleDrillDown(
        'Transaction Details',
        salesData || [],
        'metric',
        [
          { key: 'paymentTransactionId', header: 'Transaction ID' },
          { key: 'customerName', header: 'Customer' },
          { key: 'paymentValue', header: 'Amount', render: (value: number) => `₹${value?.toLocaleString() || 0}` },
          { key: 'paymentMethod', header: 'Payment Method' },
          { key: 'paymentStatus', header: 'Status' }
        ]
      )
    },
    {
      title: 'Total Sessions',
      value: metrics.totalSessions.toLocaleString(),
      icon: Activity,
      trend: '+15.3%',
      trendUp: true,
      description: 'Classes conducted across all locations',
      onClick: () => handleDrillDown(
        'Session Details',
        sessionsData || [],
        'metric',
        [
          { key: 'date', header: 'Date' },
          { key: 'classType', header: 'Class Type' },
          { key: 'instructor', header: 'Instructor' },
          { key: 'location', header: 'Location' },
          { key: 'checkedIn', header: 'Attendance' }
        ]
      )
    },
    {
      title: 'New Clients',
      value: metrics.totalNewClients.toLocaleString(),
      icon: UserPlus,
      trend: '+22.1%',
      trendUp: true,
      description: 'New member acquisitions',
      onClick: () => handleDrillDown(
        'New Client Details',
        newClientData || [],
        'metric',
        [
          { key: 'firstName', header: 'Name' },
          { key: 'email', header: 'Email' },
          { key: 'firstVisitDate', header: 'First Visit' },
          { key: 'conversionStatus', header: 'Status' },
          { key: 'ltv', header: 'LTV', render: (value: number) => `₹${value?.toLocaleString() || 0}` }
        ]
      )
    },
    {
      title: 'Avg Attendance',
      value: metrics.avgSessionAttendance.toFixed(1),
      icon: Users,
      trend: '+5.8%',
      trendUp: true,
      description: 'Average session attendance',
      onClick: () => handleDrillDown(
        'Attendance Analysis',
        sessionsData || [],
        'metric',
        [
          { key: 'date', header: 'Date' },
          { key: 'classType', header: 'Class' },
          { key: 'capacity', header: 'Capacity' },
          { key: 'checkedIn', header: 'Attended' },
          { key: 'fillPercentage', header: 'Fill %', render: (value: number) => `${value?.toFixed(1) || 0}%` }
        ]
      )
    },
    {
      title: 'Conversion Rate',
      value: `${metrics.conversionRate.toFixed(1)}%`,
      icon: Target,
      trend: '+3.2%',
      trendUp: true,
      description: 'Trial to member conversion',
      onClick: () => handleDrillDown(
        'Conversion Analysis',
        newClientData?.filter(client => client.conversionStatus === 'Converted') || [],
        'metric',
        [
          { key: 'firstName', header: 'Name' },
          { key: 'firstVisitDate', header: 'First Visit' },
          { key: 'conversionSpan', header: 'Conversion Days' },
          { key: 'ltv', header: 'LTV', render: (value: number) => `₹${value?.toLocaleString() || 0}` }
        ]
      )
    }
  ];

  // Location performance data
  const locationData = useMemo(() => {
    if (!salesData) return [];
    
    const locationStats = salesData.reduce((acc, sale) => {
      const location = sale.calculatedLocation || 'Unknown';
      if (!acc[location]) {
        acc[location] = {
          location,
          revenue: 0,
          transactions: 0,
          avgTransaction: 0
        };
      }
      acc[location].revenue += sale.netRevenue || 0;
      acc[location].transactions += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(locationStats).map((loc: any) => ({
      ...loc,
      avgTransaction: loc.transactions > 0 ? loc.revenue / loc.transactions : 0
    })).sort((a: any, b: any) => b.revenue - a.revenue);
  }, [salesData]);

  // Trainer performance data
  const trainerData = useMemo(() => {
    if (!salesData) return [];
    
    const trainerStats = salesData.reduce((acc, sale) => {
      const trainer = sale.soldBy || 'Unknown';
      if (!acc[trainer]) {
        acc[trainer] = {
          trainer,
          revenue: 0,
          transactions: 0,
          avgTransaction: 0
        };
      }
      acc[trainer].revenue += sale.netRevenue || 0;
      acc[trainer].transactions += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(trainerStats).map((trainer: any) => ({
      ...trainer,
      avgTransaction: trainer.transactions > 0 ? trainer.revenue / trainer.transactions : 0
    })).sort((a: any, b: any) => b.revenue - a.revenue);
  }, [salesData]);

  // Revenue trends data
  const revenueTrends = useMemo(() => {
    if (!salesData) return [];
    
    const monthlyRevenue = salesData.reduce((acc, sale) => {
      const date = new Date(sale.paymentDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      acc[monthKey] = (acc[monthKey] || 0) + (sale.netRevenue || 0);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(monthlyRevenue)
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [salesData]);

  // Class performance data
  const classPerformance = useMemo(() => {
    if (!sessionsData) return [];
    
    const classStats = sessionsData.reduce((acc, session) => {
      const classType = session.classType || 'Unknown';
      if (!acc[classType]) {
        acc[classType] = {
          classType,
          totalSessions: 0,
          totalAttendance: 0,
          avgAttendance: 0,
          fillRate: 0
        };
      }
      acc[classType].totalSessions += 1;
      acc[classType].totalAttendance += session.checkedIn;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(classStats).map((cls: any) => ({
      ...cls,
      avgAttendance: cls.totalSessions > 0 ? cls.totalAttendance / cls.totalSessions : 0,
      fillRate: cls.totalSessions > 0 ? (cls.totalAttendance / (cls.totalSessions * 20)) * 100 : 0 // Assuming avg capacity of 20
    })).sort((a: any, b: any) => b.avgAttendance - a.avgAttendance);
  }, [sessionsData]);

  if (salesLoading || sessionsLoading || newClientLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-slate-600 font-medium">Loading executive summary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-purple-900 to-pink-900 text-white">
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -left-4 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-10 w-24 h-24 bg-purple-300/20 rounded-full animate-bounce delay-1000"></div>
          <div className="absolute bottom-10 left-20 w-40 h-40 bg-pink-300/10 rounded-full animate-pulse delay-500"></div>
        </div>
        
        <div className="relative px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <Button 
                onClick={() => navigate('/')} 
                variant="outline" 
                size="sm" 
                className="gap-2 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
              >
                <Home className="w-4 h-4" />
                Dashboard
              </Button>
              
              <div className="flex items-center gap-3">
                <Badge className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                  <BarChart3 className="w-3 h-3 mr-1" />
                  Executive View
                </Badge>
              </div>
            </div>
            
            <div className="text-center space-y-6">
              <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent">
                Executive Summary
              </h1>
              <p className="text-xl text-purple-100 max-w-3xl mx-auto leading-relaxed font-medium">
                Comprehensive business intelligence dashboard with key performance indicators, 
                revenue analytics, and operational insights across all business verticals
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm border border-purple-200/50">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Overview</TabsTrigger>
            <TabsTrigger value="revenue" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Revenue</TabsTrigger>
            <TabsTrigger value="operations" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Operations</TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Performance</TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Insights</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {metricCards.map((card, index) => (
                <Card 
                  key={card.title} 
                  className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105"
                  onClick={card.onClick}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <card.icon className="w-5 h-5 text-purple-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-600">{card.title}</span>
                      </div>
                      <Badge variant={card.trendUp ? "default" : "destructive"} className="gap-1">
                        {card.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {card.trend}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-slate-800">{card.value}</div>
                      <p className="text-sm text-slate-500">{card.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Enhanced Tables Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Location Performance Table */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <MapPin className="w-5 h-5 text-purple-600" />
                    Top Performing Locations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {locationData.slice(0, 5).map((location, index) => (
                      <div 
                        key={location.location}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer"
                        onClick={() => handleDrillDown(
                          `${location.location} Performance`,
                          salesData?.filter(sale => sale.calculatedLocation === location.location) || [],
                          'location',
                          [
                            { key: 'customerName', header: 'Customer' },
                            { key: 'paymentDate', header: 'Date' },
                            { key: 'netRevenue', header: 'Revenue', render: (value: number) => `₹${value?.toLocaleString() || 0}` },
                            { key: 'soldBy', header: 'Sold By' }
                          ]
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">
                            {index + 1}
                          </Badge>
                          <span className="font-medium text-slate-700">{location.location}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-slate-800">₹{location.revenue.toLocaleString()}</div>
                          <div className="text-xs text-slate-500">{location.transactions} transactions</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Trainer Performance Table */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <Award className="w-5 h-5 text-purple-600" />
                    Top Performing Staff
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {trainerData.slice(0, 5).map((trainer, index) => (
                      <div 
                        key={trainer.trainer}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer"
                        onClick={() => handleDrillDown(
                          `${trainer.trainer} Performance`,
                          salesData?.filter(sale => sale.soldBy === trainer.trainer) || [],
                          'trainer',
                          [
                            { key: 'customerName', header: 'Customer' },
                            { key: 'paymentDate', header: 'Date' },
                            { key: 'netRevenue', header: 'Revenue', render: (value: number) => `₹${value?.toLocaleString() || 0}` },
                            { key: 'calculatedLocation', header: 'Location' }
                          ]
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">
                            {index + 1}
                          </Badge>
                          <span className="font-medium text-slate-700">{trainer.trainer}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-slate-800">₹{trainer.revenue.toLocaleString()}</div>
                          <div className="text-xs text-slate-500">{trainer.transactions} sales</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Revenue Trends */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Monthly Revenue Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {revenueTrends.slice(-6).map((trend, index) => (
                      <div 
                        key={trend.month}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-green-50 transition-colors cursor-pointer"
                        onClick={() => handleDrillDown(
                          `Revenue for ${trend.month}`,
                          salesData?.filter(sale => {
                            const saleDate = new Date(sale.paymentDate);
                            const monthKey = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, '0')}`;
                            return monthKey === trend.month;
                          }) || [],
                          'metric',
                          [
                            { key: 'customerName', header: 'Customer' },
                            { key: 'paymentDate', header: 'Date' },
                            { key: 'netRevenue', header: 'Revenue', render: (value: number) => `₹${value?.toLocaleString() || 0}` },
                            { key: 'calculatedLocation', header: 'Location' },
                            { key: 'soldBy', header: 'Sold By' }
                          ]
                        )}
                      >
                        <span className="font-medium text-slate-700">{trend.month}</span>
                        <span className="font-bold text-green-600">₹{trend.revenue.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Revenue by Product Category */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <PieChart className="w-5 h-5 text-blue-600" />
                    Revenue by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {useMemo(() => {
                      if (!salesData) return [];
                      const categoryRevenue = salesData.reduce((acc, sale) => {
                        const category = sale.cleanedCategory || 'Unknown';
                        acc[category] = (acc[category] || 0) + (sale.netRevenue || 0);
                        return acc;
                      }, {} as Record<string, number>);
                      
                      return Object.entries(categoryRevenue)
                        .map(([category, revenue]) => ({ category, revenue }))
                        .sort((a, b) => b.revenue - a.revenue)
                        .slice(0, 5);
                    }, [salesData]).map((category, index) => (
                      <div 
                        key={category.category}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                        onClick={() => handleDrillDown(
                          `${category.category} Sales`,
                          salesData?.filter(sale => sale.cleanedCategory === category.category) || [],
                          'category',
                          [
                            { key: 'customerName', header: 'Customer' },
                            { key: 'cleanedProduct', header: 'Product' },
                            { key: 'netRevenue', header: 'Revenue', render: (value: number) => `₹${value?.toLocaleString() || 0}` },
                            { key: 'soldBy', header: 'Sold By' }
                          ]
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">
                            {index + 1}
                          </Badge>
                          <span className="font-medium text-slate-700">{category.category}</span>
                        </div>
                        <span className="font-bold text-blue-600">₹{category.revenue.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Operations Tab */}
          <TabsContent value="operations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Class Performance */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <Activity className="w-5 h-5 text-orange-600" />
                    Class Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {classPerformance.slice(0, 5).map((cls, index) => (
                      <div 
                        key={cls.classType}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-orange-50 transition-colors cursor-pointer"
                        onClick={() => handleDrillDown(
                          `${cls.classType} Sessions`,
                          sessionsData?.filter(session => session.classType === cls.classType) || [],
                          'metric',
                          [
                            { key: 'date', header: 'Date' },
                            { key: 'instructor', header: 'Instructor' },
                            { key: 'location', header: 'Location' },
                            { key: 'checkedIn', header: 'Attendance' },
                            { key: 'capacity', header: 'Capacity' }
                          ]
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">
                            {index + 1}
                          </Badge>
                          <span className="font-medium text-slate-700">{cls.classType}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-orange-600">{cls.avgAttendance.toFixed(1)}</div>
                          <div className="text-xs text-slate-500">{cls.totalSessions} sessions</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Session Trends */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <Clock className="w-5 h-5 text-purple-600" />
                    Recent Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {sessionsData?.slice(-5).reverse().map((session, index) => (
                      <div 
                        key={`${session.sessionId}-${index}`}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer"
                        onClick={() => handleDrillDown(
                          `Session Details`,
                          [session],
                          'metric',
                          [
                            { key: 'date', header: 'Date' },
                            { key: 'classType', header: 'Class Type' },
                            { key: 'instructor', header: 'Instructor' },
                            { key: 'location', header: 'Location' },
                            { key: 'checkedIn', header: 'Attendance' }
                          ]
                        )}
                      >
                        <div>
                          <div className="font-medium text-slate-700">{session.classType}</div>
                          <div className="text-xs text-slate-500">{session.date} • {session.instructor}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-purple-600">{session.checkedIn}/{session.capacity}</div>
                          <div className="text-xs text-slate-500">{session.fillPercentage.toFixed(1)}% full</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Star className="w-5 h-5 text-yellow-600" />
                  Performance Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">{metrics.topPerformingLocation}</div>
                    <div className="text-sm text-slate-600">Top Location</div>
                  </div>
                  <div className="text-center p-6 bg-blue-50 rounded-lg">
                    <Award className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">{metrics.topPerformingTrainer}</div>
                    <div className="text-sm text-slate-600">Top Performer</div>
                  </div>
                  <div className="text-center p-6 bg-purple-50 rounded-lg">
                    <Zap className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-600">{metrics.conversionRate.toFixed(1)}%</div>
                    <div className="text-sm text-slate-600">Conversion Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <Info className="w-5 h-5 text-blue-600" />
                    Key Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <div className="font-semibold text-green-800">Revenue Growth</div>
                    <div className="text-sm text-green-700">Total revenue shows positive trend with 12.5% increase</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <div className="font-semibold text-blue-800">Member Acquisition</div>
                    <div className="text-sm text-blue-700">New client acquisition up 22.1% with strong conversion rates</div>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                    <div className="font-semibold text-orange-800">Class Performance</div>
                    <div className="text-sm text-orange-700">Session attendance improving with 15.3% more classes conducted</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                    Action Items
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500">
                    <div className="font-semibold text-amber-800">Optimize Low-Performing Classes</div>
                    <div className="text-sm text-amber-700">Review classes with low attendance rates</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                    <div className="font-semibold text-purple-800">Expand Top Locations</div>
                    <div className="text-sm text-purple-700">Consider expanding successful location formats</div>
                  </div>
                  <div className="p-4 bg-pink-50 rounded-lg border-l-4 border-pink-500">
                    <div className="font-semibold text-pink-800">Staff Development</div>
                    <div className="text-sm text-pink-700">Provide additional training for underperforming staff</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <DrillDownModal
        isOpen={drillDownModal.isOpen}
        onClose={() => setDrillDownModal(prev => ({ ...prev, isOpen: false }))}
        title={drillDownModal.title}
        data={drillDownModal.data}
        type={drillDownModal.type}
        columns={drillDownModal.columns}
      />
    </div>
  );
};

export default ExecutiveSummarySection;
