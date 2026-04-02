"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandService } from "@/services/brand.service";
import { Brand } from "@/types/product.types";

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
  save: "M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z M17 21v-8H7v8 M7 3v5h8V3",
  upload: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12",
};

interface BrandFormProps {
  initialData?: Brand;
  isEdit?: boolean;
}

export default function BrandForm({ initialData, isEdit = false }: BrandFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(initialData?.logoUrl || "");
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    logoUrl: initialData?.logoUrl || "",
  });

  useEffect(() => {
    if (!selectedImage) {
      setImagePreview(initialData?.logoUrl || formData.logoUrl || "");
      return;
    }

    const objectUrl = URL.createObjectURL(selectedImage);
    setImagePreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedImage, initialData?.logoUrl, formData.logoUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      let logoUrl = formData.logoUrl;

      if (selectedImage) {
        setUploadingImage(true);
        logoUrl = await BrandService.uploadLogo(selectedImage);
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        logoUrl,
      };

      if (isEdit && initialData) {
        await BrandService.update(initialData.id, payload);
        alert("Brand updated successfully!");
      } else {
        await BrandService.create(payload);
        alert("Brand created successfully!");
      }

      router.push("/admin/brands");
      router.refresh();
    } catch (err) {
      alert("Failed to save brand");
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
        .btn-back { display: inline-flex; align-items: center; gap: 6px; color: var(--text-muted); font-size: 13.5px; font-weight: 600; background: transparent; border: none; cursor: pointer; padding: 0; margin-bottom: 24px; transition: color 0.2s; }
        .btn-back:hover { color: var(--foreground); }
        .btn-save { display: flex; align-items: center; gap: 7px; padding: 9px 20px; background: var(--brand-red); color: #fff; border: none; border-radius: 10px; font-size: 13.5px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; white-space: nowrap; transition: background 0.2s, transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 14px rgba(255,40,0,0.25); letter-spacing: -0.01em; }
        .btn-save:hover:not(:disabled) { background: var(--brand-red-hover); transform: translateY(-1px); box-shadow: 0 6px 18px rgba(255,40,0,0.32); }
        .btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
        .form-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 24px; transition: border-color 0.2s, box-shadow 0.2s; }
        .form-card:hover { border-color: var(--border-strong); box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
        .card-title { font-size: 16px; font-weight: 700; color: var(--foreground); margin-bottom: 20px; letter-spacing: -0.01em; margin-top: 0; }
        .form-group { margin-bottom: 20px; }
        .form-group:last-child { margin-bottom: 0; }
        .form-label { display: block; font-size: 12px; font-weight: 700; color: var(--text-dim); letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 8px; }
        .form-input, .form-textarea { width: 100%; padding: 10px 14px; background: var(--background); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; color: var(--foreground); font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 500; transition: border-color 0.2s, box-shadow 0.2s; outline: none; box-sizing: border-box; }
        .form-input::placeholder, .form-textarea::placeholder { color: var(--text-dim); }
        .form-input:focus, .form-textarea:focus { border-color: var(--brand-red); box-shadow: 0 0 0 3px rgba(255,40,0,0.08); }
        .form-textarea { resize: vertical; min-height: 120px; line-height: 1.5; }
        .upload-area { border: 2px dashed var(--border); border-radius: 12px; padding: 36px 20px; text-align: center; background: var(--background); transition: all 0.2s; overflow: hidden; }
        .upload-area:hover { border-color: var(--brand-red); }
        .upload-input { display: none; }
        .upload-icon { color: var(--text-dim); margin-bottom: 12px; }
        .upload-text { font-size: 13.5px; font-weight: 700; color: var(--foreground); margin-bottom: 4px; }
        .upload-sub { font-size: 12.5px; color: var(--text-dim); }
        .preview-img { width: 100%; max-height: 180px; object-fit: contain; }
        .upload-meta { margin-top: 12px; font-size: 12.5px; color: var(--text-muted); text-align: center; }
        .upload-link { margin-top: 12px; display: inline-flex; align-items: center; justify-content: center; border: 1px solid var(--border); background: var(--surface); color: var(--foreground); border-radius: 10px; padding: 10px 14px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .upload-link:hover { border-color: var(--brand-red); color: var(--brand-red); }
      `}</style>

      <div className="gap-page">
        <div>
          <button className="btn-back" type="button" onClick={() => router.push("/admin/brands")}>
            <Icon d={icons.chevronLeft} size={15} /> Back to brands
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="page-header">
            <div>
              <h1 className="page-title">{isEdit ? "Edit Brand" : "Add New Brand"}</h1>
              <p className="page-sub">{isEdit ? `Update details for ${initialData?.name}` : "Create a new product brand"}</p>
            </div>
            <button className="btn-save" type="submit" disabled={loading || uploadingImage}>
              <Icon d={icons.save} size={15} /> {loading ? "Saving..." : uploadingImage ? "Uploading logo..." : isEdit ? "Update Brand" : "Save Brand"}
            </button>
          </div>

          <div className="form-card">
            <h2 className="card-title">Brand Information</h2>

            <div className="form-group">
              <label className="form-label">Brand Name</label>
              <input
                className="form-input"
                placeholder="e.g. Logitech"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Brand Logo</label>
              <label className="upload-area">
                <input
                  className="upload-input"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleFileChange}
                />
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Brand preview" className="preview-img" />
                    <div className="upload-meta">{selectedImage ? selectedImage.name : "Current brand logo"}</div>
                    <span className="upload-link">Choose another image</span>
                  </>
                ) : (
                  <>
                    <div className="upload-icon">
                      <Icon d={icons.upload} size={36} />
                    </div>
                    <p className="upload-text">Click to upload a brand logo</p>
                    <p className="upload-sub">PNG, JPG, WEBP, or GIF up to 10MB</p>
                  </>
                )}
              </label>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                placeholder="Details about this brand..."
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
