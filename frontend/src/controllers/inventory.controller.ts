import { useState, useEffect, useMemo, useCallback } from "react";
import { Item, CATEGORIES } from "@/models/inventory.model";
import { api } from "@/lib/api";
import { toast } from "sonner";

export function useInventoryController() {
  const [q, setQ] = useState("");
  const [view, setView] = useState<"list" | "grid">("grid");
  const [cat, setCat] = useState<string>("All");
  const [loc, setLoc] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sort, setSort] = useState("-createdAt");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const cats = CATEGORIES;

  const editingItem = useMemo(
    () => (editId ? items.find((i) => i.id === editId) ?? null : null),
    [editId, items],
  );

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (q) params.set("search", q);
      if (cat !== "All") params.set("category", cat);
      if (loc !== "All") params.set("storageLocation", loc);
      if (statusFilter !== "All") params.set("status", statusFilter);
      params.set("sort", sort);
      params.set("limit", "200");

      const data = await api.get<{ items: Item[] }>(`/api/inventory?${params}`);
      setItems(data.items);
    } catch (err: any) {
      toast.error(err.message || "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, [q, cat, loc, sort, statusFilter]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleAddItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const foodName = formData.get("foodName") as string;
    const quantity = formData.get("quantity") as string;
    const expirationDate = formData.get("expirationDate") as string;

    if (!foodName || !quantity || !expirationDate) {
      toast.error("Food name, quantity, and expiration date are required.");
      return;
    }

    const file = formData.get("image") as File;
    if (!file || file.size === 0) {
      formData.delete("image");
    }

    try {
      if (editId) {
        const updated = await api.putFormData<Item>(`/api/inventory/${editId}`, formData);
        setItems((prev) => prev.map((i) => (i.id === editId ? updated : i)));
        toast.success(`${foodName} updated`);
      } else {
        const saved = await api.postFormData<Item>("/api/inventory", formData);
        setItems((prev) => [saved, ...prev]);
        toast.success(`${foodName} saved`);
      }
      setOpen(false);
      setEditId(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to save item");
    }
  };

  const handleStartEdit = (item: Item) => {
    setEditId(item.id);
    setOpen(true);
  };

  const handleOpenAdd = () => {
    setEditId(null);
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
    setEditId(null);
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await api.delete(`/api/inventory/${id}`);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Item removed");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete item");
    }
  };

  return {
    q, setQ,
    view, setView,
    cat, setCat,
    loc, setLoc,
    statusFilter, setStatusFilter,
    sort, setSort,
    open, setOpen,
    editId, setEditId,
    editingItem,
    cats,
    items,
    loading,
    fetchItems,
    handleAddItem,
    handleStartEdit,
    handleOpenAdd,
    handleCloseModal,
    handleDeleteItem,
  };
}

export type InventoryController = ReturnType<typeof useInventoryController>;
