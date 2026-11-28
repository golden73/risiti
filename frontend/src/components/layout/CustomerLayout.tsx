import type { ReactNode } from "react";
import {
  LayoutDashboard,
  BadgeCheck,
  QrCode,
  Wallet,
  Gift,
  History,
  Flag,
  MessageSquare,
} from "lucide-react";
import { DashboardLayout, type NavItem } from "@/components/layout/DashboardLayout";
import { PhoneChip } from "@/components/customer/PhoneChip";
import { PhoneGate } from "@/components/customer/PhoneGate";

const NAV: NavItem[] = [
  { label: "Overview", to: "/app", icon: LayoutDashboard, end: true },
  { label: "Verify receipt", to: "/app/verify", icon: BadgeCheck },
  { label: "Scan QR", to: "/app/scan", icon: QrCode },
  { label: "My rewards", to: "/app/rewards", icon: Wallet },
  { label: "Marketplace", to: "/app/marketplace", icon: Gift },
  { label: "History", to: "/app/history", icon: History },
  { label: "Report no receipt", to: "/app/report", icon: Flag },
  { label: "USSD simulator", to: "/app/ussd", icon: MessageSquare },
];

export function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardLayout
      navItems={NAV}
      headerRight={<PhoneChip />}
      footer={
        <div className="rounded-xl bg-ink-50 p-3 text-xs leading-relaxed text-ink-500">
          <span className="font-semibold text-ink-700">Demo mode.</span> ZRA &
          Zamtel integrations are simulated.
        </div>
      }
    >
      <PhoneGate>{children}</PhoneGate>
    </DashboardLayout>
  );
}