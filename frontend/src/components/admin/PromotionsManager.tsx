"use client";

import { useEffect, useMemo, useState } from "react";
import { CategoryService } from "@/services/category.service";
import { ProductService } from "@/services/product.service";
import { PromotionService } from "@/services/promotion.service";
import type { Category, Product } from "@/types/product.types";
import type {
  CategoryDiscountRecord,
  CouponRecord,
  FlashSaleRecord,
  ProductDiscountRecord,
  PromotionDiscountType,
  PromotionLifecycleStatus,
} from "@/types/promotion.types";

type PromotionMode = "product" | "category" | "flash" | "coupon";
type PromotionRecord = ProductDiscountRecord | CategoryDiscountRecord | FlashSaleRecord | CouponRecord;

const Icon = ({ d, size = 16 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const icons = {
  plus: "M12 5v14M5 12h14",
  edit: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  trash: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  close: "M6 18L18 6M6 6l12 12",
  flash: "M13 2L4 14h6l-1 8 9-12h-6l1-8z",
};

const currencyValue = (value: number) =>
  `TND ${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}`;

const formatDiscountValue = (type: PromotionDiscountType, value: number) =>
  type === "PERCENTAGE" ? `${value}%` : currencyValue(value);

const formatDateTimeLocal = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

const formatSchedule = (startDate?: string | null, endDate?: string | null) => {
  if (!startDate && !endDate) return "Always on";

  const parts = [];
  if (startDate) parts.push(`From ${new Date(startDate).toLocaleString()}`);
  if (endDate) parts.push(`Until ${new Date(endDate).toLocaleString()}`);
  return parts.join(" • ");
};

const statusTone = (status: PromotionLifecycleStatus) => {
  switch (status) {
    case "ACTIVE":
      return { background: "rgba(34,197,94,0.12)", color: "#15803d" };
    case "SCHEDULED":
      return { background: "rgba(59,130,246,0.12)", color: "#2563eb" };
    case "EXPIRED":
      return { background: "rgba(107,114,128,0.12)", color: "#4b5563" };
    default:
      return { background: "rgba(239,68,68,0.12)", color: "#dc2626" };
  }
};

const getEmptyForm = (mode: PromotionMode) => ({
  targetId: "",
  productIds: [] as string[],
  name: mode === "flash" ? "Weekend Power Drop" : "",
  code: "",
  discountType: "PERCENTAGE" as PromotionDiscountType,
  discountValue: "",
  startDate: "",
  endDate: "",
  isActive: true,
  usageLimit: "",
});

export default function PromotionsManager({
  mode,
  title,
  description,
}: {
  mode: PromotionMode;
  title: string;
  description: string;
}) {
  const [records, setRecords] = useState<PromotionRecord[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PromotionLifecycleStatus | "ALL">("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(getEmptyForm(mode));

  const needsProducts = mode === "product" || mode === "flash";
  const needsCategories = mode === "category";

  const loadRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const data =
        mode === "product"
          ? await PromotionService.getProductDiscounts()
          : mode === "category"
            ? await PromotionService.getCategoryDiscounts()
            : mode === "flash"
              ? await PromotionService.getFlashSales()
              : await PromotionService.getCoupons();
      setRecords(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load promotions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRecords();
  }, [mode]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        if (needsProducts) {
          const res = await ProductService.getAll({ limit: 200 });
          setProducts(res.data);
        }

        if (needsCategories) {
          const res = await CategoryService.getAll();
          setCategories(res.data);
        }
      } catch (err) {
        console.error("Failed to load promotion options", err);
      }
    };

    void loadOptions();
  }, [needsCategories, needsProducts]);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesStatus = statusFilter === "ALL" || record.lifecycleStatus === statusFilter;
      const searchable =
        mode === "product"
          ? `${(record as ProductDiscountRecord).product.name} ${(record as ProductDiscountRecord).product.sku}`
          : mode === "category"
            ? `${(record as CategoryDiscountRecord).category.name}`
            : mode === "flash"
              ? `${(record as FlashSaleRecord).name}`
              : `${(record as CouponRecord).code}`;
      return matchesStatus && searchable.toLowerCase().includes(search.toLowerCase());
    });
  }, [mode, records, search, statusFilter]);

  const stats = useMemo(() => ({
    total: records.length,
    active: records.filter((record) => record.lifecycleStatus === "ACTIVE").length,
    scheduled: records.filter((record) => record.lifecycleStatus === "SCHEDULED").length,
  }), [records]);

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(getEmptyForm(mode));
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm(getEmptyForm(mode));
    setIsModalOpen(true);
  };

  const openEditModal = (record: PromotionRecord) => {
    setEditingId(record.id);

    if (mode === "product") {
      const item = record as ProductDiscountRecord;
      setForm({
        ...getEmptyForm(mode),
        targetId: item.productId,
        discountType: item.discountType,
        discountValue: String(item.discountValue),
        startDate: formatDateTimeLocal(item.startDate),
        endDate: formatDateTimeLocal(item.endDate),
        isActive: item.isActive,
      });
    } else if (mode === "category") {
      const item = record as CategoryDiscountRecord;
      setForm({
        ...getEmptyForm(mode),
        targetId: item.categoryId,
        discountType: item.discountType,
        discountValue: String(item.discountValue),
        startDate: formatDateTimeLocal(item.startDate),
        endDate: formatDateTimeLocal(item.endDate),
        isActive: item.isActive,
      });
    } else if (mode === "flash") {
      const item = record as FlashSaleRecord;
      setForm({
        ...getEmptyForm(mode),
        name: item.name,
        productIds: item.products.map((entry) => entry.productId),
        discountType: item.discountType,
        discountValue: String(item.discountValue),
        startDate: formatDateTimeLocal(item.startDate),
        endDate: formatDateTimeLocal(item.endDate),
        isActive: item.isActive,
      });
    } else {
      const item = record as CouponRecord;
      setForm({
        ...getEmptyForm(mode),
        code: item.code,
        discountType: item.discountType,
        discountValue: String(item.discountValue),
        startDate: formatDateTimeLocal(item.startDate),
        endDate: formatDateTimeLocal(item.endDate),
        isActive: item.isActive,
        usageLimit: item.usageLimit ? String(item.usageLimit) : "",
      });
    }

    setIsModalOpen(true);
  };

  const saveRecord = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payloadBase = {
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        isActive: form.isActive,
      };

      if (!Number.isFinite(payloadBase.discountValue) || payloadBase.discountValue <= 0) {
        throw new Error("Discount value must be greater than 0");
      }

      if (mode === "product") {
        const payload = { ...payloadBase, productId: form.targetId };
        editingId
          ? await PromotionService.updateProductDiscount(editingId, payload)
          : await PromotionService.createProductDiscount(payload);
      } else if (mode === "category") {
        const payload = { ...payloadBase, categoryId: form.targetId };
        editingId
          ? await PromotionService.updateCategoryDiscount(editingId, payload)
          : await PromotionService.createCategoryDiscount(payload);
      } else if (mode === "flash") {
        const payload = {
          ...payloadBase,
          name: form.name.trim(),
          productIds: form.productIds,
        };
        editingId
          ? await PromotionService.updateFlashSale(editingId, payload)
          : await PromotionService.createFlashSale(payload);
      } else {
        const payload = {
          ...payloadBase,
          code: form.code.trim().toUpperCase(),
          usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        };
        editingId
          ? await PromotionService.updateCoupon(editingId, payload)
          : await PromotionService.createCoupon(payload);
      }

      closeModal();
      await loadRecords();
    } catch (err: any) {
      setError(err?.message || "Failed to save promotion");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (record: PromotionRecord) => {
    const label =
      mode === "product"
        ? (record as ProductDiscountRecord).product.name
        : mode === "category"
          ? (record as CategoryDiscountRecord).category.name
          : mode === "flash"
            ? (record as FlashSaleRecord).name
            : (record as CouponRecord).code;

    if (!window.confirm(`Delete "${label}"?`)) return;

    try {
      if (mode === "product") {
        await PromotionService.deleteProductDiscount(record.id);
      } else if (mode === "category") {
        await PromotionService.deleteCategoryDiscount(record.id);
      } else if (mode === "flash") {
        await PromotionService.deleteFlashSale(record.id);
      } else {
        await PromotionService.deleteCoupon(record.id);
      }
      await loadRecords();
    } catch (err: any) {
      setError(err?.message || "Failed to delete promotion");
    }
  };

  const toggleStatus = async (record: PromotionRecord) => {
    try {
      if (mode === "product") {
        await PromotionService.updateProductDiscount(record.id, { isActive: !(record as ProductDiscountRecord).isActive });
      } else if (mode === "category") {
        await PromotionService.updateCategoryDiscount(record.id, { isActive: !(record as CategoryDiscountRecord).isActive });
      } else if (mode === "flash") {
        await PromotionService.updateFlashSale(record.id, { isActive: !(record as FlashSaleRecord).isActive });
      } else {
        await PromotionService.updateCoupon(record.id, { isActive: !(record as CouponRecord).isActive });
      }
      await loadRecords();
    } catch (err: any) {
      setError(err?.message || "Failed to update status");
    }
  };

  const modalTitle =
    editingId
      ? `Edit ${mode === "product" ? "Product Discount" : mode === "category" ? "Category Discount" : mode === "flash" ? "Flash Sale" : "Coupon"}`
      : `Create ${mode === "product" ? "Product Discount" : mode === "category" ? "Category Discount" : mode === "flash" ? "Flash Sale" : "Coupon"}`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .promotions-page { font-family: 'Plus Jakarta Sans', sans-serif; padding: 32px; flex: 1; min-height: 100vh; }
        .promotions-card { background: var(--surface); border: 1px solid var(--border); border-radius: 18px; }
        .promotions-input, .promotions-select {
          width: 100%;
          padding: 11px 14px;
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 12px;
          font-size: 14px;
          color: var(--foreground);
          font-family: 'Plus Jakarta Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .promotions-input:focus, .promotions-select:focus {
          border-color: var(--brand-red);
          box-shadow: 0 0 0 3px rgba(255,40,0,0.08);
        }
        .promotions-label {
          display: block;
          margin-bottom: 8px;
          font-size: 12px;
          font-weight: 700;
          color: var(--text-dim);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .promotions-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--brand-red);
          color: #fff;
          border: none;
          border-radius: 12px;
          padding: 11px 18px;
          font-size: 13.5px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 8px 20px rgba(255,40,0,0.18);
        }
        .promotions-btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--background);
          color: var(--foreground);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }
        .promotions-table { width: 100%; border-collapse: collapse; }
        .promotions-table th {
          text-align: left;
          padding: 14px 16px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-dim);
          border-bottom: 1px solid var(--border);
        }
        .promotions-table td {
          padding: 16px;
          border-bottom: 1px solid var(--border);
          font-size: 13.5px;
          color: var(--foreground);
          vertical-align: top;
        }
        .promotions-table tr:last-child td { border-bottom: none; }
        .promotions-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.38);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 24px;
        }
        .promotions-modal {
          width: 100%;
          max-width: 720px;
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 22px;
          box-shadow: 0 30px 80px rgba(15, 23, 42, 0.22);
          overflow: hidden;
        }
      `}</style>

      {isModalOpen && (
        <div className="promotions-modal-backdrop" onClick={closeModal}>
          <div className="promotions-modal" onClick={(event) => event.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "22px 24px", borderBottom: "1px solid var(--border)" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em" }}>{modalTitle}</h2>
                <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--text-muted)" }}>Configure discount value, schedule, and visibility.</p>
              </div>
              <button className="promotions-btn-secondary" type="button" onClick={closeModal}>
                <Icon d={icons.close} size={16} />
              </button>
            </div>

            <form onSubmit={saveRecord}>
              <div style={{ padding: 24, display: "grid", gap: 18 }}>
                {mode === "product" && (
                  <div>
                    <label className="promotions-label">Product</label>
                    <select className="promotions-select" value={form.targetId} onChange={(event) => setForm((current) => ({ ...current, targetId: event.target.value }))} required>
                      <option value="">Select a product</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({product.sku})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {mode === "category" && (
                  <div>
                    <label className="promotions-label">Category</label>
                    <select className="promotions-select" value={form.targetId} onChange={(event) => setForm((current) => ({ ...current, targetId: event.target.value }))} required>
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {mode === "flash" && (
                  <>
                    <div>
                      <label className="promotions-label">Flash Sale Name</label>
                      <input className="promotions-input" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Weekend Power Drop" required />
                    </div>
                    <div>
                      <label className="promotions-label">Products</label>
                      <div className="promotions-card" style={{ padding: 14, maxHeight: 220, overflowY: "auto", display: "grid", gap: 10 }}>
                        {products.map((product) => {
                          const checked = form.productIds.includes(product.id);
                          return (
                            <label key={product.id} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() =>
                                  setForm((current) => ({
                                    ...current,
                                    productIds: checked
                                      ? current.productIds.filter((id) => id !== product.id)
                                      : [...current.productIds, product.id],
                                  }))
                                }
                              />
                              <span style={{ fontSize: 13.5 }}>{product.name} ({product.sku})</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                {mode === "coupon" && (
                  <div>
                    <label className="promotions-label">Coupon Code</label>
                    <input className="promotions-input" value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))} placeholder="SPRING20" required />
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label className="promotions-label">Discount Type</label>
                    <select className="promotions-select" value={form.discountType} onChange={(event) => setForm((current) => ({ ...current, discountType: event.target.value as PromotionDiscountType }))}>
                      <option value="PERCENTAGE">Percentage</option>
                      <option value="FIXED">Fixed Amount</option>
                    </select>
                  </div>
                  <div>
                    <label className="promotions-label">Discount Value</label>
                    <input className="promotions-input" type="number" min="0.01" step="0.01" value={form.discountValue} onChange={(event) => setForm((current) => ({ ...current, discountValue: event.target.value }))} required />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label className="promotions-label">Start Date</label>
                    <input className="promotions-input" type="datetime-local" value={form.startDate} onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))} />
                  </div>
                  <div>
                    <label className="promotions-label">End Date</label>
                    <input className="promotions-input" type="datetime-local" value={form.endDate} onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))} />
                  </div>
                </div>

                {mode === "coupon" && (
                  <div>
                    <label className="promotions-label">Usage Limit</label>
                    <input className="promotions-input" type="number" min="1" value={form.usageLimit} onChange={(event) => setForm((current) => ({ ...current, usageLimit: event.target.value }))} placeholder="Leave blank for unlimited" />
                  </div>
                )}

                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <input type="checkbox" checked={form.isActive} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>Active promotion</span>
                </label>
              </div>

              <div style={{ padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", background: "var(--surface)" }}>
                <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
                  {error ? <span style={{ color: "#dc2626", fontWeight: 700 }}>{error}</span> : "Only one promotion applies at a time based on the priority rules."}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button type="button" className="promotions-btn-secondary" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="promotions-btn-primary" disabled={saving}>
                    <Icon d={icons.plus} size={15} />
                    {saving ? "Saving..." : editingId ? "Update Promotion" : "Create Promotion"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="promotions-page">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 30, fontWeight: 900, letterSpacing: "-0.04em" }}>{title}</h1>
            <p style={{ margin: "8px 0 0", fontSize: 14, color: "var(--text-muted)", maxWidth: 760 }}>{description}</p>
          </div>
          <button className="promotions-btn-primary" onClick={openCreateModal}>
            <Icon d={mode === "flash" ? icons.flash : icons.plus} size={16} />
            {mode === "flash" ? "Create Flash Sale" : "New Promotion"}
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16, marginTop: 26 }}>
          {[
            { label: "Total", value: stats.total, tone: "var(--foreground)" },
            { label: "Active", value: stats.active, tone: "#15803d" },
            { label: "Scheduled", value: stats.scheduled, tone: "#2563eb" },
          ].map((stat) => (
            <div key={stat.label} className="promotions-card" style={{ padding: 22 }}>
              <div style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>{stat.label}</div>
              <div style={{ marginTop: 10, fontSize: 30, fontWeight: 900, color: stat.tone }}>{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="promotions-card" style={{ marginTop: 22, padding: 18 }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
            <input className="promotions-input" style={{ flex: "1 1 260px" }} placeholder="Search promotions..." value={search} onChange={(event) => setSearch(event.target.value)} />
            <select className="promotions-select" style={{ width: 180 }} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as PromotionLifecycleStatus | "ALL")}>
              <option value="ALL">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="INACTIVE">Inactive</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>

          {error && !isModalOpen && (
            <div style={{ marginBottom: 14, padding: "12px 14px", borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)", color: "#dc2626", fontWeight: 700 }}>
              {error}
            </div>
          )}

          {loading ? (
            <div style={{ padding: 42, textAlign: "center", color: "var(--text-muted)" }}>Loading promotions...</div>
          ) : filteredRecords.length === 0 ? (
            <div style={{ padding: 42, textAlign: "center", color: "var(--text-muted)" }}>No promotions match your filters yet.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="promotions-table">
                <thead>
                  <tr>
                    <th>{mode === "product" ? "Product" : mode === "category" ? "Category" : mode === "flash" ? "Flash Sale" : "Coupon"}</th>
                    <th>Discount</th>
                    <th>Schedule</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => {
                    const tone = statusTone(record.lifecycleStatus);
                    return (
                      <tr key={record.id}>
                        <td>
                          {mode === "product" && <div><div style={{ fontWeight: 800 }}>{(record as ProductDiscountRecord).product.name}</div><div style={{ marginTop: 4, color: "var(--text-muted)", fontSize: 12 }}>{(record as ProductDiscountRecord).product.sku}</div></div>}
                          {mode === "category" && <div><div style={{ fontWeight: 800 }}>{(record as CategoryDiscountRecord).category.name}</div><div style={{ marginTop: 4, color: "var(--text-muted)", fontSize: 12 }}>Applies to all products in this category</div></div>}
                          {mode === "flash" && <div><div style={{ fontWeight: 800 }}>{(record as FlashSaleRecord).name}</div><div style={{ marginTop: 4, color: "var(--text-muted)", fontSize: 12 }}>{(record as FlashSaleRecord).products.length} products selected</div></div>}
                          {mode === "coupon" && <div><div style={{ fontWeight: 800 }}>{(record as CouponRecord).code}</div><div style={{ marginTop: 4, color: "var(--text-muted)", fontSize: 12 }}>Usage {(record as CouponRecord).usageCount}/{(record as CouponRecord).usageLimit ?? "∞"}</div></div>}
                        </td>
                        <td style={{ fontWeight: 800 }}>{formatDiscountValue(record.discountType, record.discountValue)}</td>
                        <td style={{ color: "var(--text-muted)", maxWidth: 280 }}>{formatSchedule(record.startDate, record.endDate)}</td>
                        <td><span style={{ display: "inline-flex", padding: "6px 10px", borderRadius: 999, fontSize: 11.5, fontWeight: 800, ...tone }}>{record.lifecycleStatus}</span></td>
                        <td>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button className="promotions-btn-secondary" type="button" onClick={() => toggleStatus(record)}>
                              {("isActive" in record && record.isActive) ? "Deactivate" : "Activate"}
                            </button>
                            <button className="promotions-btn-secondary" type="button" onClick={() => openEditModal(record)}>
                              <Icon d={icons.edit} size={14} />
                            </button>
                            <button className="promotions-btn-secondary" type="button" onClick={() => handleDelete(record)}>
                              <Icon d={icons.trash} size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
