"use client";

import { useState } from "react";
import { useUsers } from "@/hooks/useUsers";
import { UserService } from "@/services/user.service";
import type { User } from "@/types/auth.types";
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
  users: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2m22-4a4 4 0 100-8 4 4 0 000 8zm-8 0a4 4 0 100-8 4 4 0 000 8z",
};

const PAGE_SIZE = 8;

export default function CustomersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<"name" | "email" | "createdAt">("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const { users, loading, error, refetch } = useUsers();

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete user "${name}"?`)) {
      try {
        await UserService.delete(id);
        refetch();
      } catch (err) {
        alert("Failed to delete user");
      }
    }
  };

  const toggleRole = async (user: User) => {
    const newRole = user.role === 'ADMIN' ? 'CUSTOMER' : 'ADMIN';
    if (window.confirm(`Change ${user.name}'s role to ${newRole}?`)) {
      try {
        await UserService.update(user.id, { role: newRole });
        refetch();
      } catch (err) {
        alert("Failed to update user role");
      }
    }
  };

  const filtered = users
    .filter((u: User) => {
      const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === "All" || u.role === roleFilter;
      return matchSearch && matchRole;
    })
    .sort((a: User, b: User) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortBy === "name") return dir * a.name.localeCompare(b.name);
      if (sortBy === "email") return dir * a.email.localeCompare(b.email);
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

  const totalCustomers = users.filter((u) => u.role === "CUSTOMER").length;
  const totalAdmins = users.filter((u) => u.role === "ADMIN").length;

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
          padding: 9px 32px 9px 14px;
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 10px; font-size: 13px; color: var(--foreground);
          font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 500;
          appearance: none; cursor: pointer; outline: none; transition: border-color 0.2s;
        }
        .filter-select:focus { border-color: var(--brand-red); }

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

        /* ── Roles Badge ── */
        .badge {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 4px 10px; border-radius: 999px; font-size: 11.5px; font-weight: 700;
          letter-spacing: 0.02em; white-space: nowrap;
        }

        .user-name { font-weight: 700; color: var(--foreground); font-size: 14px; letter-spacing: -0.01em; }
        .user-email { font-size: 12px; color: var(--text-dim); font-weight: 500; margin-top: 2px; }
        .user-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--brand-red); color: #fff; font-weight: 700; display: flex; align-items: center; justify-content: center; font-size: 14px; }

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
              Customers
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4, fontWeight: 500 }}>
              Manage your registered users and administrators
            </p>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div style={{ display: "flex", gap: 14, marginTop: 24, flexWrap: "wrap" }}>
          <div className="stat-card">
            <p className="stat-label">Total Users</p>
            <p className="stat-value">{users.length}</p>
            <p className="stat-sub">Registered accounts</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Customers</p>
            <p className="stat-value" style={{ color: "var(--foreground)" }}>{totalCustomers}</p>
            <p className="stat-sub">Store buyers</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Administrators</p>
            <p className="stat-value" style={{ color: "var(--brand-red)" }}>{totalAdmins}</p>
            <p className="stat-sub">Store managers</p>
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div className="toolbar">
          <div className="search-wrap">
            <Icon d={icons.search} size={15} />
            <input
              className="search-input"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          <div style={{ position: "relative" }}>
            <select
              className="filter-select"
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            >
              <option value="All">All Roles</option>
              <option value="CUSTOMER">Customers</option>
              <option value="ADMIN">Administrators</option>
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
              <p className="empty-sub">Loading...</p>
             </div>
          ) : paginated.length === 0 ? (
            <div className="empty">
              <Icon d={icons.users} size={40} />
              <p className="empty-title">No users found</p>
              <p className="empty-sub">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 56 }}>#</th>
                    <th onClick={() => handleSort("name")}>
                      Customer <SortArrow col="name" />
                    </th>
                    <th>Role</th>
                    <th onClick={() => handleSort("createdAt")}>
                      Joined Date <SortArrow col="createdAt" />
                    </th>
                    <th style={{ textAlign: "center", width: "120px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((user: User, idx: number) => (
                    <tr key={user.id}>
                      <td style={{ color: "var(--text-dim)", fontWeight: 600, fontSize: 12 }}>
                        {(page - 1) * PAGE_SIZE + idx + 1}
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div className="user-avatar">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="user-name">{user.name}</div>
                            <div className="user-email">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge" style={{
                           background: user.role === 'ADMIN' ? 'rgba(255,40,0,0.1)' : 'var(--surface-hover)',
                           color: user.role === 'ADMIN' ? 'var(--brand-red)' : 'var(--text-muted)'
                        }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={{ color: "var(--text-muted)", fontSize: 13, fontWeight: 500 }}>
                        {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                          <button 
                            className="action-btn edit" 
                            title="Toggle Role"
                            onClick={() => toggleRole(user)}
                          >
                            <Icon d={icons.edit} size={14} />
                          </button>
                          <button 
                            className="action-btn del" 
                            title="Delete"
                            onClick={() => handleDelete(user.id, user.name)}
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
                  Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} users
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
