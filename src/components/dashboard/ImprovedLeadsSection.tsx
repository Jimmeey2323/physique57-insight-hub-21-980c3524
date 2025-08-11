
import React, { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImprovedLeadSourcePerformanceTable } from './ImprovedLeadSourcePerformanceTable';
import { ImprovedLeadMonthOnMonthTable } from './ImprovedLeadMonthOnMonthTable';
import { ImprovedLeadYearOnYearTable } from './ImprovedLeadYearOnYearTable';
import { ImprovedLeadMetricCards } from './ImprovedLeadMetricCards';
import { ImprovedLeadTopLists } from './ImprovedLeadTopLists';
import { FunnelStageAnalytics } from './FunnelStageAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLeadsData } from '@/hooks/useLeadsData';
import { RefinedLoader } from '@/components/ui/RefinedLoader';
import { BarChart3, TrendingUp, Users, Target, Calendar, Award, Activity, Filter } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';

interface SourceStats {
  leads: number;
  conversions: number;
  ltv: number;
}

interface AssociateStats {
  leads: number;
  conversions: number;
  ltv: number;
}

export const ImprovedLeadsSection: React.FC = () => {
  const { data: leadsData, loading, error } = useLeadsData();

  const processedLeadsData = useMemo(() => {
    if (!leadsData || !Array.isArray(leadsData)) {
      return [];
    }

    // Process the leads data to include conversion metrics
    return leadsData.map(lead => ({
      ...lead,
      leadToTrialConversion: lead.stage === 'Trial Completed' ? 1 : 0,
      trialToMembershipConversion: lead.conversionStatus === 'Converted' ? 1 : 0,
      totalRevenue: lead.ltv || 0
    }));
  }, [leadsData]);

  const yearOnYearData = useMemo(() => {
    if (!processedLeadsData.length) return { data: {}, years: [], sources: [] };

    const years = [...new Set(processedLeadsData.map(lead => {
      if (lead.createdAt) {
        const date = new Date(lead.createdAt);
        return date.getFullYear().toString();
      }
      return new Date().getFullYear().toString();
    }))].sort();

    const sources = [...new Set(processedLeadsData.map(lead => lead.source || 'Unknown'))];

    const yearData = {};
    
    sources.forEach(source => {
      yearData[source] = {};
      years.forEach(year => {
        const yearLeads = processedLeadsData.filter(lead => {
          const leadYear = lead.createdAt ? new Date(lead.createdAt).getFullYear().toString() : new Date().getFullYear().toString();
          return lead.source === source && leadYear === year;
        });

        yearData[source][year] = {
          totalLeads: yearLeads.length,
          convertedLeads: yearLeads.filter(lead => lead.conversionStatus === 'Converted').length,
          trialsCompleted: yearLeads.filter(lead => lead.stage === 'Trial Completed').length,
          lostLeads: yearLeads.filter(lead => lead.conversionStatus === 'Lost').length,
          totalRevenue: yearLeads.reduce((sum, lead) => sum + (lead.ltv || 0), 0)
        };
      });
    });

    return { data: yearData, years, sources };
  }, [processedLeadsData]);

  const sourceStats = useMemo((): Record<string, SourceStats> => {
    if (!processedLeadsData.length) return {};

    return processedLeadsData.reduce((acc, lead) => {
      const source = lead.source || 'Unknown';
      if (!acc[source]) {
        acc[source] = { leads: 0, conversions: 0, ltv: 0 };
      }
      acc[source].leads += 1;
      if (lead.conversionStatus === 'Converted') {
        acc[source].conversions += 1;
      }
      acc[source].ltv += lead.ltv || 0;
      return acc;
    }, {} as Record<string, SourceStats>);
  }, [processedLeadsData]);

  const associateStats = useMemo((): Record<string, AssociateStats> => {
    if (!processedLeadsData.length) return {};

    return processedLeadsData.reduce((acc, lead) => {
      const associate = lead.associate || 'Unknown';
      if (!acc[associate]) {
        acc[associate] = { leads: 0, conversions: 0, ltv: 0 };
      }
      acc[associate].leads += 1;
      if (lead.conversionStatus === 'Converted') {
        acc[associate].conversions += 1;
      }
      acc[associate].ltv += lead.ltv || 0;
      return acc;
    }, {} as Record<string, AssociateStats>);
  }, [processedLeadsData]);

  if (loading) {
    return <RefinedLoader subtitle="Loading comprehensive lead analytics..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Error loading leads data</p>
          <p className="text-slate-600 text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10 min-h-screen">
      {/* Header Section with Key Metrics */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Lead Performance Analytics
            </h1>
            <p className="text-slate-600 mt-2">Comprehensive lead tracking and conversion analysis</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 px-3 py-1">
              <Activity className="w-4 h-4 mr-1" />
              {formatNumber(processedLeadsData.length)} Total Leads
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-700 px-3 py-1">
              <Target className="w-4 h-4 mr-1" />
              {formatNumber(processedLeadsData.filter(l => l.conversionStatus === 'Converted').length)} Converted
            </Badge>
          </div>
        </div>

        {/* Metric Cards */}
        <ImprovedLeadMetricCards data={processedLeadsData} />
      </div>

      {/* Top Lists Section */}
      <ImprovedLeadTopLists 
        sourceStats={sourceStats}
        associateStats={associateStats}
      />

      {/* Funnel Stage Analytics */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Filter className="w-6 h-6 text-blue-600" />
          Funnel Health & Stage Analysis
        </h2>
        <FunnelStageAnalytics data={processedLeadsData} />
      </div>

      {/* Comprehensive Tables Section */}
      <Tabs defaultValue="source-performance" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <TabsTrigger value="source-performance" className="text-center flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Source Performance
          </TabsTrigger>
          <TabsTrigger value="month-analysis" className="text-center flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Month-on-Month
          </TabsTrigger>
          <TabsTrigger value="year-analysis" className="text-center flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Year-on-Year
          </TabsTrigger>
        </TabsList>

        {/* Lead Source Performance Table Tab */}
        <TabsContent value="source-performance" className="space-y-6">
          <ImprovedLeadSourcePerformanceTable
            data={processedLeadsData}
            title="Lead Source Performance Analysis"
          />
        </TabsContent>

        {/* Month-on-Month Analysis Tab */}
        <TabsContent value="month-analysis" className="space-y-6">
          <ImprovedLeadMonthOnMonthTable
            data={processedLeadsData}
            title="Month-on-Month Lead Performance"
          />
        </TabsContent>

        {/* Year-on-Year Analysis Tab */}
        <TabsContent value="year-analysis" className="space-y-6">
          <ImprovedLeadYearOnYearTable
            data={yearOnYearData.data}
            years={yearOnYearData.years}
            sources={yearOnYearData.sources}
          />
        </TabsContent>
      </Tabs>

      {/* Additional Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <Card className="bg-white shadow-lg border-0 rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-2xl">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Lead Volume Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Peak Lead Month</span>
                <span className="font-bold text-blue-600">
                  {(() => {
                    const monthCounts = {};
                    processedLeadsData.forEach(lead => {
                      if (lead.createdAt) {
                        const month = new Date(lead.createdAt).toLocaleDateString('default', { month: 'short', year: 'numeric' });
                        monthCounts[month] = (monthCounts[month] || 0) + 1;
                      }
                    });
                    const peakMonth = Object.entries(monthCounts).sort(([,a], [,b]) => (b as number) - (a as number))[0];
                    return peakMonth ? `${peakMonth[0]} (${peakMonth[1]})` : 'N/A';
                  })()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Top Source</span>
                <span className="font-bold text-green-600">
                  {(() => {
                    const entries = Object.entries(sourceStats);
                    if (entries.length === 0) return 'N/A';
                    const topSource = entries.sort(([,a], [,b]) => b.leads - a.leads)[0];
                    return topSource ? `${topSource[0]} (${topSource[1].leads})` : 'N/A';
                  })()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg. LTV</span>
                <span className="font-bold text-purple-600">
                  {formatCurrency(processedLeadsData.reduce((sum, l) => sum + (l.ltv || 0), 0) / (processedLeadsData.length || 1))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg border-0 rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-2xl">
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Conversion Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Best Converting Source</span>
                <span className="font-bold text-green-600">
                  {(() => {
                    const entries = Object.entries(sourceStats);
                    if (entries.length === 0) return 'N/A';
                    const conversionRates = entries.map(([source, stats]) => ({
                      source,
                      rate: stats.leads > 0 ? (stats.conversions / stats.leads * 100) : 0
                    })).sort((a, b) => b.rate - a.rate);
                    const best = conversionRates[0];
                    return best ? `${best.source} (${best.rate.toFixed(1)}%)` : 'N/A';
                  })()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Trial Completion Rate</span>
                <span className="font-bold text-blue-600">
                  {(() => {
                    const trials = processedLeadsData.filter(l => l.stage === 'Trial Completed').length;
                    const rate = processedLeadsData.length > 0 ? (trials / processedLeadsData.length * 100) : 0;
                    return `${rate.toFixed(1)}%`;
                  })()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Revenue per Lead</span>
                <span className="font-bold text-purple-600">
                  {formatCurrency(processedLeadsData.reduce((sum, l) => sum + (l.ltv || 0), 0) / (processedLeadsData.length || 1))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg border-0 rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-2xl">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Performance Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Pipeline Value</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(processedLeadsData.reduce((sum, l) => sum + (l.ltv || 0), 0))}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Sources</span>
                <span className="font-bold text-blue-600">
                  {Object.keys(sourceStats).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Associates</span>
                <span className="font-bold text-purple-600">
                  {Object.keys(associateStats).length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
