"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProducts } from "@/hooks/useProducts";
import { ProductService } from "@/services/product.service";
import type { Product as ApiProduct } from "@/types/product.types";
import {Category as cat} from "@/types/product.types";

import {useCategories} from "@/hooks/useCategories";



const Icon = ({ d, size = 16 }: { d: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.7}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

const icons = {
  search: "M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z",
  filter: "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
  edit: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  trash: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 12a3 3 0 100-6 3 3 0 000 6z",
  plus: "M12 5v14M5 12h14",
  chevronLeft: "M15 18l-6-6 6-6",
  chevronRight: "M9 18l6-6-6-6",
  sort: "M3 6h18M7 12h10M11 18h2",
  package: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  tag: "M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01",
};

function getStatus(stock: number): "available" | "out_of_stock" {
  return stock > 0 ? "available" : "out_of_stock";
}


const STATUS_CONFIG: Record<"available" | "out_of_stock", { label: string; color: string; bg: string }> = {
  available:    { label: "Available",    color: "#16a34a", bg: "rgba(22,163,74,0.10)"  },
  out_of_stock: { label: "Out of Stock", color: "#dc2626", bg: "rgba(220,38,38,0.10)"  },
};

const PAGE_SIZE = 8;

export default function GetAllProductsPage() {
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatus] = useState("All");
  const { categories}=useCategories();
  const [category, setCategory] = useState("All");
  const [page, setPage]           = useState(1);
  const [sortBy, setSortBy]       = useState<"name" | "price" | "stock" | "createdAt">("createdAt");
  const [sortDir, setSortDir]     = useState<"asc" | "desc">("desc");
  const router = useRouter();

  const { products, loading, error, refetch } = useProducts();

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await ProductService.delete(id);
        refetch();
      } catch (err: any) {
        alert(err?.message || "Failed to delete product");
      }
    }
  };

  const filtered = products
    .filter((p: ApiProduct) => {
      const catName       = p.category?.name ?? "";
      const status        = getStatus(p.stock);
      const matchSearch   = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === "All" || catName === category;
      const matchStatus   = statusFilter === "All" || status === statusFilter;
      return matchSearch && matchCategory && matchStatus;
    })
    .sort((a: ApiProduct, b: ApiProduct) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortBy === "name")      return dir * a.name.localeCompare(b.name);
      if (sortBy === "price")     return dir * (a.price - b.price);
      if (sortBy === "stock")     return dir * (a.stock - b.stock);
      if (sortBy === "createdAt") return dir * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      return 0;
    });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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

  const totalAvailable = products.filter((p: ApiProduct) => p.stock > 0).length;
  const totalOOS       = products.filter((p: ApiProduct) => p.stock === 0).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .gap-page { font-family: 'Plus Jakarta Sans', sans-serif; padding: 32px; flex: 1; }

        /* ── Stats cards ── */
        .stat-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 20px 24px;
          flex: 1;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .stat-card:hover {
          border-color: var(--border-strong);
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
        }
        .stat-label { font-size: 12px; font-weight: 600; color: var(--text-dim); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 6px; }
        .stat-value { font-size: 28px; font-weight: 800; letter-spacing: -0.03em; color: var(--foreground); }
        .stat-sub   { font-size: 12px; color: var(--text-muted); margin-top: 2px; }

        /* ── Toolbar ── */
        .toolbar { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin: 28px 0 20px; }

        .search-wrap {
          position: relative; flex: 1; min-width: 220px;
        }
        .search-wrap svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-dim); pointer-events: none; }
        .search-input {
          width: 100%; padding: 9px 14px 9px 38px;
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 10px; font-size: 13.5px; color: var(--foreground);
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
        }
        .search-input::placeholder { color: var(--text-dim); }
        .search-input:focus { border-color: var(--brand-red); box-shadow: 0 0 0 3px rgba(255,40,0,0.08); }

        .filter-select {
          padding: 9px 32px 9px 14px;
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 10px; font-size: 13px; color: var(--foreground);
          font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 500;
          appearance: none; cursor: pointer; outline: none;
          transition: border-color 0.2s;
        }
        .filter-select:focus { border-color: var(--brand-red); }

        .btn-add {
          display: flex; align-items: center; gap: 7px;
          padding: 9px 18px; background: var(--brand-red); color: #fff;
          border: none; border-radius: 10px; font-size: 13.5px; font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer;
          white-space: nowrap; transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 14px rgba(255,40,0,0.25);
          letter-spacing: -0.01em;
        }
        .btn-add:hover { background: var(--brand-red-hover); transform: translateY(-1px); box-shadow: 0 6px 18px rgba(255,40,0,0.32); }

        /* ── Table ── */
        .table-wrap {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
        }
        table { width: 100%; border-collapse: collapse; }
        thead { background: var(--background); border-bottom: 1px solid var(--border); }
        th {
          padding: 12px 16px; text-align: left;
          font-size: 11.5px; font-weight: 700; letter-spacing: 0.06em;
          text-transform: uppercase; color: var(--text-dim);
          white-space: nowrap; cursor: pointer; user-select: none;
        }
        th:hover { color: var(--foreground); }
        td { padding: 14px 16px; font-size: 13.5px; border-bottom: 1px solid var(--border); vertical-align: middle; }
        tr:last-child td { border-bottom: none; }
        tbody tr { transition: background 0.15s; }
        tbody tr:hover { background: var(--surface-hover); }

        /* ── Product cell ── */
        .product-img {
          width: 44px; height: 44px; border-radius: 10px; object-fit: cover;
          border: 1px solid var(--border); flex-shrink: 0;
        }
        .product-name { font-weight: 700; color: var(--foreground); font-size: 13.5px; letter-spacing: -0.01em; }
        .product-sku  { font-size: 11.5px; color: var(--text-dim); font-weight: 500; margin-top: 2px; }

        /* ── Status badge ── */
        .badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 10px; border-radius: 999px;
          font-size: 11.5px; font-weight: 700; letter-spacing: 0.02em;
          white-space: nowrap;
        }
        .badge-dot { width: 6px; height: 6px; border-radius: 50%; }

        /* ── Price ── */
        .price { font-weight: 700; color: var(--foreground); font-size: 14px; letter-spacing: -0.02em; }

        /* ── Stock ── */
        .stock-low  { color: #dc2626; font-weight: 700; }
        .stock-ok   { color: var(--foreground); font-weight: 600; }

        /* ── Action buttons ── */
        .action-btn {
          display: inline-flex; align-items: center; justify-content: center;
          width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border);
          background: var(--background); color: var(--text-muted);
          cursor: pointer; transition: all 0.2s;
        }
        .action-btn:hover.edit  { border-color: var(--brand-red); color: var(--brand-red); background: rgba(255,40,0,0.06); }
        .action-btn:hover.view  { border-color: #2563eb; color: #2563eb; background: rgba(37,99,235,0.06); }
        .action-btn:hover.del   { border-color: #dc2626; color: #dc2626; background: rgba(220,38,38,0.06); }

        /* ── Pagination ── */
        .pagination { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-top: 1px solid var(--border); flex-wrap: wrap; gap: 12px; }
        .pg-info { font-size: 13px; color: var(--text-muted); font-weight: 500; }

        .pg-btn {
          display: inline-flex; align-items: center; justify-content: center;
          width: 34px; height: 34px; border-radius: 8px; border: 1px solid var(--border);
          background: var(--background); color: var(--text-muted);
          cursor: pointer; transition: all 0.2s; font-size: 13px; font-weight: 600;
        }
        .pg-btn:hover:not(:disabled) { border-color: var(--brand-red); color: var(--brand-red); }
        .pg-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .pg-btn.active { background: var(--brand-red); border-color: var(--brand-red); color: #fff; }

        /* ── Empty state ── */
        .empty { text-align: center; padding: 64px 32px; color: var(--text-muted); }
        .empty-title { font-size: 16px; font-weight: 700; color: var(--foreground); margin-top: 12px; }
        .empty-sub   { font-size: 13.5px; color: var(--text-muted); margin-top: 6px; }

        /* ── Category pills ── */
        .category-pills { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 20px; }
        .cat-pill {
          padding: 5px 14px; border-radius: 999px; font-size: 12.5px; font-weight: 600;
          border: 1px solid var(--border); background: var(--surface);
          color: var(--text-muted); cursor: pointer; transition: all 0.2s;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .cat-pill:hover  { border-color: var(--border-strong); color: var(--foreground); }
        .cat-pill.active { background: var(--brand-red); border-color: var(--brand-red); color: #fff; box-shadow: 0 3px 10px rgba(255,40,0,0.22); }
      `}</style>

      <div className="gap-page">

        {/* ── Page header ── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", margin: 0, color: "var(--foreground)" }}>
              All Products
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4, fontWeight: 500 }}>
              Manage your product catalog — {products.length} total products
            </p>
          </div>
          <button className="btn-add" onClick={() => router.push("/admin/products/add")}>
            <Icon d={icons.plus} size={15} />
            Add Product
          </button>
        </div>

        {/* ── Stats row ── */}
        <div style={{ display: "flex", gap: 14, marginTop: 24, flexWrap: "wrap" }}>
          <div className="stat-card">
            <p className="stat-label">Total Products</p>
            <p className="stat-value">{products.length}</p>
            <p className="stat-sub">Across all categories</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Available</p>
            <p className="stat-value" style={{ color: "#16a34a" }}>{totalAvailable}</p>
            <p className="stat-sub">In stock</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Out of Stock</p>
            <p className="stat-value" style={{ color: "var(--brand-red)" }}>{totalOOS}</p>
            <p className="stat-sub">Needs restocking</p>
          </div>
        </div>

        <div className="category-pills" style={{ marginTop: 28 }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`cat-pill${category === cat.name ? " active" : ""}`}
              onClick={() => { setCategory(cat.name); setPage(1); }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div className="toolbar">
          <div className="search-wrap">
            <Icon d={icons.search} size={15} />
            <input
              className="search-input"
              placeholder="Search by name or SKU…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          <div style={{ position: "relative" }}>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            >
              <option value="All">All Status</option>
              <option value="available">Available</option>
              <option value="out_of_stock">Out of Stock</option>
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
          {paginated.length === 0 ? (
            <div className="empty">
              <Icon d={icons.package} size={40} />
              <p className="empty-title">No products found</p>
              <p className="empty-sub">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 56 }}>#</th>
                    <th onClick={() => handleSort("name")}>
                      Product <SortArrow col="name" />
                    </th>
                    <th>Category</th>
                    <th>Status</th>
                    <th onClick={() => handleSort("price")} style={{ textAlign: "right" }}>
                      Price <SortArrow col="price" />
                    </th>
                    <th onClick={() => handleSort("stock")} style={{ textAlign: "right" }}>
                      Stock <SortArrow col="stock" />
                    </th>
                    <th onClick={() => handleSort("createdAt")}>
                      Added <SortArrow col="createdAt" />
                    </th>
                    <th style={{ textAlign: "center" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((product: ApiProduct, idx: number) => {
                    const status    = getStatus(product.stock);
                    const statusCfg = STATUS_CONFIG[status];
                    const isLowStock = product.stock > 0 && product.stock <= 5;
                    return (
                      <tr key={product.id}>
                        {/* Index */}
                        <td style={{ color: "var(--text-dim)", fontWeight: 600, fontSize: 12 }}>
                          {(page - 1) * PAGE_SIZE + idx + 1}
                        </td>

                        {/* Product */}
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            {product.imageUrl ? (
                              <img className="product-img" src={product.imageUrl} alt={product.name} />
                            ) : (
                              <div className="product-img" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-dim)", background: "var(--surface-hover)" }}>
                                <Icon d={icons.package} size={18} />
                              </div>
                            )}
                            <div>
                              <div className="product-name">{product.name}</div>
                              <div className="product-sku">{product.sku}</div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "var(--text-muted)", fontWeight: 600 }}>
                            <Icon d={icons.tag} size={12} />
                            {product.category?.name ?? "—"}
                          </span>
                        </td>

                        {/* Status */}
                        <td>
                          <span
                            className="badge"
                            style={{ color: statusCfg.color, background: statusCfg.bg }}
                          >
                            <span className="badge-dot" style={{ background: statusCfg.color }} />
                            {statusCfg.label}
                          </span>
                        </td>

                        {/* Price */}
                        <td style={{ textAlign: "right" }}>
                          <span className="price">${product.price.toFixed(2)}</span>
                        </td>

                        {/* Stock */}
                        <td style={{ textAlign: "right" }}>
                          <span className={product.stock === 0 ? "stock-low" : isLowStock ? "stock-low" : "stock-ok"}>
                            {product.stock === 0 ? "—" : product.stock}
                            {isLowStock && product.stock > 0 && (
                              <span style={{ fontSize: 11, marginLeft: 4, opacity: 0.7 }}>low</span>
                            )}
                          </span>
                        </td>

                        {/* Date */}
                        <td style={{ color: "var(--text-muted)", fontSize: 13, fontWeight: 500 }}>
                          {new Date(product.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>

                        {/* Actions */}
                        <td>
                          <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                            <button 
                              className="action-btn view" 
                              title="View"
                              onClick={() => window.open(`/product-page?id=${product.id}`, "_blank")}
                            >
                              <Icon d={icons.eye} size={14} />
                            </button>
                            <button 
                              className="action-btn edit" 
                              title="Edit"
                              onClick={() => router.push(`/admin/products/edit/${product.id}`)}
                            >
                              <Icon d={icons.edit} size={14} />
                            </button>
                            <button 
                              className="action-btn del" 
                              title="Delete"
                              onClick={() => handleDelete(product.id, product.name)}
                            >
                              <Icon d={icons.trash} size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* ── Pagination ── */}
              <div className="pagination">
                <span className="pg-info">
                  Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} products
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
                  <button className="pg-btn" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
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
