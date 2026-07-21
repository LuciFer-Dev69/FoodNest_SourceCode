import { motion, AnimatePresence } from "motion/react";
import {
  Search, SlidersHorizontal, LayoutGrid, List, Plus, Trash2, Edit2, X,
  Refrigerator, ArrowUpDown, ImageUp,
} from "lucide-react";
import { PageHeader, Panel } from "@/components/app/primitives";
import {
  Item, CATEGORIES, STORAGE_LOCATIONS, STATUS_FILTERS, SORT_OPTIONS,
} from "@/models/inventory.model";
import type { InventoryController } from "@/controllers/inventory.controller";

const statusLabel: Record<string, { label: string; cls: string }> = {
  Fresh: { label: "Fresh", cls: "bg-green-500/15 text-green-600 dark:text-green-400" },
  "Expiring Soon": { label: "Expiring Soon", cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  Expired: { label: "Expired", cls: "bg-red-500/15 text-red-600 dark:text-red-400" },
};

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 text-emerald-500 mb-5">
        <Refrigerator className="h-12 w-12" />
      </div>
      <h3 className="text-xl font-bold">Your kitchen is empty</h3>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        Add your first food item to start tracking what's in your kitchen.
      </p>
      <button
        onClick={onAdd}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-primary px-6 py-3 text-sm font-semibold text-white shadow-soft hover:shadow-lift"
      >
        <Plus className="h-4 w-4" /> Add Inventory
      </button>
    </div>
  );
}

