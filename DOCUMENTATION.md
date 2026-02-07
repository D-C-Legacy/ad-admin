# Advertiser Dashboard — Full Feature Documentation

A fully functional, frontend-only Advertiser Campaign Management Dashboard built with React, TypeScript, Tailwind CSS, and shadcn/ui. All data is driven by a deterministic mock data engine. Every control, toggle, and input actively affects the displayed data — no dead buttons.

---

## Technical Stack

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** + **shadcn/ui** components
- **Recharts** for all data visualizations
- **React Context** for global state management
- Deterministic seeded mock data engine (100+ campaigns, 90+ days of time-series)

---

## 1. Global Layout & Navigation

### Collapsible Sidebar
Full-width and icon-only (mini) modes. Click the toggle arrow at the top of the sidebar to collapse or expand. All 9 navigation sections are always accessible with active-route highlighting.

### Advertiser Account Selector
Located in the top navigation bar. Switch between mock advertiser accounts (e.g., Acme Corp, Globex Industries, Initech Solutions). Changing the account updates **all** metrics, charts, tables, and budgets across every page.

### Global Date Range Selector
Preset ranges: Today, Last 7 Days, Last 30 Days, Last 90 Days, and Custom. The selected range filters all time-series charts, KPI cards, and performance metrics site-wide.

### Notifications Bell
Displays a dropdown with budget alerts, campaign delivery warnings, and system notices. The badge count updates dynamically based on unread notifications.

### Dark Mode Toggle
Located in the user profile menu (top-right). Switches between a clean white light theme and a dark charcoal theme. All charts, cards, and UI elements adapt automatically.

---

## 2. Dashboard (Overview) — `/`

### 6 KPI Cards
Spend, Impressions, Clicks, Conversions, Avg CPC, and Avg CPM — each with a trend indicator (↑/↓ percentage). All values recalculate when the advertiser account or date range changes.

### Trend Charts
Interactive area/line charts showing Spend, Clicks, and Conversions over time. Responsive to the global date range filter. Hover over data points for detailed tooltips.

### Campaign Status Summary
Visual count of Active, Paused, and Limited campaigns for the selected account. Updates in real-time when campaign statuses are toggled.

### Top Performing Campaigns
A mini-table showing the highest-performing campaigns ranked by conversions. Quick reference without navigating to the full Campaigns page.

---

## 3. Campaigns — `/campaigns`

### Campaign Table (100+ rows)
Columns: Name, Status, Objective (Traffic / Conversions / App Installs), Daily Budget, Spend, CPC, CPM. Full pagination with configurable page size.

### Search & Filters
Search campaigns by name. Filter by Status (Active / Paused) and Objective. All filters stack and update the table instantly.

### Column Sorting
Click any column header to sort ascending/descending. Sorting persists across filter changes.

### Inline Status Toggle
Each campaign row has a switch to pause or activate the campaign. Toggling the status immediately updates the campaign's metrics and the Dashboard KPI cards.

### Create Campaign Modal
Form with fields for Objective, Daily Budget, Schedule (start/end dates), and Bid Strategy. Submitting adds the new campaign to the table and updates all related data.

---

## 4. Ad Groups — `/ad-groups`

### Campaign Selector
A dropdown at the top lets you select a specific campaign to view its ad groups, or "All" to see a cross-campaign view (limited to 50 rows for performance).

### Ad Group Table
Columns: Name, Targeting Summary (geo, device, platform), Bid Amount, Impressions, Clicks, Conversions, Status. Each row reflects the parent campaign's data.

### Inline Status Toggle
Toggle each ad group between Active and Paused. Metrics recalculate immediately.

### Editable Bid Amounts
Click any bid amount to enter edit mode. Change the value and press Enter or click the check icon to save. The new bid recalculates projected performance in real-time.

---

## 5. Creatives — `/creatives`

### Creative Grid
Displays image, video, and text ad creatives in a card layout. Each card shows a thumbnail/icon, the creative name, type, and approval status.

