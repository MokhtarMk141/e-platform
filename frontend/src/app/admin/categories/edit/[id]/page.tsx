"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CategoryService } from "@/services/category.service";
import { Category } from "@/types/product.types";
import CategoryForm from "@/components/admin/CategoryForm";

export default function EditCategoryPage() {
  const params = useParams();
  const id = params?.id as string;
  
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const fetchCategory = async () => {
      try {
        const res = await CategoryService.getById(id);
        setCategory(res.data);
      } catch (err: any) {
        setError(err.message || "Failed to load category");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategory();
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: 32, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text-muted)" }}>Loading category...</p>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div style={{ padding: 32, textAlign: "center" }}>
        <p style={{ color: "var(--brand-red)", fontWeight: 700 }}>{error || "Category not found"}</p>
        <button 
          onClick={() => window.location.href = "/admin/categories"}
          style={{ marginTop: 16, padding: "8px 16px", background: "var(--brand-red)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}
        >
          Back to list
        </button>
      </div>
    );
  }

  return <CategoryForm initialData={category} isEdit={true} />;
}
