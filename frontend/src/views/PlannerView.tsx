import { motion } from "motion/react";
import { Fragment as FragmentWithKey } from "react";
import { Sparkles } from "lucide-react";
import { PageHeader, Panel } from "@/components/app/primitives";
import { PlannerController } from "@/controllers/planner.controller";

export function PlannerView({
  plan,
  setDrag,
  drag,
  days,
  slots,
  suggestions,
  handleDrop,
  handleAutofillWeek,
}: PlannerController) {
  return (
    <>
      <PageHeader
        title="Meal planner"
        subtitle="Drag recipes onto your week — we reserve ingredients you already own."
        action={
          <button onClick={handleAutofillWeek} className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-4 py-2 text-sm font-semibold text-white shadow-soft hover:shadow-lift">
            <Sparkles className="h-4 w-4" /> Auto-fill week
          </button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Panel className="overflow-x-auto p-4">
          <div className="grid min-w-[820px] grid-cols-[100px_repeat(7,1fr)] gap-2">
            <div></div>
            {days.map((d) => (
              <div key={d} className="rounded-2xl bg-background/60 p-2 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">{d}</div>
            ))}
            {slots.map((s) => (
              <FragmentWithKey key={s}>
                <div className="flex items-center text-xs font-bold uppercase tracking-wider text-muted-foreground">{s}</div>
                {days.map((d) => {
                  const key = `${d}-${s}`;
                  const meal = plan[key];
                  return (
                    <div
                      key={key}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDrop(key)}
                      className="min-h-[88px] rounded-2xl border border-dashed border-border bg-background/40 p-2 transition hover:border-primary/60"
                    >
                      {meal ? (
                        <motion.div
                          layout
                          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                          className="flex h-full flex-col rounded-xl bg-gradient-emerald p-2 text-white"
                        >
                          <span className="text-xl">{meal.emoji}</span>
                          <span className="mt-auto text-[11px] font-semibold leading-tight">{meal.name}</span>
                          <span className="text-[10px] opacity-80">{meal.uses} from pantry</span>
                        </motion.div>
                      ) : (
                        <div className="grid h-full place-items-center text-[11px] text-muted-foreground">Drop meal</div>
                      )}
                    </div>
                  );
                })}
              </FragmentWithKey>
            ))}
          </div>
        </Panel>

        <Panel>
          <h3 className="text-lg font-bold">Smart suggestions</h3>
          <p className="text-xs text-muted-foreground">Built from your current inventory</p>
          <ul className="mt-4 space-y-2">
            {suggestions.map((m) => (
              <li
                key={m.name}
                draggable
                onDragStart={() => setDrag(m)}
                onDragEnd={() => setDrag(null)}
                className="flex cursor-grab items-center gap-3 rounded-2xl bg-background/70 p-3 hover:shadow-soft active:cursor-grabbing"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-emerald text-xl text-white">{m.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{m.name}</p>
                  <p className="text-[11px] text-muted-foreground">uses {m.uses} items you own</p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
