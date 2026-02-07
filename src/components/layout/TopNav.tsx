import { Bell, Moon, Sun, User, ChevronDown } from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';
import { generateNotifications, formatCurrency } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DateRange } from '@/lib/types';

const dateRangeLabels: Record<DateRange, string> = {
  today: 'Today',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  custom: 'Custom',
};

export function TopNav() {
  const {
    accounts, selectedAccountId, setSelectedAccountId,
    dateRange, setDateRange, darkMode, setDarkMode,
  } = useDashboard();

  const notifications = generateNotifications(selectedAccountId);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background px-4">
      {/* Account Selector */}
      <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
        <SelectTrigger className="w-[200px] h-9 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {accounts.map((acc) => (
            <SelectItem key={acc.id} value={acc.id}>
              <span className="font-medium">{acc.name}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Date Range */}
      <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
        <SelectTrigger className="w-[160px] h-9 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(dateRangeLabels).map(([key, label]) => (
            <SelectItem key={key} value={key}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex-1" />

      {/* Account info */}
      {selectedAccount && (
        <span className="hidden md:inline text-xs text-muted-foreground tabular-nums">
          Budget: {formatCurrency(selectedAccount.totalBudget)} · Spend: {formatCurrency(selectedAccount.totalSpend)}
        </span>
      )}

      {/* Notifications */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative h-9 w-9">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                {unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {notifications.length === 0 ? (
            <DropdownMenuItem disabled>No notifications</DropdownMenuItem>
          ) : (
            notifications.slice(0, 6).map((n) => (
              <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1 py-2">
                <div className="flex items-center gap-2">
                  <Badge variant={n.type === 'budget' ? 'destructive' : n.type === 'delivery' ? 'secondary' : 'outline'} className="text-[10px] px-1.5 py-0">
                    {n.type}
                  </Badge>
                  <span className="text-xs font-medium">{n.title}</span>
                  {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                </div>
                <span className="text-xs text-muted-foreground line-clamp-2">{n.message}</span>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dark mode toggle */}
      <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>

      {/* Profile */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <User className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            <div className="text-sm font-medium">{selectedAccount?.name}</div>
            <div className="text-xs text-muted-foreground">{selectedAccount?.industry} · {selectedAccount?.timezone}</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
