"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CategoryService } from "@/services/category.service";
import { Category } from "@/types/product.types";

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
  chevronLeft: "M15 18l-6-6 6-6",
  save: "M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z M17 21v-8H7v8 M7 3v5h8V3"
};

interface CategoryFormProps {
  initialData?: Category;
  isEdit?: boolean;
}

export default function CategoryForm({ initialData, isEdit = false }: CategoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit && initialData) {
        await CategoryService.update(initialData.id, formData);
        alert("Category updated successfully!");
      } else {
        await CategoryService.create(formData);
        alert("Category created successfully!");
      }
      router.push("/admin/categories");
      router.refresh();
    } catch (err) {
      alert("Failed to save category");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .gap-page { font-family: 'Plus Jakarta Sans', sans-serif; padding: 32px; flex: 1; display: flex; flex-direction: column; }

        /* ── Page Header & Toolbar ── */
        .page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid var(--border); }
        .page-title { font-size: 26px; font-weight: 800; letter-spacing: -0.03em; margin: 0; color: var(--foreground); }
        .page-sub { font-size: 13px; color: var(--text-muted); margin-top: 4px; font-weight: 500; }
        
        .btn-back {
          display: inline-flex; align-items: center; gap: 6px;
          color: var(--text-muted); font-size: 13.5px; font-weight: 600;
          background: transparent; border: none; cursor: pointer; padding: 0;
          margin-bottom: 24px; transition: color 0.2s;
        }
        .btn-back:hover { color: var(--foreground); }

        .btn-save {
          display: flex; align-items: center; gap: 7px;
          padding: 9px 20px; background: var(--brand-red); color: #fff;
          border: none; border-radius: 10px; font-size: 13.5px; font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer;
          white-space: nowrap; transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 14px rgba(255,40,0,0.25);
          letter-spacing: -0.01em;
        }
        .btn-save:hover:not(:disabled) { background: var(--brand-red-hover); transform: translateY(-1px); box-shadow: 0 6px 18px rgba(255,40,0,0.32); }
        .btn-save:disabled { opacity: 0.6; cursor: not-allowed; }

        /* ── Grid Layout ── */
        .form-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          align-items: start;
        }

        /* ── Cards ── */
        .form-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 24px;
          margin-bottom: 24px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .form-card:hover { border-color: var(--border-strong); box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
        .card-title { font-size: 16px; font-weight: 700; color: var(--foreground); margin-bottom: 20px; letter-spacing: -0.01em; margin-top: 0; }

        /* ── Form Groups ── */
        .form-group { margin-bottom: 20px; }
        .form-group:last-child { margin-bottom: 0; }
        .form-label { display: block; font-size: 12px; font-weight: 700; color: var(--text-dim); letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 8px; }

        /* ── Inputs ── */
        .form-input, .form-textarea {
          width: 100%; padding: 10px 14px;
          background: var(--background); border: 1px solid var(--border);
          border-radius: 10px; font-size: 14px; color: var(--foreground);
          font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 500;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none; box-sizing: border-box;
        }
        .form-input::placeholder, .form-textarea::placeholder { color: var(--text-dim); }
        .form-input:focus, .form-textarea:focus { border-color: var(--brand-red); box-shadow: 0 0 0 3px rgba(255,40,0,0.08); }
        
        .form-textarea { resize: vertical; min-height: 120px; line-height: 1.5; }
      `}</style>

      <div className="gap-page">
        <div>
          <button className="btn-back" type="button" onClick={() => router.push("/admin/categories")}>
            <Icon d={icons.chevronLeft} size={15} /> Back to categories
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="page-header">
            <div>
              <h1 className="page-title">{isEdit ? "Edit Category" : "Add New Category"}</h1>
              <p className="page-sub">{isEdit ? `Update details for ${initialData?.name}` : "Create a new product category"}</p>
            </div>
            <button className="btn-save" type="submit" disabled={loading}>
              <Icon d={icons.save} size={15} /> {loading ? "Saving..." : isEdit ? "Update Category" : "Save Category"}
            </button>
          </div>

          <div className="form-grid">
            <div className="form-card">
              <h2 className="card-title">Category Information</h2>
              
              <div className="form-group">
                <label className="form-label">Category Name</label>
                <input 
                  className="form-input" 
                  placeholder="e.g. Sneakers"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-textarea" 
                  placeholder="Details about this category..."
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
