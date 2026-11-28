import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

const LINKS = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Benefits", href: "/#benefits" },
  { label: "For business", href: "/merchant" },
  { label: "ZRA insights", href: "/zra" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location]);

  return (
    <header className="sticky top-0 z-50 border-b border-ink-200/60 bg-white/80 backdrop-blur-lg">
      <nav className="container-page flex h-16 items-center justify-between">
        <Logo />

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) =>
            link.href.startsWith("/#") ? (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink-600 transition hover:bg-ink-100 hover:text-ink-900"
              >
                {link.label}
              </a>
            ) : (
              <NavLink
                key={link.href}
                to={link.href}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-ink-100 text-ink-900"
                      : "text-ink-600 hover:bg-ink-100 hover:text-ink-900"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ),
          )}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link to="/app">
            <Button variant="ghost" size="sm">
              Open app
            </Button>
          </Link>
          <Link to="/app/verify">
            <Button size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Start earning
            </Button>
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg p-2 text-ink-600 hover:bg-ink-100 md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-ink-200/60 bg-white md:hidden">
          <div className="container-page flex flex-col gap-1 py-3">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-100"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              <Link to="/app" onClick={() => setOpen(false)}>
                <Button variant="outline" fullWidth>
                  Open app
                </Button>
              </Link>
              <Link to="/app/verify" onClick={() => setOpen(false)}>
                <Button fullWidth rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Start earning
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}