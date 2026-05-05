"use client";

import {
  AreaChart,
  Badge,
  BarList,
  Button,
  Card,
  Col,
  DonutChart,
  Grid,
  Metric,
  ProgressBar,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
  Title,
} from "@tremor/react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useAnalytics } from "@/hooks/useAnalytics";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "TND",
  maximumFractionDigits: 2,
});

const compactNumberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const numberFormatter = (value: number) => compactNumberFormatter.format(value);
const money = (value: number) => currencyFormatter.format(value);

const statusMeta = {
  PENDING: { label: "Pending", color: "amber", dot: "#f59e0b" },
  PROCESSING: { label: "Processing", color: "orange", dot: "#f97316" },
  SHIPPED: { label: "Shipped", color: "sky", dot: "#0ea5e9" },
  DELIVERED: { label: "Delivered", color: "emerald", dot: "#10b981" },
  CANCELLED: { label: "Cancelled", color: "rose", dot: "#f43f5e" },
} as const;

const defaultStatusMeta = { label: "Unknown", color: "zinc", dot: "#71717a" } as const;

const surfaceStyle = {
  background: "linear-gradient(180deg, var(--background) 0%, var(--surface) 100%)",
};

const elevatedSurfaceStyle = {
  background: "linear-gradient(180deg, rgba(255,40,0,0.05) 0%, var(--surface) 24%, var(--background) 100%)",
};

const formatMonth = (key: string) => {
  const [year, month] = key.split("-").map(Number);
  const date = new Date(year, (month || 1) - 1, 1);
  return date.toLocaleString("en-US", { month: "short" });
};

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

function changeFromPrevious(current: number, previous: number) {
  if (previous <= 0) {
    if (current <= 0) {
      return { label: "Stable baseline", color: "zinc" as const };
    }

    return { label: "Fresh momentum", color: "emerald" as const };
  }

  const delta = ((current - previous) / previous) * 100;
  const label = `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}% vs last month`;

  if (delta > 3) {
    return { label, color: "emerald" as const };
  }

  if (delta < -3) {
    return { label, color: "rose" as const };
  }

  return { label, color: "zinc" as const };
}

