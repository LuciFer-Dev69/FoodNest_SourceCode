import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface HistoryItem {
  id: number;
  kind: "donation";
  emoji: string;
  title: string;
  subtitle: string;
  createdAt: string;
}

export function useHistoryController() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await api.get<HistoryItem[]>("/api/donations/history");
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return { items, loading };
}

export type HistoryController = ReturnType<typeof useHistoryController>;
