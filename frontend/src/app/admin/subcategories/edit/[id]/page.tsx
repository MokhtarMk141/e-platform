"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { SubcategoryService } from "@/services/subcategory.service";
import { Subcategory } from "@/types/product.types";
import SubcategoryForm from "@/components/admin/SubcategoryForm";

export default function EditSubcategoryPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [subcategory, setSubcategory] = useState<Subcategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchSubcategory = async () => {
      try {
        const res = await SubcategoryService.getById(id);
        setSubcategory(res.data);
      } catch (err: any) {
        setError(err.message || "Failed to load subcategory");
      } finally {
        setLoading(false);
      }
    };

    fetchSubcategory();
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: 32, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text-muted)" }}>Loading subcategory...</p>
      </div>
    );
  }

  if (error || !subcategory) {
    return (
      <div style={{ padding: 32, textAlign: "center" }}>
        <p style={{ color: "var(--brand-red)", fontWeight: 700 }}>{error || "Subcategory not found"}</p>
        <button
          onClick={() => router.push("/admin/subcategories")}
          style={{ marginTop: 16, padding: "8px 16px", background: "var(--brand-red)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}
        >
          Back to list
        </button>
      </div>
    );
  }

  return <SubcategoryForm initialData={subcategory} isEdit />;
}
