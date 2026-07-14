import { motion, AnimatePresence } from "motion/react";
import { Search, SlidersHorizontal, LayoutGrid, List, Plus, Trash2, Edit2, Archive, X } from "lucide-react";
import { PageHeader, Panel } from "@/components/app/primitives";
import { getExpiryTone } from "@/models/inventory.model";
import { InventoryController } from "@/controllers/inventory.controller";

export function InventoryView({
  q,
  setQ,
  view,
  setView,
  cat,
  setCat,
  open,
  setOpen,
  editingItem,
  setEditingItem,
  cats,
  items,
  handleAddItem,
  handleStartEdit,
  handleDeleteItem,
}: InventoryController) {
  return (
    <>
      <PageHeader
        title="Inventory"
        subtitle="Everything in your kitchen, calmly organised."
        action={
          <button onClick={() => { setEditingItem(null); setOpen(true); }} className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-4 py-2 text-sm font-semibold text-white shadow-soft hover:shadow-lift">
            <Plus className="h-4 w-4" /> Add item
          </button>
        }
      />

      <Panel>
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex flex-1 min-w-[240px] items-center gap-2 rounded-2xl border border-border bg-background/70 px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search inventory…" className="w-full bg-transparent text-sm outline-none" />
          </span>
          <button className="flex items-center gap-2 rounded-2xl border border-border bg-background/70 px-3 py-2 text-sm font-medium hover:bg-secondary">
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>
          <div className="flex items-center rounded-2xl border border-border bg-background/70 p-1">
            <button onClick={() => setView("list")} className={`grid h-8 w-8 place-items-center rounded-xl ${view === "list" ? "bg-gradient-primary text-white" : ""}`}><List className="h-4 w-4" /></button>
            <button onClick={() => setView("grid")} className={`grid h-8 w-8 place-items-center rounded-xl ${view === "grid" ? "bg-gradient-primary text-white" : ""}`}><LayoutGrid className="h-4 w-4" /></button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {cats.map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                cat === c ? "bg-gradient-primary text-white shadow-soft" : "bg-secondary text-foreground/70 hover:text-foreground"
              }`}>{c}</button>
          ))}
        </div>
      </Panel>

      <div className="mt-4">
        {view === "list" ? (
          <Panel className="overflow-hidden p-0">
            <div className="grid grid-cols-12 border-b border-border/60 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <div className="col-span-5">Item</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2">Location</div>
              <div className="col-span-2">Expires</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>
            <AnimatePresence initial={false}>
              {items.map((it, i) => (
                <motion.div
                  key={it.id}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.02 }}
                  className="grid grid-cols-12 items-center border-b border-border/40 px-5 py-3 text-sm hover:bg-background/60"
                >
                  <div className="col-span-5 flex items-center gap-3">
                     <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-xl">{it.emoji}</span>
                    <div>
                      <p className="font-semibold">{it.name}</p>
                      <p className="text-xs text-muted-foreground">{it.qty}</p>
                    </div>
                  </div>
                  <div className="col-span-2 text-muted-foreground">{it.cat}</div>
                  <div className="col-span-2 text-muted-foreground">{it.loc}</div>
                  <div className="col-span-2">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${getExpiryTone(it.expires)}`}>
                      {it.expires <= 0 ? "Expired" : `in ${it.expires}d`}
                    </span>
                  </div>
                  <div className="col-span-1 flex items-center justify-end gap-1 text-muted-foreground">
                    <button onClick={() => handleStartEdit(it)} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-secondary"><Edit2 className="h-3.5 w-3.5" /></button>
                    <button className="grid h-8 w-8 place-items-center rounded-lg hover:bg-secondary"><Archive className="h-3.5 w-3.5" /></button>
                    <button onClick={() => handleDeleteItem(it.id)} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </Panel>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {items.map((it, i) => (
              <motion.div key={it.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="glass-card hover-lift rounded-3xl p-4">
                <div className="flex h-28 items-center justify-center rounded-2xl bg-gradient-emerald text-5xl">{it.emoji}</div>
                <div className="mt-3 flex items-start justify-between">
                  <div>
                    <p className="font-bold">{it.name}</p>
                    <p className="text-xs text-muted-foreground">{it.qty} · {it.loc}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${getExpiryTone(it.expires)}`}>{it.expires}d</span>
                </div>
                <div className="mt-3 flex items-center justify-end gap-1 text-muted-foreground">
                  <button onClick={() => handleStartEdit(it)} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-secondary"><Edit2 className="h-3.5 w-3.5" /></button>
                  <button onClick={() => handleDeleteItem(it.id)} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Item Slide-over */}
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => { setOpen(false); setEditingItem(null); }}>
            <motion.aside
              onClick={(e) => e.stopPropagation()}
              initial={{ x: 480 }} animate={{ x: 0 }} exit={{ x: 480 }} transition={{ type: "spring", stiffness: 260, damping: 30 }}
              className="fixed right-3 top-3 bottom-3 w-[92vw] max-w-md glass-card rounded-3xl p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">{editingItem ? "Edit inventory item" : "Add inventory item"}</h3>
                <button onClick={() => { setOpen(false); setEditingItem(null); }} className="grid h-9 w-9 place-items-center rounded-xl hover:bg-secondary"><X className="h-4 w-4" /></button>
              </div>
              <form key={editingItem?.id || "new"} className="mt-5 space-y-3" onSubmit={handleAddItem}>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium">Name</span>
                  <input name="name" defaultValue={editingItem?.name || ""} type="text" placeholder="e.g. Greek yogurt" className="w-full rounded-2xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium">Quantity</span>
                  <input name="qty" defaultValue={editingItem?.qty || ""} type="text" placeholder="500 g" className="w-full rounded-2xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium">Category</span>
                  <input name="cat" defaultValue={editingItem?.cat || ""} type="text" placeholder="Dairy" className="w-full rounded-2xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium">Storage</span>
                  <input name="loc" defaultValue={editingItem?.loc || ""} type="text" placeholder="Fridge" className="w-full rounded-2xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium">Expires in (days)</span>
                  <input name="expires" defaultValue={editingItem?.expires || ""} type="number" placeholder="3" className="w-full rounded-2xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
                </label>
                <button className="mt-2 w-full rounded-2xl bg-gradient-primary px-5 py-3 text-sm font-semibold text-white shadow-soft hover:shadow-lift">
                  {editingItem ? "Save changes" : "Save item"}
                </button>
              </form>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
