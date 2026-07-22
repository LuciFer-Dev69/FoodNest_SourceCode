import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

const links = [
  ["Features", "#features"],
  ["How it works", "#how"],
  ["Community", "#community"],
  ["FAQ", "#faq"],
] as const;

export function GlassNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
      className="fixed inset-x-0 top-3 z-50 flex justify-center px-3 sm:top-4 sm:px-4"
    >
      <nav
        className={`glass grid w-full max-w-5xl grid-cols-[auto_1fr_auto] items-center gap-2 rounded-full px-2 py-2 transition-all sm:px-3 sm:py-2.5 ${
          scrolled ? "shadow-soft" : ""
        }`}
      >
        <Link to="/" className="group flex min-w-0 items-center gap-2 pl-2 sm:pl-3">
          <img
            src="/images/logo.png"
            alt="FoodNest"
            className="h-8 w-8 shrink-0 rounded-full object-cover"
          />
          <span className="truncate text-sm font-bold tracking-tight sm:text-base">FoodNest</span>
        </Link>

        <ul className="hidden items-center justify-center gap-1 md:flex">
          {links.map(([label, href]) => (
            <li key={label}>
              <a
                href={href}
                className="rounded-full px-3 py-1.5 text-sm font-medium text-foreground/70 transition-all duration-300 hover:scale-[1.04] hover:bg-secondary hover:text-foreground"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
        {/* spacer for grid on mobile */}
        <span className="md:hidden" />

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link
            to="/login"
            className="hidden rounded-full px-3 py-2 text-sm font-semibold text-foreground/80 transition-all duration-300 hover:scale-[1.04] hover:text-foreground sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="hidden rounded-full bg-gradient-primary px-4 py-2 text-sm font-semibold text-white shadow-soft transition-all duration-300 hover:scale-[1.04] hover:shadow-lift sm:inline-flex"
          >
            Get started
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            className="grid h-9 w-9 place-items-center rounded-full bg-background/60 md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile sheet */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="glass-card absolute left-3 right-3 top-[68px] rounded-3xl p-3 md:hidden"
          >
            <ul className="space-y-1">
              {links.map(([label, href]) => (
                <li key={label}>
                  <a
                    href={href}
                    onClick={() => setOpen(false)}
                    className="block rounded-2xl px-4 py-2.5 text-sm font-medium text-foreground/80 hover:bg-secondary"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-border/60 pt-3">
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="rounded-full border border-border bg-card px-4 py-2 text-center text-sm font-semibold"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                onClick={() => setOpen(false)}
                className="rounded-full bg-gradient-primary px-4 py-2 text-center text-sm font-semibold text-white shadow-soft"
              >
                Get started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
