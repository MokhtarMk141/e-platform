"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ProductService } from "@/services/product.service";
import { Product } from "@/types/product.types";
import ProductForm from "@/components/admin/ProductForm";

export default function EditProductPage() {
  const params = useParams();
  const id = params?.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const fetchProduct = async () => {
      try {
        const res = await ProductService.getById(id);
        setProduct(res.data);
      } catch (err: any) {
        setError(err.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: 32, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text-muted)" }}>Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ padding: 32, textAlign: "center" }}>
        <p style={{ color: "var(--brand-red)", fontWeight: 700 }}>{error || "Product not found"}</p>
        <button 
          onClick={() => window.location.href = "/admin/products/getall"}
          style={{ marginTop: 16, padding: "8px 16px", background: "var(--brand-red)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}
        >
          Back to list
        </button>
      </div>
    );
  }

  return <ProductForm initialData={product} isEdit={true} />;
}