### Status Indicators
Color-coded badges: Approved (green), Pending Review (yellow), Rejected (red). Filter by status using the dropdown at the top.

### Type Filter
Filter creatives by type: Image, Video, or Text. Combine with the status filter for targeted browsing.

### Preview Panel
Click any creative card to open a detailed preview showing larger artwork, metadata (dimensions, file size, creation date), and the assigned ad group.

### Assign to Ad Group
In the preview panel, use the dropdown to assign or reassign a creative to any ad group. Changes are reflected immediately.

---

## 6. Bidding & Optimization — `/bidding`

### Bid Strategy Selector
Choose a strategy per campaign: Manual CPC, Manual CPM, or Optimized for Conversions. Changing the strategy recalculates projected CPC/CPM/spend.

### Editable Bid Inputs
Adjust bid amounts with real-time recalculation of projected performance metrics.

### Performance Comparison Charts
Bar/line charts comparing CPC, CPM, and spend across campaigns grouped by bid strategy. Visualize which strategies are most cost-efficient.

### Optimization Suggestions
Actionable recommendations panel with suggestions like:
- "Increase bid by 10% for high-CTR ad groups"
- "Reduce spend on low-conversion campaigns"
- "Pause underperforming creatives"

Clicking **Apply** updates the relevant campaign or ad group data live.

---

## 7. Analytics & Reports — `/analytics`

### CPC & CPM Trend Charts
Interactive line charts showing cost-per-click and cost-per-mille trends over time. Hover for detailed tooltips.

### Spend vs. Conversions Chart
Dual-axis chart plotting spend and conversions together for ROI pattern analysis.

### Campaign & Ad Group Filters
Select specific campaigns or ad groups to narrow the analytics view. Combine with the global date range.

### Export Report
Click the "Export Report" button to trigger a confirmation toast. (Simulated — no actual file download.)

### Summary Statistics Table
Aggregate metrics below charts: total spend, impressions, clicks, conversions, average CPC, average CPM.

---

## 8. Budget & Billing — `/budget`

### Account Budget Overview
Three KPI cards: Total Budget, Total Spend, and Remaining Balance for the selected advertiser account.

### Campaign Budget Table
Each campaign with daily budget, total spend, and a progress bar showing spend pacing.

### Spend Pacing Indicators
- **On Track** (green) — spending within expected range
- **Underspending** (yellow/amber) — below expected pace
- **Overspending** (red) — exceeding budget pace

### Invoice History
Mock invoices with date, amount, and status (Paid / Pending).

### Payment Method
Displays mock payment method on file (e.g., Visa •••• 4242) with simulated update action.

---

## 9. Conversions & Events — `/conversions`

### Conversion Events List
Tracks: Purchase, Add to Cart, Sign Up, Lead. Each event shows total count and total value.

### Attribution Window Settings
Dropdown selectors for Click-Through (1d, 7d, 28d) and View-Through (1d, 7d, 28d) windows. Changing these recalculates all conversion metrics.

### Conversion Performance Metrics
Conversion rate, cost per conversion, and total conversion value broken down by campaign. All values update dynamically when attribution windows change.

---

## 10. Settings — `/settings`

### Account Details
Editable advertiser name, timezone, and industry. Changes persist in the current session and update the account selector.

### Notification Preferences
Toggles for email and in-app alerts on:
- Budget limit warnings
- Campaign auto-pause events
- Delivery issues

### Currency Selection
Choose from USD, EUR, GBP, or JPY. Changing the currency updates **all** monetary displays (KPI cards, tables, charts) across the entire dashboard.

---

## Mock Data Engine

- **100+ campaigns** with varied statuses (Active/Paused), objectives (Traffic/Conversions/App Installs), and budgets
- **Multiple ad groups** per campaign with geo, device, and platform targeting
- **Creatives** with image, video, and text types in Approved/Pending/Rejected states
- **90+ days** of time-series data for charts
- **Deterministic seed-based** generation for consistent data across page reloads
- Metrics simulate millions of impressions, thousands of clicks, and realistic budget depletion patterns
