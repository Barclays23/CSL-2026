import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { PageContainer } from "@/components/layout/PageContainer";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";

export function AdminRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) void navigate({ to: "/admin/login", replace: true });
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading || !isAuthenticated) {
    return (
      <PageContainer>
        <LoadingSpinner label="Checking admin session" />
      </PageContainer>
    );
  }
  return <>{children}</>;
}
