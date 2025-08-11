
import React from 'react';
import ExecutiveSummarySection from '@/components/dashboard/ExecutiveSummarySection';
import { Footer } from '@/components/ui/footer';

const ExecutiveSummary = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20">
      <ExecutiveSummarySection />
      <Footer />
    </div>
  );
};

export default ExecutiveSummary;
