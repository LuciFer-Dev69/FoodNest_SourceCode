import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ArrowRight, Package, HeartHandshake, BarChart3, CalendarDays, Bell, ShieldCheck,
  Sparkles, Globe2, Star, Plus, Minus,
} from "lucide-react";
import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { GlassNav } from "@/components/site/GlassNav";

const IMG = {
  hero: "/images/home-page/home-page1.jpg",
  features: "/images/home-page/home-page2.jpg",
  how: "/images/home-page/home-page3.jpg",
  cta: "/images/home-page/home-page4.jpg",
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FoodNest — Reduce Food Waste. Feed More People." },
      { name: "description", content: "FoodNest helps households track food, plan meals, and donate surplus to reduce waste and feed more people." },
      { property: "og:title", content: "FoodNest — Reduce Food Waste. Feed More People." },
      { property: "og:description", content: "Intelligent food inventory, donations, and meal planning." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-hero">
      <GlassNav />
      <Hero />
      <LiveStats />
      <Features />
      <HowItWorks />
      <Community />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}

function BgSection({ image, children }: { image: string; children: ReactNode }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img src={image} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/70 to-white/85" />
      <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.95_0.03_145/0.15)] via-transparent to-[oklch(0.9_0.05_130/0.1)]" />
      <div className="relative z-10">{children}</div>
    </section>
  );
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

