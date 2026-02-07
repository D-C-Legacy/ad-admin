import { useState, useMemo } from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import { formatCurrency, formatNumber } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Plus, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Campaign, CampaignObjective, BidStrategy } from '@/lib/types';

type SortKey = 'name' | 'status' | 'objective' | 'dailyBudget' | 'totalSpend' | 'cpc' | 'cpm';

export default function Campaigns() {
  const { campaigns, selectedAccountId, toggleCampaignStatus, addCampaign } = useDashboard();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [objectiveFilter, setObjectiveFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('totalSpend');
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const pageSize = 20;

  // New campaign form
  const [newName, setNewName] = useState('');
  const [newObjective, setNewObjective] = useState<CampaignObjective>('conversions');
  const [newBudget, setNewBudget] = useState('500');
  const [newStrategy, setNewStrategy] = useState<BidStrategy>('manual_cpc');

  const accountCampaigns = useMemo(() =>
    campaigns.filter((c) => c.accountId === selectedAccountId),
    [campaigns, selectedAccountId]
  );

  const filtered = useMemo(() => {
    let result = accountCampaigns;
    if (search) result = result.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter !== 'all') result = result.filter((c) => c.status === statusFilter);
    if (objectiveFilter !== 'all') result = result.filter((c) => c.objective === objectiveFilter);
    result = [...result].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === 'string') return sortAsc ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal);
      return sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
    return result;
  }, [accountCampaigns, search, statusFilter, objectiveFilter, sortKey, sortAsc]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const handleCreate = () => {
    const campaign: Campaign = {
      id: `cmp-new-${Date.now()}`,
      accountId: selectedAccountId,
      name: newName || 'New Campaign',
      status: 'active',
      objective: newObjective,
      dailyBudget: Number(newBudget) || 500,
      totalSpend: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      cpc: 0,
      cpm: 0,
      bidStrategy: newStrategy,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2026-12-31',
    };
    addCampaign(campaign);
    setShowCreate(false);
    setNewName('');
    setNewBudget('500');
  };

  const statusColor: Record<string, string> = {
    active: 'bg-success text-success-foreground',
    paused: 'bg-muted text-muted-foreground',
    limited: 'bg-warning text-warning-foreground',
  };

  const SortHeader = ({ label, sortKeyVal }: { label: string; sortKeyVal: SortKey }) => (
    <TableHead
      className="text-xs cursor-pointer select-none"
      onClick={() => handleSort(sortKeyVal)}
    >
      <span className="flex items-center gap-1">
        {label}
        <ArrowUpDown className="h-3 w-3" />
      </span>
    </TableHead>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-1" /> Create Campaign
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 h-9 w-[250px] text-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[140px] h-9 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="limited">Limited</SelectItem>
          </SelectContent>
        </Select>
        <Select value={objectiveFilter} onValueChange={(v) => { setObjectiveFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[160px] h-9 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Objectives</SelectItem>
            <SelectItem value="traffic">Traffic</SelectItem>
            <SelectItem value="conversions">Conversions</SelectItem>
            <SelectItem value="app_installs">App Installs</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground self-center">
          {filtered.length} campaigns
        </span>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs w-8">On/Off</TableHead>
                <SortHeader label="Campaign" sortKeyVal="name" />
                <SortHeader label="Status" sortKeyVal="status" />
                <SortHeader label="Objective" sortKeyVal="objective" />
                <SortHeader label="Daily Budget" sortKeyVal="dailyBudget" />
                <SortHeader label="Spend" sortKeyVal="totalSpend" />
                <SortHeader label="CPC" sortKeyVal="cpc" />
                <SortHeader label="CPM" sortKeyVal="cpm" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Switch
                      checked={c.status === 'active'}
                      onCheckedChange={() => toggleCampaignStatus(c.id)}
                      className="scale-75"
                    />
                  </TableCell>
                  <TableCell className="text-xs font-medium max-w-[220px] truncate">{c.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] ${statusColor[c.status]}`}>{c.status}</Badge>
                  </TableCell>
                  <TableCell className="text-xs capitalize">{c.objective.replace('_', ' ')}</TableCell>
                  <TableCell className="text-xs tabular-nums text-right">{formatCurrency(c.dailyBudget)}</TableCell>
                  <TableCell className="text-xs tabular-nums text-right">{formatCurrency(c.totalSpend)}</TableCell>
                  <TableCell className="text-xs tabular-nums text-right">{formatCurrency(c.cpc)}</TableCell>
                  <TableCell className="text-xs tabular-nums text-right">{formatCurrency(c.cpm)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Create Campaign Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Campaign</DialogTitle>
            <DialogDescription>Configure your new campaign and add it to the account.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm">Campaign Name</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Q1 Conversions — US" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Objective</Label>
              <Select value={newObjective} onValueChange={(v) => setNewObjective(v as CampaignObjective)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="traffic">Traffic</SelectItem>
                  <SelectItem value="conversions">Conversions</SelectItem>
                  <SelectItem value="app_installs">App Installs</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Daily Budget ($)</Label>
              <Input type="number" value={newBudget} onChange={(e) => setNewBudget(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Bid Strategy</Label>
              <Select value={newStrategy} onValueChange={(v) => setNewStrategy(v as BidStrategy)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual_cpc">Manual CPC</SelectItem>
                  <SelectItem value="manual_cpm">Manual CPM</SelectItem>
                  <SelectItem value="optimized_conversions">Optimized for Conversions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
