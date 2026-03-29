'use client';

import { useState } from 'react';

/* ── SVG Icon helper ── */
const Icon = ({ d, size = 16 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const iconPaths = {
  cart: "M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0",
  users: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2m22-4a4 4 0 100-8 4 4 0 000 8zm-8 0a4 4 0 100-8 4 4 0 000 8z",
  returnBox: "M9 14l-4-4 4-4M5 10h11a4 4 0 010 8h-1",
  dollar: "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
  search: "M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z",
  calendar: "M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM16 2v4M8 2v4M3 10h18",
  chevronDown: "M6 9l6 6 6-6",
  sliders: "M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6",
  arrowUp: "M12 19V5M5 12l7-7 7 7",
  arrowDown: "M12 5v14M19 12l-7 7-7-7",
};

/* ── Mock data ── */
const statsData = [
  { label: 'Total Sales', value: '2500', change: '+4.9%', up: true, sub: 'Last month: 2345', icon: iconPaths.cart },
  { label: 'New Customer', value: '110', change: '+7.5%', up: true, sub: 'Last month: 89', icon: iconPaths.users },
  { label: 'Return Products', value: '72', change: '-6.0%', up: false, sub: 'Last month: 60', icon: iconPaths.returnBox },
  { label: 'Total Revenue', value: '$8,220.64', change: '', up: true, sub: 'Last month: $620.00', icon: iconPaths.dollar },
];

const revenueData = [
  { day: 'Fri', value: 15000 },
  { day: 'Sat', value: 18000 },
  { day: 'Sun', value: 22430 },
  { day: 'Mon', value: 19500 },
  { day: 'Thu', value: 14000 },
  { day: 'Wen', value: 16000 },
  { day: 'Thus', value: 12000 },
];

const incomeData = [
  { month: '00', profit: 0, loss: 0 },
  { month: 'Jan', profit: 35000, loss: 10000 },
  { month: 'Feb', profit: 25000, loss: 8000 },
  { month: 'Mar', profit: 30000, loss: 12000 },
  { month: 'Apr', profit: 20000, loss: 15000 },
  { month: 'May', profit: 28000, loss: 10000 },
  { month: 'Jun', profit: 32000, loss: 8000 },
  { month: 'Jul', profit: 40000, loss: 12000 },
  { month: 'Aug', profit: 38000, loss: 10000 },
];

const recentOrders = [
  { id: '#878909', date: '2 Dec 2026', customer: 'Oliver John Brown', category: 'Shoes, Shirt', status: 'Pending', items: 2, total: '$789.00' },
  { id: '#878909', date: '1 Dec 2026', customer: 'Noah James Smith', category: 'Sneakers, T-shirt', status: 'Completed', items: 3, total: '$967.00' },
  { id: '#878910', date: '30 Nov 2026', customer: 'Emma Williams', category: 'Jacket, Pants', status: 'Completed', items: 2, total: '$456.00' },
  { id: '#878911', date: '29 Nov 2026', customer: 'Liam Johnson', category: 'Watch, Belt', status: 'Pending', items: 2, total: '$1,243.00' },
  { id: '#878912', date: '28 Nov 2026', customer: 'Sophia Davis', category: 'Dress, Bag', status: 'Completed', items: 3, total: '$678.00' },
];

const MAX_REVENUE = 30000;
const MAX_INCOME = 50000;

export default function DashboardPage() {
  const [orderSearch, setOrderSearch] = useState('');

  const filteredOrders = recentOrders.filter(o =>
    o.customer.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.id.toLowerCase().includes(orderSearch.toLowerCase())
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .dash-page {
          font-family: 'Plus Jakarta Sans', sans-serif;
          padding: 28px 32px 40px;
          flex: 1;
          min-height: 100vh;
          background: var(--background);
        }

        /* ── Page Header ── */
        .dash-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 28px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .dash-title {
          font-size: 26px;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--foreground);
          margin: 0;
        }
        .date-picker-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 16px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          color: var(--foreground);
          cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: border-color 0.2s;
        }
        .date-picker-btn:hover {
          border-color: var(--border-strong);
        }

        /* ── Stat Cards ── */
        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 28px;
        }
        @media (max-width: 1100px) { .stats-row { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 600px) { .stats-row { grid-template-columns: 1fr; } }

        .stat-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 20px 22px;
          transition: border-color 0.2s, box-shadow 0.2s;
          position: relative;
          overflow: hidden;
        }
        .stat-card:hover {
          border-color: var(--border-strong);
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
        }
        .stat-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .stat-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-muted);
          margin: 0;
        }
        .stat-icon-wrap {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: var(--surface-hover);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
        }
        .stat-value {
          font-size: 32px;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--foreground);
          margin: 0;
          line-height: 1.1;
        }
        .stat-change {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 12px;
          font-weight: 700;
          margin-left: 8px;
          padding: 2px 7px;
          border-radius: 6px;
        }
        .stat-change.up {
          color: #16a34a;
          background: rgba(22,163,74,0.08);
        }
        .stat-change.down {
          color: #dc2626;
          background: rgba(220,38,38,0.08);
        }
        .stat-sub {
          font-size: 12px;
          color: var(--text-dim);
          margin-top: 6px;
          font-weight: 500;
        }

        /* ── Charts Row ── */
        .charts-row {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 16px;
          margin-bottom: 28px;
        }
        @media (max-width: 900px) { .charts-row { grid-template-columns: 1fr; } }

        .chart-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 24px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .chart-card:hover {
          border-color: var(--border-strong);
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
        }
        .chart-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        .chart-title {
          font-size: 16px;
          font-weight: 800;
          color: var(--foreground);
          letter-spacing: -0.02em;
          margin: 0;
        }
        .chart-subtitle {
          font-size: 12.5px;
          color: var(--text-dim);
          font-weight: 500;
          margin-top: 2px;
        }
        .chart-dropdown {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 20px;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--foreground);
          cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        /* ── Revenue Bar Chart ── */
        .revenue-chart {
          display: flex;
          align-items: flex-end;
          gap: 0;
          height: 220px;
          position: relative;
        }
        .revenue-y-axis {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
          padding-right: 12px;
          min-width: 35px;
        }
        .revenue-y-label {
          font-size: 11px;
          color: var(--text-dim);
          font-weight: 500;
          text-align: right;
        }
        .revenue-bars {
          display: flex;
          align-items: flex-end;
          gap: 12px;
          flex: 1;
          height: 100%;
          border-bottom: 1px solid var(--border);
          padding-bottom: 0;
        }
        .revenue-bar-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
          justify-content: flex-end;
          position: relative;
        }
        .revenue-bar {
          width: 100%;
          max-width: 48px;
          border-radius: 8px 8px 4px 4px;
          background: var(--brand-red);
          transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
          position: relative;
          cursor: pointer;
          min-height: 4px;
        }
        .revenue-bar:hover {
          filter: brightness(1.1);
          transform: scaleY(1.02);
          transform-origin: bottom;
        }
        .revenue-bar-tooltip {
          position: absolute;
          top: -32px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--foreground);
          color: var(--background);
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s;
        }
        .revenue-bar:hover .revenue-bar-tooltip {
          opacity: 1;
        }
        .revenue-day-label {
          font-size: 12px;
          color: var(--text-dim);
          font-weight: 500;
          margin-top: 10px;
          text-align: center;
        }

        /* ── Income Chart ── */
        .income-chart {
          display: flex;
          align-items: flex-end;
          height: 180px;
          position: relative;
        }
        .income-y-axis {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
          padding-right: 10px;
          min-width: 30px;
        }
        .income-y-label {
          font-size: 10px;
          color: var(--text-dim);
          font-weight: 500;
          text-align: right;
        }
        .income-bars {
          display: flex;
          align-items: flex-end;
          gap: 6px;
          flex: 1;
          height: 100%;
          border-bottom: 1px solid var(--border);
        }
        .income-bar-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
          justify-content: flex-end;
        }
        .income-bar-stack {
          width: 100%;
          max-width: 24px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          border-radius: 4px 4px 2px 2px;
          overflow: hidden;
        }
        .income-bar-profit {
          background: var(--brand-red);
          transition: height 0.3s ease;
        }
        .income-bar-loss {
          background: var(--foreground);
          opacity: 0.85;
          transition: height 0.3s ease;
        }
        .income-month-label {
          font-size: 10px;
          color: var(--text-dim);
          font-weight: 500;
          margin-top: 6px;
          text-align: center;
        }
        .income-legend {
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
        }
        .income-legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
          margin-right: 5px;
        }

        /* ── Recent Orders ── */
        .orders-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .orders-card:hover {
          border-color: var(--border-strong);
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
        }
        .orders-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .orders-title {
          font-size: 16px;
          font-weight: 800;
          color: var(--foreground);
          letter-spacing: -0.02em;
          margin: 0;
        }
        .orders-controls {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .orders-search-wrap {
          position: relative;
        }
        .orders-search-wrap svg {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-dim);
          pointer-events: none;
        }
        .orders-search {
          padding: 8px 14px 8px 34px;
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 10px;
          font-size: 13px;
          color: var(--foreground);
          font-family: 'Plus Jakarta Sans', sans-serif;
          outline: none;
          width: 200px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .orders-search::placeholder { color: var(--text-dim); }
        .orders-search:focus {
          border-color: var(--brand-red);
          box-shadow: 0 0 0 3px rgba(255,40,0,0.08);
        }
        .sort-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          color: var(--foreground);
          cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: border-color 0.2s;
        }
        .sort-btn:hover { border-color: var(--border-strong); }

        .orders-table {
          width: 100%;
          border-collapse: collapse;
        }
        .orders-table thead {
          background: var(--background);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }
        .orders-table th {
          padding: 12px 16px;
          text-align: left;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--text-dim);
          white-space: nowrap;
        }
        .orders-table td {
          padding: 14px 16px;
          font-size: 13.5px;
          border-bottom: 1px solid var(--border);
          vertical-align: middle;
          color: var(--foreground);
        }
        .orders-table tr:last-child td {
          border-bottom: none;
        }
        .orders-table tbody tr {
          transition: background 0.15s;
        }
        .orders-table tbody tr:hover {
          background: var(--surface-hover);
        }

        .order-checkbox {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          border: 1.5px solid var(--border-strong);
          background: var(--background);
          cursor: pointer;
          accent-color: var(--brand-red);
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.01em;
        }
        .status-pending {
          background: rgba(255,40,0,0.08);
          color: var(--brand-red);
        }
        .status-completed {
          background: rgba(22,163,74,0.08);
          color: #16a34a;
        }
      `}</style>

      <div className="dash-page">
        {/* ── Page Header ── */}
        <div className="dash-header">
          <h1 className="dash-title">Sales Overview</h1>
          <button className="date-picker-btn">
            <Icon d={iconPaths.calendar} size={15} />
            <span>April 10, 2026 - May 11, 2026</span>
            <Icon d={iconPaths.chevronDown} size={13} />
          </button>
        </div>

        {/* ── Stat Cards ── */}
        <div className="stats-row">
          {statsData.map((st, i) => (
            <div className="stat-card" key={i}>
              <div className="stat-card-top">
                <p className="stat-label">{st.label}</p>
                <div className="stat-icon-wrap">
                  <Icon d={st.icon} size={18} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline' }}>
                <p className="stat-value">{st.value}</p>
                {st.change && (
                  <span className={`stat-change ${st.up ? 'up' : 'down'}`}>
                    {st.up ? '↑' : '↓'} {st.change}
                  </span>
                )}
              </div>
              <p className="stat-sub">{st.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Charts Row ── */}
        <div className="charts-row">
          {/* Revenue Analytics */}
          <div className="chart-card">
            <div className="chart-header">
              <h2 className="chart-title">Revenue analytics</h2>
              <button className="chart-dropdown">
                This Week
                <Icon d={iconPaths.chevronDown} size={13} />
              </button>
            </div>
            <div className="revenue-chart">
              <div className="revenue-y-axis">
                {['30k', '25k', '20k', '15k', '10k', '5k', '0k'].map(l => (
                  <span className="revenue-y-label" key={l}>{l}</span>
                ))}
              </div>
              <div className="revenue-bars">
                {revenueData.map((d, i) => (
                  <div className="revenue-bar-col" key={i}>
                    <div
                      className="revenue-bar"
                      style={{ height: `${(d.value / MAX_REVENUE) * 100}%` }}
                    >
                      <div className="revenue-bar-tooltip">
                        ${d.value.toLocaleString()}
                      </div>
                    </div>
                    <span className="revenue-day-label">{d.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Total Income */}
          <div className="chart-card">
            <div className="chart-header">
              <div>
                <h2 className="chart-title">Total Income</h2>
                <p className="chart-subtitle">View your income in a certain period of time</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--foreground)' }}>Profit and Loss</span>
              <div className="income-legend">
                <span><span className="income-legend-dot" style={{ background: 'var(--brand-red)' }} /> Profit</span>
                <span><span className="income-legend-dot" style={{ background: 'var(--foreground)', opacity: 0.85 }} /> Loss</span>
              </div>
            </div>
            <div className="income-chart">
              <div className="income-y-axis">
                {['50k', '40k', '30k', '20k', '10k', '0'].map(l => (
                  <span className="income-y-label" key={l}>{l}</span>
                ))}
              </div>
              <div className="income-bars">
                {incomeData.map((d, i) => {
                  const totalH = ((d.profit + d.loss) / MAX_INCOME) * 100;
                  const profitRatio = d.profit / (d.profit + d.loss || 1);
                  return (
                    <div className="income-bar-col" key={i}>
                      <div className="income-bar-stack" style={{ height: `${totalH}%` }}>
                        <div className="income-bar-profit" style={{ flex: profitRatio }} />
                        <div className="income-bar-loss" style={{ flex: 1 - profitRatio }} />
                      </div>
                      <span className="income-month-label">{d.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Recent Orders ── */}
        <div className="orders-card">
          <div className="orders-header">
            <h2 className="orders-title">Recent orders</h2>
            <div className="orders-controls">
              <div className="orders-search-wrap">
                <Icon d={iconPaths.search} size={14} />
                <input
                  className="orders-search"
                  placeholder="Search"
                  value={orderSearch}
                  onChange={e => setOrderSearch(e.target.value)}
                />
              </div>
              <button className="sort-btn">
                <Icon d={iconPaths.sliders} size={14} />
                Sort by
                <Icon d={iconPaths.chevronDown} size={12} />
              </button>
            </div>
          </div>

          <table className="orders-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}><input type="checkbox" className="order-checkbox" /></th>
                <th>Order Id</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Category</th>
                <th>Status</th>
                <th>Items</th>
                <th style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, i) => (
                <tr key={i}>
                  <td><input type="checkbox" className="order-checkbox" /></td>
                  <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{order.id}</td>
                  <td style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{order.date}</td>
                  <td style={{ fontWeight: 700 }}>{order.customer}</td>
                  <td style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{order.category}</td>
                  <td>
                    <span className={`status-badge ${order.status === 'Pending' ? 'status-pending' : 'status-completed'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{order.items} Items</td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>{order.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
