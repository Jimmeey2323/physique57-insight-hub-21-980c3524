
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ModernDataTable } from '@/components/ui/ModernDataTable';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Clock, MapPin, TrendingUp, Users, Target, Calendar } from 'lucide-react';
import type { SessionData } from '@/types/dashboard';
import { formatNumber } from '@/utils/formatters';

interface PowerCycleVsBarreAdvancedMetricsProps {
  powerCycleData: SessionData[];
  barreData: SessionData[];
  powerCycleMetrics: any;
  barreMetrics: any;
}

export const PowerCycleVsBarreAdvancedMetrics: React.FC<PowerCycleVsBarreAdvancedMetricsProps> = ({
  powerCycleData,
  barreData,
  powerCycleMetrics,
  barreMetrics
}) => {
  // Time slot analysis
  const timeSlotAnalysis = useMemo(() => {
    const slots: Record<string, { powercycle: number; barre: number; pcAttendance: number; barreAttendance: number }> = {};
    
    [...powerCycleData, ...barreData].forEach(session => {
      const hour = session.time.split(':')[0];
      const timeSlot = `${hour}:00`;
      
      if (!slots[timeSlot]) {
        slots[timeSlot] = { powercycle: 0, barre: 0, pcAttendance: 0, barreAttendance: 0 };
      }
      
      const isPowerCycle = powerCycleData.includes(session);
      if (isPowerCycle) {
        slots[timeSlot].powercycle++;
        slots[timeSlot].pcAttendance += session.checkedIn;
      } else {
        slots[timeSlot].barre++;
        slots[timeSlot].barreAttendance += session.checkedIn;
      }
    });
    
    return Object.entries(slots)
      .map(([time, data]) => ({
        time,
        powercycle: data.powercycle,
        barre: data.barre,
        pcAvgAttendance: data.powercycle > 0 ? (data.pcAttendance / data.powercycle).toFixed(1) : '0',
        barreAvgAttendance: data.barre > 0 ? (data.barreAttendance / data.barre).toFixed(1) : '0'
      }))
      .sort((a, b) => parseInt(a.time) - parseInt(b.time));
  }, [powerCycleData, barreData]);

  // Location analysis
  const locationAnalysis = useMemo(() => {
    const locations: Record<string, { 
      powercycle: number; 
      barre: number; 
      pcAttendance: number; 
      barreAttendance: number;
      pcCapacity: number;
      barreCapacity: number;
    }> = {};
    
    [...powerCycleData, ...barreData].forEach(session => {
      const location = session.location;
      
      if (!locations[location]) {
        locations[location] = { 
          powercycle: 0, 
          barre: 0, 
          pcAttendance: 0, 
          barreAttendance: 0,
          pcCapacity: 0,
          barreCapacity: 0
        };
      }
      
      const isPowerCycle = powerCycleData.includes(session);
      if (isPowerCycle) {
        locations[location].powercycle++;
        locations[location].pcAttendance += session.checkedIn;
        locations[location].pcCapacity += session.capacity;
      } else {
        locations[location].barre++;
        locations[location].barreAttendance += session.checkedIn;
        locations[location].barreCapacity += session.capacity;
      }
    });
    
    return Object.entries(locations).map(([location, data]) => ({
      location: location.length > 20 ? location.substring(0, 20) + '...' : location,
      fullLocation: location,
      powercycleSessions: data.powercycle,
      barreSessions: data.barre,
      pcFillRate: data.pcCapacity > 0 ? ((data.pcAttendance / data.pcCapacity) * 100).toFixed(1) : '0',
      barreFillRate: data.barreCapacity > 0 ? ((data.barreAttendance / data.barreCapacity) * 100).toFixed(1) : '0',
      pcAvgAttendance: data.powercycle > 0 ? (data.pcAttendance / data.powercycle).toFixed(1) : '0',
      barreAvgAttendance: data.barre > 0 ? (data.barreAttendance / data.barre).toFixed(1) : '0'
    }));
  }, [powerCycleData, barreData]);

  // Day of week analysis
  const dayAnalysis = useMemo(() => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayData: Record<string, { powercycle: number; barre: number; pcAttendance: number; barreAttendance: number }> = {};
    
    days.forEach(day => {
      dayData[day] = { powercycle: 0, barre: 0, pcAttendance: 0, barreAttendance: 0 };
    });
    
    [...powerCycleData, ...barreData].forEach(session => {
      const day = session.dayOfWeek || new Date(session.date).toLocaleLowerCase('en-US', { weekday: 'long' });
      
      if (dayData[day]) {
        const isPowerCycle = powerCycleData.includes(session);
        if (isPowerCycle) {
          dayData[day].powercycle++;
          dayData[day].pcAttendance += session.checkedIn;
        } else {
          dayData[day].barre++;
          dayData[day].barreAttendance += session.checkedIn;
        }
      }
    });
    
    return days.map(day => ({
      day,
      powercycle: dayData[day].powercycle,
      barre: dayData[day].barre,
      pcAvgAttendance: dayData[day].powercycle > 0 ? (dayData[day].pcAttendance / dayData[day].powercycle).toFixed(1) : '0',
      barreAvgAttendance: dayData[day].barre > 0 ? (dayData[day].barreAttendance / dayData[day].barre).toFixed(1) : '0'
    }));
  }, [powerCycleData, barreData]);

  const COLORS = {
    powercycle: '#3B82F6',
    barre: '#EC4899'
  };

  const pieData = [
    { name: 'PowerCycle', value: powerCycleMetrics.totalSessions, color: COLORS.powercycle },
    { name: 'Barre', value: barreMetrics.totalSessions, color: COLORS.barre }
  ];

  const timeSlotColumns = [
    { key: 'time', header: 'Time Slot', align: 'left' as const },
    { 
      key: 'powercycle', 
      header: 'PC Sessions', 
      align: 'center' as const,
      render: (value: number) => (
        <Badge className="bg-blue-100 text-blue-800 font-semibold">
          {value}
        </Badge>
      )
    },
    { 
      key: 'barre', 
      header: 'Barre Sessions', 
      align: 'center' as const,
      render: (value: number) => (
        <Badge className="bg-pink-100 text-pink-800 font-semibold">
          {value}
        </Badge>
      )
    },
    { 
      key: 'pcAvgAttendance', 
      header: 'PC Avg Attendance', 
      align: 'center' as const,
      render: (value: string) => (
        <Badge variant="outline" className="border-blue-200 text-blue-700 font-medium">
          {value}
        </Badge>
      )
    },
    { 
      key: 'barreAvgAttendance', 
      header: 'Barre Avg Attendance', 
      align: 'center' as const,
      render: (value: string) => (
        <Badge variant="outline" className="border-pink-200 text-pink-700 font-medium">
          {value}
        </Badge>
      )
    }
  ];

  const locationColumns = [
    { 
      key: 'location', 
      header: 'Location', 
      align: 'left' as const,
      render: (value: string, item: any) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span className="font-medium" title={item.fullLocation}>{value}</span>
        </div>
      )
    },
    { 
      key: 'powercycleSessions', 
      header: 'PC Sessions', 
      align: 'center' as const,
      render: (value: number) => (
        <Badge className="bg-blue-100 text-blue-800 font-semibold">
          {value}
        </Badge>
      )
    },
    { 
      key: 'barreSessions', 
      header: 'Barre Sessions', 
      align: 'center' as const,
      render: (value: number) => (
        <Badge className="bg-pink-100 text-pink-800 font-semibold">
          {value}
        </Badge>
      )
    },
    { 
      key: 'pcFillRate', 
      header: 'PC Fill Rate', 
      align: 'center' as const,
      render: (value: string) => {
        const numValue = parseFloat(value);
        const colorClass = numValue > 80 ? 'bg-green-100 text-green-800' : 
                          numValue > 60 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800';
        return (
          <Badge className={`${colorClass} font-semibold`}>
            {value}%
          </Badge>
        );
      }
    },
    { 
      key: 'barreFillRate', 
      header: 'Barre Fill Rate', 
      align: 'center' as const,
      render: (value: string) => {
        const numValue = parseFloat(value);
        const colorClass = numValue > 80 ? 'bg-green-100 text-green-800' : 
                          numValue > 60 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800';
        return (
          <Badge className={`${colorClass} font-semibold`}>
            {value}%
          </Badge>
        );
      }
    }
  ];

  return (
    <div className="space-y-8">
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Slot Distribution Chart */}
        <Card className="bg-white shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
            <CardTitle className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-600" />
              Time Slot Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timeSlotAnalysis}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value, name) => [value, name === 'powercycle' ? 'PowerCycle' : 'Barre']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e5e5',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="powercycle" fill={COLORS.powercycle} name="PowerCycle" radius={[2, 2, 0, 0]} />
                <Bar dataKey="barre" fill={COLORS.barre} name="Barre" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Session Distribution Pie Chart */}
        <Card className="bg-white shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <CardTitle className="flex items-center gap-3">
              <Target className="w-5 h-5 text-purple-600" />
              Session Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Slot Analysis Table */}
        <ModernDataTable
          data={timeSlotAnalysis}
          columns={timeSlotColumns}
          title="Time Slot Analysis"
          maxHeight="400px"
        />

        {/* Location Analysis Table */}
        <ModernDataTable
          data={locationAnalysis}
          columns={locationColumns}
          title="Location Performance"
          maxHeight="400px"
        />
      </div>

      {/* Day of Week Analysis */}
      <Card className="bg-white shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
          <CardTitle className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-green-600" />
            Day of Week Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dayAnalysis}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value, name) => [value, name === 'powercycle' ? 'PowerCycle Sessions' : 'Barre Sessions']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="powercycle" fill={COLORS.powercycle} name="PowerCycle" radius={[2, 2, 0, 0]} />
              <Bar dataKey="barre" fill={COLORS.barre} name="Barre" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
