import { useState, useEffect, useCallback } from "react";
import { MapPin, Navigation, ArrowLeft, Crosshair, Heart, MessageCircle } from "lucide-react";
import { motion } from "motion/react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { DISTANCE_OPTIONS } from "@/models/community.model";
import type { CommunityPost } from "@/models/community.model";
import { useNavigate } from "@tanstack/react-router";

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function NearbyView() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [maxDistance, setMaxDistance] = useState(10000);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const fetchNearby = useCallback(async (lat: number, lng: number, dist: number) => {
    setLoading(true);
    try {
      const result = await api.get<{ posts: CommunityPost[] }>(
        `/api/community/posts/nearby?lat=${lat}&lng=${lng}&maxDistance=${dist}&limit=50`
      );
      setPosts(result.posts);
    } catch {
      toast.error("Failed to load nearby posts");
    } finally {
      setLoading(false);
    }
  }, []);

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setLocationError(null);
        fetchNearby(loc.lat, loc.lng, maxDistance);
      },
      () => {
        setLocationError("Could not get location. Using default.");
        const defaultLoc = { lat: 27.7172, lng: 85.3240 };
        setUserLocation(defaultLoc);
        fetchNearby(defaultLoc.lat, defaultLoc.lng, maxDistance);
      }
    );
  }, [maxDistance, fetchNearby]);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => navigate({ to: "/app/community" })} className="rounded-full p-2 hover:bg-secondary">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Nearby</h1>
          <p className="text-sm text-muted-foreground">Discover posts near you</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <select value={maxDistance} onChange={(e) => setMaxDistance(Number(e.target.value))}
          className="rounded-2xl border border-border bg-background px-3 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-primary/30"
        >
          {DISTANCE_OPTIONS.map((d) => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>
        <button onClick={getLocation}
          className="flex items-center gap-1.5 rounded-2xl border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <Crosshair className="h-3.5 w-3.5" /> Refresh
        </button>
        {userLocation && (
          <span className="text-xs text-muted-foreground">
            {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
          </span>
        )}
        {locationError && <span className="text-xs text-amber-500">{locationError}</span>}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-3xl p-5 animate-pulse">
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-full bg-secondary" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 rounded bg-secondary" />
                  <div className="h-3 w-full rounded bg-secondary" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <MapPin className="h-10 w-10 text-muted-foreground" />
          <p className="text-lg font-semibold">No posts nearby</p>
          <p className="text-sm text-muted-foreground">Try increasing the distance or check back later.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-3xl p-5 hover-lift"
            >
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-full bg-gradient-primary grid place-items-center text-white text-xs font-bold overflow-hidden shrink-0">
                  {post.userId?.profilePicture ? (
                    <img src={post.userId.profilePicture} alt="" className="h-full w-full object-cover" />
                  ) : (post.userId?.name?.charAt(0)?.toUpperCase() || "U")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold">{post.userId?.name || "Unknown"}</span>
                      <span className="text-muted-foreground">{timeAgo(post.createdAt)}</span>
                    </div>
                    {(post as any).distance && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-primary shrink-0">
                        <Navigation className="h-3 w-3" />
                        {(post as any).distance < 1
                          ? `${Math.round((post as any).distance * 1000)}m`
                          : `${(post as any).distance.toFixed(1)}km`}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm font-bold">{post.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{post.content}</p>
                  {post.location?.city && (
                    <p className="mt-1.5 text-[11px] text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {post.location.city}{post.location.district ? `, ${post.location.district}` : ""}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {post.likeCount}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {post.commentCount}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
