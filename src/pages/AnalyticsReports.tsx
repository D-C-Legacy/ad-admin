import { useState, useMemo } from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import { generateTimeSeries, formatCurrency, formatNumber } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { Download } from 'lucide-react';

export default function AnalyticsReports() {
  const { campaigns, selectedAccountId, dateRange } = useDashboard();
  const [campaignFilter, setCampaignFilter] = useState<string>('all');

  const accountCampaigns = useMemo(
    () => campaigns.filter((c) => c.accountId === selectedAccountId),
    [campaigns, selectedAccountId]
  );

  const daysMap: Record<string, number> = { today: 1, '7d': 7, '30d': 30, '90d': 90, custom: 30 };
  const days = daysMap[dateRange] || 30;

  const timeSeries = useMemo(
    () => generateTimeSeries(selectedAccountId, days),
    [selectedAccountId, days]
  );

  const filteredCampaigns = useMemo(
    () => campaignFilter === 'all' ? accountCampaigns : accountCampaigns.filter((c) => c.id === campaignFilter),
    [accountCampaigns, campaignFilter]
  );

  const summaryStats = useMemo(() => {
    const totalSpend = filteredCampaigns.reduce((s, c) => s + c.totalSpend, 0);
    const totalImpressions = filteredCampaigns.reduce((s, c) => s + c.impressions, 0);
    const totalClicks = filteredCampaigns.reduce((s, c) => s + c.clicks, 0);
    const totalConversions = filteredCampaigns.reduce((s, c) => s + c.conversions, 0);
    return { totalSpend, totalImpressions, totalClicks, totalConversions };
  }, [filteredCampaigns]);

  const spendVsConversions = useMemo(
    () => filteredCampaigns.map((c) => ({ name: c.name, spend: c.totalSpend, conversions: c.conversions })),
    [filteredCampaigns]
  );

  const handleExport = () => {
    toast({
      title: 'Report Exported',
      description: `Analytics report for ${filteredCampaigns.length} campaign(s) has been exported.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Analytics & Reports</h1>
        <Button size="sm" variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-1" /> Export Report
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Campaign</Label>
          <Select value={campaignFilter} onValueChange={setCampaignFilter}>
            <SelectTrigger className="w-[250px] h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Campaigns</SelectItem>
              {accountCampaigns.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">CPC Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeries}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Line type="monotone" dataKey="cpc" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">CPM Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeries}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Line type="monotone" dataKey="cpm" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Spend vs Conversions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Spend vs. Conversions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="spend" name="Spend" tick={{ fontSize: 10 }} />
                <YAxis dataKey="conversions" name="Conversions" tick={{ fontSize: 10 }} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Scatter data={spendVsConversions} fill="hsl(var(--chart-1))" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Summary Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Summary Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Metric</TableHead>
                <TableHead className="text-xs text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="text-xs">Total Spend</TableCell>
                <TableCell className="text-xs text-right tabular-nums">{formatCurrency(summaryStats.totalSpend)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-xs">Total Impressions</TableCell>
                <TableCell className="text-xs text-right tabular-nums">{formatNumber(summaryStats.totalImpressions)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-xs">Total Clicks</TableCell>
                <TableCell className="text-xs text-right tabular-nums">{formatNumber(summaryStats.totalClicks)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-xs">Total Conversions</TableCell>
                <TableCell className="text-xs text-right tabular-nums">{formatNumber(summaryStats.totalConversions)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
