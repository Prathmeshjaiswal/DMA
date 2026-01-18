
import React from "react";
import logo from "../assets/cfg3.png"; // optional: show the same logo in footer

export default function Footer() {
  return (
    <>
      {/* Fixed footer bar */}
      <footer className="fixed inset-x-0 bottom-0 z-50 text-black border-t border-white/10 shadow-md">
        <div className="flex items-center pl-120 py-3 gap-3">
          {/* Left: logo (optional) */}
          <div className="flex items-center gap-2">

            <span className="text-sm opacity-80">
              © Coforge, 2026 | Confidential
            </span>
          </div>

          {/* Right: quick actions (optional) */}
          <div className="flex items-center gap-2">
            <a
              href="/privacy"
              className="text-xs underline underline-offset-4 hover:opacity-80"
            >
              Privacy
            </a>
            <a
              href="/terms"
              className="text-xs underline underline-offset-4 hover:opacity-80"
            >
              Terms
            </a>
          </div>
        </div>
      </footer>

      {/* Spacer to prevent content being overlapped by fixed footer */}
      <div className="h-14" />
    </>
  );
}
