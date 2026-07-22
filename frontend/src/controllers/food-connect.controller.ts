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
  deliveryMethod: "self_pickup" | "third_party";
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
    handleBack,
    fetchData,
  };
}

export type FoodConnectController = ReturnType<typeof useFoodConnectController>;
