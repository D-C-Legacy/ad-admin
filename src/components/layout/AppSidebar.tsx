import {
  LayoutDashboard, Megaphone, Layers, Palette, TrendingUp,
  BarChart3, Wallet, Target, Settings,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarTrigger, useSidebar,
} from '@/components/ui/sidebar';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { title: 'Dashboard', url: '/', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Campaign Management',
    items: [
      { title: 'Campaigns', url: '/campaigns', icon: Megaphone },
      { title: 'Ad Groups', url: '/ad-groups', icon: Layers },
      { title: 'Creatives', url: '/creatives', icon: Palette },
    ],
  },
  {
    label: 'Performance',
    items: [
      { title: 'Bidding & Optimization', url: '/bidding', icon: TrendingUp },
      { title: 'Analytics & Reports', url: '/analytics', icon: BarChart3 },
      { title: 'Conversions & Events', url: '/conversions', icon: Target },
    ],
  },
  {
    label: 'Account',
    items: [
      { title: 'Budget & Billing', url: '/budget', icon: Wallet },
      { title: 'Settings', url: '/settings', icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon">
      <div className="flex h-14 items-center border-b border-sidebar-border px-3">
        {!collapsed && (
          <span className="text-sm font-bold tracking-tight truncate">Ad Manager</span>
        )}
        <SidebarTrigger className={collapsed ? 'mx-auto' : 'ml-auto'} />
      </div>
      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label} className="py-3">
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1.5">
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink
                        to={item.url}
                        end={item.url === '/'}
                        className="flex items-center gap-3 px-3 py-2.5 text-[0.8125rem] rounded-md text-sidebar-foreground hover:bg-sidebar-accent"
                        activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      >
                        <item.icon className="h-[1.125rem] w-[1.125rem] shrink-0" />
                        {!collapsed && <span className="truncate">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
