
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  X, 
  Calendar as CalendarIcon, 
  MapPin, 
  Target, 
  Users,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { LeadsFilterOptions } from '@/types/leads';

interface FunnelLeadsFilterSectionProps {
  filters: LeadsFilterOptions;
  onFiltersChange: (filters: LeadsFilterOptions) => void;
  uniqueValues: {
    locations: string[];
    sources: string[];
    stages: string[];
    statuses: string[];
    associates: string[];
    channels: string[];
    trialStatuses: string[];
    conversionStatuses: string[];
    retentionStatuses: string[];
  };
  className?: string;
}

export const FunnelLeadsFilterSection: React.FC<FunnelLeadsFilterSectionProps> = ({
  filters,
  onFiltersChange,
  uniqueValues,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key: keyof LeadsFilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleArrayFilterChange = (key: keyof LeadsFilterOptions, value: string, checked: boolean) => {
    const currentArray = filters[key] as string[];
    const newArray = checked 
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value);
    
    onFiltersChange({
      ...filters,
      [key]: newArray
    });
  };

  const handleDateChange = (type: 'start' | 'end', date: Date | undefined) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [type]: date ? date.toISOString().split('T')[0] : ''
      }
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      dateRange: { start: '', end: '' },
      location: [],
      source: [],
      stage: [],
      status: [],
      associate: [],
      channel: [],
      trialStatus: [],
      conversionStatus: [],
      retentionStatus: [],
      minLTV: undefined,
      maxLTV: undefined
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.location.length > 0) count++;
    if (filters.source.length > 0) count++;
    if (filters.stage.length > 0) count++;
    if (filters.status.length > 0) count++;
    if (filters.associate.length > 0) count++;
    if (filters.channel.length > 0) count++;
    if (filters.trialStatus.length > 0) count++;
    if (filters.conversionStatus.length > 0) count++;
    if (filters.retentionStatus.length > 0) count++;
    if (filters.minLTV !== undefined || filters.maxLTV !== undefined) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card className={`bg-white/80 backdrop-blur-sm border-0 shadow-xl ${className}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-slate-50/50 transition-colors rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Filter className="w-5 h-5 text-blue-600" />
                Advanced Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    {activeFiltersCount} active
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      clearAllFilters();
                    }}
                    className="gap-2"
                  >
                    <X className="w-3 h-3" />
                    Clear All
                  </Button>
                )}
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-600" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <CalendarIcon className="w-4 h-4" />
                  Start Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.dateRange.start && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.start ? (
                        format(new Date(filters.dateRange.start), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.start ? new Date(filters.dateRange.start) : undefined}
                      onSelect={(date) => handleDateChange('start', date)}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <CalendarIcon className="w-4 h-4" />
                  End Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.dateRange.end && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.end ? (
                        format(new Date(filters.dateRange.end), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.end ? new Date(filters.dateRange.end) : undefined}
                      onSelect={(date) => handleDateChange('end', date)}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Multi-select Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Locations */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <MapPin className="w-4 h-4" />
                  Locations ({filters.location.length})
                </Label>
                <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1">
                  {uniqueValues.locations.map(location => (
                    <label key={location} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={filters.location.includes(location)}
                        onChange={(e) => handleArrayFilterChange('location', location, e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-slate-700">{location}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sources */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Target className="w-4 h-4" />
                  Sources ({filters.source.length})
                </Label>
                <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1">
                  {uniqueValues.sources.map(source => (
                    <label key={source} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={filters.source.includes(source)}
                        onChange={(e) => handleArrayFilterChange('source', source, e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-slate-700">{source}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Stages */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <TrendingUp className="w-4 h-4" />
                  Stages ({filters.stage.length})
                </Label>
                <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1">
                  {uniqueValues.stages.map(stage => (
                    <label key={stage} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={filters.stage.includes(stage)}
                        onChange={(e) => handleArrayFilterChange('stage', stage, e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-slate-700">{stage}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Associates */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Users className="w-4 h-4" />
                  Associates ({filters.associate.length})
                </Label>
                <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1">
                  {uniqueValues.associates.map(associate => (
                    <label key={associate} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={filters.associate.includes(associate)}
                        onChange={(e) => handleArrayFilterChange('associate', associate, e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-slate-700">{associate}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Conversion Status */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Conversion Status ({filters.conversionStatus.length})
                </Label>
                <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1">
                  {uniqueValues.conversionStatuses.map(status => (
                    <label key={status} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={filters.conversionStatus.includes(status)}
                        onChange={(e) => handleArrayFilterChange('conversionStatus', status, e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-slate-700">{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Trial Status */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Trial Status ({filters.trialStatus.length})
                </Label>
                <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1">
                  {uniqueValues.trialStatuses.map(status => (
                    <label key={status} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={filters.trialStatus.includes(status)}
                        onChange={(e) => handleArrayFilterChange('trialStatus', status, e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-slate-700">{status}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* LTV Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Min LTV</Label>
                <Input
                  type="number"
                  placeholder="Min LTV"
                  value={filters.minLTV || ''}
                  onChange={(e) => handleFilterChange('minLTV', e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Max LTV</Label>
                <Input
                  type="number"
                  placeholder="Max LTV"
                  value={filters.maxLTV || ''}
                  onChange={(e) => handleFilterChange('maxLTV', e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </div>
            </div>

            {/* Apply/Reset Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-slate-600">
                {activeFiltersCount > 0 ? `${activeFiltersCount} filter(s) applied` : 'No filters applied'}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearAllFilters}
                  className="gap-2"
                  disabled={activeFiltersCount === 0}
                >
                  <RefreshCw className="w-3 h-3" />
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
