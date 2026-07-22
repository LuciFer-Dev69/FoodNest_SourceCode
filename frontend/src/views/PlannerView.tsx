import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import {
  Sparkles, Save, ChevronDown, ChevronLeft, ChevronRight, Plus, Trash2, Copy, RotateCcw,
  Check, SkipForward, X, Heart, Search, ShoppingCart, Clock, Globe,
  BookMarked, LayoutGrid, List, ArrowUpDown, AlertTriangle,
} from "lucide-react";
import { PageHeader, Panel } from "@/components/app/primitives";
import type { PlannerController } from "@/controllers/planner.controller";
import { FILTER_OPTIONS } from "@/models/planner.model";

const STATUS_ICONS = {
  planned: "",
  completed: "✓",
  skipped: "→",
  cancelled: "✕",
};

const STATUS_BG = {
  planned: "",
  completed: "bg-green-500/10 border-green-500/30",
  skipped: "bg-amber-500/10 border-amber-500/30",
  cancelled: "bg-red-500/10 border-red-500/30",
};

function QuickActions({ onEdit, onDuplicate, onDelete, onMove, onFavorite, isFav }) {
  return (
    <div className="absolute right-1 top-1 z-10 flex gap-0.5">
      <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="grid h-6 w-6 place-items-center rounded-lg bg-background/80 text-muted-foreground hover:bg-secondary" title="Edit"><Search className="h-3 w-3" /></button>
      <button onClick={(e) => { e.stopPropagation(); onDuplicate(); }} className="grid h-6 w-6 place-items-center rounded-lg bg-background/80 text-muted-foreground hover:bg-secondary" title="Duplicate"><Copy className="h-3 w-3" /></button>
      <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="grid h-6 w-6 place-items-center rounded-lg bg-background/80 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" title="Delete"><Trash2 className="h-3 w-3" /></button>
      <button onClick={(e) => { e.stopPropagation(); onFavorite(); }} className={`grid h-6 w-6 place-items-center rounded-lg bg-background/80 hover:bg-secondary ${isFav ? "text-red-500" : "text-muted-foreground"}`} title="Favorite"><Heart className={`h-3 w-3 ${isFav ? "fill-current" : ""}`} /></button>
    </div>
  );
}

function MealCard({ slotKey, meal, onEdit, onDuplicate, onDelete, onStatusChange, onFavorite, isFav, onMoveTo, onDragStart }) {
  const [menuOpen, setMenuOpen] = useState(false);

  if (!meal || !meal.name) return null;

  return (
    <motion.div
      layout
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", slotKey);
        e.dataTransfer.effectAllowed = "move";
        onDragStart?.(slotKey);
      }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`relative flex h-full flex-col rounded-xl bg-gradient-emerald p-2 text-white ${STATUS_BG[meal.status]} border ${meal.status !== "planned" ? "border-current" : "border-transparent"}`}
    >
      <QuickActions
        onEdit={onEdit}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        onFavorite={onFavorite}
        isFav={isFav}
      />
      <span className="text-xl">{meal.emoji}</span>
      <span className="mt-auto text-[11px] font-semibold leading-tight">{meal.name}</span>
      <div className="mt-1 flex items-center gap-1">
        {meal.status !== "planned" && (
          <span className="text-[10px] opacity-80">{STATUS_ICONS[meal.status]} {meal.status}</span>
        )}
      </div>
      <div className="mt-1 flex gap-1">
        {["completed", "skipped", "cancelled"].map((s) => (
          s !== meal.status && (
            <button
              key={s}
              onClick={(e) => { e.stopPropagation(); onStatusChange(s as any); }}
              className={`rounded px-1 py-0.5 text-[9px] ${
                s === "completed" ? "bg-green-500/30" : s === "skipped" ? "bg-amber-500/30" : "bg-red-500/30"
              } hover:opacity-80`}
            >
              {STATUS_ICONS[s]}
            </button>
          )
        ))}
      </div>
    </motion.div>
  );
}

