import {
  AdvertiserAccount, Campaign, AdGroup, Creative, TimeSeriesPoint,
  ConversionEvent, Notification, Invoice,
  CampaignStatus, CampaignObjective, BidStrategy, CreativeType, CreativeStatus
} from './types';

// Seeded PRNG (mulberry32)
function mulberry32(a: number) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42);

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function randBetween(min: number, max: number): number {
  return min + rand() * (max - min);
}

function randInt(min: number, max: number): number {
  return Math.floor(randBetween(min, max));
}

// ── Accounts ──
const accountNames = ['Acme Corp', 'Globex Industries', 'Initech Solutions'];
const industries = ['E-Commerce', 'SaaS', 'Mobile Gaming'];
const timezones = ['America/New_York', 'Europe/London', 'Asia/Tokyo'];

export const accounts: AdvertiserAccount[] = accountNames.map((name, i) => ({
  id: `acc-${i + 1}`,
  name,
  timezone: timezones[i],
  industry: industries[i],
  currency: 'USD',
  totalBudget: Math.round(randBetween(50000, 200000)),
  totalSpend: 0, // computed later
}));

// ── Campaigns ──
const objectiveLabels: Record<CampaignObjective, string[]> = {
  traffic: ['Brand Awareness', 'Website Traffic', 'Landing Page', 'Blog Promo', 'Content Push'],
  conversions: ['Lead Gen', 'Signup Drive', 'Purchase', 'Free Trial', 'Demo Request'],
  app_installs: ['App Install', 'App Engagement', 'Re-engagement', 'Deep Link', 'App Promo'],
};
const regions = ['US', 'EU', 'APAC', 'LATAM', 'Global'];
const seasons = ['Q1', 'Q2', 'Q3', 'Q4', 'Evergreen', 'Holiday', 'Summer', 'BFCM'];
const statuses: CampaignStatus[] = ['active', 'paused', 'limited'];
const objectives: CampaignObjective[] = ['traffic', 'conversions', 'app_installs'];
const bidStrategies: BidStrategy[] = ['manual_cpc', 'manual_cpm', 'optimized_conversions'];

export const campaigns: Campaign[] = [];

accounts.forEach((account) => {
  const count = randInt(35, 50);
  for (let i = 0; i < count; i++) {
    const objective = pick(objectives);
    const status = pick(statuses);
    const dailyBudget = Math.round(randBetween(50, 2000));
    const impressions = randInt(10000, 5000000);
    const clicks = randInt(Math.floor(impressions * 0.005), Math.floor(impressions * 0.04));
    const conversions = randInt(Math.floor(clicks * 0.01), Math.floor(clicks * 0.15));
    const totalSpend = Math.round(randBetween(dailyBudget * 5, dailyBudget * 60) * 100) / 100;
    const cpc = clicks > 0 ? Math.round((totalSpend / clicks) * 100) / 100 : 0;
    const cpm = impressions > 0 ? Math.round((totalSpend / impressions) * 1000 * 100) / 100 : 0;

    const label = pick(objectiveLabels[objective]);
    const region = pick(regions);
    const season = pick(seasons);

    campaigns.push({
      id: `cmp-${account.id}-${i}`,
      accountId: account.id,
      name: `${label} — ${region} ${season}`,
      status,
      objective,
      dailyBudget,
      totalSpend,
      impressions,
      clicks,
      conversions,
      cpc,
      cpm,
      bidStrategy: pick(bidStrategies),
      startDate: `2025-${String(randInt(1, 12)).padStart(2, '0')}-${String(randInt(1, 28)).padStart(2, '0')}`,
      endDate: `2026-${String(randInt(1, 12)).padStart(2, '0')}-${String(randInt(1, 28)).padStart(2, '0')}`,
    });
  }
});

// Update account totalSpend
accounts.forEach((acc) => {
  acc.totalSpend = campaigns
    .filter((c) => c.accountId === acc.id)
    .reduce((sum, c) => sum + c.totalSpend, 0);
  acc.totalSpend = Math.round(acc.totalSpend * 100) / 100;
});

// ── Ad Groups ──
const geoOptions = [['US'], ['US', 'CA'], ['UK', 'DE', 'FR'], ['JP', 'KR'], ['BR', 'MX'], ['AU', 'NZ']];
const deviceOptions = [['desktop'], ['mobile'], ['desktop', 'mobile'], ['mobile', 'tablet'], ['desktop', 'mobile', 'tablet']];
const platformOptions = [['web'], ['ios'], ['android'], ['ios', 'android'], ['web', 'ios', 'android']];

export const adGroups: AdGroup[] = [];

