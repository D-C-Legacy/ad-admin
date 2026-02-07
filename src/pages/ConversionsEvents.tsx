import { useState, useMemo } from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import { computeConversionEvents, formatCurrency, formatNumber } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Target } from 'lucide-react';

export default function ConversionsEvents() {
  const { selectedAccountId, campaigns } = useDashboard();
  const [clickWindow, setClickWindow] = useState('7');
  const [viewWindow, setViewWindow] = useState('1');

  const attributionDays = parseInt(clickWindow);

  const events = useMemo(
    () => computeConversionEvents(selectedAccountId, attributionDays),
    [selectedAccountId, attributionDays]
  );

  const campaignConversions = useMemo(() => {
    const accountCampaigns = campaigns
      .filter((c) => c.accountId === selectedAccountId && c.conversions > 0)
      .sort((a, b) => b.conversions - a.conversions)
      .slice(0, 10);
    return accountCampaigns.map((c) => ({
      name: c.name.length > 25 ? c.name.slice(0, 25) + '…' : c.name,
      conversions: c.conversions,
      costPerConversion: c.totalSpend > 0 && c.conversions > 0 ? Math.round((c.totalSpend / c.conversions) * 100) / 100 : 0,
    }));
  }, [campaigns, selectedAccountId]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Conversions & Events</h1>

      {/* Attribution Settings */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Attribution Window Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Click-through window</Label>
              <Select value={clickWindow} onValueChange={setClickWindow}>
                <SelectTrigger className="w-[140px] h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="28">28 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">View-through window</Label>
              <Select value={viewWindow} onValueChange={setViewWindow}>
                <SelectTrigger className="w-[140px] h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="28">28 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversion Events */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4" /> Conversion Events
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Event</TableHead>
                <TableHead className="text-xs text-right">Count</TableHead>
                <TableHead className="text-xs text-right">Value</TableHead>
                <TableHead className="text-xs text-right">Conv. Rate</TableHead>
                <TableHead className="text-xs text-right">Cost/Conv.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((ev) => (
                <TableRow key={ev.id}>
                  <TableCell className="text-xs font-medium">{ev.name}</TableCell>
                  <TableCell className="text-xs text-right tabular-nums">{formatNumber(ev.count)}</TableCell>
                  <TableCell className="text-xs text-right tabular-nums">{formatCurrency(ev.value)}</TableCell>
                  <TableCell className="text-xs text-right tabular-nums">{ev.conversionRate}%</TableCell>
                  <TableCell className="text-xs text-right tabular-nums">{formatCurrency(ev.costPerConversion)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Conversions by Campaign */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Conversions by Campaign (Top 10)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={campaignConversions} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} width={140} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="conversions" fill="hsl(var(--chart-1))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
