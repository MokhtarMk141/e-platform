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
    strokeWidth={1.7}
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
      let imageUrl = formData.imageUrl;
      if (selectedImage) {
        setUploadingImage(true);
        imageUrl = await ProductService.uploadImage(selectedImage);
      }

      const dataToSave = {
        name: formData.name,
        sku: formData.sku,
        categoryId: formData.categoryId || undefined,
        brandId: formData.brandId || undefined,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        description: formData.description || undefined,
        imageUrl: imageUrl || undefined,
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
      alert("Failed to save product");
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

        .gap-page {
          font-family: 'Plus Jakarta Sans', sans-serif;
          padding: 32px;
          flex: 1;
          display: flex;
          flex-direction: column;
          background:
            radial-gradient(circle at top right, rgba(255,40,0,0.08) 0%, transparent 28%),
            linear-gradient(180deg, var(--background) 0%, var(--surface) 52%, var(--background) 100%);
          min-height: 100vh;
        }

        .btn-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--text-muted);
          font-size: 13.5px;
          font-weight: 600;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
          margin-bottom: 24px;
          transition: color 0.2s;
        }

        .btn-back:hover { color: var(--foreground); }

        .hero-shell {
          position: relative;
          overflow: hidden;
          border: 1px solid var(--border);
          border-radius: 28px;
          padding: 28px 30px;
          margin-bottom: 28px;
          background: linear-gradient(135deg, var(--background) 0%, var(--surface) 100%);
          box-shadow: 0 24px 60px rgba(0,0,0,0.05);
        }

        .hero-shell::before {
          content: "";
          position: absolute;
          inset: 0;
          opacity: 0.08;
          background-image: radial-gradient(var(--foreground) 1.1px, transparent 1.1px);
          background-size: 28px 28px;
          pointer-events: none;
        }

        .hero-glow {
          position: absolute;
          right: -80px;
          top: 50%;
          width: 280px;
          height: 280px;
          border-radius: 50%;
          transform: translateY(-50%);
          background: radial-gradient(circle, rgba(255,40,0,0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        .page-header {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--brand-red);
          margin-bottom: 14px;
        }

        .eyebrow-line {
          width: 28px;
          height: 2px;
          border-radius: 2px;
          background: var(--brand-red);
        }

        .page-title {
          font-size: clamp(28px, 4vw, 48px);
          font-weight: 900;
          letter-spacing: -0.04em;
          margin: 0;
          color: var(--foreground);
          line-height: 1.05;
          max-width: 620px;
        }

        .page-sub {
          font-size: 15px;
          color: var(--text-muted);
          margin-top: 14px;
          font-weight: 500;
          max-width: 560px;
          line-height: 1.7;
          font-family: 'DM Sans', sans-serif;
        }

        .btn-save {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 12px 22px;
          background: var(--brand-red);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 13.5px;
          font-weight: 800;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s, transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 14px rgba(255,40,0,0.25);
          letter-spacing: -0.01em;
        }

        .btn-save:hover:not(:disabled) {
          background: var(--brand-red-hover);
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(255,40,0,0.32);
        }

        .btn-save:disabled { opacity: 0.6; cursor: not-allowed; }

        .form-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
          align-items: start;
        }

        @media (max-width: 900px) {
          .form-grid { grid-template-columns: 1fr; }
        }

        .form-card {
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 24px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.04);
          overflow: hidden;
          position: relative;
        }

        .form-card::before {
          content: "";
          position: absolute;
          inset: 0 0 auto 0;
          height: 4px;
          background: linear-gradient(90deg, var(--brand-red), rgba(255,40,0,0));
          opacity: 0;
          transition: opacity 0.25s;
        }

        .form-card:hover {
          border-color: var(--brand-red);
          box-shadow: 0 20px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(255,40,0,0.08);
          transform: translateY(-4px);
        }

        .form-card:hover::before { opacity: 1; }

        .card-kicker {
          font-size: 11px;
          color: var(--text-dim);
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .card-title {
          font-size: 18px;
          font-weight: 800;
          color: var(--foreground);
          margin-bottom: 20px;
          letter-spacing: -0.02em;
          margin-top: 0;
        }

        .form-group { margin-bottom: 20px; }
        .form-group:last-child { margin-bottom: 0; }

        .form-label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: var(--text-dim);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }

        @media (max-width: 600px) {
          .form-row { grid-template-columns: 1fr; }
        }

        .form-input, .form-select, .form-textarea {
          width: 100%;
          padding: 12px 14px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 14px;
          font-size: 14px;
          color: var(--foreground);
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 500;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
          box-sizing: border-box;
        }

        .form-input::placeholder, .form-textarea::placeholder { color: var(--text-dim); }
        .form-input:focus, .form-select:focus, .form-textarea:focus {
          border-color: var(--brand-red);
          box-shadow: 0 0 0 3px rgba(255,40,0,0.08);
        }

        .form-textarea { resize: vertical; min-height: 120px; line-height: 1.5; }
        .form-select { appearance: none; cursor: pointer; padding-right: 36px; }
        .select-wrapper { position: relative; }
        .select-icon {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: var(--text-dim);
          font-size: 10px;
        }

        .input-with-prefix { position: relative; display: flex; align-items: center; }
        .input-prefix {
          position: absolute;
          left: 14px;
          color: var(--text-dim);
          font-weight: 600;
          font-size: 14px;
          pointer-events: none;
        }

        .input-with-prefix .form-input { padding-left: 28px; }

        .upload-area {
          border: 1px dashed var(--border-strong);
          border-radius: 20px;
          padding: 44px 20px;
          text-align: center;
          cursor: default;
          background: var(--surface);
          transition: all 0.2s;
          overflow: hidden;
        }

        .upload-area:hover { border-color: var(--brand-red); }
        .upload-icon { color: var(--text-dim); margin-bottom: 12px; }
        .upload-text { font-size: 13.5px; font-weight: 700; color: var(--foreground); margin-bottom: 4px; }
        .upload-sub { font-size: 12.5px; color: var(--text-dim); }
        .preview-img { width: 100%; max-height: 220px; object-fit: contain; }
        .upload-input { display: none; }
        .upload-meta { margin-top: 12px; font-size: 12.5px; color: var(--text-muted); text-align: center; }

        .upload-link {
          margin-top: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border);
          background: var(--background);
          color: var(--foreground);
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .upload-link:hover { border-color: var(--brand-red); color: var(--brand-red); }
      `}</style>

      <div className="gap-page">
        <div>
          <button className="btn-back" type="button" onClick={() => router.push("/admin/products/getall")}>
            <Icon d={icons.chevronLeft} size={15} /> Back to products
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="hero-shell">
            <div className="hero-glow" />
            <div className="page-header">
              <div>
                <div className="eyebrow">
                  <span className="eyebrow-line" />
                  Admin Catalog
                </div>
                <h1 className="page-title">{isEdit ? "Edit Product" : "Add New Product"}</h1>
                <p className="page-sub">
                  {isEdit
                    ? `Update details for ${initialData?.name}`
                    : "Create a new product card for your catalog with the same polished storefront feel used on the product page."}
                </p>
              </div>

              <button className="btn-save" type="submit" disabled={loading || uploadingImage}>
                <Icon d={icons.save} size={15} /> {loading ? "Saving..." : uploadingImage ? "Uploading image..." : isEdit ? "Update Product" : "Save Product"}
              </button>
            </div>
          </div>

          <div className="form-grid">
            <div className="left-col">
              <div className="form-card">
                <div className="card-kicker">Storefront Details</div>
                <h2 className="card-title">Basic Information</h2>

                <div className="form-group">
                  <label className="form-label">Product Name</label>
                  <input
                    className="form-input"
                    placeholder="Product name"
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
                    placeholder="Write a detailed description of the product..."
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-card">
                <div className="card-kicker">Pricing Setup</div>
                <h2 className="card-title">Pricing & Inventory</h2>

                <div className="form-row" style={{ marginBottom: 0 }}>
                  <div className="form-group">
                    <label className="form-label">Price</label>
                    <div className="input-with-prefix">
                      <span className="input-prefix">$</span>
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
                    <label className="form-label">Stock Quantity</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="0"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: 20 }}>
                  <label className="form-label">SKU (Stock Keeping Unit)</label>
                  <input
                    className="form-input"
                    placeholder="e.g. NK-AM270-BLK"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="right-col">
              <div className="form-card">
                <div className="card-kicker">Catalog Placement</div>
                <h2 className="card-title">Organization</h2>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <div className="select-wrapper">
                    <select
                      className="form-select"
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleChange}
                      required
                    >
                      <option value="" disabled>{fetchingCategories ? "Loading..." : "Select a category"}</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    <span className="select-icon">v</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <div className="select-wrapper">
                    <select
                      className="form-select"
                      name="brandId"
                      value={formData.brandId}
                      onChange={handleChange}
                    >
                      <option value="">{fetchingBrands ? "Loading..." : "Select a brand"}</option>
                      {brands.map((brand) => (
                        <option key={brand.id} value={brand.id}>{brand.name}</option>
                      ))}
                    </select>
                    <span className="select-icon">v</span>
                  </div>
                </div>
              </div>

              <div className="form-card">
                <div className="card-kicker">Visual Asset</div>
                <h2 className="card-title">Product Image</h2>
                <div className="form-group">
                  <label className="form-label">Upload Image</label>
                  <label className="upload-area">
                    <input
                      className="upload-input"
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={handleFileChange}
                    />

                    {imagePreview ? (
                      <>
                        <img src={imagePreview} alt="Preview" className="preview-img" />
                        <div className="upload-meta">
                          {selectedImage ? selectedImage.name : "Current product image"}
                        </div>
                        <span className="upload-link">Choose another image</span>
                      </>
                    ) : (
                      <>
                        <div className="upload-icon">
                          <Icon d={icons.upload} size={36} />
                        </div>
                        <p className="upload-text">Click to upload a product image</p>
                        <p className="upload-sub">PNG, JPG, WEBP, or GIF up to 10MB</p>
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
