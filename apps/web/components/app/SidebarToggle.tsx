"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

/**
 * Small toggle that lives at the top of the sidebar. State is stored in
 * localStorage so the choice survives navigation and reloads.
 *
 * The actual width change is driven by a class on <html> (see lib/useSidebar.ts)
 * rather than React state, so the toggle never triggers a page re-render.
 */
export function SidebarToggle() {
  function toggle() {
    const root = document.documentElement;
    const next = root.dataset.sidebar === "collapsed" ? "expanded" : "collapsed";
    root.dataset.sidebar = next;
    try {
      localStorage.setItem("angaza.sidebar", next);
    } catch {
      // localStorage may be blocked — the toggle still works for this session.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle sidebar"
      className="hidden rounded-md p-2 text-text-faint hover:bg-bg-elevated hover:text-text focus-ring md:inline-flex"
    >
      <PanelLeftClose size={16} strokeWidth={1.75} className="[[data-sidebar='collapsed']_&]:hidden" />
      <PanelLeftOpen size={16} strokeWidth={1.75} className="[[data-sidebar='expanded']_&]:hidden" />
    </button>
  );
}