function Hero() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="relative flex min-h-dvh items-center overflow-hidden">
      <div className="absolute inset-0">
        <img src={IMG.hero} alt="" className="h-full w-full object-cover" />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/70 to-white/85" />
      <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.95_0.03_145/0.15)] via-transparent to-[oklch(0.9_0.05_130/0.1)]" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center justify-center px-6 py-32 md:py-40">
        <div className="w-full max-w-2xl text-center">
          <div className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-foreground/80">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            New · AI meal suggestions from what's already in your kitchen
          </div>

          <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight md:text-7xl">
            Reduce food waste. <br className="hidden md:block" />
            <span className="gradient-text">Feed more people.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            FoodNest is the intelligent kitchen co-pilot that tracks what you own, plans meals around it,
            and connects surplus food to neighbours who need it.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-primary px-6 py-3.5 text-sm font-semibold text-white shadow-lift transition-all duration-300 hover:scale-[1.03] hover:shadow-xl"
            >
              Start saving food free
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
            <a
              href="#how"
              className="rounded-full border border-border/60 bg-white/70 px-6 py-3.5 text-sm font-semibold text-foreground/90 backdrop-blur transition-all duration-300 hover:bg-white/90 hover:shadow-soft"
            >
              See how it works
            </a>
          </div>
        </div>
      </div>

      <motion.a
        href="#stats"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
      >
        <span className="text-[10px] font-medium uppercase tracking-widest">Scroll</span>
        <div className="relative h-8 w-5 rounded-full border-2 border-current">
          <motion.div
            animate={reducedMotion ? {} : { y: [0, 10, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="mx-auto mt-1.5 h-2 w-1 rounded-full bg-current"
          />
        </div>
      </motion.a>
    </section>
  );
}

type LiveStatItem = {
  value: string;
  label: string;
};

function LiveStats({ stats }: { stats?: LiveStatItem[] }) {
  const defaultStats: LiveStatItem[] = [
    { value: "2.4M", label: "Meals saved" },
    { value: "180T", label: "Food rescued" },
    { value: "48K", label: "Active households" },
    { value: "92%", label: "Less weekly waste" },
  ];
  const items = stats || defaultStats;

  return (
    <section id="stats" className="mx-auto max-w-6xl px-6">
      <div className="glass-card grid grid-cols-2 gap-2 rounded-3xl p-2 md:grid-cols-4">
        {items.map((s, i) => (
          <motion.div
            key={i} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.05 * i }}
            className="rounded-2xl p-5 text-center"
          >
            <p className="text-3xl font-bold tracking-tight gradient-text">{s.value}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const items = [
    { i: Package, t: "Smart inventory", d: "Add items in seconds. Expiry badges, storage location, categories and bulk actions out of the box." },
    { i: CalendarDays, t: "Weekly meal planner", d: "Drag and drop recipes. We reserve ingredients you already own automatically." },
    { i: HeartHandshake, t: "Donation marketplace", d: "List surplus food. Neighbours nearby claim it. A pickup window keeps it organised." },
    { i: BarChart3, t: "Impact analytics", d: "Track waste trends, money saved and carbon avoided week over week." },
    { i: Bell, t: "Gentle reminders", d: "Real-time notifications before food expires — never harsh, always helpful." },
    { i: ShieldCheck, t: "Privacy & 2FA", d: "JWT auth, bcrypt and TOTP-based two-factor. Your kitchen stays yours." },
  ];
  return (
    <BgSection image={IMG.features}>
      <section id="features" className="mx-auto max-w-6xl px-6 py-28">
        <SectionTitle eyebrow="Features" title="Everything your kitchen needs." subtitle="One calm, fast, beautifully designed surface for your food." />
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="glass-card hover-lift rounded-3xl p-6"
            >
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-primary text-white shadow-soft">
                <f.i className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-bold">{f.t}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.d}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </BgSection>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", t: "Stock your nest", d: "Add or scan your groceries. Categories, expiry dates and quantities — all auto-filled where possible." },
    { n: "02", t: "Plan & cook", d: "Get meal ideas that match what you already own. Drag them onto your weekly calendar." },
    { n: "03", t: "Donate the surplus", d: "List anything you can't use. Neighbours nearby claim it for pickup, with everyone in the loop." },
  ];
  return (
    <BgSection image={IMG.how}>
      <section id="how" className="mx-auto max-w-6xl px-6 py-28">
        <SectionTitle eyebrow="How it works" title="From fridge to fork — without the waste." />
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={i} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card relative overflow-hidden rounded-3xl p-7"
            >
              <span className="text-sm font-bold tracking-wider text-primary">{s.n}</span>
              <h3 className="mt-3 text-2xl font-bold">{s.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </BgSection>
  );
}

function Community() {
  const cards = [
    { img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=70", t: "Sourdough loaves", who: "Mia · 0.4 km", tag: "Bakery", pill: "Available" },
    { img: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=70", t: "Organic spinach", who: "Lucas · 1.2 km", tag: "Produce", pill: "Reserved" },
    { img: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=70", t: "Almond milk x3", who: "Priya · 0.8 km", tag: "Dairy alt.", pill: "Available" },
    { img: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=800&q=70", t: "Apples (1 kg)", who: "Noah · 2.0 km", tag: "Produce", pill: "Available" },
    { img: "https://images.unsplash.com/photo-1551462147-ff29053bfc14?auto=format&fit=crop&w=800&q=70", t: "Pasta (sealed)", who: "Sofia · 1.6 km", tag: "Pantry", pill: "Claimed" },
    { img: "https://images.unsplash.com/photo-1447175008436-054170c2e979?auto=format&fit=crop&w=800&q=70", t: "Heirloom carrots", who: "Aida · 0.9 km", tag: "Produce", pill: "Available" },
  ];
  return (
    <section id="community" className="mx-auto max-w-6xl px-6 py-28">
      <SectionTitle eyebrow="Donation community" title="Surplus, shared." subtitle="A real-time, neighbourhood-scale marketplace for food that would otherwise be thrown away." />
      <div className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
        {cards.map((c, i) => (
          <motion.div
            key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.04 }}
            className="glass-card break-inside-avoid overflow-hidden rounded-3xl p-3 hover-lift"
          >
            <div className="relative h-40 overflow-hidden rounded-2xl">
              <img
                src={c.img}
                alt={c.t}
                loading="lazy"
                className="h-full w-full object-cover transition duration-500 hover:scale-105"
              />
              <span className={`absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-semibold backdrop-blur ${
                c.pill === "Available" ? "bg-success/80 text-white" :
                c.pill === "Reserved" ? "bg-warning/80 text-white" : "bg-foreground/60 text-white"
              }`}>{c.pill}</span>
            </div>
            <div className="p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="truncate font-bold">{c.t}</h4>
                  <p className="text-xs text-muted-foreground">{c.who}</p>
                </div>
                <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium">{c.tag}</span>
              </div>
              <button className="mt-3 w-full rounded-full bg-gradient-primary px-3 py-2 text-xs font-semibold text-white shadow-soft hover:shadow-lift">Claim</button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  const t = [
    { n: "Amelia R.", r: "Household of 4", q: "We cut our weekly food waste in half. The meal planner alone paid for itself.", a: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=3&w=200&h=200&q=70" },
    { n: "Jared P.", r: "Restaurant owner", q: "Our surplus reaches families within an hour. FoodNest is the bridge we always needed.", a: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=3&w=200&h=200&q=70" },
    { n: "Hana M.", r: "Single, busy", q: "Beautiful, calming app. Reminds me without nagging. My fridge has never been cleaner.", a: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=facearea&facepad=3&w=200&h=200&q=70" },
  ];
  return (
    <section className="mx-auto max-w-6xl px-6 py-28">
      <SectionTitle eyebrow="Loved by kitchens" title="Real people. Less waste." />
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {t.map((x, i) => (
          <motion.div
            key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.06 * i }}
            className="glass-card rounded-3xl p-6"
          >
            <div className="flex gap-1 text-warning">
              {Array.from({ length: 5 }).map((_, k) => <Star key={k} className="h-4 w-4 fill-current" />)}
            </div>
            <p className="mt-3 text-[15px] leading-relaxed">"{x.q}"</p>
            <div className="mt-4 flex items-center gap-3">
              <img src={x.a} alt={x.n} loading="lazy" className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/20" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{x.n}</p>
                <p className="truncate text-xs text-muted-foreground">{x.r}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    { q: "Is FoodNest free to use?", a: "Yes — the core household plan is free. Premium features for shared homes and small businesses are optional." },
    { q: "Do you support 2FA?", a: "Yes. We use TOTP-based two-factor authentication, bcrypt password hashing and JWT sessions." },
    { q: "How are donations matched?", a: "We surface listings within your chosen radius. Claiming reserves it for a pickup window you control." },
    { q: "Can I export my data?", a: "Absolutely. You own your kitchen — export inventory, meal history and impact reports anytime." },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-28">
      <SectionTitle eyebrow="FAQ" title="Questions, answered." />
      <div className="mt-10 space-y-3">
        {items.map((it, i) => {
          const isOpen = open === i;
          return (
            <motion.div key={i} layout className="glass-card rounded-2xl">
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 rounded-2xl px-5 py-4 text-left"
              >
                <span className="font-semibold">{it.q}</span>
                {isOpen ? <Minus className="h-4 w-4 text-primary" /> : <Plus className="h-4 w-4 text-primary" />}
              </button>
              <motion.div
                initial={false}
                animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                className="overflow-hidden px-5 text-sm text-muted-foreground"
              >
                <p className="pb-5">{it.a}</p>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <BgSection image={IMG.cta}>
      <section className="mx-auto max-w-6xl px-6 py-28">
        <div className="glass-card relative overflow-hidden rounded-[2rem] p-10 md:p-16">
          <div className="absolute inset-0 -z-10 bg-gradient-primary opacity-90" />
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(800px_300px_at_20%_0%,rgba(255,255,255,0.35),transparent)]" />
          <div className="max-w-2xl text-white">
            <Globe2 className="h-8 w-8" />
            <h2 className="mt-4 text-4xl font-extrabold leading-tight md:text-5xl">
              Your kitchen, but kinder to the planet.
            </h2>
            <p className="mt-3 text-white/90">
              Join thousands of households cutting food waste, saving money and feeding neighbours every week.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/register" className="rounded-full bg-white px-6 py-3.5 text-sm font-bold text-primary shadow-lift hover:translate-y-[-1px] transition">
                Create your free account
              </Link>
              <Link to="/login" className="rounded-full border border-white/40 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur hover:bg-white/20">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>
    </BgSection>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background/60 backdrop-blur">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <img
              src="/images/logo.png"
              alt="FoodNest"
              className="h-8 w-8 shrink-0 rounded-2xl object-cover"
            />
            <span className="font-bold">FoodNest</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Reduce waste. Feed people. Cook better.</p>
        </div>
        {[
          { t: "Product", l: ["Features", "Inventory", "Donations", "Meal planner"] },
          { t: "Company", l: ["About", "Community", "Sustainability", "Contact"] },
          { t: "Legal", l: ["Privacy", "Terms", "Security", "Cookies"] },
        ].map((c) => (
          <div key={c.t}>
            <h4 className="text-sm font-bold">{c.t}</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {c.l.map((x) => <li key={x}><a href="#" className="hover:text-foreground">{x}</a></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} FoodNest. Crafted with care for a less wasteful world.
      </div>
    </footer>
  );
}

function SectionTitle({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <motion.span
        initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="text-xs font-bold uppercase tracking-[0.2em] text-primary"
      >{eyebrow}</motion.span>
      <motion.h2
        initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="mt-3 text-3xl font-extrabold tracking-tight md:text-5xl"
      >{title}</motion.h2>
      {subtitle && <p className="mt-3 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
