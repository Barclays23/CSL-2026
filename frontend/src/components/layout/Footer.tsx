import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { CslMark } from "@/components/brand/CslMark";
import { NAV_ITEMS } from "@/components/layout/Navbar";
import { getSponsors } from "@/services/sponsorService";
import type { PublicSponsor } from "@/types/sponsor.types";

export function Footer() {
  const [sponsors, setSponsors] = useState<PublicSponsor[]>([]);
  useEffect(() => {
    getSponsors({ limit: 8 })
      .then((response) => setSponsors(response.data.filter((sponsor) => sponsor.status === "active")))
      .catch(() => setSponsors([]));
  }, []);

  return (
    <footer className="mt-10 border-t border-line bg-glass">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.2fr_1fr_1fr] lg:px-8">
        <div>
          <div className="flex items-center gap-2">
            <CslMark />
            <p className="font-display text-2xl text-fg">CSL Football</p>
          </div>
          <p className="mt-3 max-w-sm text-sm text-muted">
            The current village tournament: squads, auction balances, fixtures and the table, kept in one place.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Navigate</p>
          <div className="mt-3 flex flex-col gap-2">
            {NAV_ITEMS.map((item) => (
              <Link key={item.to} to={item.to} className="text-sm text-fg">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Sponsors</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {sponsors.map((sponsor) =>
              sponsor.logo ? (
                <img key={sponsor._id} src={sponsor.logo.url} alt={sponsor.name} className="h-12 w-12 rounded-xl object-cover" />
              ) : (
                <span key={sponsor._id} className="text-sm text-fg">
                  {sponsor.name}
                </span>
              ),
            )}
          </div>
        </div>
      </div>
      <p className="border-t border-line px-4 py-4 text-center text-xs text-faint">CSL Football Tournament. Current season only.</p>
    </footer>
  );
}
