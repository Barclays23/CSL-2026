import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { LogOut, Menu, Shield } from "lucide-react";
import { CslMark } from "@/components/brand/CslMark";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/cn";

export const NAV_ITEMS = [
  { to: "/", label: "Home" },
  { to: "/players", label: "Players" },
  { to: "/teams", label: "Teams" },
  { to: "/managers", label: "Managers" },
  { to: "/sponsors", label: "Sponsors" },
  { to: "/matches", label: "Fixtures" },
  { to: "/standings", label: "Standings" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-glass backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <CslMark className="h-9 w-9" />
          <span className="font-display text-xl leading-none tracking-wide text-fg">CSL</span>
        </Link>
        <nav className="ml-4 hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "rounded-full px-3 py-2 text-sm font-medium",
                  active ? "bg-accent text-accent-fg" : "text-muted hover:text-fg",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated ? (
            <div className="hidden items-center gap-2 sm:flex">
              <Link to="/admin/dashboard" className="rounded-full px-3 py-2 text-sm font-semibold text-fg">
                {user?.name.split(" ")[0] ?? "Admin"}
              </Link>
              <IconButton aria-label="Log out" onClick={() => void logout()}>
                <LogOut className="h-4 w-4" />
              </IconButton>
            </div>
          ) : (
            <Link to="/admin/login" className="hidden sm:block">
              <Button variant="surface" size="sm">
                <Shield className="h-4 w-4" />
                Admin
              </Button>
            </Link>
          )}
          <IconButton className="lg:hidden" aria-label="Open menu" onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5" />
          </IconButton>
        </div>
      </div>
      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </header>
  );
}
