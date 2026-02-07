import { useState, useMemo } from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import { formatCurrency } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Lightbulb, Check } from 'lucide-react';
import { BidStrategy } from '@/lib/types';

interface Suggestion {
  id: string;
  text: string;
  applied: boolean;
  action: () => void;
}

export default function BiddingOptimization() {
  const { campaigns, selectedAccountId, updateCampaignBidStrategy, adGroups, updateAdGroupBid } = useDashboard();
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());

  const accountCampaigns = useMemo(
    () => campaigns.filter((c) => c.accountId === selectedAccountId),
    [campaigns, selectedAccountId]
  );

  const strategyData = useMemo(() => {
    const grouped: Record<string, { strategy: string; avgCpc: number; avgCpm: number; campaigns: number }> = {};
    const labels: Record<BidStrategy, string> = {
      manual_cpc: 'Manual CPC',
      manual_cpm: 'Manual CPM',
      optimized_conversions: 'Optimized Conv.',
    };
    accountCampaigns.forEach((c) => {
      const key = c.bidStrategy;
      if (!grouped[key]) grouped[key] = { strategy: labels[key], avgCpc: 0, avgCpm: 0, campaigns: 0 };
      grouped[key].avgCpc += c.cpc;
      grouped[key].avgCpm += c.cpm;
      grouped[key].campaigns += 1;
    });
    return Object.values(grouped).map((g) => ({
      ...g,
      avgCpc: g.campaigns > 0 ? Math.round((g.avgCpc / g.campaigns) * 100) / 100 : 0,
      avgCpm: g.campaigns > 0 ? Math.round((g.avgCpm / g.campaigns) * 100) / 100 : 0,
    }));
  }, [accountCampaigns]);

  // Generate suggestions
  const suggestions = useMemo<Suggestion[]>(() => {
    const result: Suggestion[] = [];
    const highCtrGroups = adGroups.filter((ag) => {
      const ctr = ag.impressions > 0 ? ag.clicks / ag.impressions : 0;
      return ctr > 0.025 && accountCampaigns.some((c) => c.id === ag.campaignId);
    });
    if (highCtrGroups.length > 0) {
      result.push({
        id: 'high-ctr-bid',
        text: `Increase bid by 10% for ${highCtrGroups.length} high-CTR ad groups to capture more volume.`,
        applied: appliedSuggestions.has('high-ctr-bid'),
        action: () => {
          highCtrGroups.forEach((ag) => updateAdGroupBid(ag.id, Math.round(ag.bidAmount * 1.1 * 100) / 100));
          setAppliedSuggestions((prev) => new Set(prev).add('high-ctr-bid'));
        },
      });
    }

    const lowConvCampaigns = accountCampaigns.filter((c) => c.status === 'active' && c.conversions < 5 && c.totalSpend > 500);
    if (lowConvCampaigns.length > 0) {
      result.push({
        id: 'low-conv-reduce',
        text: `Reduce spend on ${lowConvCampaigns.length} low-conversion campaigns (< 5 conversions, > $500 spend).`,
        applied: appliedSuggestions.has('low-conv-reduce'),
        action: () => {
          lowConvCampaigns.forEach((c) => updateCampaignBidStrategy(c.id, 'optimized_conversions'));
          setAppliedSuggestions((prev) => new Set(prev).add('low-conv-reduce'));
        },
      });
    }

    const manualCampaigns = accountCampaigns.filter((c) => c.bidStrategy === 'manual_cpc' && c.conversions > 20);
    if (manualCampaigns.length > 0) {
      result.push({
        id: 'switch-optimized',
        text: `Switch ${manualCampaigns.length} high-converting Manual CPC campaigns to Optimized for Conversions.`,
        applied: appliedSuggestions.has('switch-optimized'),
        action: () => {
          manualCampaigns.forEach((c) => updateCampaignBidStrategy(c.id, 'optimized_conversions'));
          setAppliedSuggestions((prev) => new Set(prev).add('switch-optimized'));
        },
      });
    }

    return result;
  }, [accountCampaigns, adGroups, appliedSuggestions, updateAdGroupBid, updateCampaignBidStrategy]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Bidding & Optimization</h1>

      {/* Bid strategy per campaign */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Campaign Bid Strategies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[300px] overflow-auto">
            {accountCampaigns.slice(0, 20).map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-3 py-1.5 border-b last:border-0">
                <span className="text-xs font-medium truncate flex-1">{c.name}</span>
                <Select
                  value={c.bidStrategy}
                  onValueChange={(v) => updateCampaignBidStrategy(c.id, v as BidStrategy)}
                >
                  <SelectTrigger className="w-[200px] h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual_cpc">Manual CPC</SelectItem>
                    <SelectItem value="manual_cpm">Manual CPM</SelectItem>
                    <SelectItem value="optimized_conversions">Optimized for Conversions</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-xs tabular-nums text-muted-foreground w-20 text-right">
                  CPC: {formatCurrency(c.cpc)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance comparison */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Strategy Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={strategyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="strategy" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="avgCpc" name="Avg CPC ($)" fill="hsl(var(--chart-1))" />
                <Bar dataKey="avgCpm" name="Avg CPM ($)" fill="hsl(var(--chart-3))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Suggestions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Lightbulb className="h-4 w-4" /> Optimization Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {suggestions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No suggestions available — campaigns are well-optimized.</p>
          ) : (
            suggestions.map((s) => (
              <div key={s.id} className="flex items-start gap-3 p-3 rounded-lg border">
                <div className="flex-1">
                  <p className="text-xs">{s.text}</p>
                </div>
                <Button
                  size="sm"
                  variant={s.applied ? 'outline' : 'default'}
                  className="shrink-0 text-xs"
                  disabled={s.applied}
                  onClick={s.action}
                >
                  {s.applied ? <><Check className="h-3 w-3 mr-1" /> Applied</> : 'Apply'}
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
