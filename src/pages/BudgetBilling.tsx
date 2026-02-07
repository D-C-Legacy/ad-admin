import { useMemo } from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import { formatCurrency, invoices } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DollarSign, TrendingDown, TrendingUp, CreditCard } from 'lucide-react';

export default function BudgetBilling() {
  const { campaigns, accounts, selectedAccountId } = useDashboard();

  const account = accounts.find((a) => a.id === selectedAccountId)!;
  const remaining = account.totalBudget - account.totalSpend;
  const usagePercent = account.totalBudget > 0 ? Math.min((account.totalSpend / account.totalBudget) * 100, 100) : 0;

  const accountCampaigns = useMemo(
    () => campaigns.filter((c) => c.accountId === selectedAccountId),
    [campaigns, selectedAccountId]
  );

  const getPacingStatus = (c: typeof accountCampaigns[0]) => {
    const expectedSpend = c.dailyBudget * 30;
    const ratio = expectedSpend > 0 ? c.totalSpend / expectedSpend : 0;
    if (ratio > 1.1) return { label: 'Overspending', color: 'bg-destructive text-destructive-foreground' };
    if (ratio < 0.5) return { label: 'Underspending', color: 'bg-warning text-warning-foreground' };
    return { label: 'On Track', color: 'bg-success text-success-foreground' };
  };

  const invoiceStatusColor: Record<string, string> = {
    paid: 'bg-success text-success-foreground',
    pending: 'bg-warning text-warning-foreground',
    overdue: 'bg-destructive text-destructive-foreground',
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Budget & Billing</h1>

      {/* Account Budget Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Total Budget</span>
            </div>
            <div className="text-xl font-bold tabular-nums">{formatCurrency(account.totalBudget)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Total Spend</span>
            </div>
            <div className="text-xl font-bold tabular-nums">{formatCurrency(account.totalSpend)}</div>
            <Progress value={usagePercent} className="mt-2 h-2" />
            <span className="text-[10px] text-muted-foreground">{usagePercent.toFixed(1)}% used</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Remaining</span>
            </div>
            <div className={`text-xl font-bold tabular-nums ${remaining < 0 ? 'text-destructive' : ''}`}>
              {formatCurrency(remaining)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Budget Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Campaign Budget Usage</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Campaign</TableHead>
                <TableHead className="text-xs text-right">Daily Budget</TableHead>
                <TableHead className="text-xs text-right">Total Spend</TableHead>
                <TableHead className="text-xs w-[200px]">Pacing</TableHead>
                <TableHead className="text-xs text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accountCampaigns.slice(0, 25).map((c) => {
                const pacing = getPacingStatus(c);
                const expected = c.dailyBudget * 30;
                const pacingPercent = expected > 0 ? Math.min((c.totalSpend / expected) * 100, 150) : 0;
                return (
                  <TableRow key={c.id}>
                    <TableCell className="text-xs font-medium truncate max-w-[200px]">{c.name}</TableCell>
                    <TableCell className="text-xs text-right tabular-nums">{formatCurrency(c.dailyBudget)}</TableCell>
                    <TableCell className="text-xs text-right tabular-nums">{formatCurrency(c.totalSpend)}</TableCell>
                    <TableCell>
                      <Progress value={Math.min(pacingPercent, 100)} className="h-2" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge className={`text-[10px] ${pacing.color}`}>{pacing.label}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Billing Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CreditCard className="h-4 w-4" /> Billing Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 rounded-lg border text-xs">
            <span className="text-muted-foreground">Payment Method:</span> Visa ending in •••• 4242
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Invoice</TableHead>
                <TableHead className="text-xs">Date</TableHead>
                <TableHead className="text-xs text-right">Amount</TableHead>
                <TableHead className="text-xs text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="text-xs font-medium">{inv.id}</TableCell>
                  <TableCell className="text-xs">{inv.date}</TableCell>
                  <TableCell className="text-xs text-right tabular-nums">{formatCurrency(inv.amount)}</TableCell>
                  <TableCell className="text-right">
                    <Badge className={`text-[10px] ${invoiceStatusColor[inv.status]}`}>{inv.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
