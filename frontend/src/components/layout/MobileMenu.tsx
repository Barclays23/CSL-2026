import { Link } from "@tanstack/react-router";
import { LogOut, Shield, X } from "lucide-react";
import { NAV_ITEMS } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { useAuth } from "@/contexts/AuthContext";

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { isAuthenticated, logout } = useAuth();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-bg/80 backdrop-blur-md lg:hidden">
      <div className="flex h-full flex-col bg-glass-strong p-5">
        <div className="flex justify-end">
          <IconButton aria-label="Close menu" onClick={onClose}>
            <X className="h-5 w-5" />
          </IconButton>
        </div>
        <nav className="mt-6 flex flex-col gap-2" aria-label="Mobile">
          {NAV_ITEMS.map((item) => (
            <Link key={item.to} to={item.to} onClick={onClose} className="rounded-card px-3 py-3 text-lg font-medium text-fg">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto">
          {isAuthenticated ? (
            <div className="flex flex-col gap-2">
              <Link to="/admin/dashboard" onClick={onClose}>
                <Button variant="surface" className="w-full">
                  Dashboard
                </Button>
              </Link>
              <Button
                variant="danger"
                className="w-full"
                onClick={() => {
                  onClose();
                  void logout();
                }}
              >
                <LogOut className="h-4 w-4" />
                Log out
              </Button>
            </div>
          ) : (
            <Link to="/admin/login" onClick={onClose}>
              <Button className="w-full">
                <Shield className="h-4 w-4" />
                Admin login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
