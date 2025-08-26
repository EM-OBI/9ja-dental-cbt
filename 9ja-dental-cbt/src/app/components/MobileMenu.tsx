"use client";

import clsx from "clsx";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function MobileMenu({ open, onClose }: Props) {
  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "#aboutUs", label: "About" },
    { href: "#features", label: "Features" },
    { href: "#pricing", label: "Pricing" },
  ];

  return (
    <div
      className={clsx(
        "mobile-menu fixed inset-0 z-40 bg-black/95 backdrop-blur-lg transform transition-transform duration-300",
        open && "open"
      )}
    >
      <div className="flex flex-col items-center justify-center h-full space-y-8 text-2xl heading-font">
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="hover:text-emerald-300 transition text-white"
          >
            {link.label}
          </a>
        ))}
      </div>
      <div className="fixed bottom-8 left-0 right-0 flex justify-center">
        <button
          onClick={onClose}
          className="glass-effect p-3 rounded-full flex items-center justify-center hover:bg-opacity-80 transition-all"
          aria-label="Close menu"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  );
}