function AnalyticsPage() {
  const { analytics, loading, error, refetch } = useAnalytics();

  const monthly = analytics?.monthly ?? [];
  const latestMonth = monthly.at(-1);
  const previousMonth = monthly.at(-2);
  const latestRevenue = latestMonth?.revenue ?? 0;
  const previousRevenue = previousMonth?.revenue ?? 0;
  const latestOrders = latestMonth?.orders ?? 0;
  const previousOrders = previousMonth?.orders ?? 0;
  const currentAov = latestOrders > 0 ? latestRevenue / latestOrders : analytics?.revenue.averageOrderValue ?? 0;
  const previousAov = previousOrders > 0 ? previousRevenue / previousOrders : 0;
  const revenueInMotion = analytics ? Math.max(analytics.revenue.potential - analytics.revenue.realized, 0) : 0;

  const revenueDelta = changeFromPrevious(latestRevenue, previousRevenue);
  const ordersDelta = changeFromPrevious(latestOrders, previousOrders);
  const aovDelta = changeFromPrevious(currentAov, previousAov);

  const revenueTrend = monthly.map((month) => ({
    month: formatMonth(month.month),
    Revenue: month.revenue,
    Orders: month.orders,
    "New users": month.newUsers,
  }));

  const peakMonth = monthly.reduce(
    (best, month) => (month.revenue > best.revenue ? month : best),
    monthly[0] ?? { month: "", revenue: 0, orders: 0, newUsers: 0 }
  );

  const statusRows = (analytics?.statusDistribution ?? []).map((item) => {
    const meta = statusMeta[item.status as keyof typeof statusMeta] ?? defaultStatusMeta;
    return {
      ...item,
      label: meta.label,
      color: meta.color,
      dot: meta.dot,
      share: analytics?.totals.orders ? (item.count / analytics.totals.orders) * 100 : 0,
    };
  });

  const deliveredCount =
    analytics?.statusDistribution.find((item) => item.status === "DELIVERED")?.count ?? 0;
  const fulfillmentRate = analytics?.totals.orders
    ? Math.round((deliveredCount / analytics.totals.orders) * 100)
    : 0;

  const categoryRevenueBars = (analytics?.categorySales ?? []).map((category) => ({
    name: category.name,
    value: category.revenue,
  }));

  const categoryUnitsBars = (analytics?.categorySales ?? []).map((category) => ({
    name: category.name,
    value: category.orders,
  }));

  const productBars = (analytics?.topProducts ?? []).map((product) => ({
    name: product.name,
    value: product.revenue,
  }));

  const leadingProduct = analytics?.topProducts[0];

  return (
    <div style={{ padding: 28, minHeight: "100%", background: "var(--background)" }}>
      <style>{`
        @keyframes commandShimmer {
          0% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .command-shell {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .command-hero {
          position: relative;
          overflow: hidden;
          padding: 32px;
          border-radius: 32px;
          border: 1px solid rgba(255,255,255,0.08);
          background:
            radial-gradient(circle at top right, rgba(255,40,0,0.28) 0%, transparent 28%),
            radial-gradient(circle at bottom left, rgba(255,120,0,0.12) 0%, transparent 26%),
            linear-gradient(135deg, #1a1a1a 0%, #090909 72%);
          box-shadow: 0 24px 64px rgba(0,0,0,0.18);
          color: #ffffff;
        }

        .command-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.16) 1px, transparent 1px);
          background-size: 18px 18px;
          opacity: 0.08;
          mask-image: linear-gradient(180deg, rgba(0,0,0,0.85), transparent);
          pointer-events: none;
        }

        .command-hero-grid {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: minmax(0, 1.45fr) minmax(280px, 1fr);
          gap: 24px;
          align-items: end;
        }

        .command-kicker {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
          padding: 8px 14px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.05);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .command-kicker-dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #22c55e;
          box-shadow: 0 0 0 8px rgba(34,197,94,0.14);
        }

        .command-title {
          margin: 0;
          font-size: clamp(32px, 4vw, 48px);
          font-weight: 900;
          line-height: 1.02;
          letter-spacing: -0.05em;
        }

        .command-copy {
          margin: 14px 0 0;
          max-width: 700px;
          color: rgba(255,255,255,0.72);
          font-size: 15px;
          line-height: 1.75;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
        }

        .command-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 24px;
        }

        .command-note {
          padding: 11px 14px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.74);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.02em;
        }

        .hero-signal-panel {
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(16px);
          padding: 20px;
        }

        .hero-signal-title {
          margin: 0;
          color: #ffffff;
          font-size: 18px;
          font-weight: 800;
          letter-spacing: -0.03em;
        }

        .hero-signal-copy {
          margin: 6px 0 0;
          color: rgba(255,255,255,0.62);
          font-size: 12px;
          font-weight: 600;
          line-height: 1.6;
        }

        .hero-signal-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-top: 18px;
        }

        .hero-signal-card {
          padding: 14px 14px 16px;
          border-radius: 18px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
        }

        .hero-signal-label {
          display: block;
          color: rgba(255,255,255,0.58);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .hero-signal-value {
          display: block;
          margin-top: 10px;
          color: #ffffff;
          font-size: 22px;
          font-weight: 900;
          letter-spacing: -0.04em;
        }

        .hero-signal-sub {
          display: block;
          margin-top: 4px;
          color: rgba(255,255,255,0.62);
          font-size: 12px;
          font-weight: 600;
          line-height: 1.5;
        }

        .brand-panel {
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
        }

        .brand-panel:hover {
          transform: translateY(-2px);
        }

        .command-mini-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-top: 18px;
        }

        .command-mini-card {
          border-radius: 18px;
          padding: 14px 16px;
          border: 1px solid var(--border);
          background: var(--surface);
        }

        .command-mini-value {
          margin-top: 6px;
          font-size: 18px;
          font-weight: 900;
          letter-spacing: -0.03em;
          color: var(--foreground);
        }

        .status-stack {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 18px;
        }

        .status-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .status-row-left {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          flex-shrink: 0;
        }

        .status-label {
          color: var(--foreground);
          font-size: 13px;
          font-weight: 700;
        }

        .status-sub {
          margin-top: 2px;
          color: var(--text-muted);
          font-size: 11px;
          font-weight: 600;
        }

        .inventory-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-top: 18px;
        }

        .inventory-item {
          padding: 14px 16px;
          border-radius: 18px;
          border: 1px solid var(--border);
          background: linear-gradient(180deg, var(--surface) 0%, var(--background) 100%);
        }

        .empty-block {
          border-radius: 18px;
          border: 1px dashed var(--border-strong);
          background: linear-gradient(180deg, var(--surface) 0%, var(--background) 100%);
          padding: 24px;
          text-align: center;
          color: var(--text-muted);
          font-weight: 700;
        }

        .command-table-wrap {
          overflow-x: auto;
        }

        .command-table tbody td {
          transition: background 0.2s ease;
        }

        .command-table tbody tr:hover td {
          background: var(--surface-hover);
        }

        .command-skeleton {
          background: linear-gradient(90deg, rgba(255,40,0,0.06) 0%, rgba(255,255,255,0.45) 50%, rgba(255,40,0,0.06) 100%);
          background-size: 200% 100%;
          animation: commandShimmer 1.5s linear infinite;
          border-radius: 999px;
        }

        .command-loading-orb {
          width: 54px;
          height: 54px;
          border-radius: 18px;
          background: linear-gradient(135deg, var(--brand-red) 0%, #ff7b00 100%);
          box-shadow: 0 18px 30px rgba(255,40,0,0.22);
        }

        @media (max-width: 1120px) {
          .command-hero-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 760px) {
          .command-hero {
            padding: 24px;
            border-radius: 24px;
          }

          .hero-signal-grid,
          .command-mini-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="command-shell">
        <section className="command-hero">
          <div className="command-hero-grid">
            <div>
              <div className="command-kicker">
                <span className="command-kicker-dot" />
                Analytics Command Center
              </div>
              <h1 className="command-title">Tremor-powered store intelligence with your site’s visual DNA.</h1>
              <p className="command-copy">
                Revenue, orders, customer growth, and inventory health now live in a single command center that mirrors
                the storefront’s red-black premium aesthetic instead of a generic admin dashboard.
              </p>
              <div className="command-actions">
                <Button onClick={refetch} loading={loading} icon={ArrowPathIcon}>
                  Refresh Metrics
                </Button>
                <div className="command-note">Live window: latest 6 months of store performance</div>
              </div>
            </div>

            <div className="hero-signal-panel">
              <h2 className="hero-signal-title">Store pulse</h2>
              <p className="hero-signal-copy">Immediate signals your team can act on without leaving the dashboard.</p>
              <div className="hero-signal-grid">
                <div className="hero-signal-card">
                  <span className="hero-signal-label">Customers</span>
                  <span className="hero-signal-value">{numberFormatter(analytics?.totals.customers ?? 0)}</span>
                  <span className="hero-signal-sub">
                    {numberFormatter(analytics?.totals.users ?? 0)} total accounts in the platform
                  </span>
                </div>

                <div className="hero-signal-card">
                  <span className="hero-signal-label">Open Carts</span>
                  <span className="hero-signal-value">{money(analytics?.carts.estimatedOpenCartValue ?? 0)}</span>
                  <span className="hero-signal-sub">
                    {numberFormatter(analytics?.carts.itemsInOpenCarts ?? 0)} items waiting in carts
                  </span>
                </div>

                <div className="hero-signal-card">
                  <span className="hero-signal-label">Stock Alerts</span>
                  <span className="hero-signal-value">{numberFormatter(analytics?.lowStockProducts.length ?? 0)}</span>
                  <span className="hero-signal-sub">
                    {numberFormatter(analytics?.totals.pendingOrders ?? 0)} pending orders to protect
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {error ? (
          <Card className="brand-panel" style={{ ...surfaceStyle, borderColor: "rgba(244,63,94,0.26)" }}>
            <Title>Analytics feed needs attention</Title>
            <Text style={{ marginTop: 8 }}>{error}</Text>
          </Card>
        ) : null}

        {!analytics ? (
          loading ? (
            <LoadingState />
          ) : (
            <EmptyState onRefresh={refetch} />
          )
        ) : (
          <>
            <Grid numItems={1} numItemsMd={2} numItemsLg={4} className="gap-4">
              <InsightCard
                title="Realized revenue"
                value={money(analytics.revenue.realized)}
                note={`Peak delivery month: ${formatMonth(peakMonth.month)} at ${money(peakMonth.revenue)}`}
                badgeLabel={revenueDelta.label}
                badgeColor={revenueDelta.color}
                accent="linear-gradient(90deg, var(--brand-red), #ff7a00)"
              />

              <InsightCard
                title="Revenue in motion"
                value={money(revenueInMotion)}
                note={`${numberFormatter(analytics.totals.pendingOrders)} pending orders still moving through the pipeline`}
                badgeLabel="Open pipeline"
                badgeColor="amber"
                accent="linear-gradient(90deg, #ff7a00, #f59e0b)"
              />

              <InsightCard
                title="This month orders"
                value={numberFormatter(latestOrders)}
                note={`${numberFormatter(analytics.totals.orders)} lifetime orders captured so far`}
                badgeLabel={ordersDelta.label}
                badgeColor={ordersDelta.color}
                accent="linear-gradient(90deg, #111111, #3f3f46)"
              />

              <InsightCard
                title="Average order value"
                value={money(currentAov)}
                note={`${fulfillmentRate}% fulfillment rate based on delivered orders`}
                badgeLabel={aovDelta.label}
                badgeColor={aovDelta.color}
                accent="linear-gradient(90deg, #10b981, #22c55e)"
              />
            </Grid>

            <Grid numItems={1} numItemsLg={3} className="gap-4">
              <Col numColSpan={1} numColSpanLg={2}>
                <Card className="brand-panel" style={elevatedSurfaceStyle}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
                    <div>
                      <Title>Performance timeline</Title>
                      <Text style={{ marginTop: 6 }}>
                        Switch between revenue, order velocity, and audience growth without leaving the main chart.
                      </Text>
                    </div>
                    <Badge color="red">Tremor AreaChart</Badge>
                  </div>

                  <TabGroup style={{ marginTop: 18 }}>
                    <TabList variant="solid" color="red">
                      <Tab>Revenue pulse</Tab>
                      <Tab>Order flow</Tab>
                      <Tab>Audience growth</Tab>
                    </TabList>

                    <TabPanels style={{ marginTop: 18 }}>
                      <TabPanel>
                        <AreaChart
                          className="mt-2 h-80"
                          data={revenueTrend}
                          index="month"
                          categories={["Revenue"]}
                          colors={["red"]}
                          valueFormatter={money}
                          showLegend={false}
                          showAnimation
                          showGradient
                          curveType="natural"
                          yAxisWidth={92}
                        />
                      </TabPanel>

                      <TabPanel>
                        <AreaChart
                          className="mt-2 h-80"
                          data={revenueTrend}
                          index="month"
                          categories={["Orders"]}
                          colors={["zinc"]}
                          valueFormatter={numberFormatter}
                          showLegend={false}
                          showAnimation
                          showGradient
                          curveType="natural"
                          yAxisWidth={70}
                        />
                      </TabPanel>

                      <TabPanel>
                        <AreaChart
                          className="mt-2 h-80"
                          data={revenueTrend}
                          index="month"
                          categories={["New users"]}
                          colors={["orange"]}
                          valueFormatter={numberFormatter}
                          showLegend={false}
                          showAnimation
                          showGradient
                          curveType="natural"
                          yAxisWidth={70}
                        />
                      </TabPanel>
                    </TabPanels>
                  </TabGroup>

                  <div className="command-mini-grid">
                    <div className="command-mini-card">
                      <Text>Peak month</Text>
                      <div className="command-mini-value">{formatMonth(peakMonth.month)}</div>
                      <Text>{money(peakMonth.revenue)} delivered</Text>
                    </div>

                    <div className="command-mini-card">
                      <Text>Current new users</Text>
                      <div className="command-mini-value">{numberFormatter(latestMonth?.newUsers ?? 0)}</div>
                      <Text>New customer accounts created this month</Text>
                    </div>

                    <div className="command-mini-card">
                      <Text>Catalog breadth</Text>
                      <div className="command-mini-value">{numberFormatter(analytics.totals.products)}</div>
                      <Text>{numberFormatter(analytics.totals.categories)} product categories on the shelf</Text>
                    </div>
                  </div>
                </Card>
              </Col>

              <Col numColSpan={1}>
                <Card className="brand-panel" style={surfaceStyle}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start" }}>
                    <div>
                      <Title>Order status mix</Title>
                      <Text style={{ marginTop: 6 }}>
                        A quick read on fulfillment pressure and order quality.
                      </Text>
                    </div>
                    <Badge color="zinc">{fulfillmentRate}% fulfilled</Badge>
                  </div>

                  <DonutChart
                    className="mt-6 h-72"
                    data={statusRows}
                    category="count"
                    index="label"
                    colors={statusRows.map((row) => row.color)}
                    valueFormatter={numberFormatter}
                    showLabel={false}
                    showAnimation
                  />

                  <div className="status-stack">
                    {statusRows.map((row) => (
                      <div key={row.status} className="status-row">
                        <div className="status-row-left">
                          <span className="status-dot" style={{ background: row.dot }} />
                          <div>
                            <div className="status-label">{row.label}</div>
                            <div className="status-sub">{row.share.toFixed(0)}% of total orders</div>
                          </div>
                        </div>
                        <Badge color={row.color}>{numberFormatter(row.count)}</Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              </Col>
            </Grid>

            <Grid numItems={1} numItemsLg={3} className="gap-4">
              <Col numColSpan={1}>
                <Card className="brand-panel" style={surfaceStyle}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
                    <div>
                      <Title>Category command board</Title>
                      <Text style={{ marginTop: 6 }}>
                        Compare category revenue against unit demand using Tremor tabs and bar lists.
                      </Text>
                    </div>
                    <Badge color="red">Top 5</Badge>
                  </div>

                  <TabGroup style={{ marginTop: 18 }}>
                    <TabList variant="solid" color="red">
                      <Tab>Revenue</Tab>
                      <Tab>Units</Tab>
                    </TabList>

                    <TabPanels style={{ marginTop: 18 }}>
                      <TabPanel>
                        {categoryRevenueBars.length > 0 ? (
                          <BarList data={categoryRevenueBars} valueFormatter={money} color="red" showAnimation />
                        ) : (
                          <div className="empty-block">No category revenue yet.</div>
                        )}
                      </TabPanel>

                      <TabPanel>
                        {categoryUnitsBars.length > 0 ? (
                          <BarList data={categoryUnitsBars} valueFormatter={numberFormatter} color="orange" showAnimation />
                        ) : (
                          <div className="empty-block">No category volume yet.</div>
                        )}
                      </TabPanel>
                    </TabPanels>
                  </TabGroup>
                </Card>
              </Col>

              <Col numColSpan={1}>
                <Card className="brand-panel" style={surfaceStyle}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
                    <div>
                      <Title>Top performing products</Title>
                      <Text style={{ marginTop: 6 }}>
                        Best sellers by realized revenue with a layout that matches the storefront’s premium cards.
                      </Text>
                    </div>
                    <Badge color="emerald">{leadingProduct ? `${leadingProduct.unitsSold} units lead` : "Waiting"}</Badge>
                  </div>

                  <div style={{ marginTop: 18 }}>
                    {productBars.length > 0 ? (
                      <BarList data={productBars} valueFormatter={money} color="red" showAnimation />
                    ) : (
                      <div className="empty-block">No product performance data yet.</div>
                    )}
                  </div>

                  {leadingProduct ? (
                    <div
                      style={{
                        marginTop: 18,
                        padding: "14px 16px",
                        borderRadius: 18,
                        border: "1px solid var(--border)",
                        background: "linear-gradient(180deg, rgba(255,40,0,0.05), rgba(255,255,255,0))",
                      }}
                    >
                      <Text>Lead mover</Text>
                      <div style={{ marginTop: 8, fontSize: 18, fontWeight: 900, letterSpacing: "-0.03em", color: "var(--foreground)" }}>
                        {leadingProduct.name}
                      </div>
                      <Text style={{ marginTop: 6 }}>
                        {leadingProduct.sku} • {numberFormatter(leadingProduct.unitsSold)} units sold
                      </Text>
                    </div>
                  ) : null}
                </Card>
              </Col>

              <Col numColSpan={1}>
                <Card className="brand-panel" style={surfaceStyle}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
                    <div>
                      <Title>Inventory watch</Title>
                      <Text style={{ marginTop: 6 }}>
                        Surface low-stock risk before high-demand products go dark.
                      </Text>
                    </div>
                    <Badge color={analytics.lowStockProducts.length > 0 ? "rose" : "emerald"}>
                      {analytics.lowStockProducts.length > 0 ? `${analytics.lowStockProducts.length} alerts` : "Stable"}
                    </Badge>
                  </div>

                  <div className="inventory-list">
                    {analytics.lowStockProducts.length === 0 ? (
                      <div className="empty-block">Inventory looks healthy right now.</div>
                    ) : (
                      analytics.lowStockProducts.map((product) => (
                        <div key={product.id} className="inventory-item">
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 14, fontWeight: 800, color: "var(--foreground)", letterSpacing: "-0.02em" }}>
                                {product.name}
                              </div>
                              <div style={{ marginTop: 3, fontSize: 11, color: "var(--text-dim)", fontWeight: 700 }}>
                                {product.sku}
                              </div>
                            </div>
                            <Badge color={product.stock <= 2 ? "rose" : "orange"}>{product.stock} left</Badge>
                          </div>

                          <div style={{ marginTop: 12 }}>
                            <ProgressBar
                              value={Math.max(4, Math.min((product.stock / 10) * 100, 100))}
                              color={product.stock <= 2 ? "rose" : "orange"}
                              showAnimation
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </Col>
            </Grid>

            <Card className="brand-panel" style={surfaceStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
                <div>
                  <Title>Recent order stream</Title>
                  <Text style={{ marginTop: 6 }}>
                    The latest transactions, redesigned with Tremor tables and the same clean spacing language as the site.
                  </Text>
                </div>
                <Badge color="red">{numberFormatter(analytics.recentOrders.length)} latest orders</Badge>
              </div>

              <div className="command-table-wrap" style={{ marginTop: 20 }}>
                {analytics.recentOrders.length > 0 ? (
                  <Table className="command-table">
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell>Order</TableHeaderCell>
                        <TableHeaderCell>Customer</TableHeaderCell>
                        <TableHeaderCell>Created</TableHeaderCell>
                        <TableHeaderCell>Total</TableHeaderCell>
                        <TableHeaderCell>Status</TableHeaderCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {analytics.recentOrders.map((order) => {
                        const meta = statusMeta[order.status as keyof typeof statusMeta] ?? defaultStatusMeta;

                        return (
                          <TableRow key={order.id}>
                            <TableCell>
                              <div style={{ fontWeight: 800, color: "var(--foreground)" }}>#{order.id.slice(0, 8).toUpperCase()}</div>
                            </TableCell>
                            <TableCell>
                              <div style={{ fontWeight: 700, color: "var(--foreground)" }}>
                                {order.customerName || "Guest checkout"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div style={{ color: "var(--text-muted)", fontWeight: 600 }}>{formatDateTime(order.createdAt)}</div>
                            </TableCell>
                            <TableCell>
                              <div style={{ fontWeight: 800, color: "var(--foreground)" }}>{money(order.total)}</div>
                            </TableCell>
                            <TableCell>
                              <Badge color={meta.color}>{meta.label}</Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="empty-block">No recent orders to display yet.</div>
                )}
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

function InsightCard({
  title,
  value,
  note,
  badgeLabel,
  badgeColor,
  accent,
}: {
  title: string;
  value: string;
  note: string;
  badgeLabel: string;
  badgeColor: string;
  accent: string;
}) {
  return (
    <Card className="brand-panel" style={surfaceStyle}>
      <div
        style={{
          width: 62,
          height: 4,
          borderRadius: 999,
          background: accent,
        }}
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginTop: 16 }}>
        <div style={{ minWidth: 0 }}>
          <Text>{title}</Text>
          <Metric style={{ marginTop: 12 }}>{value}</Metric>
          <Text style={{ marginTop: 10, lineHeight: 1.7 }}>{note}</Text>
        </div>
        <Badge color={badgeColor}>{badgeLabel}</Badge>
      </div>
    </Card>
  );
}

function LoadingState() {
  return (
    <div className="command-shell">
      <Grid numItems={1} numItemsMd={2} numItemsLg={4} className="gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="brand-panel" style={surfaceStyle}>
            <div className="command-skeleton" style={{ width: 72, height: 4 }} />
            <div className="command-skeleton" style={{ width: "50%", height: 18, marginTop: 18 }} />
            <div className="command-skeleton" style={{ width: "74%", height: 34, marginTop: 14 }} />
            <div className="command-skeleton" style={{ width: "66%", height: 14, marginTop: 16 }} />
          </Card>
        ))}
      </Grid>

      <Card className="brand-panel" style={elevatedSurfaceStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div className="command-loading-orb" />
          <div>
            <Title>Synchronizing analytics streams</Title>
            <Text style={{ marginTop: 8 }}>
              Pulling the latest orders, carts, customer growth, and inventory signals into the new command center.
            </Text>
          </div>
        </div>
      </Card>
    </div>
  );
}

function EmptyState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <Card className="brand-panel" style={surfaceStyle}>
      <Title>Analytics data is not ready yet</Title>
      <Text style={{ marginTop: 8 }}>
        The dashboard layout is in place, but the overview feed did not return any metrics for this session.
      </Text>
      <div style={{ marginTop: 18 }}>
        <Button onClick={onRefresh} icon={ArrowPathIcon}>
          Retry Analytics Sync
        </Button>
      </div>
    </Card>
  );
}

export default AnalyticsPage;
