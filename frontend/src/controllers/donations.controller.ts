import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Donation, CATEGORIES } from "@/models/donations.model";
import { api } from "@/lib/api";
import { toast } from "sonner";

export function useDonationsController() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");
  const [sort, setSort] = useState("-createdAt");
  const [items, setItems] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const cats = CATEGORIES;
  const editingItem = useMemo(
    () => (editId ? items.find((i) => i.id === editId) ?? null : null),
    [editId, items],
  );
  const detailItem = useMemo(
    () => (detailId ? items.find((i) => i.id === detailId) ?? null : null),
    [detailId, items],
  );

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (q) params.set("search", q);
      if (cat !== "All") params.set("category", cat);
      params.set("sort", sort);
      params.set("limit", "100");

      const data = await api.get<{ items: Donation[] }>(`/api/donations?${params}`);
      setItems(data.items);
    } catch (err: any) {
      toast.error(err.message || "Failed to load donations");
    } finally {
      setLoading(false);
    }
  }, [q, cat, sort]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleCreateOpen = () => {
    setEditId(null);
    setCreateOpen(true);
  };

  const handleEditOpen = (item: Donation) => {
    setEditId(item.id);
    setCreateOpen(true);
  };

  const handleCloseForm = () => {
    setCreateOpen(false);
    setEditId(null);
  };

  const handleDetailOpen = (item: Donation) => {
    setDetailId(item.id);
  };

  const handleDetailClose = () => {
    setDetailId(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const foodName = formData.get("foodName") as string;
    const quantity = formData.get("quantity") as string;

    if (!foodName || !quantity) {
      toast.error("Food name and quantity are required.");
      return;
    }

    const file = formData.get("image") as File;
    if (!file || file.size === 0) {
      formData.delete("image");
    }
    formData.delete("shareToCommunity");
    const shareToCommunity = form.querySelector<HTMLInputElement>('[name="shareToCommunity"]')?.checked ?? false;
    if (shareToCommunity) formData.append("shareToCommunity", "true");

    try {
      if (editId) {
        const updated = await api.putFormData<Donation>(`/api/donations/${editId}`, formData);
        setItems((prev) => prev.map((i) => (i.id === editId ? updated : i)));
        toast.success(`${foodName} updated`);
      } else {
        const saved = await api.postFormData<Donation>("/api/donations", formData);
        setItems((prev) => [saved, ...prev]);
        if (shareToCommunity) {
          toast.success(`${foodName} published! Shared to community.`);
        } else {
          toast.success(`${foodName} published!`);
        }
      }
      handleCloseForm();
    } catch (err: any) {
      toast.error(err.message || "Failed to save donation");
    }
  };

  const handleClaim = async (id: string) => {
    try {
      const updated = await api.put<Donation>(`/api/donations/${id}/claim`);
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
      toast.success("Donation claimed! The owner will be notified.");
      handleDetailClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to claim donation");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/donations/${id}`);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Donation deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete donation");
    }
  };

  const handleCancel = async (id: string) => {
    try {
      const result = await api.put<{ message: string }>(`/api/donations/${id}/cancel`);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success(result.message || "Donation cancelled");
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel donation");
    }
  };

  const handleOpenFoodConnect = (id: string) => {
    navigate({ to: `/app/food-connect/${id}` });
    handleDetailClose();
  };

  return {
    q, setQ,
    cat, setCat,
    sort, setSort,
    items,
    loading,
    createOpen,
    editId,
    editingItem,
    detailId,
    detailItem,
    cats,
    fetchItems,
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
  };
}

export type DonationsController = ReturnType<typeof useDonationsController>;
