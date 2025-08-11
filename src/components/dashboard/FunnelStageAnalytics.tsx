
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Users, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { formatNumber, formatCurrency } from '@/utils/formatters';

interface FunnelStageAnalyticsProps {
  data: any[];
}

export const FunnelStageAnalytics: React.FC<FunnelStageAnalyticsProps> = ({ data }) => {
  const stageAnalytics = useMemo(() => {
    if (!data || data.length === 0) return { stages: [], mostCommon: [], leastCommon: [] };

    const stageMap = new Map();

    data.forEach(lead => {
      const stage = lead.stage || 'Unknown';
      if (!stageMap.has(stage)) {
        stageMap.set(stage, {
          stage,
          count: 0,
          converted: 0,
          lost: 0,
          revenue: 0,
          conversionRate: 0
        });
      }

      const stageData = stageMap.get(stage);
      stageData.count += 1;
      
      if (lead.conversionStatus === 'Converted') {
        stageData.converted += 1;
      }
      
      if (lead.conversionStatus === 'Lost' || lead.stage === 'Lost') {
        stageData.lost += 1;
      }
      
      stageData.revenue += (lead.ltv || 0);
    });

    const stages = Array.from(stageMap.values()).map(stage => ({
      ...stage,
      conversionRate: stage.count > 0 ? (stage.converted / stage.count) * 100 : 0,
      lostRate: stage.count > 0 ? (stage.lost / stage.count) * 100 : 0,
      percentage: stage.count > 0 ? (stage.count / data.length) * 100 : 0
    })).sort((a, b) => b.count - a.count);

    const mostCommon = stages.slice(0, 5);
    const leastCommon = stages.slice(-5).reverse();

    return { stages, mostCommon, leastCommon };
  }, [data]);

  const totalLeads = data?.length || 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Most Common Stages */}
      <Card className="bg-white shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Most Common Stages
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {stageAnalytics.mostCommon.map((stage, index) => (
              <div key={stage.stage} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      #{index + 1}
                    </Badge>
                    <span className="font-medium text-slate-800">{stage.stage}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">{formatNumber(stage.count)}</div>
                    <div className="text-xs text-slate-500">{stage.percentage.toFixed(1)}%</div>
                  </div>
                </div>
                <Progress value={stage.percentage} className="h-2" />
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div className="font-bold text-green-600">{stage.converted}</div>
                    <div className="text-slate-500">Converted</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-red-600">{stage.lost}</div>
                    <div className="text-slate-500">Lost</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-blue-600">{formatCurrency(stage.revenue)}</div>
                    <div className="text-slate-500">Revenue</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Least Common Stages */}
      <Card className="bg-white shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Least Common Stages
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {stageAnalytics.leastCommon.map((stage, index) => (
              <div key={stage.stage} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      #{stageAnalytics.stages.length - index}
                    </Badge>
                    <span className="font-medium text-slate-800">{stage.stage}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">{formatNumber(stage.count)}</div>
                    <div className="text-xs text-slate-500">{stage.percentage.toFixed(1)}%</div>
                  </div>
                </div>
                <Progress value={stage.percentage} className="h-2" />
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div className="font-bold text-green-600">{stage.converted}</div>
                    <div className="text-slate-500">Converted</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-red-600">{stage.lost}</div>
                    <div className="text-slate-500">Lost</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-blue-600">{formatCurrency(stage.revenue)}</div>
                    <div className="text-slate-500">Revenue</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stage Performance Overview */}
      <Card className="bg-white shadow-lg border-0 lg:col-span-2">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Funnel Stage Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stageAnalytics.stages.length}</div>
              <div className="text-sm text-slate-600">Total Stages</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {stageAnalytics.stages.reduce((sum, stage) => sum + stage.converted, 0)}
              </div>
              <div className="text-sm text-slate-600">Total Conversions</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {stageAnalytics.stages.reduce((sum, stage) => sum + stage.lost, 0)}
              </div>
              <div className="text-sm text-slate-600">Total Lost</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(stageAnalytics.stages.reduce((sum, stage) => sum + stage.revenue, 0))}
              </div>
              <div className="text-sm text-slate-600">Total Revenue</div>
            </div>
          </div>

          {/* Stage Conversion Rates */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-800 mb-3">Stage Conversion Performance</h4>
            {stageAnalytics.stages.slice(0, 8).map((stage) => (
              <div key={stage.stage} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600" />
                  <span className="font-medium text-slate-800">{stage.stage}</span>
                  <Badge variant="outline" className="text-xs">
                    {formatNumber(stage.count)} leads
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-bold text-green-600">{stage.conversionRate.toFixed(1)}%</div>
                    <div className="text-xs text-slate-500">Conversion Rate</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-600">{stage.lostRate.toFixed(1)}%</div>
                    <div className="text-xs text-slate-500">Lost Rate</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-600">{formatCurrency(stage.revenue / stage.count)}</div>
                    <div className="text-xs text-slate-500">Avg Revenue</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