campaigns.forEach((campaign) => {
  const count = randInt(2, 6);
  for (let i = 0; i < count; i++) {
    const bidAmount = Math.round(randBetween(0.1, 5) * 100) / 100;
    const impressions = randInt(1000, Math.floor(campaign.impressions / count));
    const clicks = randInt(Math.floor(impressions * 0.005), Math.floor(impressions * 0.04));
    const conversions = randInt(0, Math.floor(clicks * 0.12));

    adGroups.push({
      id: `ag-${campaign.id}-${i}`,
      campaignId: campaign.id,
      name: `${campaign.name} — Group ${i + 1}`,
      status: rand() > 0.2 ? 'active' : 'paused',
      bidAmount,
      targeting: {
        geo: pick(geoOptions),
        device: pick(deviceOptions),
        platform: pick(platformOptions),
      },
      impressions,
      clicks,
      conversions,
    });
  }
});

// ── Creatives ──
const creativeTypes: CreativeType[] = ['image', 'video', 'text'];
const creativeStatuses: CreativeStatus[] = ['approved', 'pending', 'rejected'];
const dimensionsMap: Record<CreativeType, string[]> = {
  image: ['300x250', '728x90', '160x600', '320x50', '1200x628'],
  video: ['1920x1080', '1280x720', '640x360', '1080x1080'],
  text: ['N/A'],
};

export const creatives: Creative[] = [];

for (let i = 0; i < 60; i++) {
  const type = pick(creativeTypes);
  const status: CreativeStatus = rand() > 0.15 ? (rand() > 0.2 ? 'approved' : 'pending') : 'rejected';
  const relatedAdGroups = adGroups
    .filter(() => rand() > 0.92)
    .slice(0, randInt(1, 4))
    .map((ag) => ag.id);

  creatives.push({
    id: `cr-${i}`,
    name: `Creative ${i + 1} — ${type === 'image' ? 'Banner' : type === 'video' ? 'Pre-roll' : 'Headline'} ${pick(['A', 'B', 'C', 'D'])}`,
    type,
    status,
    adGroupIds: relatedAdGroups,
    dimensions: pick(dimensionsMap[type]),
    fileSize: type === 'text' ? '< 1 KB' : `${randInt(20, 5000)} KB`,
    createdDate: `2025-${String(randInt(1, 12)).padStart(2, '0')}-${String(randInt(1, 28)).padStart(2, '0')}`,
  });
}

// ── Time Series (90 days) ──
export function generateTimeSeries(accountId: string, days: number = 90): TimeSeriesPoint[] {
  const accountCampaigns = campaigns.filter((c) => c.accountId === accountId && c.status === 'active');
  const baseSpend = accountCampaigns.reduce((s, c) => s + c.dailyBudget, 0) / Math.max(accountCampaigns.length, 1);
  const localRand = mulberry32(accountId.charCodeAt(4) * 1000);

  const points: TimeSeriesPoint[] = [];
  const today = new Date('2026-02-06');

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayOfWeek = date.getDay();
    const weekendFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.7 : 1;
    const trendFactor = 1 + (days - i) * 0.003;

    const spend = Math.round(baseSpend * weekendFactor * trendFactor * (0.8 + localRand() * 0.4) * 100) / 100;
    const impressions = Math.round(spend / 0.007 * (0.8 + localRand() * 0.4));
    const clicks = Math.round(impressions * (0.008 + localRand() * 0.025));
    const conversions = Math.round(clicks * (0.02 + localRand() * 0.08));
    const cpc = clicks > 0 ? Math.round((spend / clicks) * 100) / 100 : 0;
    const cpm = impressions > 0 ? Math.round((spend / impressions) * 1000 * 100) / 100 : 0;

    points.push({
      date: date.toISOString().split('T')[0],
      spend, impressions, clicks, conversions, cpc, cpm,
    });
  }
  return points;
}

// ── Conversion Events ──
export const conversionEvents: ConversionEvent[] = [
  { id: 'ev-1', name: 'Purchase', type: 'purchase', count: 0, value: 0, conversionRate: 0, costPerConversion: 0 },
  { id: 'ev-2', name: 'Add to Cart', type: 'add_to_cart', count: 0, value: 0, conversionRate: 0, costPerConversion: 0 },
  { id: 'ev-3', name: 'Sign Up', type: 'signup', count: 0, value: 0, conversionRate: 0, costPerConversion: 0 },
  { id: 'ev-4', name: 'Lead', type: 'lead', count: 0, value: 0, conversionRate: 0, costPerConversion: 0 },
  { id: 'ev-5', name: 'Page View', type: 'pageview', count: 0, value: 0, conversionRate: 0, costPerConversion: 0 },
  { id: 'ev-6', name: 'App Install', type: 'app_install', count: 0, value: 0, conversionRate: 0, costPerConversion: 0 },
];

