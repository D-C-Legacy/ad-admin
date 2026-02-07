import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import {
  AdvertiserAccount, Campaign, AdGroup, Creative, DateRange,
} from '@/lib/types';
import { accounts as mockAccounts, campaigns as mockCampaigns, adGroups as mockAdGroups, creatives as mockCreatives } from '@/lib/mock-data';

interface DashboardState {
  accounts: AdvertiserAccount[];
  selectedAccountId: string;
  dateRange: DateRange;
  campaigns: Campaign[];
  adGroups: AdGroup[];
  creatives: Creative[];
  currency: string;
  darkMode: boolean;
}

interface DashboardActions {
  setSelectedAccountId: (id: string) => void;
  setDateRange: (range: DateRange) => void;
  setCurrency: (currency: string) => void;
  setDarkMode: (dark: boolean) => void;
  toggleCampaignStatus: (campaignId: string) => void;
  toggleAdGroupStatus: (adGroupId: string) => void;
  addCampaign: (campaign: Campaign) => void;
  updateCampaignBidStrategy: (campaignId: string, strategy: Campaign['bidStrategy']) => void;
  updateAdGroupBid: (adGroupId: string, bid: number) => void;
  assignCreativeToAdGroup: (creativeId: string, adGroupId: string) => void;
  updateAccountDetails: (accountId: string, details: Partial<AdvertiserAccount>) => void;
}

const DashboardContext = createContext<(DashboardState & DashboardActions) | null>(null);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [selectedAccountId, setSelectedAccountId] = useState(mockAccounts[0].id);
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [campaignsState, setCampaigns] = useState<Campaign[]>([...mockCampaigns]);
  const [adGroupsState, setAdGroups] = useState<AdGroup[]>([...mockAdGroups]);
  const [creativesState, setCreatives] = useState<Creative[]>([...mockCreatives]);
  const [accountsState, setAccounts] = useState<AdvertiserAccount[]>([...mockAccounts]);
  const [currency, setCurrency] = useState('USD');
  const [darkMode, setDarkModeState] = useState(false);

  const setDarkMode = useCallback((dark: boolean) => {
    setDarkModeState(dark);
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  const toggleCampaignStatus = useCallback((campaignId: string) => {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === campaignId
          ? { ...c, status: c.status === 'active' ? 'paused' : 'active' }
          : c
      )
    );
  }, []);

  const toggleAdGroupStatus = useCallback((adGroupId: string) => {
    setAdGroups((prev) =>
      prev.map((ag) =>
        ag.id === adGroupId
          ? { ...ag, status: ag.status === 'active' ? 'paused' : 'active' }
          : ag
      )
    );
  }, []);

  const addCampaign = useCallback((campaign: Campaign) => {
    setCampaigns((prev) => [campaign, ...prev]);
  }, []);

  const updateCampaignBidStrategy = useCallback((campaignId: string, strategy: Campaign['bidStrategy']) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id !== campaignId) return c;
        const multiplier = strategy === 'optimized_conversions' ? 0.85 : strategy === 'manual_cpm' ? 1.1 : 1;
        return {
          ...c,
          bidStrategy: strategy,
          cpc: Math.round(c.cpc * multiplier * 100) / 100,
          cpm: Math.round(c.cpm * multiplier * 100) / 100,
        };
      })
    );
  }, []);

  const updateAdGroupBid = useCallback((adGroupId: string, bid: number) => {
    setAdGroups((prev) =>
      prev.map((ag) => {
        if (ag.id !== adGroupId) return ag;
        const ratio = bid / (ag.bidAmount || 1);
        return {
          ...ag,
          bidAmount: bid,
          impressions: Math.round(ag.impressions * Math.sqrt(ratio)),
          clicks: Math.round(ag.clicks * Math.sqrt(ratio)),
          conversions: Math.round(ag.conversions * Math.sqrt(ratio)),
        };
      })
    );
  }, []);

  const assignCreativeToAdGroup = useCallback((creativeId: string, adGroupId: string) => {
    setCreatives((prev) =>
      prev.map((cr) =>
        cr.id === creativeId
          ? { ...cr, adGroupIds: [...new Set([...cr.adGroupIds, adGroupId])] }
          : cr
      )
    );
  }, []);

  const updateAccountDetails = useCallback((accountId: string, details: Partial<AdvertiserAccount>) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === accountId ? { ...acc, ...details } : acc))
    );
  }, []);

  const value = useMemo(() => ({
    accounts: accountsState,
    selectedAccountId,
    dateRange,
    campaigns: campaignsState,
    adGroups: adGroupsState,
    creatives: creativesState,
    currency,
    darkMode,
    setSelectedAccountId,
    setDateRange,
    setCurrency,
    setDarkMode,
    toggleCampaignStatus,
    toggleAdGroupStatus,
    addCampaign,
    updateCampaignBidStrategy,
    updateAdGroupBid,
    assignCreativeToAdGroup,
    updateAccountDetails,
  }), [
    accountsState, selectedAccountId, dateRange, campaignsState, adGroupsState,
    creativesState, currency, darkMode, setDarkMode, toggleCampaignStatus,
    toggleAdGroupStatus, addCampaign, updateCampaignBidStrategy, updateAdGroupBid,
    assignCreativeToAdGroup, updateAccountDetails,
  ]);

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider');
  return ctx;
}
