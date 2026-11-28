import type { ReactNode } from "react";

export interface TabItem {
  key: string;
  label: ReactNode;
}

export function Tabs({
  items,
  active,
  onChange,
  className = "",
}: {
  items: TabItem[];
  active: string;
  onChange: (key: string) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={`no-scrollbar flex gap-1 overflow-x-auto rounded-xl bg-ink-100 p-1 ${className}`}
    >
      {items.map((item) => {
        const isActive = item.key === active;
        return (
          <button
            key={item.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(item.key)}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition ${
              isActive
                ? "bg-white text-ink-900 shadow-soft"
                : "text-ink-500 hover:text-ink-800"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}