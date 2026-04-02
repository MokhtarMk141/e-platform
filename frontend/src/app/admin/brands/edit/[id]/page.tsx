"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BrandService } from "@/services/brand.service";
import { Brand } from "@/types/product.types";
import BrandForm from "@/components/admin/BrandForm";

export default function EditBrandPage() {
  const params = useParams();
  const id = params?.id as string;
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchBrand = async () => {
      try {
        const res = await BrandService.getById(id);
        setBrand(res.data);
      } catch (err: any) {
        setError(err.message || "Failed to load brand");
      } finally {
        setLoading(false);
      }
    };

    fetchBrand();
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: 32, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text-muted)" }}>Loading brand...</p>
      </div>
    );
  }

  if (error || !brand) {
    return (
      <div style={{ padding: 32, textAlign: "center" }}>
        <p style={{ color: "var(--brand-red)", fontWeight: 700 }}>{error || "Brand not found"}</p>
        <button
          onClick={() => { window.location.href = "/admin/brands"; }}
          style={{ marginTop: 16, padding: "8px 16px", background: "var(--brand-red)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}
        >
          Back to list
        </button>
      </div>
    );
  }

  return <BrandForm initialData={brand} isEdit={true} />;
}
