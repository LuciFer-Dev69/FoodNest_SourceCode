import { motion } from "motion/react";
import { MapPin, Clock } from "lucide-react";
import { PageHeader, Panel } from "@/components/app/primitives";
import { DONATION_TONES } from "@/models/donations.model";
import { DonationsController } from "@/controllers/donations.controller";

export function DonationsView({
  filter,
  setFilter,
  cats,
  items,
  handleClaim,
  handleListDonation,
}: DonationsController) {
  return (
    <>
      <PageHeader
        title="Donation marketplace"
        subtitle="Surplus food, shared with neighbours."
        action={
          <button onClick={handleListDonation} className="rounded-full bg-gradient-primary px-4 py-2 text-sm font-semibold text-white shadow-soft hover:shadow-lift">
            + List donation
          </button>
        }
      />
      <Panel>
        <div className="flex flex-wrap gap-2">
          {cats.map((c) => (
            <button key={c} onClick={() => setFilter(c)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                filter === c ? "bg-gradient-primary text-white shadow-soft" : "bg-secondary hover:text-foreground text-foreground/70"
              }`}>{c}</button>
          ))}
        </div>
      </Panel>

      <div className="mt-4 columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4 [&>*]:mb-4">
        {items.map((c, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="glass-card hover-lift break-inside-avoid rounded-3xl p-4">
            <div className="flex h-36 items-center justify-center rounded-2xl bg-gradient-emerald text-7xl">{c.emoji}</div>
            <div className="mt-4 flex items-start justify-between gap-3">
              <div>
                <h4 className="font-bold">{c.t}</h4>
                <p className="text-xs text-muted-foreground">by {c.who}</p>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${DONATION_TONES[c.status]}`}>{c.status}</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {c.km} km</span>
              <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {c.pickup}</span>
            </div>
            <button
              onClick={() => handleClaim(c.id ?? i)}
              disabled={c.status !== "Available"}
              className="mt-4 w-full rounded-2xl bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:shadow-lift disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
            >
              {c.status === "Available" ? "Claim" : c.status}
            </button>
          </motion.div>
        ))}
      </div>
    </>
  );
}
