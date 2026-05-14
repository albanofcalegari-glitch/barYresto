"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export function MobileSidebar({
  children,
  userName,
  userRole,
  logoutButton,
}: {
  children: React.ReactNode;
  userName?: string;
  userRole?: string;
  logoutButton?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-3 py-2 bg-surface-card/90 backdrop-blur-md border-b border-white/[0.06]">
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg text-zinc-400 hover:bg-white/5 hover:text-zinc-200 transition-colors"
          aria-label="Abrir menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 5h14M3 10h14M3 15h14" />
          </svg>
        </button>
        {userName && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium text-zinc-200">{userName}</div>
              {userRole && <div className="text-xs text-zinc-500">{userRole}</div>}
            </div>
            {logoutButton}
          </div>
        )}
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-64 border-r border-white/[0.06] bg-surface-card p-4 flex flex-col
          transform transition-transform duration-200 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <button
          onClick={() => setOpen(false)}
          className="md:hidden absolute top-3 right-3 p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors"
          aria-label="Cerrar menu"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M5 5l10 10M15 5L5 15" />
          </svg>
        </button>
        {children}
      </aside>
    </>
  );
}
