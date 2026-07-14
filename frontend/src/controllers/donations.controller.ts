import { useState, useEffect, useMemo } from "react";
import { DONATION_CARDS, DonationCard } from "@/models/donations.model";
import { api } from "@/lib/api";
import { toast } from "sonner";

export function useDonationsController() {
  const [filter, setFilter] = useState<string>("All");
  const [donations, setDonations] = useState<DonationCard[]>([]);
  const [loading, setLoading] = useState(true);
  const cats = ["All", "Produce", "Dairy", "Bakery", "Pantry"];

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const data = await api.get<DonationCard[]>("/api/donations");
      setDonations(data);
    } catch (err) {
      console.warn("Could not connect to database backend. Using mock donations seed.", err.message);
      setDonations(DONATION_CARDS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const filteredItems = useMemo(() => {
    return filter === "All"
      ? donations
      : donations.filter((c) => c.cat.toLowerCase().includes(filter.toLowerCase()));
  }, [donations, filter]);

  const handleClaim = async (id: number) => {
    try {
      await api.put(`/api/donations/${id}/claim`, {});
      toast.success("Donation claimed successfully!");
      fetchDonations();
    } catch (err) {
      // Mock local fallback
      setDonations((prev) => {
        const updated = [...prev];
        const index = updated.findIndex((d: any) => d.id === id);
        if (index !== -1 && updated[index].status === "Available") {
          updated[index] = { ...updated[index], status: "Claimed" };
        }
        return updated;
      });
      toast.success("Donation claimed locally (offline mode)");
    }
  };

  const handleListDonation = async () => {
    // Show mock dialog or trigger listing creation
    const name = prompt("Enter food name to donate:");
    if (!name) return;
    const qty = prompt("Enter quantity (e.g. 2 loaves, 500g):") || "1 unit";
    const cat = prompt("Enter category (Produce, Dairy, Bakery, Pantry):") || "Produce";
    const pickup = prompt("Enter pickup window (e.g. Today 5-7pm):") || "Today";

    const newDonation = { name, emoji: "🍞", qty, cat, pickup };

    try {
      const saved = await api.post<DonationCard>("/api/donations", newDonation);
      setDonations(prev => [...prev, saved]);
      toast.success("Donation listed successfully!");
    } catch (err) {
      const mockSaved: DonationCard = {
        emoji: "🍞",
        t: name,
        who: "You",
        km: 0.5,
        cat,
        pickup,
        status: "Available"
      };
      setDonations(prev => [...prev, mockSaved]);
      toast.success("Donation listed locally (offline mode)");
    }
  };

  return {
    filter,
    setFilter,
    cats,
    items: filteredItems,
    loading,
    handleClaim,
    handleListDonation,
  };
}

export type DonationsController = ReturnType<typeof useDonationsController>;
