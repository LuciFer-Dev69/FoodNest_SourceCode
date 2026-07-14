import { useState, useEffect, useMemo } from "react";
import { Item, SEED_INVENTORY } from "@/models/inventory.model";
import { api } from "@/lib/api";
import { toast } from "sonner";

export function useInventoryController() {
  const [q, setQ] = useState("");
  const [view, setView] = useState<"list" | "grid">("list");
  const [cat, setCat] = useState<string>("All");
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [inventoryItems, setInventoryItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const cats = ["All", "Produce", "Dairy", "Bakery", "Pantry"];

  // Fetch from Express API
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await api.get<Item[]>("/api/inventory");
      setInventoryItems(data);
    } catch (err) {
      console.warn("Could not connect to database backend. Using mock inventory seed.", err.message);
      // Fallback to seed inventory when database backend is offline
      setInventoryItems(SEED_INVENTORY);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const filteredItems = useMemo(
    () =>
      inventoryItems.filter(
        (i) =>
          (cat === "All" || i.cat === cat) &&
          i.name.toLowerCase().includes(q.toLowerCase())
      ),
    [inventoryItems, q, cat]
  );

  const handleAddItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const itemData = {
      name: formData.get("name") as string,
      qty: formData.get("qty") as string,
      cat: formData.get("cat") as string,
      loc: formData.get("loc") as string,
      expires: parseInt(formData.get("expires") as string) || 3,
      emoji: editingItem?.emoji || "🥬"
    };

    if (!itemData.name || !itemData.qty || !itemData.cat || !itemData.loc) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      if (editingItem) {
        const updatedItem = await api.put<Item>(`/api/inventory/${editingItem.id}`, itemData);
        setInventoryItems((prev) => prev.map((item) => item.id === editingItem.id ? updatedItem : item));
        toast.success(`${itemData.name} updated successfully`);
      } else {
        const savedItem = await api.post<Item>("/api/inventory", itemData);
        setInventoryItems((prev) => [...prev, savedItem]);
        toast.success(`${itemData.name} saved to inventory`);
      }
      setOpen(false);
      setEditingItem(null);
    } catch (err) {
      // Mock fallback if offline
      if (editingItem) {
        const mockUpdatedItem = {
          ...editingItem,
          ...itemData
        };
        setInventoryItems((prev) => prev.map((item) => item.id === editingItem.id ? mockUpdatedItem : item));
        toast.success(`${itemData.name} updated locally (offline mode)`);
      } else {
        const mockSavedItem = {
          id: String(Date.now()),
          ...itemData
        };
        setInventoryItems((prev) => [...prev, mockSavedItem]);
        toast.success(`${itemData.name} added locally (offline mode)`);
      }
      setOpen(false);
      setEditingItem(null);
    }
  };

  const handleStartEdit = (item: Item) => {
    setEditingItem(item);
    setOpen(true);
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await api.delete(`/api/inventory/${id}`);
      setInventoryItems((prev) => prev.filter((item) => item.id !== id));
      toast.success("Item removed");
    } catch (err) {
      // Mock fallback
      setInventoryItems((prev) => prev.filter((item) => item.id !== id));
      toast.success("Item removed locally (offline mode)");
    }
  };

  return {
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
    items: filteredItems,
    loading,
    handleAddItem,
    handleStartEdit,
    handleDeleteItem,
  };
}

export type InventoryController = ReturnType<typeof useInventoryController>;
