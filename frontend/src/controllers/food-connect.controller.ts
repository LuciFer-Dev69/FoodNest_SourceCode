import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { toast } from "sonner";

export type FoodConnectData = {
  id: string;
  foodName: string;
  category: string;
  quantity: number;
  unit: string;
  description: string;
  expirationDate: string | null;
  pickupDate: string | null;
  pickupTime: string;
  image: string | null;
  status: string;
  pickupLocation: {
    latitude: number | null;
    longitude: number | null;
    address: string;
    country: string;
    city: string;
  };
  deliveryMethod: "self_pickup" | "third_party" | null;
  deliveryStatus: "none" | "proposed" | "accepted";
  deliveryPartner: string | null;
  claimedAt: string | null;
  completedAt: string | null;
  donor: {
    id: string;
    name: string;
    email: string;
    profilePicture: string | null;
  };
  claimant: {
    id: string;
    name: string;
    email: string;
    profilePicture: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export function useFoodConnectController(donationId: string) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<FoodConnectData | null>(null);
  const [loading, setLoading] = useState(true);

  const userId = user?.id;

  const isDonor = useMemo(() => data && userId ? data.donor.id === userId : false, [data, userId]);
  const isClaimant = useMemo(() => data && userId ? data.claimant?.id === userId : false, [data, userId]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await api.get<FoodConnectData>(`/api/food-connect/${donationId}`);
      setData(result);
    } catch (err: any) {
      toast.error(err.message || "Failed to load food connect");
      navigate({ to: "/app/donations" });
    } finally {
      setLoading(false);
    }
  }, [donationId, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleComplete = async () => {
    if (!data) return;
    try {
      await api.put(`/api/food-connect/${donationId}/complete`);
      toast.success("Delivery completed! Thank you.");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to complete delivery");
    }
  };

  const handleCancel = async () => {
    if (!data) return;
    try {
      await api.put(`/api/food-connect/${donationId}/cancel`);
      toast.success("Food connect cancelled.");
      navigate({ to: "/app/donations" });
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel");
    }
  };

  const handleProposeDelivery = async (deliveryMethod: "self_pickup" | "third_party", deliveryPartner?: string) => {
    if (!data) return;
    try {
      const result = await api.post<FoodConnectData>(`/api/food-connect/${donationId}/propose-delivery`, { deliveryMethod, deliveryPartner });
      setData(result);
      if (deliveryMethod === "self_pickup") {
        toast.success("Self pickup chosen");
      } else {
        toast.success(`${deliveryPartner} proposed to donor`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to propose delivery");
    }
  };

  const handleAcceptDelivery = async () => {
    if (!data) return;
    try {
      await api.post(`/api/food-connect/${donationId}/respond-delivery`, { accept: true });
      toast.success("Delivery accepted");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to accept delivery");
    }
  };

  const handleRejectDelivery = async () => {
    if (!data) return;
    try {
      await api.post(`/api/food-connect/${donationId}/respond-delivery`, { accept: false });
      toast.success("Delivery rejected, claim cancelled");
      navigate({ to: "/app/donations" });
    } catch (err: any) {
      toast.error(err.message || "Failed to reject delivery");
    }
  };

  const handleBack = () => {
    navigate({ to: "/app/donations" });
  };

  return {
    data,
    loading,
    isDonor,
    isClaimant,
    handleComplete,
    handleCancel,
    handleProposeDelivery,
    handleAcceptDelivery,
    handleRejectDelivery,
    handleBack,
    fetchData,
  };
}

export type FoodConnectListItem = {
  id: string;
  foodName: string;
  category: string;
  quantity: number;
  unit: string;
  image: string | null;
  status: string;
  deliveryMethod: "self_pickup" | "third_party" | null;
  deliveryStatus: "none" | "proposed" | "accepted";
  deliveryPartner: string | null;
  donor: { id: string; name: string; email: string; profilePicture: string | null };
  claimant: { id: string; name: string; email: string; profilePicture: string | null } | null;
  claimedAt: string | null;
  completedAt: string | null;
  createdAt: string;
};

export function useFoodConnectListController() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState<FoodConnectListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = user?.id;

  const active = useMemo(() => items.filter((i) => i.status === "Reserved"), [items]);
  const history = useMemo(() => items.filter((i) => i.status === "Completed" || i.status === "Cancelled"), [items]);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const result = await api.get<{ items: FoodConnectListItem[] }>("/api/food-connect");
      setItems(result.items);
    } catch (err: any) {
      toast.error(err.message || "Failed to load food connects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleOpen = (id: string) => {
    navigate({ to: `/app/food-connect/${id}` });
  };

  return {
    items,
    active,
    history,
    loading,
    userId,
    handleOpen,
    fetchItems,
  };
}

export type FoodConnectListController = ReturnType<typeof useFoodConnectListController>;

export type FoodConnectController = ReturnType<typeof useFoodConnectController>;
