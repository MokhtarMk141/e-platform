"use client";

import { useState } from "react";
import { useDiscounts } from "@/hooks/useDiscounts";
import { DiscountService, type Discount } from "@/services/discount.service";
import { useProducts } from "@/hooks/useProducts";

const Icon = ({ d, size = 16 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const icons = {
  search: "M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z",
  edit: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  trash: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 12a3 3 0 100-6 3 3 0 000 6z",
  plus: "M12 5v14M5 12h14",
  chevronLeft: "M15 18l-6-6 6-6",
  chevronRight: "M9 18l6-6-6-6",
  sort: "M3 6h18M7 12h10M11 18h2",
  tag: "M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01",
  close: "M6 18L18 6M6 6l12 12",
  package: "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"
};

const PAGE_SIZE = 8;

export default function CouponsPage() {
  const { discounts, loading, error, refetch } = useDiscounts();
  const { products } = useProducts({ limit: 100 }); // We grab a bunch of products for the dropdown. Alternatively would use an autocomplete.
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<"code" | "discount" | "expiryDate" | "usageCount" | "createdAt">("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Discount>>({
    type: "PERCENTAGE",
    status: "ACTIVE",
    discount: 0,
    maxUses: null,
    productId: null,
    code: null,
    expiryDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().substring(0,16),
  });

  const [mode, setMode] = useState<"CODE" | "PRODUCT">("CODE");

  const handleDelete = async (id: string, label: string) => {
    if (window.confirm(`Are you sure you want to delete discount "${label}"?`)) {
      try {
        await DiscountService.delete(id);
        refetch();
      } catch (err: any) {
        alert(err.message || 'Failed to delete');
      }
    }
  };

  const toggleStatus = async (coupon: Discount) => {
    const newStatus = coupon.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    if (window.confirm(`Change ${coupon.code || "product discount"}'s status to ${newStatus}?`)) {
      try {
        await DiscountService.update(coupon.id, { status: newStatus });
        refetch();
      } catch (err: any) {
         alert(err.message || 'Failed to update');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        code: mode === "CODE" ? formData.code : null,
        productId: mode === "PRODUCT" ? formData.productId : null,
      };
      
      await DiscountService.create(payload);
      
      setIsModalOpen(false);
      refetch();
      setFormData({
        type: "PERCENTAGE", status: "ACTIVE", discount: 0, maxUses: null, productId: null, code: null,
        expiryDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().substring(0,16),
      });
    } catch (err: any) {
      alert(err.message || "Failed to create discount");
    }
  };

  const filtered = (discounts || [])
    .filter((c: Discount) => {
      const label = c.code || "Direct Product Discount";
      const matchSearch = label.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || c.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a: Discount, b: Discount) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortBy === "code") return dir * (a.code || "").localeCompare(b.code || "");
      if (sortBy === "discount") return dir * (a.discount - b.discount);
      if (sortBy === "usageCount") return dir * (a.usageCount - b.usageCount);
      if (sortBy === "expiryDate") return dir * (new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
      if (sortBy === "createdAt") return dir * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      return 0;
    });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(col); setSortDir("asc"); }
  };

  const SortArrow = ({ col }: { col: typeof sortBy }) =>
    sortBy === col ? (
      <span style={{ color: "var(--brand-red)", marginLeft: 4, fontSize: 11 }}>
        {sortDir === "asc" ? "▲" : "▼"}
      </span>
    ) : (
      <span style={{ opacity: 0.25, marginLeft: 4, fontSize: 11 }}>▲</span>
    );

  const totalActive = (discounts||[]).filter(c => c.status === "ACTIVE").length;
  const totalUses = (discounts||[]).reduce((sum, c) => sum + c.usageCount, 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .gap-page { font-family: 'Plus Jakarta Sans', sans-serif; padding: 32px; flex: 1; min-height: 100vh;}

        .stat-card {
          background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 20px 24px; flex: 1; transition: border-color 0.2s, box-shadow 0.2s;
        }
        .stat-card:hover { border-color: var(--border-strong); box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
        .stat-label { font-size: 12px; font-weight: 600; color: var(--text-dim); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 6px; }
        .stat-value { font-size: 28px; font-weight: 800; letter-spacing: -0.03em; color: var(--foreground); }
        .stat-sub   { font-size: 12px; color: var(--text-muted); margin-top: 2px; }

        .toolbar { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin: 28px 0 20px; }

        .search-wrap { position: relative; flex: 1; min-width: 220px; }
        .search-wrap svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-dim); pointer-events: none; }
        .search-input {
          width: 100%; padding: 9px 14px 9px 38px;
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 10px; font-size: 13.5px; color: var(--foreground);
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: border-color 0.2s, box-shadow 0.2s; outline: none; box-sizing: border-box;
        }
        .search-input::placeholder { color: var(--text-dim); }
        .search-input:focus { border-color: var(--brand-red); box-shadow: 0 0 0 3px rgba(255,40,0,0.08); }

        .filter-select {
          padding: 9px 32px 9px 14px; background: var(--surface); border: 1px solid var(--border);
          border-radius: 10px; font-size: 13px; color: var(--foreground);
          font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 500;
          appearance: none; cursor: pointer; outline: none; transition: border-color 0.2s;
        }
        .filter-select:focus { border-color: var(--brand-red); }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--brand-red); color: #fff;
          padding: 9px 18px; border-radius: 10px;
          font-size: 13.5px; font-weight: 700; border: none;
          cursor: pointer; box-shadow: 0 4px 12px rgba(255,40,0,0.25);
          transition: all 0.2s; font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .btn-primary:hover {
          background: #e62000; box-shadow: 0 6px 16px rgba(255,40,0,0.3); transform: translateY(-1px);
        }

        .table-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; overflow: auto; }
        table { min-width: 880px; }
        table { width: 100%; border-collapse: collapse; }
        thead { background: var(--background); border-bottom: 1px solid var(--border); }
        th {
          padding: 12px 16px; text-align: left; font-size: 11.5px; font-weight: 700; letter-spacing: 0.06em;
          text-transform: uppercase; color: var(--text-dim); white-space: nowrap; cursor: pointer; user-select: none;
        }
        th:hover { color: var(--foreground); }
        td { padding: 14px 16px; font-size: 13.5px; border-bottom: 1px solid var(--border); vertical-align: middle; }
        tr:last-child td { border-bottom: none; }
        tbody tr { transition: background 0.15s; }
        tbody tr:hover { background: var(--surface-hover); }

        .badge {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 4px 10px; border-radius: 999px; font-size: 11.5px; font-weight: 700;
          letter-spacing: 0.02em; white-space: nowrap;
        }
        .badge.active { background: rgba(34,197,94,0.1); color: #16a34a; }
        .badge.paused { background: rgba(234,179,8,0.1); color: #ca8a04; }
        .badge.expired { background: rgba(239,68,68,0.1); color: #dc2626; }
        
        .badge.discount-percentage { background: rgba(59,130,246,0.1); color: #2563eb; }
        .badge.discount-fixed { background: rgba(168,85,247,0.1); color: #9333ea; }

        .coupon-code { font-weight: 800; color: var(--foreground); font-size: 15px; letter-spacing: -0.01em; display: inline-flex; align-items: center; gap: 8px;}
        .coupon-desc { font-size: 12px; color: var(--text-dim); font-weight: 500; margin-top: 4px; }

        .action-btn {
          display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border); background: var(--background); color: var(--text-muted); cursor: pointer; transition: all 0.2s;
        }
        .action-btn:hover.edit  { border-color: var(--brand-red); color: var(--brand-red); background: rgba(255,40,0,0.06); }
        .action-btn:hover.del   { border-color: #dc2626; color: #dc2626; background: rgba(220,38,38,0.06); }

        .pagination { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-top: 1px solid var(--border); flex-wrap: wrap; gap: 12px; }
        .pg-info { font-size: 13px; color: var(--text-muted); font-weight: 500; }
        .pg-btn {
          display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 8px; border: 1px solid var(--border); background: var(--background); color: var(--text-muted); cursor: pointer; transition: all 0.2s; font-size: 13px; font-weight: 600;
        }
        .pg-btn:hover:not(:disabled) { border-color: var(--brand-red); color: var(--brand-red); }
        .pg-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .pg-btn.active { background: var(--brand-red); border-color: var(--brand-red); color: #fff; }

        .empty { text-align: center; padding: 64px 32px; color: var(--text-muted); }
        .empty-title { font-size: 16px; font-weight: 700; color: var(--foreground); margin-top: 12px; }
        .empty-sub   { font-size: 13.5px; color: var(--text-muted); margin-top: 6px; }

        /* ── Modal Styles ── */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .modal { background: var(--background); border-radius: 16px; width: 100%; max-width: 500px; border: 1px solid var(--border); display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
        .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid var(--border); background: var(--surface); }
        .modal-title { font-size: 18px; font-weight: 800; color: var(--foreground); margin: 0; letter-spacing: -0.02em; }
        .modal-close { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; border-radius: 6px; }
        .modal-close:hover { background: var(--surface-hover); color: var(--foreground); }
        .modal-body { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
        .modal-footer { padding: 16px 24px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 12px; background: var(--surface); }
        
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-label { font-size: 13px; font-weight: 700; color: var(--foreground); }
        .form-input { padding: 10px 14px; background: var(--background); border: 1px solid var(--border); border-radius: 8px; font-size: 14px; color: var(--foreground); font-family: 'Plus Jakarta Sans', sans-serif; outline: none; transition: border-color 0.2s; }
        .form-input:focus { border-color: var(--brand-red); }
        
        .mode-toggle { display: flex; gap: 0; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
        .mode-btn { flex: 1; padding: 10px; background: none; border: none; font-size: 13.5px; font-weight: 700; color: var(--text-dim); cursor: pointer; transition: all 0.2s; }
        .mode-btn.active { background: var(--border); color: var(--foreground); }

        .error-alert {
          margin-top: 14px;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid rgba(239, 68, 68, 0.25);
          background: rgba(239, 68, 68, 0.08);
          color: #dc2626;
          font-size: 13px;
          font-weight: 600;
        }

        @media (max-width: 900px) {
          .gap-page { padding: 20px; }
          .toolbar { gap: 8px; }
          .stat-card { min-width: calc(50% - 7px); }
        }

        @media (max-width: 640px) {
          .stat-card { min-width: 100%; }
        }
      `}</style>

      {/* ── Modal ── */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create Discount</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <Icon d={icons.close} size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                
                <div className="mode-toggle">
                  <button type="button" className={`mode-btn ${mode === 'CODE' ? 'active' : ''}`} onClick={() => setMode('CODE')}>Promo Code</button>
                  <button type="button" className={`mode-btn ${mode === 'PRODUCT' ? 'active' : ''}`} onClick={() => setMode('PRODUCT')}>Product Direct</button>
                </div>

                {mode === "CODE" ? (
                  <div className="form-group">
                    <label className="form-label">Discount Code</label>
                    <input required className="form-input" placeholder="e.g. SUMMER20" value={formData.code || ''} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} />
                  </div>
                ) : (
                  <div className="form-group">
                    <label className="form-label">Select Product</label>
                    <select required className="form-input" value={formData.productId || ''} onChange={(e) => setFormData({...formData, productId: e.target.value})}>
                      <option value="">-- Choose heavily discounted product --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select className="form-input" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value as any})}>
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FIXED">Fixed Amount ($)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Value</label>
                    <input required type="number" min="1" className="form-input" placeholder="e.g. 20" value={formData.discount || ''} onChange={(e) => setFormData({...formData, discount: parseFloat(e.target.value)})} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                   <div className="form-group">
                    <label className="form-label">Max Uses (Optional)</label>
                    <input type="number" min="1" className="form-input" placeholder="e.g. 100" value={formData.maxUses || ''} onChange={(e) => setFormData({...formData, maxUses: e.target.value ? parseInt(e.target.value) : null})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Expiry Date & Time</label>
                    <input required type="datetime-local" className="form-input" value={formData.expiryDate} onChange={(e) => setFormData({...formData, expiryDate: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 10, padding: '9px 18px', color: 'var(--foreground)', fontWeight: 700, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Cancel</button>
                <button type="submit" className="btn-primary">Create Discount</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="gap-page">
        {/* ── Page header ── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", margin: 0, color: "var(--foreground)" }}>
              Discounts & Coupons
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4, fontWeight: 500 }}>
              Create and manage promotional codes for your store
            </p>
          </div>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <Icon d={icons.plus} size={15} />
            Create Discount
          </button>
        </div>
        {error && <div className="error-alert">{error}</div>}

        {/* ── Stats row ── */}
        <div style={{ display: "flex", gap: 14, marginTop: 24, flexWrap: "wrap" }}>
          <div className="stat-card">
            <p className="stat-label">Total Discounts</p>
            <p className="stat-value">{(discounts||[]).length}</p>
            <p className="stat-sub">Across all statuses</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Active Promotions</p>
            <p className="stat-value" style={{ color: "#16a34a" }}>{totalActive}</p>
            <p className="stat-sub">Currently live and usable</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Total Uses</p>
            <p className="stat-value" style={{ color: "var(--brand-red)" }}>{totalUses}</p>
            <p className="stat-sub">Times discounts applied</p>
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div className="toolbar">
          <div className="search-wrap">
            <Icon d={icons.search} size={15} />
            <input
              className="search-input"
              placeholder="Search discount labels…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          <div style={{ position: "relative" }}>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="All">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PAUSED">Paused</option>
              <option value="EXPIRED">Expired</option>
            </select>
            <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-dim)", fontSize: 10 }}>▼</span>
          </div>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
            <Icon d={icons.sort} size={15} />
            <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="table-wrap">
          {loading ? (
             <div className="empty">
              <p className="empty-sub">Loading discounts...</p>
             </div>
          ) : paginated.length === 0 ? (
            <div className="empty">
              <Icon d={icons.tag} size={40} />
              <p className="empty-title">No discounts found</p>
              <p className="empty-sub">Try adjusting your search or create a new discount.</p>
            </div>
          ) : (
            <>
              <table>
                <thead>
                  <tr>
                    <th onClick={() => handleSort("code")}>
                      Label <SortArrow col="code" />
                    </th>
                    <th onClick={() => handleSort("discount")}>
                      Value <SortArrow col="discount" />
                    </th>
                    <th>Status</th>
                    <th onClick={() => handleSort("usageCount")}>
                      Usage <SortArrow col="usageCount" />
                    </th>
                    <th onClick={() => handleSort("expiryDate")}>
                      Expiry Date <SortArrow col="expiryDate" />
                    </th>
                    <th style={{ textAlign: "center", width: "120px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((coupon: Discount) => (
                    <tr key={coupon.id}>
                      <td>
                        <div className="coupon-code">
                          <span style={{
                            display: 'inline-flex', padding: 4, borderRadius: 6,
                            background: 'rgba(255,40,0,0.1)', color: 'var(--brand-red)'
                          }}>
                            {coupon.code ? <Icon d={icons.tag} size={14} /> : <Icon d={icons.package} size={14} />}
                          </span>
                          {coupon.code || "Product Direct"}
                        </div>
                        <div className="coupon-desc">
                          {coupon.code ? "Req. Code: " + coupon.code : "Applies to Specific Product"}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${coupon.type === "PERCENTAGE" ? "discount-percentage" : "discount-fixed"}`}>
                          {coupon.type === "PERCENTAGE" ? `${coupon.discount}%` : `$${coupon.discount}`}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${coupon.status.toLowerCase()}`}>
                          {coupon.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--foreground)", fontSize: 13 }}>
                          {coupon.usageCount}
                          <span style={{ color: "var(--text-muted)", fontWeight: 500, marginLeft: 2 }}>
                            / {coupon.maxUses ? coupon.maxUses : "∞"}
                          </span>
                        </div>
                        {coupon.maxUses && (
                           <div style={{ width: 80, height: 4, background: "var(--border)", borderRadius: 2, marginTop: 6, overflow: "hidden" }}>
                             <div style={{
                               height: "100%",
                               width: `${Math.min(100, (coupon.usageCount / coupon.maxUses) * 100)}%`,
                               background: (coupon.usageCount / coupon.maxUses) >= 1 ? "var(--brand-red)" : "#16a34a"
                             }} />
                           </div>
                        )}
                      </td>
                      <td style={{ color: "var(--text-muted)", fontSize: 13, fontWeight: 500 }}>
                        {new Date(coupon.expiryDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                          <button 
                            className="action-btn edit" 
                            title={coupon.status === "ACTIVE" ? "Pause" : "Activate"}
                            onClick={() => toggleStatus(coupon)}
                          >
                            <Icon d={icons.edit} size={14} />
                          </button>
                          <button 
                            className="action-btn del" 
                            title="Delete"
                            onClick={() => handleDelete(coupon.id, coupon.code || "Direct")}
                          >
                            <Icon d={icons.trash} size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* ── Pagination ── */}
              <div className="pagination">
                <span className="pg-info">
                  Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} discounts
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="pg-btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                    <Icon d={icons.chevronLeft} size={15} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      className={`pg-btn${p === page ? " active" : ""}`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  ))}
                  <button className="pg-btn" disabled={page === totalPages || totalPages === 0} onClick={() => setPage((p) => p + 1)}>
                    <Icon d={icons.chevronRight} size={15} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
