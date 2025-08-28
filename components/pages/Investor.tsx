import React, { useEffect, useMemo, useState } from 'react';
import { dataService } from '../../utils/dataService';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { TrendingUp, Users, LineChart, Gauge, Rocket, DollarSign, BarChart2, Clock, Shield } from 'lucide-react';

type KPI = {
  label: string;
  value: string;
  delta?: string;
  icon: React.ReactNode;
};

export const Investor: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [trend, setTrend] = useState<Array<{ date: string; score: number }>>([]);

  useEffect(() => {
    const run = async () => {
      try {
        const analytics = await dataService.getAnalytics();
        // Compute demo business KPIs from learning analytics
        const arpu = (analytics.totalTests * 0.7).toFixed(2); // demo mapping
        const cac = (2.5 + (100 - analytics.averageScore) / 50).toFixed(2);
        const mrr = (analytics.totalTests * 1.9).toFixed(0);
        const ltv = (Number(arpu) * (3 + analytics.studyStreak)).toFixed(0);
        const retention = Math.min(98, 40 + analytics.studyStreak * 8);

        setKpis([
          { label: 'MRR (demo)', value: `$${mrr}k`, delta: '+12% MoM', icon: <DollarSign className="h-5 w-5"/> },
          { label: 'ARPU', value: `$${arpu}`, delta: '+4.2% WoW', icon: <Gauge className="h-5 w-5"/> },
          { label: 'CAC', value: `$${cac}`, delta: '-6.1%', icon: <Rocket className="h-5 w-5"/> },
          { label: 'LTV', value: `$${ltv}`, delta: '+9.3%', icon: <TrendingUp className="h-5 w-5"/> },
          { label: 'Retention 30d', value: `${retention}%`, delta: '+2.0pp', icon: <Shield className="h-5 w-5"/> },
          { label: 'Avg. Score', value: `${analytics.averageScore}%`, delta: '+1.1pp', icon: <BarChart2 className="h-5 w-5"/> },
        ]);
        setTrend(analytics.progressTrend);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const gradient = 'bg-[radial-gradient(1200px_600px_at_0%_0%,rgba(59,130,246,0.12),transparent_60%),radial-gradient(1200px_600px_at_100%_0%,rgba(168,85,247,0.12),transparent_60%),linear-gradient(135deg,#0f172a_0%,#0b1220_100%)]';

  if (loading) {
    return (
      <div className={`flex-1 flex items-center justify-center ${gradient}`}>
        <div className="text-center">
          <div className="loading-futuristic mx-auto mb-4"/>
          <p className="text-white/70">Preparing investor dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 overflow-auto ${gradient}`}>
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">Investor Snapshot</h1>
              <p className="text-white/60">Demo KPIs derived from learning analytics</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="text-white/90 border-white/20">Export</Button>
              <Button>Share</Button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {kpis.map((kpi) => (
              <Card key={kpi.label} className="bg-white/5 border-white/10 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white/70">{kpi.label}</CardTitle>
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10">{kpi.icon}</div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpi.value}</div>
                  {kpi.delta && <p className="text-xs text-emerald-400 mt-1">{kpi.delta}</p>}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 bg-white/5 border-white/10 text-white">
              <CardHeader>
                <CardTitle>Learning → Revenue Correlation (demo)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 w-full relative">
                  {/* Minimal sparkline without external libs */}
                  <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#60a5fa"/>
                        <stop offset="100%" stopColor="#a78bfa"/>
                      </linearGradient>
                    </defs>
                    <polyline
                      fill="none"
                      stroke="url(#grad)"
                      strokeWidth="2"
                      points={(() => {
                        if (!trend.length) return '0,20 100,20';
                        const max = Math.max(...trend.map(t => t.score), 100);
                        const min = Math.min(...trend.map(t => t.score), 0);
                        return trend.map((t, i) => {
                          const x = (i / Math.max(1, trend.length - 1)) * 100;
                          const y = 40 - ((t.score - min) / Math.max(1, max - min)) * 30 - 5;
                          return `${x.toFixed(2)},${y.toFixed(2)}`;
                        }).join(' ');
                      })()}
                    />
                  </svg>
                  <div className="mt-4 grid grid-cols-3 gap-4 text-sm text-white/70">
                    <div className="flex items-center gap-2"><LineChart className="h-4 w-4"/> Avg score: <span className="text-white">{Math.round(trend.reduce((s,t)=>s+t.score,0)/Math.max(1,trend.length))}%</span></div>
                    <div className="flex items-center gap-2"><Clock className="h-4 w-4"/> Period: <span className="text-white">{trend.length} days</span></div>
                    <div className="flex items-center gap-2"><Users className="h-4 w-4"/> Cohort: <span className="text-white">Demo</span></div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10 text-white">
              <CardHeader>
                <CardTitle>Conversion Funnel (demo)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[{label:'Signup',v:92,color:'bg-blue-500'},{label:'Activation',v:71,color:'bg-violet-500'},{label:'Paid',v:38,color:'bg-fuchsia-500'}].map(s => (
                    <div key={s.label}>
                      <div className="flex justify-between text-sm text-white/70 mb-1">
                        <span>{s.label}</span><span className="text-white">{s.v}%</span>
                      </div>
                      <div className="h-2 w-full bg-white/10 rounded">
                        <div className={`h-full ${s.color} rounded`} style={{ width: `${s.v}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Investor;

