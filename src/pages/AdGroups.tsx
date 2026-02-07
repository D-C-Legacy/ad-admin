import { useState, useMemo } from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import { formatCurrency, formatNumber } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdGroups() {
  const { campaigns, adGroups, selectedAccountId, toggleAdGroupStatus, updateAdGroupBid } = useDashboard();
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('all');
  const [editingBid, setEditingBid] = useState<string | null>(null);
  const [bidValue, setBidValue] = useState('');

  const accountCampaigns = useMemo(
    () => campaigns.filter((c) => c.accountId === selectedAccountId),
    [campaigns, selectedAccountId]
  );

  const filteredAdGroups = useMemo(
    () => selectedCampaignId !== 'all'
      ? adGroups.filter((ag) => ag.campaignId === selectedCampaignId)
      : adGroups.filter((ag) => accountCampaigns.some((c) => c.id === ag.campaignId)).slice(0, 50),
    [adGroups, selectedCampaignId, accountCampaigns]
  );

  const handleBidSave = (agId: string) => {
    const val = parseFloat(bidValue);
    if (!isNaN(val) && val > 0) updateAdGroupBid(agId, val);
    setEditingBid(null);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Ad Groups</h1>

      <div className="flex gap-3 items-end">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Campaign</Label>
          <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
            <SelectTrigger className="w-[300px] h-9 text-sm"><SelectValue placeholder="All campaigns (first 50)" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All (first 50)</SelectItem>
              {accountCampaigns.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <span className="text-sm text-muted-foreground">{filteredAdGroups.length} ad groups</span>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs w-8">On/Off</TableHead>
                <TableHead className="text-xs">Ad Group</TableHead>
                <TableHead className="text-xs">Targeting</TableHead>
                <TableHead className="text-xs text-right">Bid</TableHead>
                <TableHead className="text-xs text-right">Impressions</TableHead>
                <TableHead className="text-xs text-right">Clicks</TableHead>
                <TableHead className="text-xs text-right">Conversions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdGroups.map((ag) => (
                <TableRow key={ag.id}>
                  <TableCell>
                    <Switch
                      checked={ag.status === 'active'}
                      onCheckedChange={() => toggleAdGroupStatus(ag.id)}
                      className="scale-75"
                    />
                  </TableCell>
                  <TableCell className="text-xs font-medium max-w-[200px] truncate">{ag.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {ag.targeting.geo.map((g) => (
                        <Badge key={g} variant="outline" className="text-[10px] px-1">{g}</Badge>
                      ))}
                      {ag.targeting.device.map((d) => (
                        <Badge key={d} variant="secondary" className="text-[10px] px-1">{d}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-right">
                    {editingBid === ag.id ? (
                      <Input
                        type="number"
                        value={bidValue}
                        onChange={(e) => setBidValue(e.target.value)}
                        onBlur={() => handleBidSave(ag.id)}
                        onKeyDown={(e) => e.key === 'Enter' && handleBidSave(ag.id)}
                        className="h-7 w-20 text-xs"
                        autoFocus
                      />
                    ) : (
                      <span
                        className="tabular-nums cursor-pointer hover:underline"
                        onClick={() => { setEditingBid(ag.id); setBidValue(String(ag.bidAmount)); }}
                      >
                        {formatCurrency(ag.bidAmount)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-right tabular-nums">{formatNumber(ag.impressions)}</TableCell>
                  <TableCell className="text-xs text-right tabular-nums">{formatNumber(ag.clicks)}</TableCell>
                  <TableCell className="text-xs text-right tabular-nums">{formatNumber(ag.conversions)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
