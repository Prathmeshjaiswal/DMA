// Footer.jsx
import React from "react";

export default function Footer() {
  return (
    <footer className="text-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm opacity-80">© Coforge, {new Date().getFullYear()} | Confidential</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="/privacy" className="text-xs underline underline-offset-4 hover:opacity-80">
            Privacy
          </a>
          <a href="/terms" className="text-xs underline underline-offset-4 hover:opacity-80">
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}