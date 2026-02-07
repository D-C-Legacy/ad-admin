import { useState, useMemo } from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Image, Video, Type, X } from 'lucide-react';

export default function Creatives() {
  const { creatives, adGroups, selectedAccountId, campaigns, assignCreativeToAdGroup } = useDashboard();
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCreative, setSelectedCreative] = useState<string | null>(null);
  const [assignDialogId, setAssignDialogId] = useState<string | null>(null);
  const [assignTarget, setAssignTarget] = useState('');

  const accountAdGroupIds = useMemo(() => {
    const campaignIds = new Set(campaigns.filter((c) => c.accountId === selectedAccountId).map((c) => c.id));
    return adGroups.filter((ag) => campaignIds.has(ag.campaignId));
  }, [campaigns, adGroups, selectedAccountId]);

  const filtered = useMemo(() => {
    let result = creatives;
    if (typeFilter !== 'all') result = result.filter((c) => c.type === typeFilter);
    if (statusFilter !== 'all') result = result.filter((c) => c.status === statusFilter);
    return result;
  }, [creatives, typeFilter, statusFilter]);

  const selected = creatives.find((c) => c.id === selectedCreative);

  const statusColor: Record<string, string> = {
    approved: 'bg-success text-success-foreground',
    pending: 'bg-warning text-warning-foreground',
    rejected: 'bg-destructive text-destructive-foreground',
  };

  const typeIcon: Record<string, React.ReactNode> = {
    image: <Image className="h-8 w-8" />,
    video: <Video className="h-8 w-8" />,
    text: <Type className="h-8 w-8" />,
  };

  const handleAssign = () => {
    if (assignDialogId && assignTarget) {
      assignCreativeToAdGroup(assignDialogId, assignTarget);
      setAssignDialogId(null);
      setAssignTarget('');
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Creatives</h1>

      <div className="flex gap-3">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px] h-9 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="image">Image</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="text">Text</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] h-9 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground self-center">{filtered.length} creatives</span>
      </div>

      <div className="flex gap-4">
        {/* Grid */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((cr) => (
            <Card
              key={cr.id}
              className={`cursor-pointer transition-shadow hover:shadow-md ${selectedCreative === cr.id ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setSelectedCreative(cr.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-center h-20 bg-muted rounded-md mb-3">
                  {typeIcon[cr.type]}
                </div>
                <p className="text-xs font-medium truncate">{cr.name}</p>
                <div className="flex items-center justify-between mt-2">
                  <Badge className={`text-[10px] ${statusColor[cr.status]}`}>{cr.status}</Badge>
                  <span className="text-[10px] text-muted-foreground">{cr.dimensions}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Preview Panel */}
        {selected && (
          <Card className="w-72 shrink-0 sticky top-20 h-fit">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Preview</CardTitle>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedCreative(null)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-center h-32 bg-muted rounded-md">
                {typeIcon[selected.type]}
              </div>
              <div className="space-y-1.5 text-xs">
                <div><span className="text-muted-foreground">Name:</span> {selected.name}</div>
                <div><span className="text-muted-foreground">Type:</span> {selected.type}</div>
                <div><span className="text-muted-foreground">Dimensions:</span> {selected.dimensions}</div>
                <div><span className="text-muted-foreground">Size:</span> {selected.fileSize}</div>
                <div><span className="text-muted-foreground">Created:</span> {selected.createdDate}</div>
                <div>
                  <span className="text-muted-foreground">Status: </span>
                  <Badge className={`text-[10px] ${statusColor[selected.status]}`}>{selected.status}</Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Assigned to:</span>{' '}
                  {selected.adGroupIds.length} ad group(s)
                </div>
              </div>
              <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => setAssignDialogId(selected.id)}>
                Assign to Ad Group
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Assign Dialog */}
      <Dialog open={!!assignDialogId} onOpenChange={() => setAssignDialogId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Creative to Ad Group</DialogTitle>
            <DialogDescription>Select an ad group to assign this creative to.</DialogDescription>
          </DialogHeader>
          <Select value={assignTarget} onValueChange={setAssignTarget}>
            <SelectTrigger><SelectValue placeholder="Select ad group" /></SelectTrigger>
            <SelectContent>
              {accountAdGroupIds.slice(0, 20).map((ag) => (
                <SelectItem key={ag.id} value={ag.id}>{ag.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogId(null)}>Cancel</Button>
            <Button onClick={handleAssign} disabled={!assignTarget}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
