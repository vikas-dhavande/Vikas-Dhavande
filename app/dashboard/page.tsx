'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Bar, BarChart } from "recharts";
import { Eye, FileText, Users, TrendingUp, ArrowUpRight, ArrowDownRight, BookOpen, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HairlineAccent } from "@/components/ui/hairline-accent";

interface AnalyticsStats {
  totalViews: number;
  uniqueVisitors: number;
  topPages: { path: string; views: number }[];
  chartData: { name: string; views: number }[];
}

interface BlogStats {
  total: number;
  published: number;
  drafts: number;
  recent: { id: string; title: string; slug: string; published_at: string | null; created_at: string }[];
}

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsStats | null>(null);
  const [blogStats, setBlogStats] = useState<BlogStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [analyticsRes, blogsRes] = await Promise.all([
          fetch('/api/analytics/stats'),
          fetch('/api/blog'),
        ]);

        if (analyticsRes.ok) {
          const data = await analyticsRes.json();
          setAnalytics(data);
        }

        if (blogsRes.ok) {
          const blogs = await blogsRes.json();
          setBlogStats({
            total: blogs.length,
            published: blogs.filter((b: any) => b.published_at).length,
            drafts: blogs.filter((b: any) => !b.published_at).length,
            recent: blogs.slice(0, 5),
          });
        }
      } catch (e) {
        console.error('Dashboard load error', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const StatCard = ({
    title,
    value,
    sub,
    icon: Icon,
    trend,
    color,
  }: {
    title: string;
    value: string | number;
    sub: string;
    icon: React.ElementType;
    trend?: 'up' | 'down';
    color: string;
  }) => (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {loading ? <span className="opacity-30 animate-pulse">—</span> : value}
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
          {trend === 'up' && <ArrowUpRight className="h-3 w-3 text-green-500" />}
          {trend === 'down' && <ArrowDownRight className="h-3 w-3 text-destructive" />}
          {sub}
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* 3D Isometric Telemetry Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-border bg-card/80 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-3.5">
          <HairlineAccent figure="plot" size="medium" />
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                Executive Telemetry &amp; Operations
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                live
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Real-time traffic performance, visitor sessions, and editorial activity
            </p>
          </div>
        </div>
        <Link href="/dashboard/analytics">
          <Button variant="outline" size="sm" className="gap-1.5 self-start sm:self-auto text-xs">
            Full Analytics <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Page Views"
          value={analytics?.totalViews.toLocaleString() ?? '—'}
          sub="Tracked via analytics events"
          icon={Eye}
          color="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          title="Unique Visitors"
          value={analytics?.uniqueVisitors.toLocaleString() ?? '—'}
          sub="Unique browser sessions"
          icon={Users}
          color="bg-violet-500/10 text-violet-600 dark:text-violet-400"
        />
        <StatCard
          title="Blog Posts"
          value={blogStats?.total ?? '—'}
          sub={`${blogStats?.published ?? 0} published · ${blogStats?.drafts ?? 0} drafts`}
          icon={FileText}
          color="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          title="Published"
          value={blogStats?.published ?? '—'}
          sub="Live posts visible to public"
          icon={BookOpen}
          color="bg-orange-500/10 text-orange-600 dark:text-orange-400"
          trend="up"
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Traffic Overview</CardTitle>
              <CardDescription>Page views over the last 7 days</CardDescription>
            </div>
            <HairlineAccent figure="plot" size="compact" intensity={0.5} />
          </CardHeader>
          <CardContent className="h-[280px]">
            {loading ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Loading chart…</div>
            ) : analytics?.chartData?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" className="text-xs" tick={{ fontSize: 11 }} />
                  <YAxis className="text-xs" tick={{ fontSize: 11 }} />
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
                    fillOpacity={1}
                    fill="url(#colorViews)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <TrendingUp className="h-8 w-8 opacity-20" />
                <p className="text-sm">No analytics data yet</p>
                <p className="text-xs">Views will appear here as users visit the site</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Pages */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
            <CardDescription>Most visited paths on your site</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-8 rounded bg-muted animate-pulse" />
                ))}
              </div>
            ) : analytics?.topPages?.length ? (
              <div className="space-y-3">
                {analytics.topPages.map((page, i) => {
                  const max = analytics.topPages[0].views;
                  const pct = Math.round((page.views / max) * 100);
                  return (
                    <div key={page.path} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium truncate max-w-[160px]">{page.path}</span>
                        <span className="text-muted-foreground text-xs">{page.views} views</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="progress-fill bg-primary/70"
                          style={{ '--bar-width': `${pct}%` } as React.CSSProperties}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
                <Eye className="h-8 w-8 opacity-20" />
                <p className="text-sm">No page data yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Blog Posts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Blog Posts</CardTitle>
            <CardDescription>Latest content from your CMS</CardDescription>
          </div>
          <Link href="/dashboard/blog">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-12 rounded bg-muted animate-pulse" />)}
            </div>
          ) : blogStats?.recent?.length ? (
            <div className="divide-y divide-border">
              {blogStats.recent.map((blog) => (
                <div key={blog.id} className="flex items-center justify-between py-3 gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{blog.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        {new Date(blog.published_at ?? blog.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={blog.published_at ? 'default' : 'secondary'} className="text-xs">
                      {blog.published_at ? 'Published' : 'Draft'}
                    </Badge>
                    <Link href={`/dashboard/blog/${blog.id}/edit`}>
                      <Button variant="ghost" size="sm" className="text-xs h-7">Edit</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 gap-3 text-muted-foreground">
              <BookOpen className="h-8 w-8 opacity-20" />
              <p className="text-sm">No blog posts yet</p>
              <Link href="/dashboard/blog/new">
                <Button size="sm">Create your first post</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
