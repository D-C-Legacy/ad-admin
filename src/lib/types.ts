export interface AdvertiserAccount {
  id: string;
  name: string;
  timezone: string;
  industry: string;
  currency: string;
  totalBudget: number;
  totalSpend: number;
}

export type CampaignStatus = 'active' | 'paused' | 'limited';
export type CampaignObjective = 'traffic' | 'conversions' | 'app_installs';
export type BidStrategy = 'manual_cpc' | 'manual_cpm' | 'optimized_conversions';
export type CreativeType = 'image' | 'video' | 'text';
export type CreativeStatus = 'approved' | 'pending' | 'rejected';

export interface Campaign {
  id: string;
  accountId: string;
  name: string;
  status: CampaignStatus;
  objective: CampaignObjective;
  dailyBudget: number;
  totalSpend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  cpc: number;
  cpm: number;
  bidStrategy: BidStrategy;
  startDate: string;
  endDate: string;
}

export interface AdGroup {
  id: string;
  campaignId: string;
  name: string;
  status: 'active' | 'paused';
  bidAmount: number;
  targeting: {
    geo: string[];
    device: string[];
    platform: string[];
  };
  impressions: number;
  clicks: number;
  conversions: number;
}

export interface Creative {
  id: string;
  name: string;
  type: CreativeType;
  status: CreativeStatus;
  adGroupIds: string[];
  dimensions: string;
  fileSize: string;
  createdDate: string;
}

export interface TimeSeriesPoint {
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  cpc: number;
  cpm: number;
}

export interface ConversionEvent {
  id: string;
  name: string;
  type: string;
  count: number;
  value: number;
  conversionRate: number;
  costPerConversion: number;
}

export interface Notification {
  id: string;
  type: 'budget' | 'campaign' | 'delivery';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
}

export type DateRange = 'today' | '7d' | '30d' | '90d' | 'custom';
