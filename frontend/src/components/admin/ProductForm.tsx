"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ProductService } from "@/services/product.service";
import { CategoryService } from "@/services/category.service";
import { SubcategoryService } from "@/services/subcategory.service";
import { BrandService } from "@/services/brand.service";
import { Product, Category, Brand, Subcategory } from "@/types/product.types";

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
  save: "M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z M17 21v-8H7v8 M7 3v5h8V3",
};

interface ProductFormProps {
  initialData?: Product;
  isEdit?: boolean;
}

export default function ProductForm({ initialData, isEdit = false }: ProductFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const [fetchingSubcategories, setFetchingSubcategories] = useState(true);
  const [fetchingBrands, setFetchingBrands] = useState(true);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(initialData?.imageUrl || "");

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    sku: initialData?.sku || "",
    categoryId: initialData?.categoryId || "",
    subcategoryId: initialData?.subcategoryId || "",
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
    const loadSubcategories = async () => {
      try {
        const res = await SubcategoryService.getAll();
        setSubcategories(res.data);
      } catch (err) {
        console.error("Failed to load subcategories", err);
      } finally {
        setFetchingSubcategories(false);
      }
    };

    loadSubcategories();
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

  const filteredSubcategories = useMemo(
    () => subcategories.filter((subcategory) => subcategory.categoryId === formData.categoryId),
    [subcategories, formData.categoryId]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "categoryId") {
      setFormData((current) => ({
        ...current,
        categoryId: value,
        subcategoryId: current.subcategoryId && subcategories.some(
          (subcategory) => subcategory.id === current.subcategoryId && subcategory.categoryId === value
        )
          ? current.subcategoryId
          : "",
      }));
      return;
    }

    setFormData((current) => ({ ...current, [name]: value }));
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
        subcategoryId: formData.subcategoryId || undefined,
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
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .gap-page { font-family: 'Plus Jakarta Sans', sans-serif; padding: 32px; flex: 1; display: flex; flex-direction: column; }
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
          box-shadow: 0 4px 14px rgba(255,40,0,0.25); letter-spacing: -0.01em;
        }
        .btn-save:hover:not(:disabled) { background: var(--brand-red-hover); transform: translateY(-1px); box-shadow: 0 6px 18px rgba(255,40,0,0.32); }
        .btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
        .form-grid { display: grid; grid-template-columns: 1fr; gap: 24px; align-items: start; }
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
        .form-group { margin-bottom: 20px; }
        .form-group:last-child { margin-bottom: 0; }
        .form-label { display: block; font-size: 12px; font-weight: 700; color: var(--text-dim); letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 8px; }
        .form-input, .form-select, .form-textarea {
          width: 100%; padding: 10px 14px;
          background: var(--background); border: 1px solid var(--border);
          border-radius: 10px; font-size: 14px; color: var(--foreground);
          font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 500;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none; box-sizing: border-box;
        }
        .form-input::placeholder, .form-textarea::placeholder { color: var(--text-dim); }
        .form-input:focus, .form-select:focus, .form-textarea:focus { border-color: var(--brand-red); box-shadow: 0 0 0 3px rgba(255,40,0,0.08); }
        .form-textarea { resize: vertical; min-height: 120px; line-height: 1.5; }
        .form-select { appearance: none; cursor: pointer; }
        .input-with-prefix { position: relative; display: flex; align-items: center; }
        .input-prefix { position: absolute; left: 14px; color: var(--text-dim); font-weight: 700; font-size: 13px; pointer-events: none; }
        .input-with-prefix .form-input { padding-left: 42px; }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 900px) { .two-col { grid-template-columns: 1fr; } }
        .upload-area {
          border: 2px dashed var(--border); border-radius: 14px; padding: 32px;
          text-align: center; cursor: pointer; background: var(--background);
          transition: all 0.2s; display: block; overflow: hidden;
        }
        .upload-area:hover { border-color: var(--brand-red); background: var(--surface); }
        .upload-icon { color: var(--text-dim); margin-bottom: 16px; opacity: 0.6; }
        .upload-text { font-size: 15px; font-weight: 700; color: var(--foreground); margin-bottom: 6px; }
        .upload-sub { font-size: 13px; color: var(--text-muted); font-weight: 500; }
        .preview-img { width: 100%; max-height: 280px; object-fit: contain; border-radius: 12px; }
      `}</style>

      <div className="gap-page">
        <button className="btn-back" type="button" onClick={() => router.push("/admin/products/getall")}>
          <Icon d={icons.chevronLeft} size={15} /> Back to products
        </button>

        <form onSubmit={handleSubmit}>
          <div className="page-header">
            <div>
              <h1 className="page-title">{isEdit ? "Edit Product" : "Add New Product"}</h1>
              <p className="page-sub">{isEdit ? `Update details for ${initialData?.name}` : "Create a new catalog product"}</p>
            </div>
            <button className="btn-save" type="submit" disabled={loading || uploadingImage}>
              <Icon d={icons.save} size={15} /> {loading ? "Saving..." : uploadingImage ? "Uploading..." : isEdit ? "Update Product" : "Save Product"}
            </button>
          </div>

          <div className="form-grid">
            <div className="form-card">
              <h2 className="card-title">Product Information</h2>

              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input
                  className="form-input"
                  placeholder="e.g. Gaming Mouse"
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
                  placeholder="Details about this product..."
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  style={{ minHeight: 140 }}
                />
              </div>

              <div className="two-col">
                <div className="form-group">
                  <label className="form-label">Price</label>
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
                  <label className="form-label">Stock</label>
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

              <div className="form-group">
                <label className="form-label">SKU</label>
                <input
                  className="form-input"
                  placeholder="e.g. PRD-2026-XJL"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="two-col">
                <div className="form-group">
                  <label className="form-label">Product Category</label>
                  <select
                    className="form-select"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>{fetchingCategories ? "Loading categories..." : "Select Category"}</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Subcategory</label>
                  <select
                    className="form-select"
                    name="subcategoryId"
                    value={formData.subcategoryId}
                    onChange={handleChange}
                    disabled={!formData.categoryId}
                  >
                    <option value="">
                      {!formData.categoryId
                        ? "Select category first"
                        : fetchingSubcategories
                          ? "Loading subcategories..."
                          : "Optional subcategory"}
                    </option>
                    {filteredSubcategories.map((subcategory) => (
                      <option key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Manufacturer Brand</label>
                <select
                  className="form-select"
                  name="brandId"
                  value={formData.brandId}
                  onChange={handleChange}
                >
                  <option value="">{fetchingBrands ? "Loading brands..." : "Select Brand"}</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-card">
              <h2 className="card-title">Product Image</h2>

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
                      <div style={{ marginTop: 16, fontSize: 12, fontWeight: 700, color: "var(--brand-red)" }}>Update Image</div>
                    </div>
                  ) : (
                    <>
                      <div className="upload-icon">
                        <Icon d={icons.upload} size={44} />
                      </div>
                      <p className="upload-text">Upload Product Image</p>
                      <p className="upload-sub">PNG, WEBP or JPG (Max 10MB)</p>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
