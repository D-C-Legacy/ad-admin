import { useMemo } from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import { getAccountMetrics, generateTimeSeries, formatCurrency, formatNumber } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Eye, MousePointerClick, Target, BarChart3, Activity } from 'lucide-react';

export default function Dashboard() {
  const { selectedAccountId, dateRange, campaigns, currency } = useDashboard();

  const metrics = useMemo(
    () => getAccountMetrics(selectedAccountId, dateRange),
    [selectedAccountId, dateRange]
  );

  const daysMap: Record<string, number> = { today: 1, '7d': 7, '30d': 30, '90d': 90, custom: 30 };
  const days = daysMap[dateRange] || 30;

  const timeSeries = useMemo(
    () => generateTimeSeries(selectedAccountId, days),
    [selectedAccountId, days]
  );

  const accountCampaigns = useMemo(
    () => campaigns.filter((c) => c.accountId === selectedAccountId),
    [campaigns, selectedAccountId]
  );

  const topCampaigns = useMemo(
    () => [...accountCampaigns].sort((a, b) => b.conversions - a.conversions).slice(0, 5),
    [accountCampaigns]
  );

  const kpis = [
    { label: 'Spend', value: formatCurrency(metrics.spend), icon: DollarSign, trend: '+12.3%', up: true },
    { label: 'Impressions', value: formatNumber(metrics.impressions), icon: Eye, trend: '+8.1%', up: true },
    { label: 'Clicks', value: formatNumber(metrics.clicks), icon: MousePointerClick, trend: '+5.4%', up: true },
    { label: 'Conversions', value: formatNumber(metrics.conversions), icon: Target, trend: '+15.2%', up: true },
    { label: 'Avg CPC', value: formatCurrency(metrics.avgCpc), icon: BarChart3, trend: '-2.1%', up: false },
    { label: 'Avg CPM', value: formatCurrency(metrics.avgCpm), icon: Activity, trend: '-1.8%', up: false },
  ];

  const statusColor: Record<string, string> = {
    active: 'bg-success text-success-foreground',
    paused: 'bg-muted text-muted-foreground',
    limited: 'bg-warning text-warning-foreground',
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{kpi.label}</span>
                <kpi.icon className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="text-lg font-bold tabular-nums">{kpi.value}</div>
              <div className={`flex items-center gap-1 text-xs mt-1 ${kpi.up ? 'text-success' : 'text-destructive'}`}>
                {kpi.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {kpi.trend}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Spend Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeries}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 10 }} className="text-muted-foreground" />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Area type="monotone" dataKey="spend" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.1)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Clicks & Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeries}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Line yAxisId="left" type="monotone" dataKey="clicks" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="conversions" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Summary + Top Campaigns */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Campaign Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Active', count: metrics.activeCampaigns, status: 'active' },
              { label: 'Paused', count: metrics.pausedCampaigns, status: 'paused' },
              { label: 'Limited', count: metrics.limitedCampaigns, status: 'limited' },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={statusColor[s.status]}>{s.label}</Badge>
                </div>
                <span className="text-sm font-medium tabular-nums">{s.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Performing Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Campaign</TableHead>
                  <TableHead className="text-xs text-right">Conversions</TableHead>
                  <TableHead className="text-xs text-right">Spend</TableHead>
                  <TableHead className="text-xs text-right">CPC</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCampaigns.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="text-xs font-medium truncate max-w-[200px]">{c.name}</TableCell>
                    <TableCell className="text-xs text-right tabular-nums">{formatNumber(c.conversions)}</TableCell>
                    <TableCell className="text-xs text-right tabular-nums">{formatCurrency(c.totalSpend)}</TableCell>
                    <TableCell className="text-xs text-right tabular-nums">{formatCurrency(c.cpc)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