export function computeConversionEvents(accountId: string, attributionWindow: number): ConversionEvent[] {
  const accountCampaigns = campaigns.filter((c) => c.accountId === accountId);
  const totalClicks = accountCampaigns.reduce((s, c) => s + c.clicks, 0);
  const totalSpend = accountCampaigns.reduce((s, c) => s + c.totalSpend, 0);
  const windowMultiplier = attributionWindow === 1 ? 0.4 : attributionWindow === 7 ? 0.75 : 1;

  const localRand = mulberry32(attributionWindow * 100 + accountId.charCodeAt(4));
  return conversionEvents.map((ev) => {
    const baseFraction = 0.05 + localRand() * 0.25;
    const count = Math.round(totalClicks * baseFraction * windowMultiplier);
    const value = Math.round(count * (10 + localRand() * 90) * 100) / 100;
    const conversionRate = totalClicks > 0 ? Math.round((count / totalClicks) * 10000) / 100 : 0;
    const costPerConversion = count > 0 ? Math.round((totalSpend * baseFraction / count) * 100) / 100 : 0;
    return { ...ev, count, value, conversionRate, costPerConversion };
  });
}

// ── Notifications ──
export function generateNotifications(accountId: string): Notification[] {
  const accountCampaigns = campaigns.filter((c) => c.accountId === accountId);
  const notifications: Notification[] = [];

  const overBudget = accountCampaigns.filter((c) => c.totalSpend > c.dailyBudget * 45);
  overBudget.slice(0, 3).forEach((c, i) => {
    notifications.push({
      id: `notif-budget-${i}`,
      type: 'budget',
      title: 'Budget Alert',
      message: `"${c.name}" has spent ${Math.round((c.totalSpend / (c.dailyBudget * 30)) * 100)}% of monthly budget.`,
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      read: i > 0,
    });
  });

  const limited = accountCampaigns.filter((c) => c.status === 'limited');
  limited.slice(0, 2).forEach((c, i) => {
    notifications.push({
      id: `notif-delivery-${i}`,
      type: 'delivery',
      title: 'Delivery Warning',
      message: `"${c.name}" is limited by budget. Consider increasing daily budget.`,
      timestamp: new Date(Date.now() - (i + 3) * 3600000).toISOString(),
      read: false,
    });
  });

  const paused = accountCampaigns.filter((c) => c.status === 'paused');
  if (paused.length > 5) {
    notifications.push({
      id: 'notif-campaign-1',
      type: 'campaign',
      title: 'Campaign Notice',
      message: `${paused.length} campaigns are currently paused across this account.`,
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      read: true,
    });
  }

  return notifications;
}

// ── Invoices ──
export const invoices: Invoice[] = [
  { id: 'inv-001', date: '2026-01-31', amount: 15420.00, status: 'paid' },
  { id: 'inv-002', date: '2025-12-31', amount: 18230.50, status: 'paid' },
  { id: 'inv-003', date: '2025-11-30', amount: 12890.75, status: 'paid' },
  { id: 'inv-004', date: '2026-02-05', amount: 8420.55, status: 'pending' },
];

// ── Helpers ──
export function getAccountMetrics(accountId: string, dateRange: string) {
  const accountCampaigns = campaigns.filter((c) => c.accountId === accountId);
  const daysMap: Record<string, number> = { today: 1, '7d': 7, '30d': 30, '90d': 90, custom: 30 };
  const days = daysMap[dateRange] || 30;
  const factor = days / 30;

  const totalSpend = accountCampaigns.reduce((s, c) => s + c.totalSpend, 0) * factor;
  const totalImpressions = accountCampaigns.reduce((s, c) => s + c.impressions, 0) * factor;
  const totalClicks = accountCampaigns.reduce((s, c) => s + c.clicks, 0) * factor;
  const totalConversions = accountCampaigns.reduce((s, c) => s + c.conversions, 0) * factor;
  const avgCpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
  const avgCpm = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0;

  return {
    spend: Math.round(totalSpend * 100) / 100,
    impressions: Math.round(totalImpressions),
    clicks: Math.round(totalClicks),
    conversions: Math.round(totalConversions),
    avgCpc: Math.round(avgCpc * 100) / 100,
    avgCpm: Math.round(avgCpm * 100) / 100,
    activeCampaigns: accountCampaigns.filter((c) => c.status === 'active').length,
    pausedCampaigns: accountCampaigns.filter((c) => c.status === 'paused').length,
    limitedCampaigns: accountCampaigns.filter((c) => c.status === 'limited').length,
  };
}

export function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}
