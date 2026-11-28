import { Link } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { SimulatedBadge } from "@/components/ui/SimulatedBadge";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "/#how-it-works" },
      { label: "Benefits", href: "/#benefits" },
      { label: "Verify a receipt", href: "/app/verify" },
      { label: "Rewards", href: "/app/marketplace" },
    ],
  },
  {
    title: "Stakeholders",
    links: [
      { label: "Customer app", href: "/app" },
      { label: "Merchant dashboard", href: "/merchant" },
      { label: "ZRA insights", href: "/zra" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-ink-200/70 bg-white">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm text-ink-500">
            Risiti Loop rewards citizens for verifying ZRA Smart Invoice
            receipts — building a transparent, rewarding tax culture in Zambia.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <SimulatedBadge label="ZRA integration simulated" />
            <SimulatedBadge label="Zamtel rewards simulated" />
          </div>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold text-ink-900">{col.title}</h4>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-ink-500 transition hover:text-brand-700"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-ink-100">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-sm text-ink-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Risiti Loop. Hackathon prototype.</p>
          <p>All ZRA &amp; Zamtel integrations are simulated.</p>
        </div>
      </div>
    </footer>
  );
}