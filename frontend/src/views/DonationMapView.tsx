import { useState, useEffect, useCallback } from "react";
import { MapPin, Navigation, ArrowLeft, Crosshair } from "lucide-react";
import { motion } from "motion/react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import type { MapMarker } from "@/models/community.model";

export function DonationMapView() {
  const navigate = useNavigate();
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const fetchDonations = useCallback(async (lat?: number, lng?: number) => {
    setLoading(true);
    try {
      const params = lat && lng ? `?lat=${lat}&lng=${lng}&maxDistance=50000` : "";
      const result = await api.get<{ markers: MapMarker[] }>(`/api/community/posts/donation-map${params}`);
      setMarkers(result.markers);
    } catch {
      toast.error("Failed to load donation map");
    } finally {
      setLoading(false);
    }
  }, []);

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      fetchDonations(27.7172, 85.3240);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        fetchDonations(loc.lat, loc.lng);
      },
      () => {
        setUserLocation({ lat: 27.7172, lng: 85.3240 });
        fetchDonations(27.7172, 85.3240);
      }
    );
  }, [fetchDonations]);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => navigate({ to: "/app/community" })} className="rounded-full p-2 hover:bg-secondary">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Donation Pickup Map</h1>
          <p className="text-sm text-muted-foreground">Find available donations near you</p>
        </div>
        <button onClick={getLocation}
          className="ml-auto flex items-center gap-1.5 rounded-2xl border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <Crosshair className="h-3.5 w-3.5" /> Center
        </button>
      </div>

      {loading ? (
        <div className="glass-card rounded-3xl h-96 animate-pulse grid place-items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : markers.length === 0 ? (
        <div className="glass-card rounded-3xl h-96 grid place-items-center">
          <div className="text-center">
            <MapPin className="h-10 w-10 text-muted-foreground mx-auto" />
            <p className="mt-3 text-lg font-semibold">No donation posts found</p>
            <p className="text-sm text-muted-foreground mt-1">Donation posts with locations will appear here.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
          <div className="glass-card rounded-3xl h-96 overflow-hidden relative bg-secondary/20">
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-center pointer-events-none">
                <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Google Maps will render here</p>
                <p className="text-xs text-muted-foreground mt-1">{markers.length} donation markers loaded</p>
              </div>
            </div>
            <div className="absolute top-3 right-3 z-10 space-y-1">
              {markers.map((m) => (
                <button key={m.id}
                  onClick={() => setSelectedMarker(m)}
                  className="flex items-center gap-1.5 rounded-xl bg-card/90 backdrop-blur px-2.5 py-1.5 text-xs font-semibold shadow-soft hover:bg-card border border-border"
                >
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  {m.city || "Unknown"}
                  {m.distance !== null && (
                    <span className="text-muted-foreground font-normal">
                      {m.distance < 1 ? `${Math.round(m.distance * 1000)}m` : `${m.distance.toFixed(1)}km`}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {selectedMarker && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card rounded-3xl p-5 h-fit"
            >
              {selectedMarker.image && (
                <img src={selectedMarker.image} alt="" className="w-full h-32 object-cover rounded-2xl mb-3" />
              )}
              <p className="font-bold text-sm">{selectedMarker.foodName}</p>
              <div className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                <p className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {selectedMarker.city || "Unknown location"}</p>
                {selectedMarker.distance !== null && (
                  <p className="flex items-center gap-1.5"><Navigation className="h-3 w-3" />
                    {selectedMarker.distance < 1
                      ? `${Math.round(selectedMarker.distance * 1000)}m away`
                      : `${selectedMarker.distance.toFixed(1)}km away`}
                  </p>
                )}
              </div>
              <button
                onClick={() => navigate({ to: `/app/community?post=${selectedMarker.postId}` })}
                className="mt-4 w-full rounded-2xl bg-gradient-primary py-2 text-sm font-semibold text-white shadow-soft hover:opacity-90"
              >
                View Donation
              </button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
