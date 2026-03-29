"use client";

import { useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import { CategoryService } from "@/services/category.service";
import type { Category } from "@/types/product.types";
import { useRouter } from "next/navigation";

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
  edit: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  trash: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 12a3 3 0 100-6 3 3 0 000 6z",
  plus: "M12 5v14M5 12h14",
  chevronLeft: "M15 18l-6-6 6-6",
  chevronRight: "M9 18l6-6-6-6",
  sort: "M3 6h18M7 12h10M11 18h2",
  tag: "M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01",
};

const PAGE_SIZE = 8;

export default function CategoriesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<"name" | "productCount">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const { categories, loading, error, refetch } = useCategories();

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete category "${name}"? This may affect products in this category.`)) {
      try {
        await CategoryService.delete(id);
        refetch();
      } catch (err) {
        alert("Failed to delete category");
      }
    }
  };

  const filtered = categories
    .filter((c: Category) => c.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a: Category, b: Category) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortBy === "name") return dir * a.name.localeCompare(b.name);
      if (sortBy === "productCount") return dir * ((a.productCount || 0) - (b.productCount || 0));
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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .gap-page { font-family: 'Plus Jakarta Sans', sans-serif; padding: 32px; flex: 1; min-height: 100vh;}

        /* ── Stats cards ── */
        .stat-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 20px 24px;
          flex: 1;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .stat-card:hover { border-color: var(--border-strong); box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
        .stat-label { font-size: 12px; font-weight: 600; color: var(--text-dim); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 6px; }
        .stat-value { font-size: 28px; font-weight: 800; letter-spacing: -0.03em; color: var(--foreground); }
        .stat-sub   { font-size: 12px; color: var(--text-muted); margin-top: 2px; }

        /* ── Toolbar ── */
        .toolbar { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin: 28px 0 20px; }

        .search-wrap { position: relative; flex: 1; min-width: 220px; max-width: 400px; }
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

        .btn-add {
          display: flex; align-items: center; gap: 7px;
          padding: 9px 18px; background: var(--brand-red); color: #fff;
          border: none; border-radius: 10px; font-size: 13.5px; font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer;
          white-space: nowrap; transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 14px rgba(255,40,0,0.25); letter-spacing: -0.01em;
        }
        .btn-add:hover { background: var(--brand-red-hover); transform: translateY(-1px); box-shadow: 0 6px 18px rgba(255,40,0,0.32); }

        /* ── Table ── */
        .table-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; }
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

        .cat-name { font-weight: 700; color: var(--foreground); font-size: 14px; letter-spacing: -0.01em; }
        .cat-desc { font-size: 12px; color: var(--text-dim); font-weight: 500; margin-top: 2px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

        /* ── Action buttons ── */
        .action-btn {
          display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border); background: var(--background); color: var(--text-muted); cursor: pointer; transition: all 0.2s;
        }
        .action-btn:hover.edit  { border-color: var(--brand-red); color: var(--brand-red); background: rgba(255,40,0,0.06); }
        .action-btn:hover.del   { border-color: #dc2626; color: #dc2626; background: rgba(220,38,38,0.06); }

        /* ── Pagination ── */
        .pagination { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-top: 1px solid var(--border); flex-wrap: wrap; gap: 12px; }
        .pg-info { font-size: 13px; color: var(--text-muted); font-weight: 500; }
        .pg-btn {
          display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 8px; border: 1px solid var(--border); background: var(--background); color: var(--text-muted); cursor: pointer; transition: all 0.2s; font-size: 13px; font-weight: 600;
        }
        .pg-btn:hover:not(:disabled) { border-color: var(--brand-red); color: var(--brand-red); }
        .pg-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .pg-btn.active { background: var(--brand-red); border-color: var(--brand-red); color: #fff; }

        /* ── Empty state ── */
        .empty { text-align: center; padding: 64px 32px; color: var(--text-muted); }
        .empty-title { font-size: 16px; font-weight: 700; color: var(--foreground); margin-top: 12px; }
        .empty-sub   { font-size: 13.5px; color: var(--text-muted); margin-top: 6px; }
      `}</style>

      <div className="gap-page">
        {/* ── Page header ── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", margin: 0, color: "var(--foreground)" }}>
              Categories
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4, fontWeight: 500 }}>
              Manage your product categories
            </p>
          </div>
          <button className="btn-add" onClick={() => router.push('/admin/categories/add')}>
            <Icon d={icons.plus} size={15} />
            Add Category
          </button>
        </div>

        {/* ── Stats row ── */}
        <div style={{ display: "flex", gap: 14, marginTop: 24, flexWrap: "wrap" }}>
          <div className="stat-card">
            <p className="stat-label">Total Categories</p>
            <p className="stat-value">{categories.length}</p>
            <p className="stat-sub">Active in store</p>
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div className="toolbar">
          <div className="search-wrap">
            <Icon d={icons.search} size={15} />
            <input
              className="search-input"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
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
              <p className="empty-sub">Loading...</p>
             </div>
          ) : paginated.length === 0 ? (
            <div className="empty">
              <Icon d={icons.tag} size={40} />
              <p className="empty-title">No categories found</p>
              <p className="empty-sub">Try adjusting your search or add a new one.</p>
            </div>
          ) : (
            <>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 56 }}>#</th>
                    <th onClick={() => handleSort("name")}>
                      Name <SortArrow col="name" />
                    </th>
                    <th>Description</th>
                    <th onClick={() => handleSort("productCount")} style={{ textAlign: "right", width: "150px" }}>
                      Products <SortArrow col="productCount" />
                    </th>
                    <th style={{ textAlign: "center", width: "120px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((cat: Category, idx: number) => (
                    <tr key={cat.id}>
                      <td style={{ color: "var(--text-dim)", fontWeight: 600, fontSize: 12 }}>
                        {(page - 1) * PAGE_SIZE + idx + 1}
                      </td>
                      <td>
                        <div className="cat-name">{cat.name}</div>
                      </td>
                      <td>
                        <div className="cat-desc">{cat.description || "—"}</div>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <span style={{ fontWeight: 600, color: "var(--foreground)" }}>
                          {cat.productCount || 0}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                          <button 
                            className="action-btn edit" 
                            title="Edit"
                            onClick={() => router.push(`/admin/categories/edit/${cat.id}`)}
                          >
                            <Icon d={icons.edit} size={14} />
                          </button>
                          <button 
                            className="action-btn del" 
                            title="Delete"
                            onClick={() => handleDelete(cat.id, cat.name)}
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
                  Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} categories
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
