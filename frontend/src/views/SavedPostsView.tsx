import { useState, useEffect, useCallback } from "react";
import { Bookmark, ArrowLeft, Heart, MessageCircle, Share2, AlertTriangle, Clock } from "lucide-react";
import { motion } from "motion/react";
import { api } from "@/lib/api";
import { toast } from "sonner";
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

export function SavedPostsView() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const result = await api.get<{ posts: CommunityPost[] }>("/api/community/bookmarks");
        setPosts(result.posts);
      } catch {
        toast.error("Failed to load saved posts");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const removeBookmark = useCallback(async (postId: string) => {
    try {
      await api.post(`/api/community/posts/${postId}/bookmark`);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      toast.success("Bookmark removed");
    } catch {
      toast.error("Failed to remove bookmark");
    }
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => navigate({ to: "/app/community" })} className="rounded-full p-2 hover:bg-secondary">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Saved Posts</h1>
          <p className="text-sm text-muted-foreground">Your bookmarked community posts</p>
        </div>
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
          <Bookmark className="h-10 w-10 text-muted-foreground" />
          <p className="text-lg font-semibold">No saved posts</p>
          <p className="text-sm text-muted-foreground">Bookmark posts to save them for later.</p>
          <button onClick={() => navigate({ to: "/app/community" })}
            className="rounded-2xl bg-gradient-primary px-5 py-2 text-sm font-semibold text-white shadow-soft hover:opacity-90"
          >
            Browse Community
          </button>
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
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold">{post.userId?.name || "Unknown"}</span>
                    <span className="text-muted-foreground">{timeAgo(post.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-sm">{post.title || post.content.slice(0, 100)}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {post.likeCount}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {post.commentCount}</span>
                  </div>
                  <button onClick={() => removeBookmark(post._id)}
                    className="mt-2 rounded-xl border border-border px-3 py-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground"
                  >
                    Remove Bookmark
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
