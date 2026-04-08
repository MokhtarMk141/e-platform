"use client";

import { useSearchParams } from "next/navigation";
import SubcategoryForm from "@/components/admin/SubcategoryForm";

export default function AddSubcategoryPage() {
  const searchParams = useSearchParams();
  const defaultCategoryId = searchParams.get("categoryId") ?? undefined;

  return <SubcategoryForm defaultCategoryId={defaultCategoryId} />;
}