function FilterPills({
  label, options, current, onChange,
}: {
  label: string; options: readonly string[]; current: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="mr-1 whitespace-nowrap text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
            current === o
              ? "bg-gradient-primary text-white shadow-soft"
              : "bg-secondary text-foreground/70 hover:text-foreground"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function getStatusInfo(item: Item) {
  return statusLabel[item.status] ?? { label: item.status, cls: "bg-muted text-muted-foreground" };
}

export function InventoryView({
  q, setQ,
  view, setView,
  cat, setCat,
  loc, setLoc,
  statusFilter, setStatusFilter,
  sort, setSort,
  open,
  editId,
  editingItem,
  items,
  loading,
  handleAddItem,
  handleStartEdit,
  handleOpenAdd,
  handleCloseModal,
  handleDeleteItem,
}: InventoryController) {

  if (loading) {
    return (
      <>
        <PageHeader title="Inventory" subtitle="Everything in your kitchen, calmly organised." />
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass-card rounded-3xl p-4 animate-pulse">
              <div className="h-28 rounded-2xl bg-secondary" />
              <div className="mt-3 h-4 w-3/4 rounded bg-secondary" />
              <div className="mt-2 h-3 w-1/2 rounded bg-secondary" />
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Inventory"
        subtitle="Everything in your kitchen, calmly organised."
        action={
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-4 py-2 text-sm font-semibold text-white shadow-soft hover:shadow-lift"
          >
            <Plus className="h-4 w-4" /> Add item
          </button>
        }
      />

      <Panel>
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex flex-1 min-w-[200px] items-center gap-2 rounded-2xl border border-border bg-background/70 px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search inventory…"
              className="w-full bg-transparent text-sm outline-none"
            />
          </span>

          <div className="flex items-center gap-1.5 rounded-2xl border border-border bg-background/70 px-3 py-2 text-sm">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-transparent text-sm outline-none"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center rounded-2xl border border-border bg-background/70 p-1">
            <button
              onClick={() => setView("list")}
              className={`grid h-8 w-8 place-items-center rounded-xl ${view === "list" ? "bg-gradient-primary text-white" : "text-muted-foreground"}`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("grid")}
              className={`grid h-8 w-8 place-items-center rounded-xl ${view === "grid" ? "bg-gradient-primary text-white" : "text-muted-foreground"}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <FilterPills label="Category" options={CATEGORIES} current={cat} onChange={setCat} />
          <FilterPills label="Location" options={STORAGE_LOCATIONS} current={loc} onChange={setLoc} />
          <FilterPills label="Status" options={STATUS_FILTERS} current={statusFilter} onChange={setStatusFilter} />
        </div>
      </Panel>

      {items.length === 0 ? (
        <EmptyState onAdd={handleOpenAdd} />
      ) : view === "list" ? (
        <div className="mt-4">
          <Panel className="overflow-hidden p-0">
            <div className="grid grid-cols-12 border-b border-border/60 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <div className="col-span-4">Item</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2">Location</div>
              <div className="col-span-2">Expires</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            <AnimatePresence initial={false}>
              {items.map((it, i) => {
                const info = getStatusInfo(it);
                return (
                  <motion.div
                    key={it.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.02 }}
                    className="grid grid-cols-12 items-center border-b border-border/40 px-5 py-3 text-sm hover:bg-background/60"
                  >
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-secondary">
                        {it.image ? (
                          <img src={it.image} alt={it.foodName} className="h-full w-full object-cover" />
                        ) : (
                          <Refrigerator className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{it.foodName}</p>
                        <p className="text-xs text-muted-foreground">{it.quantity} {it.unit}</p>
                      </div>
                    </div>
                    <div className="col-span-2 text-muted-foreground">{it.category}</div>
                    <div className="col-span-2 text-muted-foreground">{it.storageLocation}</div>
                    <div className="col-span-2">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${info.cls}`}>
                        {info.label}
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center justify-end gap-1 text-muted-foreground">
                      <button
                        onClick={() => handleStartEdit(it)}
                        className="grid h-8 w-8 place-items-center rounded-lg hover:bg-secondary"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(it.id)}
                        className="grid h-8 w-8 place-items-center rounded-lg hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </Panel>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence initial={false}>
            {items.map((it, i) => {
              const info = getStatusInfo(it);
              return (
                <motion.div
                  key={it.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="glass-card hover-lift rounded-3xl p-4"
                >
                  <div className="flex h-28 items-center justify-center overflow-hidden rounded-2xl bg-gradient-emerald">
                    {it.image ? (
                      <img src={it.image} alt={it.foodName} className="h-full w-full object-cover" />
                    ) : (
                      <Refrigerator className="h-12 w-12 text-white/60" />
                    )}
                  </div>
                  <div className="mt-3 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-bold">{it.foodName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {it.quantity} {it.unit} &middot; {it.storageLocation}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${info.cls}`}>
                      {info.label}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{it.category}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-end gap-1 text-muted-foreground">
                    <button
                      onClick={() => handleStartEdit(it)}
                      className="grid h-8 w-8 place-items-center rounded-lg hover:bg-secondary"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(it.id)}
                      className="grid h-8 w-8 place-items-center rounded-lg hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add / Edit Slide-over */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
          >
            <motion.aside
              onClick={(e) => e.stopPropagation()}
              initial={{ x: 480 }}
              animate={{ x: 0 }}
              exit={{ x: 480 }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              className="fixed right-3 top-3 bottom-3 w-[92vw] max-w-md glass-card rounded-3xl p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">
                  {editId ? "Edit inventory item" : "Add inventory item"}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="grid h-9 w-9 place-items-center rounded-xl hover:bg-secondary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form
                id="inventory-form"
                key={editId || "new"}
                className="mt-5 space-y-3"
                onSubmit={handleAddItem}
                encType="multipart/form-data"
              >
                <fieldset className="space-y-3">
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium">Food name *</span>
                    <input
                      name="foodName"
                      defaultValue={editingItem?.foodName ?? ""}
                      type="text"
                      placeholder="e.g. Greek yogurt"
                      className="w-full rounded-2xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="mb-1 block text-sm font-medium">Quantity *</span>
                      <input
                        name="quantity"
                        defaultValue={editingItem?.quantity ?? ""}
                        type="number"
                        min="0"
                        step="any"
                        placeholder="2"
                        className="w-full rounded-2xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-sm font-medium">Unit</span>
                      <input
                        name="unit"
                        defaultValue={editingItem?.unit ?? ""}
                        type="text"
                        placeholder="pcs, g, L"
                        className="w-full rounded-2xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="mb-1 block text-sm font-medium">Category</span>
                    <select
                      name="category"
                      defaultValue={editingItem?.category ?? "Other"}
                      className="w-full rounded-2xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      {CATEGORIES.filter((c) => c !== "All").map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-sm font-medium">Storage location</span>
                    <select
                      name="storageLocation"
                      defaultValue={editingItem?.storageLocation ?? "Fridge"}
                      className="w-full rounded-2xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      {STORAGE_LOCATIONS.filter((l) => l !== "All").map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="mb-1 block text-sm font-medium">Purchase date</span>
                      <input
                        name="purchaseDate"
                        defaultValue={editingItem?.purchaseDate?.split("T")[0] ?? ""}
                        type="date"
                        className="w-full rounded-2xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-sm font-medium">Expiration date *</span>
                      <input
                        name="expirationDate"
                        defaultValue={editingItem?.expirationDate?.split("T")[0] ?? ""}
                        type="date"
                        className="w-full rounded-2xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="mb-1 block text-sm font-medium">Notes</span>
                    <textarea
                      name="notes"
                      defaultValue={editingItem?.notes ?? ""}
                      rows={3}
                      placeholder="Optional notes…"
                      className="w-full resize-none rounded-2xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-sm font-medium">Image</span>
                    <span className="flex items-center gap-2 rounded-2xl border border-border bg-background/70 px-3 py-2.5 text-sm text-muted-foreground cursor-pointer hover:border-primary/40">
                      <ImageUp className="h-4 w-4" />
                      {editingItem?.image ? "Change photo" : "Upload photo"}
                      <input
                        name="image"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                      />
                    </span>
                  </label>
                </fieldset>

                <button
                  type="submit"
                  className="mt-2 w-full rounded-2xl bg-gradient-primary px-5 py-3 text-sm font-semibold text-white shadow-soft hover:shadow-lift"
                >
                  {editId ? "Save changes" : "Save item"}
                </button>
              </form>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
