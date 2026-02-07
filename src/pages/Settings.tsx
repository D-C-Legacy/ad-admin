import { useState } from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Settings as SettingsIcon, Bell, Globe } from 'lucide-react';

export default function Settings() {
  const { accounts, selectedAccountId, updateAccountDetails, setCurrency, currency } = useDashboard();
  const account = accounts.find((a) => a.id === selectedAccountId)!;

  const [name, setName] = useState(account.name);
  const [timezone, setTimezone] = useState(account.timezone);
  const [industry, setIndustry] = useState(account.industry);

  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [campaignPaused, setCampaignPaused] = useState(true);
  const [deliveryIssues, setDeliveryIssues] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);

  const handleSave = () => {
    updateAccountDetails(selectedAccountId, { name, timezone, industry });
    toast({
      title: 'Settings Saved',
      description: 'Account details have been updated.',
    });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>

      {/* Account Details */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" /> Account Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Advertiser Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Timezone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="America/New_York">America/New_York</SelectItem>
                <SelectItem value="America/Chicago">America/Chicago</SelectItem>
                <SelectItem value="America/Los_Angeles">America/Los_Angeles</SelectItem>
                <SelectItem value="Europe/London">Europe/London</SelectItem>
                <SelectItem value="Europe/Berlin">Europe/Berlin</SelectItem>
                <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Industry</Label>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="E-Commerce">E-Commerce</SelectItem>
                <SelectItem value="SaaS">SaaS</SelectItem>
                <SelectItem value="Mobile Gaming">Mobile Gaming</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Education">Education</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" onClick={handleSave}>Save Changes</Button>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Bell className="h-4 w-4" /> Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Budget limit alerts</Label>
            <Switch checked={budgetAlerts} onCheckedChange={setBudgetAlerts} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Campaign paused notifications</Label>
            <Switch checked={campaignPaused} onCheckedChange={setCampaignPaused} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Delivery issue warnings</Label>
            <Switch checked={deliveryIssues} onCheckedChange={setDeliveryIssues} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Email notifications</Label>
            <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
          </div>
        </CardContent>
      </Card>

      {/* Currency */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Globe className="h-4 w-4" /> Currency
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="EUR">EUR (€)</SelectItem>
              <SelectItem value="GBP">GBP (£)</SelectItem>
              <SelectItem value="JPY">JPY (¥)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  );
}
