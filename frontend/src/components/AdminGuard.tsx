"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, syncAuth } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    syncAuth();
    setMounted(true);
  }, [syncAuth]);

  useEffect(() => {
    if (mounted) {
      if (!isAuthenticated) {
        router.replace("/login");
        return;
      }

      if (user?.role !== "ADMIN") {
        router.replace("/");
      }
    }
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted || !isAuthenticated || user?.role !== "ADMIN") {
    // Return null while checking auth to prevent flash of content
    return null; 
  }

  return <>{children}</>;
}
