
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSalesData } from '@/hooks/useSalesData';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { AlertTriangle, Database } from 'lucide-react';
import { DiscountFilterSection } from './DiscountFilterSection';
import { DiscountMetricsCards } from './DiscountMetricsCards';
import { DiscountAnalyticsCharts } from './DiscountAnalyticsCharts';
import { DiscountDataTable } from './DiscountDataTable';
import { DiscountInteractiveTopBottomLists } from './DiscountInteractiveTopBottomLists';
import { DiscountDistributionCharts } from './DiscountDistributionCharts';
import { DiscountMonthOnMonthTable } from './DiscountMonthOnMonthTable';
import { DiscountYearOnYearTable } from './DiscountYearOnYearTable';
import { SourceDataModal } from '@/components/ui/SourceDataModal';
import { Button } from '@/components/ui/button';

export const DiscountsSection: React.FC = () => {
  const { data, loading, error } = useSalesData();
  const [filters, setFilters] = useState<any>({});
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);
  const [showSourceData, setShowSourceData] = useState(false);

  if (loading) {
    return <LoadingSkeleton type="full-page" />;
  }

  if (error) {
    const errorMessage = typeof error === 'string' ? error : 'An unknown error occurred';
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg text-red-600">Error loading discount data</p>
          <p className="text-sm text-gray-500">{errorMessage}</p>
        </div>
      </div>
    );
  }

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const toggleFilterCollapse = () => {
    setIsFilterCollapsed(!isFilterCollapsed);
  };

  // Prepare source data for modal
  const sourceDefinitions = [
    {
      name: "Sales",
      sheetName: "Sales",
      spreadsheetId: "149ILDqovzZA6FRUJKOwzutWdVqmqWBtWPfzG3A0zxTI",
      data: data || []
    }
  ];

  return (
    <section className="space-y-6">
      {/* Full width filter section */}
      <div className="w-full">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Discount Analysis</CardTitle>
              <p className="text-sm text-muted-foreground">Explore discount trends and their impact on sales.</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowSourceData(true)}
              className="flex items-center gap-2"
            >
              <Database className="w-4 h-4" />
              View Source Data
            </Button>
          </CardHeader>
          <CardContent className="w-full">
            <DiscountFilterSection 
              data={data} 
              onFiltersChange={handleFiltersChange}
              isCollapsed={isFilterCollapsed}
              onToggleCollapse={toggleFilterCollapse}
            />
          </CardContent>
        </Card>
      </div>

      <DiscountMetricsCards data={data} filters={filters} />

      <div className="grid gap-6 md:grid-cols-2">
        <DiscountAnalyticsCharts data={data} filters={filters} />
        <DiscountDistributionCharts data={data} filters={filters} />
      </div>

      {/* Interactive Top/Bottom Lists - 50% width each */}
      <DiscountInteractiveTopBottomLists data={data} filters={filters} />

      <DiscountMonthOnMonthTable data={data} filters={filters} />

      <DiscountYearOnYearTable data={data} filters={filters} />

      <DiscountDataTable data={data} filters={filters} />

      {/* Source Data Modal */}
      <SourceDataModal
        open={showSourceData}
        onOpenChange={setShowSourceData}
        sources={sourceDefinitions}
      />
    </section>
  );
};
