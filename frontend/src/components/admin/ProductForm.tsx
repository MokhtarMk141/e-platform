"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProductService } from "@/services/product.service";
import { CategoryService } from "@/services/category.service";
import { BrandService } from "@/services/brand.service";
import { Product, Category, Brand } from "@/types/product.types";

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

const Icon = ({ d, size = 16 }: { d: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

const icons = {
  chevronLeft: "M15 18l-6-6 6-6",
  upload: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12",
  save: "M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z M17 21v-8H7v8 M7 3v5h8V3"
};

interface ProductFormProps {
  initialData?: Product;
  isEdit?: boolean;
}

export default function ProductForm({ initialData, isEdit = false }: ProductFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const [fetchingBrands, setFetchingBrands] = useState(true);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(initialData?.imageUrl || "");

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    sku: initialData?.sku || "",
    categoryId: initialData?.categoryId || "",
    brandId: initialData?.brandId || "",
    price: initialData?.price?.toString() || "",
    stock: initialData?.stock?.toString() || "",
    description: initialData?.description || "",
    imageUrl: initialData?.imageUrl || "",
  });

  useEffect(() => {
    if (!selectedImage) {
      setImagePreview(initialData?.imageUrl || formData.imageUrl || "");
      return;
    }

    const objectUrl = URL.createObjectURL(selectedImage);
    setImagePreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedImage, initialData?.imageUrl, formData.imageUrl]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await CategoryService.getAll();
        setCategories(res.data);
      } catch (err) {
        console.error("Failed to load categories", err);
      } finally {
        setFetchingCategories(false);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const loadBrands = async () => {
      try {
        const res = await BrandService.getAll();
        setBrands(res.data);
      } catch (err) {
        console.error("Failed to load brands", err);
      } finally {
        setFetchingBrands(false);
      }
    };

    loadBrands();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;

    if (file && file.size > MAX_IMAGE_SIZE_BYTES) {
      alert("Image too large. Max size is 10MB.");
      e.target.value = "";
      setSelectedImage(null);
      return;
    }

    setSelectedImage(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const parsedPrice = Number.parseFloat(formData.price);
      const parsedStock = Number.parseInt(formData.stock, 10);

      if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
        throw new Error("Price must be a valid positive number");
      }

      if (!Number.isFinite(parsedStock) || parsedStock < 0) {
        throw new Error("Stock must be a valid non-negative integer");
      }

      let imageUrl = formData.imageUrl || "";
      if (selectedImage) {
        setUploadingImage(true);
        imageUrl = await ProductService.uploadImage(selectedImage);
      }

      const dataToSave = {
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        categoryId: formData.categoryId || undefined,
        brandId: formData.brandId || undefined,
        price: parsedPrice,
        stock: parsedStock,
        description: formData.description.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
      };

      if (isEdit && initialData) {
        await ProductService.update(initialData.id, dataToSave);
        alert("Product updated successfully!");
      } else {
        await ProductService.create(dataToSave);
        alert("Product created successfully!");
      }

      router.push("/admin/products/getall");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save product";
      alert(message);
      console.error(err);
    } finally {
      setUploadingImage(false);
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .gap-page {
          font-family: 'Plus Jakarta Sans', sans-serif;
          padding: 40px;
          flex: 1;
          display: flex;
          flex-direction: column;
          background:
            radial-gradient(circle at top right, rgba(255,40,0,0.06) 0%, transparent 35%),
            var(--background);
          min-height: 100vh;
        }

        .btn-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--text-dim);
          font-size: 13px;
          font-weight: 800;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
          margin-bottom: 28px;
          transition: all 0.2s;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .btn-back:hover { color: var(--brand-red); transform: translateX(-4px); }

        .hero-shell {
          position: relative;
          overflow: hidden;
          border: 1px solid var(--border);
          border-radius: 32px;
          padding: 40px;
          margin-bottom: 32px;
          background: var(--surface);
          box-shadow: 0 4px 24px rgba(0,0,0,0.03);
          animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .hero-glow {
          position: absolute;
          right: -40px;
          top: -40px;
          width: 320px;
          height: 320px;
          background: radial-gradient(circle, rgba(255,40,0,0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--brand-red);
          margin-bottom: 16px;
        }
        .eyebrow-line { width: 32px; height: 2.5px; background: var(--brand-red); border-radius: 4px; }

        .page-title {
          font-size: clamp(32px, 5vw, 44px);
          font-weight: 900;
          letter-spacing: -0.05em;
          margin: 0;
          color: var(--foreground);
          line-height: 1;
        }

        .page-sub {
          font-size: 16px;
          color: var(--text-muted);
          margin-top: 16px;
          font-weight: 500;
          max-width: 600px;
          line-height: 1.6;
          font-family: 'DM Sans', sans-serif;
        }

        .btn-save {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          background: var(--brand-red);
          color: #fff;
          border: none;
          border-radius: 16px;
          font-size: 14.5px;
          font-weight: 900;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 14px rgba(255,40,0,0.25);
          letter-spacing: -0.01em;
        }
        .btn-save:hover:not(:disabled) {
          background: var(--brand-red-hover);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255,40,0,0.35);
        }
        .btn-save:disabled { opacity: 0.6; cursor: not-allowed; }

        .form-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
          align-items: start;
        }
        @media (max-width: 1000px) { .form-grid { grid-template-columns: 1fr; } }

        .form-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 32px;
          margin-bottom: 24px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .form-card:hover {
          transform: translateY(-2px);
          border-color: var(--border-strong);
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
        }

        .card-kicker {
          font-size: 11px;
          color: var(--text-dim);
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 12px;
        }
        .card-title {
          font-size: 20px;
          font-weight: 900;
          color: var(--foreground);
          margin: 0 0 24px;
          letter-spacing: -0.03em;
        }

        .form-group { margin-bottom: 24px; }
        .form-label {
          display: block;
          font-size: 12px;
          font-weight: 800;
          color: var(--text-dim);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 10px;
        }

        .form-input, .form-select, .form-textarea {
          width: 100%;
          padding: 14px 18px;
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 14px;
          font-size: 15px;
          color: var(--foreground);
          font-family: inherit;
          font-weight: 600;
          transition: all 0.2s;
          outline: none;
        }
        .form-input:focus, .form-select:focus, .form-textarea:focus {
          border-color: var(--brand-red);
          box-shadow: 0 0 0 4px rgba(255,40,0,0.08);
          background: var(--surface);
        }

        .input-with-prefix { position: relative; display: flex; align-items: center; }
        .input-prefix { position: absolute; left: 18px; color: var(--text-dim); font-weight: 900; font-size: 13px; pointer-events: none; }
        .input-with-prefix .form-input { padding-left: 52px; }

        .upload-area {
          border: 2px dashed var(--border);
          border-radius: 20px;
          padding: 48px;
          text-align: center;
          cursor: pointer;
          background: var(--background);
          transition: all 0.2s;
          display: block;
        }
        .upload-area:hover { border-color: var(--brand-red); background: var(--surface); }
        .upload-icon { color: var(--text-dim); margin-bottom: 16px; opacity: 0.6; }
        .upload-text { font-size: 15px; font-weight: 800; color: var(--foreground); margin-bottom: 6px; }
        .upload-sub { font-size: 13px; color: var(--text-muted); font-weight: 500; }
        .preview-img { width: 100%; max-height: 280px; object-fit: contain; border-radius: 12px; }
      `}</style>

      <div className="gap-page">
        <button className="btn-back" type="button" onClick={() => router.push("/admin/products/getall")}>
          <Icon d={icons.chevronLeft} size={16} /> Back to Catalog
        </button>

        <form onSubmit={handleSubmit}>
          <div className="hero-shell">
            <div className="hero-glow" />
            <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 24 }}>
              <div>
                <div className="eyebrow">
                  <span className="eyebrow-line" />
                  Product Management
                </div>
                <h1 className="page-title">{isEdit ? "Refine Product" : "New Collection Asset"}</h1>
                <p className="page-sub">
                  {isEdit
                    ? `Fine-tune the presentation for ${initialData?.name}. Quality data drives higher conversion rates.`
                    : "Expand your catalog with high-fidelity product listings. Our premium " + "feel good" + " design system ensures every item looks elite."}
                </p>
              </div>
              <button className="btn-save" type="submit" disabled={loading || uploadingImage}>
                <Icon d={icons.save} size={18} /> {loading ? "Synchronizing..." : uploadingImage ? "Uploading Asset..." : isEdit ? "Commit Changes" : "Publish Product"}
              </button>
            </div>
          </div>

          <div className="form-grid">
            <div className="left-col">
              <div className="form-card" style={{ animationDelay: "0.1s" }}>
                <div className="card-kicker">Core Attributes</div>
                <h2 className="card-title">Identity & Narrative</h2>

                <div className="form-group">
                  <label className="form-label">Commercial Name</label>
                  <input
                    className="form-input"
                    placeholder="Enter the premium product title..."
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Narrative Description</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Craft a compelling story about this product..."
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    style={{ minHeight: 180 }}
                  />
                </div>
              </div>

              <div className="form-card" style={{ animationDelay: "0.2s" }}>
                <div className="card-kicker">Value Metrics</div>
                <h2 className="card-title">Pricing & Availability</h2>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  <div className="form-group">
                    <label className="form-label">MSRP Price</label>
                    <div className="input-with-prefix">
                      <span className="input-prefix">TND</span>
                      <input
                        type="number"
                        step="0.01"
                        className="form-input"
                        placeholder="0.00"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Inventory Level</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="Units in stock"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: 8 }}>
                  <label className="form-label">Global Identity (SKU)</label>
                  <input
                    className="form-input"
                    placeholder="e.g. PRD-2026-XJL"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="right-col">
              <div className="form-card" style={{ animationDelay: "0.3s" }}>
                <div className="card-kicker">Taxonomy</div>
                <h2 className="card-title">Classification</h2>

                <div className="form-group">
                  <label className="form-label">Product Category</label>
                  <select
                    className="form-select"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>{fetchingCategories ? "Loading Assets..." : "Select Category"}</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Manufacturer Brand</label>
                  <select
                    className="form-select"
                    name="brandId"
                    value={formData.brandId}
                    onChange={handleChange}
                  >
                    <option value="">{fetchingBrands ? "Loading Assets..." : "Select Brand"}</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-card" style={{ animationDelay: "0.4s" }}>
                <div className="card-kicker">Visual Identity</div>
                <h2 className="card-title">Media Asset</h2>
                <div className="form-group">
                  <label className="upload-area">
                    <input
                      style={{ display: "none" }}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                    />

                    {imagePreview ? (
                      <div style={{ position: "relative" }}>
                        <img src={imagePreview} alt="Preview" className="preview-img" />
                        <div style={{ marginTop: 16, fontSize: 12, fontWeight: 800, color: "var(--brand-red)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Update Asset</div>
                      </div>
                    ) : (
                      <>
                        <div className="upload-icon">
                          <Icon d={icons.upload} size={44} />
                        </div>
                        <p className="upload-text">Upload High-Res Media</p>
                        <p className="upload-sub">PNG, WEBP or JPG (Max 10MB)</p>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