function EmptySlot({ slotKey, onAdd }) {
  return (
    <button
      onClick={() => onAdd(slotKey)}
      className="grid h-full w-full place-items-center text-[11px] text-muted-foreground hover:text-foreground"
    >
      <Plus className="h-4 w-4" />
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "planned") return null;
  const colors = {
    completed: "bg-green-500/15 text-green-600",
    skipped: "bg-amber-500/15 text-amber-600",
    cancelled: "bg-red-500/15 text-red-600",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${colors[status] || ""}`}>
      {STATUS_ICONS[status]} {status}
    </span>
  );
}

export function PlannerView({
  plan, loading, saving,
  currentPlanName,
  savedPlans, plansPage, plansTotalPages, plansLoading,
  suggestions, suggestionsLoading,
  favorites, favoritesLoading,
  summary,
  shoppingList, shoppingLoading,
  searchQuery, setSearchQuery,
  searchFilter, setSearchFilter,
  searchResults, searching,
  editingSlot, setEditingSlot,
  editName, setEditName,
  editEmoji, setEditEmoji,
  showSavedPlans, setShowSavedPlans,
  showShoppingList, setShowShoppingList,
  showFavorites, setShowFavorites,
  quickAddOpen, setQuickAddOpen,

  days, slots,
  savePlan,
  loadSavedPlans,
  loadPlanById,
  deleteSavedPlan,
  duplicateSavedPlan,
  handleAddMeal,
  handleEditMeal,
  handleSaveEdit,
  handleDeleteMeal,
  clearAllMeals,
  handleDuplicateMeal,
  handleClearMeal,
  handleMoveMeal,
  handleStatusChange,
  generateRandomPlan,
  loadShoppingList,
  toggleFavorite,
  searchRecipes,
  isFavorite,
}: PlannerController) {
  const [moveFrom, setMoveFrom] = useState<string | null>(null);
  const [moveTo, setMoveTo] = useState<string | null>(null);
  const [showMovePicker, setShowMovePicker] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showEmptyGrid, setShowEmptyGrid] = useState(false);
  const [pendingReplace, setPendingReplace] = useState<{ slotKey: string; name: string; emoji: string } | null>(null);

  function getSlot(slotKey: string) {
    return plan.find((m) => m.slotKey === slotKey);
  }

  function onAddMealWithCheck(slotKey: string, meal: { name: string; emoji: string }) {
    const existing = getSlot(slotKey);
    if (existing?.name) {
      setPendingReplace({ slotKey, ...meal });
      return;
    }
    handleAddMeal(slotKey, meal);
  }

  function getSlot(slotKey: string) {
    return plan.find((m) => m.slotKey === slotKey);
  }

  function handleOpenMove(slotKey: string) {
    setMoveFrom(slotKey);
    setShowMovePicker(true);
  }

  function handleConfirmMove(targetKey: string) {
    if (moveFrom && moveFrom !== targetKey) {
      handleMoveMeal(moveFrom, targetKey);
    }
    setShowMovePicker(false);
    setMoveFrom(null);
  }

  function handleQuickSearch(q: string) {
    setSearchQuery(q);
    if (q.trim().length >= 1 || searchFilter !== "All") {
      searchRecipes(q, searchFilter);
    } else {
      searchRecipes("", "All");
    }
  }

  function handleFilterChange(f: string) {
    setSearchFilter(f);
    searchRecipes(searchQuery, f);
  }

  const filteredSearchResults = searchResults;
  const plannedCount = plan.filter((m) => m.name).length;
  const emptyCount = 21 - plannedCount;

  if (loading) {
    return (
      <>
        <PageHeader title="Meal planner" subtitle="Plan your weekly meals." />
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <Panel className="overflow-x-auto p-4">
            <div className="grid min-w-[820px] grid-cols-[100px_repeat(7,1fr)] gap-2">
              <div></div>
              {days.map((d) => (
                <div key={d} className="h-6 rounded-2xl bg-secondary/50 animate-pulse" />
              ))}
              {slots.map((s) => (
                <div key={s} className="contents">
                  <div className="h-6 rounded-2xl bg-secondary/30" />
                  {days.map((d) => (
                    <div key={`${d}-${s}`} className="min-h-[88px] rounded-2xl bg-secondary/20 animate-pulse" />
                  ))}
                </div>
              ))}
            </div>
          </Panel>
          <Panel>
            <div className="h-6 w-32 rounded bg-secondary/50 animate-pulse mb-4" />
            <div className="space-y-2">
              {[1,2,3,4].map((i) => (
                <div key={i} className="h-14 rounded-2xl bg-secondary/30 animate-pulse" />
              ))}
            </div>
          </Panel>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Meal planner"
        subtitle={currentPlanName ? `Current: ${currentPlanName}` : "Plan your weekly meals"}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => { loadShoppingList(); setShowShoppingList(true); }}
              className="inline-flex items-center gap-2 rounded-full bg-background/70 px-4 py-2 text-sm font-semibold text-foreground shadow-soft hover:shadow-lift border border-border"
            >
              <ShoppingCart className="h-4 w-4" /> Shopping List
            </button>
            <button
              onClick={() => { loadSavedPlans(); setShowSavedPlans(true); }}
              className="inline-flex items-center gap-2 rounded-full bg-background/70 px-4 py-2 text-sm font-semibold text-foreground shadow-soft hover:shadow-lift border border-border"
            >
              <BookMarked className="h-4 w-4" /> Saved Plans
            </button>
            <button
              onClick={generateRandomPlan}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-4 py-2 text-sm font-semibold text-white shadow-soft hover:shadow-lift"
            >
              <Sparkles className="h-4 w-4" /> Generate Random Plan
            </button>
            <button
              onClick={() => setShowClearConfirm(true)}
              className="inline-flex items-center gap-2 rounded-full border border-destructive/30 px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/5"
            >
              <Trash2 className="h-4 w-4" /> Clear All
            </button>
            <button
              onClick={savePlan}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-soft hover:shadow-lift disabled:opacity-50"
            >
              <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save"}
            </button>
          </div>
        }
      />

      {plannedCount === 0 && !loading && !showEmptyGrid ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 text-emerald-500 mb-5">
            <CalendarPlus className="h-12 w-12" />
          </div>
          <h3 className="text-xl font-bold">No meal plan created yet</h3>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Create a meal plan to organize your weekly meals.
          </p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={generateRandomPlan}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-6 py-3 text-sm font-semibold text-white shadow-soft hover:shadow-lift"
            >
              <Sparkles className="h-4 w-4" /> Generate Random Plan
            </button>
            <button
              onClick={() => setShowEmptyGrid(true)}
              className="inline-flex items-center gap-2 rounded-full bg-background/70 px-6 py-3 text-sm font-semibold text-foreground shadow-soft hover:shadow-lift border border-border"
            >
              <Plus className="h-4 w-4" /> Create Manually
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <Panel className="overflow-x-auto p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{plannedCount}/21 meals planned</span>
                {summary && (
                  <>
                    <span>•</span>
                    <span className="text-green-500">{summary.mealsCompleted} completed</span>
                    <span>•</span>
                    <span className="text-amber-500">{summary.mealsSkipped} skipped</span>
                    <span>•</span>
                    <span>{summary.recipesUsed} recipes</span>
                  </>
                )}
              </div>
            </div>
            <div className="grid min-w-[820px] grid-cols-[100px_repeat(7,1fr)] gap-2">
              <div></div>
              {days.map((d) => (
                <div key={d} className="rounded-2xl bg-background/60 p-2 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">{d}</div>
              ))}
              {slots.map((s) => (
                <div key={s} className="contents">
                  <div className="flex items-center text-xs font-bold uppercase tracking-wider text-muted-foreground">{s}</div>
                  {days.map((d) => {
                    const key = `${d}-${s}`;
                    const meal = getSlot(key);
                    const isEmpty = !meal || !meal.name;

                    return (
                      <div
                        key={key}
                        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const src = e.dataTransfer.getData("text/plain");
                          if (src && src !== key) handleMoveMeal(src, key);
                        }}
                        className={`relative min-h-[100px] rounded-2xl border border-dashed p-2 transition ${
                          moveFrom === key ? "border-primary bg-primary/10" :
                          moveTo === key ? "border-emerald-500 bg-emerald-500/10" :
                          isEmpty ? "border-border bg-background/40" : "border-border/60 bg-background/60"
                        } hover:border-primary/60`}
                      >
                        {isEmpty ? (
                          <EmptySlot slotKey={key} onAdd={(sk) => {
                            setQuickAddOpen(sk);
                          }} />
                        ) : (
                          <MealCard
                            slotKey={key}
                            meal={meal}
                            isFav={isFavorite(meal.name)}
                            onEdit={() => handleEditMeal(key)}
                            onDuplicate={() => handleDuplicateMeal(key)}
                            onDelete={() => handleDeleteMeal(key)}
                            onStatusChange={(s) => handleStatusChange(key, s)}
                            onFavorite={() => toggleFavorite(meal.name, meal.emoji)}
                            onMoveTo={() => handleOpenMove(key)}
                          />
                        )}
                        {showMovePicker && moveFrom !== key && !isEmpty && (
                          <button
                            onClick={() => handleConfirmMove(key)}
                            className="absolute inset-0 z-20 grid place-items-center rounded-2xl bg-primary/20 text-xs font-bold text-primary opacity-0 hover:opacity-100"
                          >
                            Move here
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </Panel>

          <div className="space-y-4">
            {/* Search & Filter */}
            <Panel>
              <div className="flex items-center gap-2 rounded-2xl border border-border bg-background/70 px-3 py-2">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  value={searchQuery}
                  onChange={(e) => handleQuickSearch(e.target.value)}
                  placeholder="Search recipes..."
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {FILTER_OPTIONS.map((f) => (
                  <button
                    key={f}
                    onClick={() => handleFilterChange(f)}
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition ${
                      searchFilter === f
                        ? "bg-gradient-primary text-white"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              {searching && (
                <div className="mt-2 text-xs text-muted-foreground">Searching...</div>
              )}
              {filteredSearchResults.length > 0 && (
                <div className="mt-3 space-y-1 max-h-48 overflow-y-auto">
                  {filteredSearchResults.map((r) => {
                    const slot = plan.find((m) => m.name === r.name);
                    const isFav = isFavorite(r.name);
                    return (
                      <div key={r.name} className="flex items-center gap-2 rounded-2xl bg-background/50 p-2 text-sm hover:bg-background/80">
                        <span className="text-lg">{r.emoji}</span>
                        <span className="flex-1 font-semibold">{r.name}</span>
                        <button
                          onClick={() => toggleFavorite(r.name, r.emoji || "🍽️")}
                          className={`grid h-7 w-7 place-items-center rounded-lg ${isFav ? "text-red-500" : "text-muted-foreground"} hover:bg-secondary`}
                        >
                          <Heart className={`h-3.5 w-3.5 ${isFav ? "fill-current" : ""}`} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </Panel>

            {/* Smart Suggestions */}
            <Panel>
              <h3 className="text-sm font-bold">Smart suggestions</h3>
              <p className="text-xs text-muted-foreground">Based on your inventory</p>
              {suggestionsLoading ? (
                <div className="mt-3 space-y-2">
                  {[1,2,3].map((i) => (
                    <div key={i} className="h-14 rounded-2xl bg-secondary/30 animate-pulse" />
                  ))}
                </div>
              ) : suggestions.length === 0 ? (
                <div className="mt-4 text-center text-xs text-muted-foreground">
                  <p>No recipe suggestions available.</p>
                  <p>Add inventory items to receive meal recommendations.</p>
                </div>
              ) : (
                <div className="mt-3 space-y-2 max-h-80 overflow-y-auto">
                  {suggestions.map((s) => (
                    <div
                      key={s.name}
                      className="rounded-2xl bg-background/70 p-3 text-sm hover:bg-background/90 cursor-pointer transition"
                      onClick={() => {
                        if (quickAddOpen) {
                          onAddMealWithCheck(quickAddOpen, { name: s.name, emoji: s.emoji });
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-emerald text-base text-white">{s.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{s.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {s.availableCount}/{s.ingredientsTotal} ingredients
                            {s.missingCount > 0 && ` · Missing: ${s.itemsMissing.slice(0, 2).join(", ")}${s.missingCount > 2 ? ` +${s.missingCount - 2}` : ""}`}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-muted-foreground block">{s.difficulty}</span>
                          <span className="text-[10px] text-muted-foreground">{s.time}</span>
                        </div>
                      </div>
                      {s.availableCount > 0 && (
                        <div className="mt-1.5 flex items-center gap-1">
                          <span className="text-[10px] text-green-600">✓ {s.availableCount} ingredient{s.availableCount !== 1 ? "s" : ""} available</span>
                          {s.missingCount > 0 && (
                            <span className="text-[10px] text-amber-600">· Missing {s.missingCount}</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            {/* Favorites */}
            <Panel>
              <button
                onClick={() => setShowFavorites(!showFavorites)}
                className="flex w-full items-center justify-between"
              >
                <h3 className="text-sm font-bold">Favorite Recipes</h3>
                <span className="text-xs text-muted-foreground">{favorites.length}</span>
              </button>
              {showFavorites && (
                favoritesLoading ? (
                  <div className="mt-3 space-y-2">
                    {[1,2].map((i) => (
                      <div key={i} className="h-10 rounded-2xl bg-secondary/30 animate-pulse" />
                    ))}
                  </div>
                ) : favorites.length === 0 ? (
                  <p className="mt-3 text-xs text-muted-foreground">No favorites yet</p>
                ) : (
                  <div className="mt-3 space-y-1 max-h-40 overflow-y-auto">
                    {favorites.map((f) => (
                      <div key={f.id} className="flex items-center gap-2 rounded-2xl bg-background/50 p-2 text-sm">
                        <span className="text-lg">{f.emoji}</span>
                        <span className="flex-1 font-semibold truncate">{f.name}</span>
                        <button
                          onClick={() => toggleFavorite(f.name, f.emoji)}
                          className="grid h-7 w-7 place-items-center rounded-lg text-red-500 hover:bg-secondary"
                        >
                          <Heart className="h-3.5 w-3.5 fill-current" />
                        </button>
                      </div>
                    ))}
                  </div>
                )
              )}
            </Panel>
          </div>
        </div>
      )}

      {/* Edit Meal Modal */}
      <AnimatePresence>
        {editingSlot && (
          <motion.div
            className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditingSlot(null)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-md glass-card rounded-3xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Edit meal — {editingSlot}</h3>
                <button onClick={() => setEditingSlot(null)} className="grid h-8 w-8 place-items-center rounded-xl hover:bg-secondary"><X className="h-4 w-4" /></button>
              </div>
              <div className="space-y-3">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium">Meal name</span>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="e.g. Tomato Soup"
                    className="w-full rounded-2xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium">Emoji</span>
                  <input
                    value={editEmoji}
                    onChange={(e) => setEditEmoji(e.target.value)}
                    placeholder="🍲"
                    className="w-full rounded-2xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => { handleClearMeal(editingSlot); setEditingSlot(null); }}
                    className="flex-1 rounded-2xl border border-border px-4 py-2.5 text-sm font-semibold hover:bg-secondary"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => { handleDeleteMeal(editingSlot); setEditingSlot(null); }}
                    className="flex-1 rounded-2xl border border-destructive/30 px-4 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/10"
                  >
                    Delete
                  </button>
                </div>
                <button
                  onClick={handleSaveEdit}
                  className="w-full rounded-2xl bg-gradient-primary px-5 py-3 text-sm font-semibold text-white shadow-soft hover:shadow-lift"
                >
                  Save changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Add Modal */}
      <AnimatePresence>
        {quickAddOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setQuickAddOpen(null)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-md glass-card rounded-3xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Add meal — {quickAddOpen}</h3>
                <button onClick={() => setQuickAddOpen(null)} className="grid h-8 w-8 place-items-center rounded-xl hover:bg-secondary"><X className="h-4 w-4" /></button>
              </div>

              <QuickAddMakeOwn onAdd={(name, emoji) => onAddMealWithCheck(quickAddOpen, { name, emoji })} />

              <div className="flex items-center gap-2 rounded-2xl border border-border bg-background/70 px-3 py-2 mb-3">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  placeholder="Type a recipe name..."
                  className="w-full bg-transparent text-sm outline-none"
                  onChange={(e) => handleQuickSearch(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {FILTER_OPTIONS.slice(0, 6).map((f) => (
                  <button
                    key={f}
                    onClick={() => handleFilterChange(f)}
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition ${
                      searchFilter === f ? "bg-gradient-primary text-white" : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {searchResults.length === 0 && suggestions.length > 0 ? (
                  suggestions.slice(0, 8).map((s) => (
                    <button
                      key={s.name}
                      onClick={() => onAddMealWithCheck(quickAddOpen, { name: s.name, emoji: s.emoji })}
                      className="flex w-full items-center gap-2 rounded-2xl bg-background/50 p-2 text-sm hover:bg-background/80 text-left"
                    >
                      <span className="text-lg">{s.emoji}</span>
                      <span className="flex-1 font-semibold">{s.name}</span>
                      <span className="text-[10px] text-muted-foreground">{s.availableCount}/{s.ingredientsTotal}</span>
                    </button>
                  ))
                ) : (
                  searchResults.map((r) => (
                    <button
                      key={r.name}
                      onClick={() => onAddMealWithCheck(quickAddOpen, { name: r.name, emoji: r.emoji || "🍽️" })}
                      className="flex w-full items-center gap-2 rounded-2xl bg-background/50 p-2 text-sm hover:bg-background/80 text-left"
                    >
                      <span className="text-lg">{r.emoji}</span>
                      <span className="flex-1 font-semibold">{r.name}</span>
                    </button>
                  ))
                )}
                {searchResults.length === 0 && searchQuery && (
                  <button
                    onClick={() => onAddMealWithCheck(quickAddOpen, { name: searchQuery.trim(), emoji: "🍽️" })}
                    className="flex w-full items-center gap-2 rounded-2xl bg-primary/10 p-2 text-sm hover:bg-primary/20 text-left"
                  >
                    <Plus className="h-4 w-4 text-primary" />
                    <span className="font-semibold">Add "{searchQuery.trim()}"</span>
                  </button>
                )}
              </div>

              {searchResults.length === 0 && !searchQuery && (
                <>
                  <CategorySection
                    title="🌿 Vegetarian"
                    items={VEGETARIAN_ITEMS}
                    onSelect={(name, emoji) => onAddMealWithCheck(quickAddOpen, { name, emoji })}
                  />
                  <CategorySection
                    title="💪 Healthy"
                    items={HEALTHY_ITEMS}
                    onSelect={(name, emoji) => onAddMealWithCheck(quickAddOpen, { name, emoji })}
                  />
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear All Confirmation */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 backdrop-blur-sm"
            onClick={() => setShowClearConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="glass-card mx-4 max-w-sm rounded-3xl p-6 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <AlertTriangle className="mx-auto h-10 w-10 text-destructive" />
              <h3 className="mt-4 text-lg font-bold">Clear all meals?</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                This will remove {plannedCount} meal{plannedCount !== 1 ? "s" : ""} from this week's plan.
                You can undo this by not saving before leaving.
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { clearAllMeals(); setShowClearConfirm(false); }}
                  className="rounded-full bg-destructive px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Yes, clear all
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Replace Confirmation */}
      <AnimatePresence>
        {pendingReplace && (() => {
          const existing = getSlot(pendingReplace.slotKey);
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 backdrop-blur-sm"
              onClick={() => setPendingReplace(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="glass-card mx-4 max-w-sm rounded-3xl p-6 text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
                <h3 className="mt-4 text-lg font-bold">Replace existing meal?</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  This slot already has <strong>{existing?.name || "a meal"}</strong>. Replace it?
                </p>
                <div className="mt-6 flex items-center justify-center gap-3">
                  <button
                    onClick={() => setPendingReplace(null)}
                    className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleAddMeal(pendingReplace.slotKey, { name: pendingReplace.name, emoji: pendingReplace.emoji });
                      setPendingReplace(null);
                    }}
                    className="rounded-full bg-destructive px-5 py-2.5 text-sm font-semibold text-white"
                  >
                    Replace
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Saved Plans Modal */}
      <AnimatePresence>
        {showSavedPlans && (
          <motion.div
            className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSavedPlans(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ x: 480 }}
              animate={{ x: 0 }}
              exit={{ x: 480 }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              className="fixed right-3 top-3 bottom-3 w-[92vw] max-w-md glass-card rounded-3xl p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Saved Meal Plans</h3>
                <button onClick={() => setShowSavedPlans(false)} className="grid h-9 w-9 place-items-center rounded-xl hover:bg-secondary"><X className="h-4 w-4" /></button>
              </div>

              {plansLoading ? (
                <div className="space-y-3">
                  {[1,2,3].map((i) => (
                    <div key={i} className="h-20 rounded-3xl bg-secondary/30 animate-pulse" />
                  ))}
                </div>
              ) : savedPlans.length === 0 ? (
                <div className="text-center py-12 text-sm text-muted-foreground">
                  <p>No saved meal plans yet.</p>
                  <p className="mt-1">Create and save a plan to see it here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedPlans.map((sp) => {
                    const mealCount = sp.meals.filter((m) => m.name).length;
                    return (
                      <div key={sp.id} className="rounded-3xl bg-background/50 p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold">{sp.name || "Week"}</h4>
                            <p className="text-xs text-muted-foreground">
                              {mealCount} meals · {new Date(sp.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => { loadPlanById(sp.id); setShowSavedPlans(false); }}
                              className="rounded-full bg-gradient-primary px-3 py-1 text-xs font-semibold text-white"
                            >
                              Load
                            </button>
                            <button
                              onClick={() => duplicateSavedPlan(sp.id)}
                              className="rounded-full bg-background/70 px-3 py-1 text-xs font-semibold border border-border hover:bg-secondary"
                            >
                              Duplicate
                            </button>
                            <button
                              onClick={() => deleteSavedPlan(sp.id)}
                              className="rounded-full bg-background/70 px-3 py-1 text-xs font-semibold text-destructive border border-destructive/30 hover:bg-destructive/10"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {sp.meals.filter((m) => m.name).slice(0, 6).map((m) => (
                            <span key={m.slotKey} className="rounded-full bg-background/80 px-2 py-0.5 text-[10px]">
                              {m.emoji} {m.name}
                            </span>
                          ))}
                          {mealCount > 6 && (
                            <span className="rounded-full bg-background/80 px-2 py-0.5 text-[10px] text-muted-foreground">
                              +{mealCount - 6} more
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {plansTotalPages > 1 && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  <button
                    disabled={plansPage <= 1}
                    onClick={() => loadSavedPlans(plansPage - 1)}
                    className="grid h-8 w-8 place-items-center rounded-xl hover:bg-secondary disabled:opacity-30"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-xs text-muted-foreground">{plansPage} / {plansTotalPages}</span>
                  <button
                    disabled={plansPage >= plansTotalPages}
                    onClick={() => loadSavedPlans(plansPage + 1)}
                    className="grid h-8 w-8 place-items-center rounded-xl hover:bg-secondary disabled:opacity-30"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shopping List Modal */}
      <AnimatePresence>
        {showShoppingList && (
          <motion.div
            className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowShoppingList(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ x: 480 }}
              animate={{ x: 0 }}
              exit={{ x: 480 }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              className="fixed right-3 top-3 bottom-3 w-[92vw] max-w-md glass-card rounded-3xl p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Shopping List</h3>
                <button onClick={() => setShowShoppingList(false)} className="grid h-9 w-9 place-items-center rounded-xl hover:bg-secondary"><X className="h-4 w-4" /></button>
              </div>
              {shoppingLoading ? (
                <div className="space-y-2">
                  {[1,2,3,4,5].map((i) => (
                    <div key={i} className="h-10 rounded-2xl bg-secondary/30 animate-pulse" />
                  ))}
                </div>
              ) : shoppingList.length === 0 ? (
                <div className="text-center py-12 text-sm text-muted-foreground">
                  <p>Your shopping list is empty.</p>
                  <p className="mt-1">All required ingredients are in your inventory!</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {shoppingList.map((item) => (
                    <div key={item.name} className="flex items-center justify-between rounded-2xl bg-background/50 px-4 py-3 text-sm">
                      <span className="font-semibold">{item.name}</span>
                      <span className="text-muted-foreground">x{item.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Move Meal Picker */}
      <AnimatePresence>
        {showMovePicker && (
          <motion.div
            className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setShowMovePicker(false); setMoveFrom(null); }}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-lg glass-card rounded-3xl p-6"
            >
              <h3 className="text-lg font-bold mb-3">Move meal to...</h3>
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-muted-foreground mb-1">
                <div></div>
                {days.map((d) => <div key={d}>{d}</div>)}
              </div>
              {slots.map((s) => (
                <div key={s} className="grid grid-cols-7 gap-1 mb-1">
                  <div className="text-[10px] font-bold text-muted-foreground flex items-center">{s}</div>
                  {days.map((d) => {
                    const key = `${d}-${s}`;
                    const meal = getSlot(key);
                    return (
                      <button
                        key={key}
                        onClick={() => handleConfirmMove(key)}
                        disabled={key === moveFrom}
                        className={`min-h-[40px] rounded-xl text-[10px] p-1 transition ${
                          key === moveFrom
                            ? "bg-primary/20 text-primary"
                            : meal?.name
                              ? "bg-background/70 hover:bg-primary/20"
                              : "bg-background/40 border border-dashed border-border hover:border-primary/60"
                        } disabled:opacity-50`}
                      >
                        {meal?.name ? (
                          <span className="truncate block">{meal.emoji} {meal.name}</span>
                        ) : (
                          <Plus className="h-3 w-3 mx-auto text-muted-foreground" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const VEGETARIAN_ITEMS = [
  { name: "Garden Salad", emoji: "🥗" },
  { name: "Veggie Pasta", emoji: "🍝" },
  { name: "Lentil Soup", emoji: "🫘" },
  { name: "Broccoli Stir-fry", emoji: "🥦" },
  { name: "Falafel Wrap", emoji: "🧆" },
  { name: "Vegetable Curry", emoji: "🍛" },
  { name: "Stuffed Peppers", emoji: "🫔" },
  { name: "Veggie Dumplings", emoji: "🥟" },
  { name: "Mushroom Risotto", emoji: "🍄" },
  { name: "Bean Burrito", emoji: "🌯" },
];

const HEALTHY_ITEMS = [
  { name: "Avocado Toast", emoji: "🥑" },
  { name: "Berry Smoothie", emoji: "🫐" },
  { name: "Kale Caesar", emoji: "🥬" },
  { name: "Grilled Chicken", emoji: "🥩" },
  { name: "Quinoa Bowl", emoji: "🥣" },
  { name: "Salmon Plate", emoji: "🐟" },
  { name: "Rainbow Salad", emoji: "🥕" },
  { name: "Brown Rice Bowl", emoji: "🍚" },
  { name: "Almond Crunch", emoji: "🥜" },
  { name: "Zucchini Noodles", emoji: "🥒" },
];

const QUICK_EMOJIS = ["🍽️", "🥗", "🍝", "🍛", "🌯", "🥪", "🥘", "🍲", "🥣", "🥗", "🥑", "🥬", "🥩", "🐟", "🫐", "🥟", "🧆", "🍄", "🥦", "🫘"];

function QuickAddMakeOwn({ onAdd }: { onAdd: (name: string, emoji: string) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🍽️");

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd(name.trim(), emoji);
    setName("");
    setEmoji("🍽️");
    setOpen(false);
  };

  return (
    <div className="mb-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 rounded-2xl bg-secondary/50 px-3 py-2 text-sm font-semibold hover:bg-secondary/80"
      >
        <ChevronDown className={`h-4 w-4 transition ${open ? "" : "-rotate-90"}`} />
        Make Your Own Recipe
      </button>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="mt-2 space-y-2 overflow-hidden"
        >
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-background/70 px-3 py-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Recipe name"
              className="w-full bg-transparent text-sm outline-none"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              value={emoji}
              onChange={(e) => setEmoji(e.target.value || "🍽️")}
              className="w-10 rounded-xl border border-border bg-background/70 px-2 py-2 text-center text-lg outline-none"
            />
            <span className="text-[11px] text-muted-foreground">Pick an emoji</span>
            <button
              onClick={handleAdd}
              disabled={!name.trim()}
              className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-gradient-primary px-4 py-2 text-xs font-semibold text-white shadow-soft hover:shadow-lift disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" /> Add to plan
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {QUICK_EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={`rounded-lg px-1.5 py-1 text-base transition hover:bg-secondary ${emoji === e ? "bg-secondary ring-2 ring-primary/40" : ""}`}
              >
                {e}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function CategorySection({ title, items, onSelect }: { title: string; items: { name: string; emoji: string }[]; onSelect: (name: string, emoji: string) => void }) {
  return (
    <div className="mt-3">
      <p className="mb-1.5 text-xs font-semibold text-muted-foreground">{title}</p>
      <div className="grid grid-cols-5 gap-1.5">
        {items.map((item) => (
          <button
            key={item.name}
            onClick={() => onSelect(item.name, item.emoji)}
            className="flex flex-col items-center gap-0.5 rounded-xl bg-background/50 p-1.5 text-center hover:bg-background/80 transition"
          >
            <span className="text-lg">{item.emoji}</span>
            <span className="text-[9px] font-medium leading-tight text-foreground">{item.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function CalendarPlus(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /><path d="M10 16h4" /><path d="M12 14v4" />
    </svg>
  );
}
