import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Plus, Trash2, Edit2, X, ArrowUpDown, HeartHandshake,
  MapPin, Clock, CalendarDays, ImageUp, Users, Truck,
} from "lucide-react";
import { PageHeader, Panel } from "@/components/app/primitives";
import {
  CATEGORIES, SORT_OPTIONS, STATUS_BADGES,
} from "@/models/donations.model";
import { LocationPicker } from "@/components/donations/LocationPicker";
import type { DonationsController } from "@/controllers/donations.controller";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
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

export function DonationsView({
  q, setQ,
  cat, setCat,
  sort, setSort,
  items,
  loading,
  createOpen,
  editId,
  editingItem,
  detailItem,
  cats,
  handleCreateOpen,
  handleEditOpen,
  handleCloseForm,
  handleDetailOpen,
  handleDetailClose,
  handleSubmit,
  handleClaim,
  handleDelete,
  handleCancel,
  handleOpenFoodConnect,
}: DonationsController) {
  const [pickupCountry, setPickupCountry] = useState("Nepal");
  const [pickupCity, setPickupCity] = useState("Kathmandu");
  const [pickupLat, setPickupLat] = useState<number | null>(null);
  const [pickupLng, setPickupLng] = useState<number | null>(null);
  const [pickupAddress, setPickupAddress] = useState("");

  useEffect(() => {
    if (editingItem?.pickupLocation) {
      const pl = editingItem.pickupLocation;
      setPickupCountry(pl.country || "Nepal");
      setPickupCity(pl.city || "Kathmandu");
      setPickupLat(pl.latitude ?? null);
      setPickupLng(pl.longitude ?? null);
      setPickupAddress(pl.address || "");
    } else if (!editId) {
      setPickupCountry("Nepal");
      setPickupCity("Kathmandu");
      setPickupLat(null);
      setPickupLng(null);
      setPickupAddress("");
    }
  }, [editingItem, editId]);
  if (loading) {
    return (
      <>
        <PageHeader title="Donation marketplace" subtitle="Surplus food, shared with neighbours." />
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass-card rounded-3xl p-4 animate-pulse">
              <div className="h-36 rounded-2xl bg-secondary" />
              <div className="mt-4 h-4 w-3/4 rounded bg-secondary" />
              <div className="mt-2 h-3 w-1/2 rounded bg-secondary" />
              <div className="mt-3 h-3 w-2/3 rounded bg-secondary" />
              <div className="mt-4 h-10 rounded-2xl bg-secondary" />
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Donation marketplace"
        subtitle="Surplus food, shared with neighbours."
        action={
          <button
            onClick={handleCreateOpen}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-4 py-2 text-sm font-semibold text-white shadow-soft hover:shadow-lift"
          >
            <Plus className="h-4 w-4" /> List a Donation
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
              placeholder="Search donations…"
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
        </div>

        <div className="mt-4 space-y-2">
          <FilterPills label="Category" options={CATEGORIES} current={cat} onChange={setCat} />
        </div>
      </Panel>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 text-emerald-500 mb-5">
            <HeartHandshake className="h-12 w-12" />
          </div>
          <h3 className="text-xl font-bold">No donations available right now</h3>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Be the first to share surplus food with your community.
          </p>
          <button
            onClick={handleCreateOpen}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-primary px-6 py-3 text-sm font-semibold text-white shadow-soft hover:shadow-lift"
          >
            <Plus className="h-4 w-4" /> List Your Donation
          </button>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence initial={false}>
            {items.map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass-card hover-lift rounded-3xl overflow-hidden"
              >
                <div className="relative h-40 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center overflow-hidden">
                  {d.image ? (
                    <img src={d.image} alt={d.foodName} className="h-full w-full object-cover" />
                  ) : (
                    <HeartHandshake className="h-16 w-16 text-emerald-400/40" />
                  )}
                  <span className={`absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${STATUS_BADGES[d.status]}`}>
                    {d.status}
                  </span>
                </div>
                <div className="p-4">
                  <h4 className="font-bold truncate">{d.foodName}</h4>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {d.quantity} {d.unit} &middot; {d.category}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {d.pickupLocation?.city || d.city || "N/A"}
                    </span>
                    {d.pickupDate && (
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" /> {d.pickupDate}
                      </span>
                    )}
                    {d.pickupTime && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {d.pickupTime}
                      </span>
                    )}
                    {d.expirationDate && (
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3 w-3 text-red-500/70" /> Exp {d.expirationDate}
                      </span>
                    )}
                    {d.deliveryMethod && (
                    <span className="inline-flex items-center gap-1">
                      <Truck className="h-3 w-3" /> {d.deliveryMethod === "self_pickup" ? "Self Pickup" : "Third-party"}
                    </span>
                    )}
                    <span className="inline-flex items-center gap-1 ml-auto">
                      <Users className="h-3 w-3" /> {d.donor.name}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">{timeAgo(d.createdAt)}</span>
                    <div className="flex items-center gap-1">
                      {d.isOwner ? (
                        <>
                          <button
                            onClick={() => handleEditOpen(d)}
                            className="grid h-8 w-8 place-items-center rounded-lg hover:bg-secondary text-muted-foreground"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(d.id)}
                            className="grid h-8 w-8 place-items-center rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleDetailOpen(d)}
                          className="rounded-full bg-gradient-primary px-4 py-1.5 text-xs font-semibold text-white shadow-soft hover:shadow-lift"
                        >
                          View Details
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create / Edit Form Modal */}
      <AnimatePresence>
        {createOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseForm}
          >
            <motion.aside
              onClick={(e) => e.stopPropagation()}
              initial={{ x: 480 }}
              animate={{ x: 0 }}
              exit={{ x: 480 }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              className="fixed right-3 top-3 bottom-3 w-[92vw] max-w-md glass-card rounded-3xl p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold">
                  {editId ? "Edit donation" : "List a Donation"}
                </h3>
                <button onClick={handleCloseForm} className="grid h-9 w-9 place-items-center rounded-xl hover:bg-secondary">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form
                key={editId || "new"}
                onSubmit={handleSubmit}
                encType="multipart/form-data"
                className="space-y-3"
              >
                <fieldset className="space-y-3">
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium">Food name *</span>
                    <input
                      name="foodName"
                      defaultValue={editingItem?.foodName ?? ""}
                      type="text"
                      placeholder="e.g. Fresh Vegetables"
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
                        placeholder="5"
                        className="w-full rounded-2xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-sm font-medium">Unit</span>
                      <input
                        name="unit"
                        defaultValue={editingItem?.unit ?? ""}
                        type="text"
                        placeholder="kg, pcs, loaves"
                        className="w-full rounded-2xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="mb-1 block text-sm font-medium">Category</span>
                    <select
                      name="category"
                      defaultValue={editingItem?.category ?? "Produce"}
                      className="w-full rounded-2xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      {CATEGORIES.filter((c) => c !== "All").map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-sm font-medium">Description</span>
                    <textarea
                      name="description"
                      defaultValue={editingItem?.description ?? ""}
                      rows={3}
                      placeholder="Describe what you're donating…"
                      className="w-full resize-none rounded-2xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-sm font-medium">Expiration date</span>
                    <input
                      name="expirationDate"
                      defaultValue={editingItem?.expirationDate?.split("T")[0] ?? ""}
                      type="date"
                      className="w-full rounded-2xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="mb-1 block text-sm font-medium">Pickup date</span>
                      <input
                        name="pickupDate"
                        defaultValue={editingItem?.pickupDate?.split("T")[0] ?? ""}
                        type="date"
                        className="w-full rounded-2xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-sm font-medium">Pickup time</span>
                      <input
                        name="pickupTime"
                        defaultValue={editingItem?.pickupTime ?? ""}
                        type="text"
                        placeholder="e.g. 5–7pm"
                        className="w-full rounded-2xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="mb-1 block text-sm font-medium">Image</span>
                    <span className="flex items-center gap-2 rounded-2xl border border-border bg-background/70 px-3 py-2.5 text-sm text-muted-foreground cursor-pointer hover:border-primary/40">
                      <ImageUp className="h-4 w-4" />
                      {editingItem?.image ? "Change photo" : "Upload photo"}
                      <input name="image" type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" />
                    </span>
                  </label>

                  <div className="border-t border-border/40 pt-3">
                    <span className="mb-3 block text-sm font-bold">Pickup Location</span>
                    <div className="space-y-3">
                      <label className="block">
                        <span className="mb-1 block text-sm font-medium">Country</span>
                        <select
                          value={pickupCountry}
                          onChange={(e) => {
                            setPickupCountry(e.target.value);
                            setPickupCity(e.target.value === "Nepal" ? "Kathmandu" : "Kuala Lumpur");
                            setPickupLat(null);
                            setPickupLng(null);
                          }}
                          className="w-full rounded-2xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                        >
                          <option value="Nepal">Nepal</option>
                          <option value="Malaysia">Malaysia</option>
                        </select>
                      </label>

                      <LocationPicker
                        country={pickupCountry}
                        latitude={pickupLat}
                        longitude={pickupLng}
                        onLocationChange={(lat, lng) => { setPickupLat(lat); setPickupLng(lng); }}
                      />

                      <label className="block">
                        <span className="mb-1 block text-sm font-medium">Pickup address</span>
                        <input
                          value={pickupAddress}
                          onChange={(e) => setPickupAddress(e.target.value)}
                          placeholder="e.g. Baneshwor, Kathmandu"
                          className="w-full rounded-2xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                        />
                      </label>

                      <input type="hidden" name="pickupLocation" value={JSON.stringify({ latitude: pickupLat, longitude: pickupLng, address: pickupAddress, country: pickupCountry, city: pickupCity })} />
                    </div>
                  </div>

                  {!editId && (
                    <label className="flex items-center gap-2 text-sm">
                      <input name="shareToCommunity" type="checkbox" className="accent-primary" />
                      Share to community feed after publishing
                    </label>
                  )}
                </fieldset>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="flex-1 rounded-2xl border border-border px-5 py-2.5 text-sm font-semibold hover:bg-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-2xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:shadow-lift"
                  >
                    {editId ? "Save changes" : "Publish Donation"}
                  </button>
                </div>
              </form>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {detailItem && (
          <motion.div
            className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm grid place-items-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDetailClose}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="glass-card w-full max-w-lg rounded-3xl overflow-hidden"
            >
              <div className="relative h-56 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center overflow-hidden">
                {detailItem.image ? (
                  <img src={detailItem.image} alt={detailItem.foodName} className="h-full w-full object-cover" />
                ) : (
                  <HeartHandshake className="h-24 w-24 text-emerald-400/40" />
                )}
                <button
                  onClick={handleDetailClose}
                  className="absolute top-4 right-4 grid h-9 w-9 place-items-center rounded-full bg-black/20 text-white backdrop-blur-sm hover:bg-black/40"
                >
                  <X className="h-4 w-4" />
                </button>
                <span className={`absolute top-4 left-4 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGES[detailItem.status]}`}>
                  {detailItem.status}
                </span>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold">{detailItem.foodName}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Donated by {detailItem.donor.name}
                  </p>
                </div>

                {detailItem.description && (
                  <p className="text-sm">{detailItem.description}</p>
                )}

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Quantity</span>
                    <p className="font-semibold">{detailItem.quantity} {detailItem.unit}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Category</span>
                    <p className="font-semibold">{detailItem.category}</p>
                  </div>
                  {detailItem.pickupLocation?.city && (
                    <div>
                      <span className="text-muted-foreground">Pickup at</span>
                      <p className="font-semibold">{detailItem.pickupLocation.city}{detailItem.pickupLocation.country ? `, ${detailItem.pickupLocation.country}` : ""}</p>
                    </div>
                  )}
                  {detailItem.pickupDate && (
                    <div>
                      <span className="text-muted-foreground">Pickup date</span>
                      <p className="font-semibold">{detailItem.pickupDate}</p>
                    </div>
                  )}
                  {detailItem.pickupTime && (
                    <div>
                      <span className="text-muted-foreground">Pickup time</span>
                      <p className="font-semibold">{detailItem.pickupTime}</p>
                    </div>
                  )}
                  {detailItem.expirationDate && (
                    <div>
                      <span className="text-muted-foreground">Expires</span>
                      <p className="font-semibold text-red-500/80">{detailItem.expirationDate}</p>
                    </div>
                  )}
                  {detailItem.deliveryMethod && (
                  <div>
                    <span className="text-muted-foreground">Delivery</span>
                    <p className="font-semibold">{detailItem.deliveryMethod === "self_pickup" ? "Self Pickup" : "Third-party"}</p>
                  </div>
                  )}
                </div>

                {(detailItem.pickupLocation?.address) && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Pickup address</span>
                    <p className="font-semibold">
                      {detailItem.pickupLocation.address}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleDetailClose}
                    className="flex-1 rounded-2xl border border-border px-5 py-2.5 text-sm font-semibold hover:bg-secondary"
                  >
                    Close
                  </button>
                  {detailItem.status === "Available" && !detailItem.isOwner && (
                    <button
                      onClick={() => handleClaim(detailItem.id)}
                      className="flex-1 rounded-2xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:shadow-lift"
                    >
                      Claim Donation
                    </button>
                  )}
                  {(detailItem.status === "Reserved" || detailItem.status === "Completed") && (detailItem.isOwner || detailItem.isClaimant) && (
                    <button
                      onClick={() => handleOpenFoodConnect(detailItem.id)}
                      className="flex-1 rounded-2xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:shadow-lift"
                    >
                      Open Food Connect
                    </button>
                  )}
                  {detailItem.status === "Available" && detailItem.isOwner && (
                    <span className="flex-1 text-center text-sm text-muted-foreground">Your donation</span>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
