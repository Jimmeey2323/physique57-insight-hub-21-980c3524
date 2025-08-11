
import React from 'react';
import { ImprovedLeadsSection } from '@/components/dashboard/ImprovedLeadsSection';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, Filter, Database, Eye, BarChart3, TrendingUp, Users, Target } from 'lucide-react';
import { Footer } from '@/components/ui/footer';
import { cn } from '@/lib/utils';

const FunnelLeads = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Enhanced Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 text-white">
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -left-4 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-10 w-24 h-24 bg-blue-300/20 rounded-full animate-bounce delay-1000"></div>
          <div className="absolute bottom-10 left-20 w-40 h-40 bg-indigo-300/10 rounded-full animate-pulse delay-500"></div>
          <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-cyan-300/15 rounded-full animate-ping delay-700"></div>
        </div>
        
        <div className="relative px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8 animate-fade-in">
              <Button 
                onClick={() => navigate('/')} 
                variant="outline" 
                size="sm" 
                className="gap-2 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-200 hover:scale-105"
              >
                <Home className="w-4 h-4" />
                Dashboard
              </Button>
              
              <div className="flex items-center gap-3">
                <Badge className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                  <Database className="w-3 h-3 mr-1" />
                  Lead Analytics
                </Badge>
                <Badge className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                  <BarChart3 className="w-3 h-3 mr-1" />
                  Real-time Data
                </Badge>
              </div>
            </div>
            
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20 animate-fade-in-up shadow-lg">
                <Filter className="w-5 h-5" />
                <span className="font-semibold">Advanced Lead Analytics</span>
              </div>
              
              <h1 className={cn(
                "text-5xl md:text-6xl font-black bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent",
                "animate-fade-in-up delay-200 tracking-tight"
              )}>
                Lead Performance Hub
              </h1>
              
              <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-300 font-medium">
                Comprehensive lead generation analysis with advanced conversion tracking, funnel optimization, 
                and performance insights across all channels and associates
              </p>
              
              {/* Enhanced Key Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 animate-fade-in-up delay-400 max-w-4xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center justify-center mb-3">
                    <Users className="w-8 h-8 text-blue-200" />
                  </div>
                  <div className="text-2xl font-bold text-white">2,400+</div>
                  <div className="text-sm text-blue-200">Total Leads</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center justify-center mb-3">
                    <Target className="w-8 h-8 text-green-200" />
                  </div>
                  <div className="text-2xl font-bold text-white">24.5%</div>
                  <div className="text-sm text-green-200">Conversion Rate</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center justify-center mb-3">
                    <TrendingUp className="w-8 h-8 text-amber-200" />
                  </div>
                  <div className="text-2xl font-bold text-white">₹45K</div>
                  <div className="text-sm text-amber-200">Avg LTV</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center justify-center mb-3">
                    <BarChart3 className="w-8 h-8 text-purple-200" />
                  </div>
                  <div className="text-2xl font-bold text-white">18.2%</div>
                  <div className="text-sm text-purple-200">Growth Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ImprovedLeadsSection />
      
      <Footer />

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        
        .delay-200 {
          animation-delay: 0.2s;
        }
        
        .delay-300 {
          animation-delay: 0.3s;
        }
        
        .delay-400 {
          animation-delay: 0.4s;
        }
      `}</style>
    </div>
  );
};

export default FunnelLeads;
