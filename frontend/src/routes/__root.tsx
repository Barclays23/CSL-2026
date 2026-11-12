import { createRootRoute, Outlet } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ConfirmProvider } from "@/contexts/ConfirmContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { NotFoundPage } from "@/pages/NotFoundPage";

function RootComponent() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ConfirmProvider>
          <AppLayout>
            <Outlet />
          </AppLayout>
          <ToastProvider />
        </ConfirmProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundPage,
});
