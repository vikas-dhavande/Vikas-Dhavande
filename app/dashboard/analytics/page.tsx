'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Area, AreaChart, ResponsiveContainer, XAxis, YAxis,
  CartesianGrid, Tooltip, Bar, BarChart, Cell
} from "recharts";
import { Eye, Users, TrendingUp, BarChart2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const RANGES = [
  { label: '24h', value: '24h' },
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
] as const;

type Range = '24h' | '7d' | '30d';

interface Stats {
  totalViews: number;
  uniqueVisitors: number;
  bounceRate: string;
  topPages: { path: string; views: number }[];
  chartData: { name: string; views: number }[];
}

export default function AnalyticsPage() {
  const [range, setRange] = useState<Range>('7d');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async (r: Range) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics/stats?range=${r}`);
      if (res.ok) {
        setStats(await res.json());
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(range); }, [range]);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--primary) / 0.8)', 'hsl(var(--primary) / 0.6)', 'hsl(var(--primary) / 0.4)', 'hsl(var(--primary) / 0.3)'];

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Monitor traffic and visitor behaviour on your site</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden">
            {RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`px-3 py-1.5 text-sm transition-colors ${
                  range === r.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-muted-foreground hover:bg-muted'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <Button variant="outline" size="icon" onClick={() => fetchStats(range)} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Total Page Views', value: stats?.totalViews, icon: Eye, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
          { label: 'Unique Visitors', value: stats?.uniqueVisitors, icon: Users, color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
          { label: 'Bounce Rate', value: stats?.bounceRate, icon: TrendingUp, color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <span className="opacity-30 animate-pulse">—</span> : (value?.toLocaleString?.() ?? value ?? '0')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Traffic Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Page Views Over Time</CardTitle>
          <CardDescription>
            Daily view counts for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[320px]">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : stats?.chartData?.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#grad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <BarChart2 className="h-10 w-10 opacity-20" />
              <p className="text-sm font-medium">No data for this period</p>
              <p className="text-xs">Analytics events will appear here as users visit the site</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Pages */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Pages by Views</CardTitle>
            <CardDescription>Most visited paths during the selected range</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : stats?.topPages?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.topPages.slice(0, 8)}
                  layout="vertical"
                  margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
                >
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis
                    type="category"
                    dataKey="path"
                    width={100}
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) => v.length > 14 ? v.slice(0, 14) + '…' : v}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="views" radius={[0, 4, 4, 0]}>
                    {stats.topPages.slice(0, 8).map((_, i) => (
                      <Cell key={i} fill={COLORS[Math.min(i, COLORS.length - 1)]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Pages Table</CardTitle>
            <CardDescription>Ranked by number of views</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3,4,5].map(i => <div key={i} className="h-8 rounded bg-muted animate-pulse" />)}
              </div>
            ) : stats?.topPages?.length ? (
              <div className="space-y-2">
                {stats.topPages.slice(0, 8).map((page, i) => {
                  const max = stats.topPages[0].views;
                  const pct = Math.round((page.views / max) * 100);
                  return (
                    <div key={page.path} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs text-muted-foreground w-4 shrink-0">#{i + 1}</span>
                          <span className="truncate font-medium">{page.path}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs ml-2 shrink-0">{page.views}</Badge>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="progress-fill bg-primary/60"
                          style={{ '--bar-width': `${pct}%` } as React.CSSProperties}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">No data yet</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
