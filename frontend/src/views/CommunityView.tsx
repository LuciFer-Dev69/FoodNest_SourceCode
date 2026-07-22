import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "@tanstack/react-router";
import {
  Heart, MessageCircle, Bookmark, Share2, AlertTriangle, MoreHorizontal,
  Plus, Search, X, Send, MapPin, Clock, ChevronDown, ImagePlus,
  Trash2, Edit3, Camera, Globe, Eye, EyeOff, ExternalLink, User,
  Award, Flame, TrendingUp, Users, MessageSquare, ThumbsUp,
  BookmarkCheck, CheckCheck, Activity, Filter, Video, ThumbsDown, HeartHandshake,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import type { CommunityController } from "@/controllers/community.controller";
import type { CommunityPost as CommunityPostType, CommentType } from "@/models/community.model";
import { CATEGORIES, REPORT_REASONS, SORT_OPTIONS } from "@/models/community.model";
import { Panel } from "@/components/app/primitives";

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

function PostCard({ post, ctrl }: { post: CommunityPostType; ctrl: CommunityController }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const textTruncated = post.content.length > 200 && !expanded;
  const isOwner = user?.id === post.userId._id;

  const isVideo = (url: string) => /\.(mp4|mov|webm)$/i.test(url);

  const handleAcceptDonation = async () => {
    if (!post.donationId) return;
    setShowConfirm(false);
    setAccepting(true);
    try {
      await api.put(`/api/donations/${post.donationId}/claim`);
      toast.success("Donation claimed! Taking you to Food Connect.");
      navigate({ to: `/app/food-connect/${post.donationId}` });
    } catch (err: any) {
      toast.error(err.message || "Failed to claim donation");
    } finally {
      setAccepting(false);
    }
  };

  const allMedia = [
    ...post.images.map((u) => ({ url: u, type: "image" as const })),
    ...(post.videos || []).map((u) => ({ url: u, type: "video" as const })),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-3xl overflow-hidden hover-lift"
    >
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div
            className="h-10 w-10 shrink-0 rounded-full bg-gradient-primary grid place-items-center text-white text-sm font-bold cursor-pointer overflow-hidden"
            onClick={() => { ctrl.loadProfile(post.userId._id); ctrl.setShowUserProfile(post.userId._id); }}
          >
            {post.userId.profilePicture ? (
              <img src={post.userId.profilePicture} alt="" className="h-full w-full object-contain bg-black/5" />
            ) : (
              post.userId.name?.charAt(0).toUpperCase() || "U"
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => { ctrl.loadProfile(post.userId._id); ctrl.setShowUserProfile(post.userId._id); }}
                className="text-sm font-semibold hover:underline truncate"
              >
                {post.userId.name}
              </button>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="rounded-full bg-secondary/60 px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  {post.category}
                </span>
                <span className="text-[11px] text-muted-foreground whitespace-nowrap">{timeAgo(post.createdAt)}</span>
                <div className="relative">
                  <button onClick={() => setMenuOpen((v) => !v)}
                    className="rounded-full p-1 text-muted-foreground hover:bg-secondary/50"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 top-full mt-1 z-40 min-w-[160px] rounded-2xl bg-card border border-border shadow-xl py-1 overflow-hidden"
                      onMouseLeave={() => setMenuOpen(false)}
                    >
                      {isOwner ? (
                        <button onClick={() => { ctrl.deletePost(post._id); setMenuOpen(false); }}
                          className="flex w-full items-center gap-2 px-4 py-2 text-xs font-semibold text-red-500 hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" /> Delete Post
                        </button>
                      ) : (
                        <>
                          <button onClick={() => { ctrl.toggleNotInterested(post._id); setMenuOpen(false); }}
                            className="flex w-full items-center gap-2 px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary/40"
                          >
                            <ThumbsDown className="h-4 w-4" /> Not Interested
                          </button>
                          <div className="border-t border-border/40 my-1" />
                          <button onClick={() => { ctrl.setShowReportModal(post._id); setMenuOpen(false); }}
                            className="flex w-full items-center gap-2 px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary/40"
                          >
                            <AlertTriangle className="h-4 w-4" /> Report Post
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {post.title && <p className="mt-1 text-sm font-bold">{post.title}</p>}

            <p className="mt-1.5 text-sm leading-relaxed">
              {textTruncated ? post.content.slice(0, 200) + "..." : post.content}
              {textTruncated && (
                <button onClick={() => setExpanded(true)} className="ml-1 text-xs font-semibold text-primary hover:underline">See more</button>
              )}
            </p>

            {post.tags?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {post.tags.map((tag) => (
                  <span key={tag} className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">#{tag}</span>
                ))}
              </div>
            )}

            {allMedia.length > 0 && (
              <div className="mt-3 grid gap-1 grid-cols-2 rounded-2xl overflow-hidden">
                {allMedia.slice(0, 5).map((media, i) => (
                  <div key={i} className={`relative ${allMedia.length === 3 && i === 0 ? "row-span-2" : ""}`}>
                    {media.type === "video" ? (
                      <video src={media.url} controls className="w-full h-36 object-contain bg-black/5" />
                    ) : (
                      <img src={media.url} alt="" className="w-full h-36 object-contain bg-black/5" loading="lazy" />
                    )}
                    {i === 4 && allMedia.length > 5 && (
                      <div className="absolute inset-0 bg-black/50 grid place-items-center text-white text-lg font-bold">
                        +{allMedia.length - 5}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {post.location?.displayName && (
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {post.location.city || post.location.displayName}
              </div>
            )}

            {post.donationId && post.category === "Donation" && !isOwner && (
              <div className="mt-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                <div className="flex items-start gap-2">
                  <HeartHandshake className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Food Donation</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{post.title}</p>
                    {post.donationClaimed ? (
                      <p className="mt-2 flex items-center gap-1.5 rounded-xl bg-gray-500/10 px-4 py-2 text-xs font-semibold text-gray-500">
                        <CheckCheck className="h-4 w-4" /> Claimed
                      </p>
                    ) : (
                      <button
                        onClick={() => setShowConfirm(true)}
                        disabled={accepting}
                        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-2 text-xs font-semibold text-white shadow-soft hover:opacity-90 disabled:opacity-50"
                      >
                        {accepting ? "Claiming..." : "Accept Donation"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3">
          <div className="flex items-center gap-1">
            <button onClick={() => ctrl.toggleLike(post._id)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                post.isLiked ? "bg-red-500/10 text-red-500" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <Heart className={`h-4 w-4 ${post.isLiked ? "fill-current" : ""}`} />
              {post.likeCount || 0}
            </button>
            <button onClick={() => { ctrl.setShowDetailPost(post); ctrl.loadComments(post._id); }}
              className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            >
              <MessageCircle className="h-4 w-4" />
              {post.commentCount || 0}
            </button>
            <button onClick={() => ctrl.toggleBookmark(post._id)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                post.isBookmarked ? "text-amber-500" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <Bookmark className={`h-4 w-4 ${post.isBookmarked ? "fill-current" : ""}`} />
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => ctrl.sharePost(post._id)}
              className="rounded-xl px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button onClick={() => ctrl.setShowReportModal(post._id)}
              className="rounded-xl px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            >
              <AlertTriangle className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setShowConfirm(false)}
        >
          <div className="w-full max-w-sm rounded-3xl bg-card border border-border shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold">Accept Donation</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Do you really want to accept this donation?
            </p>
            <div className="mt-3 rounded-2xl bg-emerald-500/10 p-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                <HeartHandshake className="h-5 w-5" /> {post.title || post.content.slice(0, 60)}
              </p>
            </div>
            <div className="mt-5 flex items-center gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAcceptDonation}
                disabled={accepting}
                className="flex-1 rounded-xl bg-gradient-primary px-4 py-2 text-sm font-semibold text-white shadow-soft hover:opacity-90 disabled:opacity-50"
              >
                {accepting ? "Claiming..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function CreatePostModal({ ctrl }: { ctrl: CommunityController }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Other");
  const [tags, setTags] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);
  const [pickupAvailable, setPickupAvailable] = useState(false);
  const [visibility, setVisibility] = useState<"public" | "community">("public");
  const [submitting, setSubmitting] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 5 - imageFiles.length;
    const toAdd = files.slice(0, remaining);
    setImageFiles((prev) => [...prev, ...toAdd]);
    for (const f of toAdd) {
      setImagePreviews((prev) => [...prev, URL.createObjectURL(f)]);
    }
    e.target.value = "";
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 5 - videoFiles.length;
    const toAdd = files.slice(0, remaining);
    setVideoFiles((prev) => [...prev, ...toAdd]);
    for (const f of toAdd) {
      setVideoPreviews((prev) => [...prev, URL.createObjectURL(f)]);
    }
    e.target.value = "";
  };

  const removeImage = (i: number) => {
    URL.revokeObjectURL(imagePreviews[i]);
    setImageFiles((prev) => prev.filter((_, j) => j !== i));
    setImagePreviews((prev) => prev.filter((_, j) => j !== i));
  };

  const removeVideo = (i: number) => {
    URL.revokeObjectURL(videoPreviews[i]);
    setVideoFiles((prev) => prev.filter((_, j) => j !== i));
    setVideoPreviews((prev) => prev.filter((_, j) => j !== i));
  };

  const resetForm = () => {
    setTitle(""); setContent(""); setCategory("Other"); setTags("");
    setImageFiles([]); setVideoFiles([]);
    imagePreviews.forEach(URL.revokeObjectURL);
    videoPreviews.forEach(URL.revokeObjectURL);
    setImagePreviews([]); setVideoPreviews([]);
    setPickupAvailable(false); setVisibility("public");
  };

  const handleSubmit = async () => {
    if (!content.trim()) return toast.error("Content is required");
    setSubmitting(true);
    const hasMedia = imageFiles.length > 0 || videoFiles.length > 0;
    if (hasMedia) {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("content", content);
      fd.append("category", category);
      fd.append("tags", JSON.stringify(tags.split(",").map((t) => t.trim()).filter(Boolean)));
      fd.append("pickupAvailable", String(pickupAvailable));
      fd.append("visibility", visibility);
      for (const f of imageFiles) fd.append("media", f);
      for (const f of videoFiles) fd.append("media", f);
      await ctrl.createPost(fd);
    } else {
      await ctrl.createPost({
        title, content, category,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        pickupAvailable, visibility,
      });
    }
    setSubmitting(false);
    resetForm();
  };

  return (
    <AnimatePresence>
      {ctrl.showCreateModal && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => { ctrl.setShowCreateModal(false); resetForm(); }}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
            className="w-full max-w-lg rounded-3xl bg-card border border-border shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-3 border-b border-border/40">
              <h2 className="text-lg font-bold">Create Post</h2>
              <button onClick={() => { ctrl.setShowCreateModal(false); resetForm(); }} className="rounded-full p-1.5 hover:bg-secondary">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-3 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Title (optional)</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post title..."
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Content *</label>
                <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Share something with the community..."
                  rows={4}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Tags (comma separated)</label>
                <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="sustainable, recipe, vegan..."
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Photos ({imageFiles.length}/5)</label>
                <div className="flex flex-wrap gap-2">
                  {imagePreviews.map((preview, i) => (
                    <div key={i} className="relative h-16 w-16 rounded-xl overflow-hidden">
                      <img src={preview} alt="" className="h-full w-full object-contain bg-black/5" />
                      <button onClick={() => removeImage(i)}
                        className="absolute top-0.5 right-0.5 rounded-full bg-black/60 p-0.5"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  ))}
                  {imageFiles.length < 5 && (
                    <button onClick={() => imageRef.current?.click()} className="h-16 w-16 rounded-xl border-2 border-dashed border-border grid place-items-center text-muted-foreground hover:text-foreground hover:border-foreground/30">
                      <Camera className="h-5 w-5" />
                    </button>
                  )}
                  <input ref={imageRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Videos ({videoFiles.length}/5)</label>
                <div className="flex flex-wrap gap-2">
                  {videoPreviews.map((preview, i) => (
                    <div key={i} className="relative h-16 w-16 rounded-xl overflow-hidden bg-black grid place-items-center">
                      <video src={preview} className="h-full w-full object-contain bg-black/5" />
                      <div className="absolute inset-0 grid place-items-center">
                        <Video className="h-5 w-5 text-white/70" />
                      </div>
                      <button onClick={() => removeVideo(i)}
                        className="absolute top-0.5 right-0.5 rounded-full bg-black/60 p-0.5"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  ))}
                  {videoFiles.length < 5 && (
                    <button onClick={() => videoRef.current?.click()} className="h-16 w-16 rounded-xl border-2 border-dashed border-border grid place-items-center text-muted-foreground hover:text-foreground hover:border-foreground/30">
                      <Video className="h-5 w-5" />
                    </button>
                  )}
                  <input ref={videoRef} type="file" accept="video/mp4,video/quicktime,video/webm" multiple className="hidden" onChange={handleVideoSelect} />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={pickupAvailable} onChange={(e) => setPickupAvailable(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary/30"
                  />
                  Pickup Available
                </label>
                <div className="flex items-center gap-1.5">
                  {visibility === "public" ? <Globe className="h-3.5 w-3.5 text-muted-foreground" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
                  <select value={visibility} onChange={(e) => setVisibility(e.target.value as any)}
                    className="rounded-lg border border-border bg-background px-2 py-1 text-xs outline-none"
                  >
                    <option value="public">Public</option>
                    <option value="community">Community Only</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 pb-6 pt-3 border-t border-border/40">
              <button onClick={() => { ctrl.setShowCreateModal(false); resetForm(); }}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-secondary"
              >
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={submitting || !content.trim()}
                className="rounded-xl bg-gradient-primary px-5 py-2 text-sm font-semibold text-white shadow-soft hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? "Publishing..." : "Publish"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PostDetailModal({ ctrl }: { ctrl: CommunityController }) {
  const post = ctrl.showDetailPost;
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);

  if (!post) return null;

  const handleComment = async () => {
    if (!commentText.trim()) return;
    await ctrl.createComment(post._id, commentText, replyTo || undefined);
    setCommentText("");
    setReplyTo(null);
  };

  return (
    <AnimatePresence>
      {ctrl.showDetailPost && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => { ctrl.setShowDetailPost(null); ctrl.setDetailComments([]); }}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
            className="w-full max-w-2xl rounded-3xl bg-card border border-border shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-3 border-b border-border/40 shrink-0">
              <h2 className="text-lg font-bold">Post</h2>
              <button onClick={() => { ctrl.setShowDetailPost(null); ctrl.setDetailComments([]); }}
                className="rounded-full p-1.5 hover:bg-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-primary grid place-items-center text-white text-xs font-bold overflow-hidden">
                  {post.userId.profilePicture ? (
                    <img src={post.userId.profilePicture} alt="" className="h-full w-full object-contain bg-black/5" />
                  ) : (post.userId.name?.charAt(0)?.toUpperCase() || "U")}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{post.userId.name}</span>
                    <span className="text-[11px] text-muted-foreground">{timeAgo(post.createdAt)}</span>
                    <span className="rounded-full bg-secondary/60 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">{post.category}</span>
                  </div>
                  {post.title && <p className="mt-1 text-sm font-bold">{post.title}</p>}
                  <p className="mt-1.5 text-sm leading-relaxed">{post.content}</p>
                  {(post.images?.length > 0 || post.videos?.length > 0) && (
                    <div className="mt-3 grid gap-1 grid-cols-2 rounded-2xl overflow-hidden">
                      {post.images.map((img, i) => (
                        <img key={`img-${i}`} src={img} alt="" className="w-full object-contain bg-black/5 h-36" loading="lazy" />
                      ))}
                      {(post.videos || []).map((vid, i) => (
                        <video key={`vid-${i}`} src={vid} controls className="w-full object-contain bg-black/5 h-36" />
                      ))}
                    </div>
                  )}
                  {post.location?.displayName && (
                    <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {post.location.displayName}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3 border-t border-border/30 pt-3">
                <button onClick={() => ctrl.toggleLike(post._id)}
                  className={`flex items-center gap-1 text-xs font-semibold ${post.isLiked ? "text-red-500" : "text-muted-foreground"}`}
                >
                  <Heart className={`h-4 w-4 ${post.isLiked ? "fill-current" : ""}`} /> {post.likeCount || 0}
                </button>
                <button onClick={() => ctrl.toggleBookmark(post._id)}
                  className={`flex items-center gap-1 text-xs font-semibold ${post.isBookmarked ? "text-amber-500" : "text-muted-foreground"}`}
                >
                  <Bookmark className={`h-4 w-4 ${post.isBookmarked ? "fill-current" : ""}`} />
                </button>
                <button onClick={() => ctrl.sharePost(post._id)}
                  className="flex items-center gap-1 text-xs font-semibold text-muted-foreground"
                >
                  <Share2 className="h-4 w-4" /> Share
                </button>
              </div>

              <div className="mt-4 border-t border-border/30 pt-4">
                <h3 className="text-sm font-bold mb-3">Comments ({ctrl.detailComments.length})</h3>

                {ctrl.detailLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse flex gap-3">
                        <div className="h-7 w-7 rounded-full bg-secondary" />
                        <div className="flex-1">
                          <div className="h-3 w-24 rounded bg-secondary mb-2" />
                          <div className="h-3 w-full rounded bg-secondary" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : ctrl.detailComments.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">No comments yet. Be the first!</p>
                ) : (
                  <div className="space-y-4">
                    {ctrl.detailComments.map((comment) => (
                      <CommentItem key={comment._id} comment={comment} ctrl={ctrl} onReply={(id) => setReplyTo(id)} />
                    ))}
                  </div>
                )}

                <div className="mt-4 flex items-start gap-2 border-t border-border/30 pt-4">
                  <input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={replyTo ? "Write a reply..." : "Write a comment..."}
                    onKeyDown={(e) => e.key === "Enter" && handleComment()}
                    className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  {replyTo && (
                    <button onClick={() => setReplyTo(null)} className="rounded-xl p-2 text-xs text-muted-foreground hover:bg-secondary">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <button onClick={handleComment} disabled={!commentText.trim()}
                    className="rounded-xl bg-gradient-primary px-3 py-2 text-white disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CommentItem({ comment, ctrl, onReply }: { comment: CommentType; ctrl: CommunityController; onReply: (id: string) => void }) {
  const [showReplies, setShowReplies] = useState(true);
  return (
    <div>
      <div className="flex items-start gap-2.5">
        <div className="h-7 w-7 shrink-0 rounded-full bg-gradient-primary grid place-items-center text-white text-[10px] font-bold overflow-hidden">
          {comment.userId?.profilePicture ? (
            <img src={comment.userId.profilePicture} alt="" className="h-full w-full object-contain bg-black/5" />
          ) : (comment.userId?.name?.charAt(0)?.toUpperCase() || "U")}
        </div>
        <div className="flex-1 min-w-0">
          <div className="rounded-2xl bg-secondary/40 px-3 py-2">
            <p className="text-xs font-semibold">{comment.userId?.name || "Unknown"}</p>
            <p className="text-sm mt-0.5">{comment.text}</p>
          </div>
          <div className="flex items-center gap-3 mt-1 ml-2">
            <span className="text-[10px] text-muted-foreground">{timeAgo(comment.createdAt)}</span>
            <button onClick={() => onReply(comment._id)} className="text-[10px] font-semibold text-muted-foreground hover:text-foreground">
              Reply
            </button>
          </div>
        </div>
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-8 mt-2">
          <button onClick={() => setShowReplies(!showReplies)} className="text-[11px] font-semibold text-primary mb-2">
            {showReplies ? "Hide" : "Show"} {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
          </button>
          {showReplies && comment.replies.map((reply) => (
            <div key={reply._id} className="flex items-start gap-2.5 mb-2">
              <div className="h-6 w-6 shrink-0 rounded-full bg-gradient-primary grid place-items-center text-white text-[9px] font-bold overflow-hidden">
                {reply.userId?.profilePicture ? (
                  <img src={reply.userId.profilePicture} alt="" className="h-full w-full object-contain bg-black/5" />
                ) : (reply.userId?.name?.charAt(0)?.toUpperCase() || "U")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="rounded-2xl bg-secondary/40 px-3 py-2">
                  <p className="text-xs font-semibold">{reply.userId?.name || "Unknown"}</p>
                  <p className="text-sm mt-0.5">{reply.text}</p>
                </div>
                <p className="text-[10px] text-muted-foreground ml-2 mt-0.5">{timeAgo(reply.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReportModal({ ctrl }: { ctrl: CommunityController }) {
  const [reason, setReason] = useState("Spam");
  const [description, setDescription] = useState("");

  if (!ctrl.showReportModal) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4"
        onClick={() => ctrl.setShowReportModal(null)}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
          className="w-full max-w-sm rounded-3xl bg-card border border-border shadow-2xl p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-lg font-bold mb-4">Report Post</h3>
          <div className="space-y-3">
            <select value={reason} onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            >
              {REPORT_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional details (optional)..."
              rows={3}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>
          <div className="flex items-center justify-end gap-2 mt-5">
            <button onClick={() => ctrl.setShowReportModal(null)}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-secondary"
            >
              Cancel
            </button>
            <button onClick={() => ctrl.reportPost(ctrl.showReportModal!, reason, description)}
              className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
            >
              Submit Report
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function UserProfileModal({ ctrl }: { ctrl: CommunityController }) {
  const profile = ctrl.profileData;
  if (!ctrl.showUserProfile || !profile) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4"
        onClick={() => { ctrl.setShowUserProfile(null); ctrl.setProfileData(null); }}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
          className="w-full max-w-md rounded-3xl bg-card border border-border shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-primary p-6 pb-16 relative">
            <button onClick={() => { ctrl.setShowUserProfile(null); ctrl.setProfileData(null); }}
              className="absolute top-4 right-4 rounded-full bg-black/20 p-1.5 text-white hover:bg-black/30"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex flex-col items-center">
              <div className="h-20 w-20 rounded-full border-4 border-white/30 overflow-hidden bg-white/20 grid place-items-center text-white text-3xl font-bold">
                {profile.user.profilePicture ? (
                  <img src={profile.user.profilePicture} alt="" className="h-full w-full object-contain bg-black/5" />
                ) : (profile.user.name?.charAt(0)?.toUpperCase() || "U")}
              </div>
              <p className="mt-3 text-lg font-bold text-white">{profile.user.name}</p>
              <p className="text-xs text-white/70">Joined {timeAgo(profile.stats.joinedDate)}</p>
            </div>
          </div>
          <div className="px-6 pb-6 -mt-10">
            <div className="glass-card rounded-2xl p-4 grid grid-cols-3 gap-3 text-center">
              <div><p className="text-lg font-bold">{profile.stats.postCount}</p><p className="text-[10px] text-muted-foreground">Posts</p></div>
              <div><p className="text-lg font-bold">{profile.stats.totalLikes}</p><p className="text-[10px] text-muted-foreground">Likes</p></div>
              <div><p className="text-lg font-bold">{profile.stats.donations}</p><p className="text-[10px] text-muted-foreground">Donations</p></div>
            </div>

            {profile.stats.badges.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Badges</p>
                <div className="flex flex-wrap gap-2">
                  {profile.stats.badges.map((badge) => (
                    <span key={badge} className="rounded-full bg-amber-500/10 text-amber-600 px-3 py-1 text-xs font-semibold flex items-center gap-1">
                      <Award className="h-3 w-3" /> {badge}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <p className="mt-4 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{profile.stats.foodSaved}</span> food saved
            </p>

            {profile.recentPosts.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Recent Posts</p>
                <div className="space-y-2">
                  {profile.recentPosts.slice(0, 3).map((p) => (
                    <div key={p._id} className="rounded-xl bg-secondary/40 px-3 py-2">
                      <p className="text-xs font-semibold truncate">{p.title || p.content.slice(0, 60)}</p>
                      <p className="text-[10px] text-muted-foreground">{p.category} · {timeAgo(p.createdAt)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Sidebar({ ctrl }: { ctrl: CommunityController }) {
  return (
    <div className="space-y-4">
      <Panel>
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><Activity className="h-4 w-4 text-primary" /> Community Stats</h3>
        <div className="grid grid-cols-2 gap-3">
          <StatItem icon={<MessageSquare className="h-3.5 w-3.5" />} label="Posts" value={ctrl.stats?.totalPosts || 0} />
          <StatItem icon={<MessageCircle className="h-3.5 w-3.5" />} label="Comments" value={ctrl.stats?.totalComments || 0} />
          <StatItem icon={<ThumbsUp className="h-3.5 w-3.5" />} label="Likes" value={ctrl.stats?.totalLikes || 0} />
          <StatItem icon={<Bookmark className="h-3.5 w-3.5" />} label="Bookmarks" value={ctrl.stats?.totalBookmarks || 0} />
          <StatItem icon={<Users className="h-3.5 w-3.5" />} label="Active Users" value={ctrl.stats?.activeUsers || 0} />
          <StatItem icon={<Flame className="h-3.5 w-3.5" />} label="Today" value={ctrl.stats?.todayPosts || 0} />
        </div>
        <div className="mt-3 pt-3 border-t border-border/30 flex justify-between text-xs text-muted-foreground">
          <span>This week</span>
          <span className="font-semibold text-foreground">{ctrl.stats?.weekPosts || 0} posts</span>
        </div>
        {ctrl.stats?.userStats && (
          <div className="mt-3 pt-3 border-t border-border/30 text-xs text-muted-foreground">
            <p>Your posts: <span className="font-semibold text-foreground">{ctrl.stats.userStats.postCount}</span></p>
            {ctrl.stats.userStats.achievements.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {ctrl.stats.userStats.achievements.map((a) => (
                  <span key={a.badge} className="rounded-full bg-amber-500/10 text-amber-600 px-2 py-0.5 text-[9px] font-semibold">{a.badge}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </Panel>

      {ctrl.trendingTopics.length > 0 && (
        <Panel>
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Trending Topics</h3>
          <div className="space-y-2">
            {ctrl.trendingTopics.map((topic) => (
              <button key={topic.tag} onClick={() => ctrl.setSearch(topic.tag)}
                className="flex items-center justify-between w-full text-xs hover:bg-secondary/40 rounded-lg px-2 py-1.5"
              >
                <span className="font-medium">#{topic.tag}</span>
                <span className="text-muted-foreground">{topic.count} posts</span>
              </button>
            ))}
          </div>
        </Panel>
      )}

      {ctrl.popularCategories.length > 0 && (
        <Panel>
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><Filter className="h-4 w-4 text-primary" /> Categories</h3>
          <div className="space-y-1.5">
            {ctrl.popularCategories.map((cat) => (
              <button key={cat.category} onClick={() => ctrl.setCategory(cat.category)}
                className={`flex items-center justify-between w-full text-xs rounded-lg px-2 py-1.5 hover:bg-secondary/40 ${
                  ctrl.category === cat.category ? "bg-primary/10 text-primary font-semibold" : ""
                }`}
              >
                <span>{cat.category}</span>
                <span className="text-muted-foreground">{cat.count}</span>
              </button>
            ))}
          </div>
        </Panel>
      )}

      {ctrl.newestMembers.length > 0 && (
        <Panel>
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Newest Members</h3>
          <div className="space-y-2">
            {ctrl.newestMembers.map((member) => (
              <button key={member._id}
                onClick={() => { ctrl.loadProfile(member._id); ctrl.setShowUserProfile(member._id); }}
                className="flex items-center gap-2 w-full text-xs hover:bg-secondary/40 rounded-lg px-2 py-1.5"
              >
                <div className="h-6 w-6 rounded-full bg-gradient-primary grid place-items-center text-white text-[9px] font-bold overflow-hidden shrink-0">
                  {member.profilePicture ? <img src={member.profilePicture} alt="" className="h-full w-full object-contain bg-black/5" /> : member.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left min-w-0">
                  <p className="font-medium truncate">{member.name}</p>
                  <p className="text-[10px] text-muted-foreground">{member.postCount} posts</p>
                </div>
              </button>
            ))}
          </div>
        </Panel>
      )}

      {ctrl.recentDonations.length > 0 && (
        <Panel>
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><Heart className="h-4 w-4 text-primary" /> Recent Donations</h3>
          <div className="space-y-2">
            {ctrl.recentDonations.map((d) => (
              <div key={d._id} className="flex items-start gap-2 text-xs">
                {d.images?.[0] && (
                  <img src={d.images[0]} alt="" className="h-8 w-8 rounded-lg object-contain bg-black/5 shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="font-medium truncate">{d.title || d.content.slice(0, 40)}</p>
                  <p className="text-[10px] text-muted-foreground">{d.userId?.name} · {timeAgo(d.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-secondary/30 px-3 py-2">
      <span className="text-muted-foreground">{icon}</span>
      <div>
        <p className="text-xs font-semibold">{value}</p>
        <p className="text-[9px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export function CommunityView(ctrl: CommunityController) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) observerRef.current.disconnect();
      if (!node || !ctrl.hasMore || ctrl.loadingMore) return;
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) ctrl.loadMore();
      }, { threshold: 0.1 });
      observerRef.current.observe(node);
    },
    [ctrl.hasMore, ctrl.loadingMore, ctrl.loadMore]
  );

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Community</h1>
          <p className="mt-1 text-sm text-muted-foreground">Share, learn, and connect with fellow food-savers.</p>
        </div>
        <button
          onClick={() => ctrl.setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-2xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Create Post
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={ctrl.search}
                onChange={(e) => ctrl.setSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") ctrl.fetchPosts(1, true); }}
                placeholder="Search posts..."
                className="w-full rounded-2xl border border-border bg-background pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <select value={ctrl.category} onChange={(e) => ctrl.setCategory(e.target.value)}
              className="rounded-2xl border border-border bg-background px-3 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={ctrl.sort} onChange={(e) => ctrl.setSort(e.target.value)}
              className="rounded-2xl border border-border bg-background px-3 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-primary/30"
            >
              {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            {(ctrl.category || ctrl.search) && (
              <button onClick={ctrl.clearFilters}
                className="rounded-2xl border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>

          {ctrl.loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card rounded-3xl p-5 animate-pulse">
                  <div className="flex gap-3">
                    <div className="h-10 w-10 rounded-full bg-secondary shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 rounded bg-secondary" />
                      <div className="h-3 w-full rounded bg-secondary" />
                      <div className="h-3 w-3/4 rounded bg-secondary" />
                    </div>
                  </div>
                  <div className="mt-4 h-48 rounded-2xl bg-secondary" />
                </div>
              ))}
            </div>
          ) : ctrl.error && ctrl.posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <AlertTriangle className="h-10 w-10 text-amber-500" />
              <p className="text-lg font-semibold">Could not load posts</p>
              <p className="text-sm text-muted-foreground">{ctrl.error}</p>
              <button onClick={() => ctrl.fetchPosts(1, true)}
                className="rounded-2xl bg-gradient-primary px-5 py-2 text-sm font-semibold text-white shadow-soft hover:opacity-90"
              >
                Retry
              </button>
            </div>
          ) : ctrl.posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <MessageCircle className="h-10 w-10 text-muted-foreground" />
              <p className="text-lg font-semibold">No posts yet</p>
              <p className="text-sm text-muted-foreground">Be the first to share with the community!</p>
              <button onClick={() => ctrl.setShowCreateModal(true)}
                className="rounded-2xl bg-gradient-primary px-5 py-2 text-sm font-semibold text-white shadow-soft hover:opacity-90"
              >
                Create Post
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {ctrl.posts.map((post) => (
                <PostCard key={post._id} post={post} ctrl={ctrl} />
              ))}
              {ctrl.loadingMore && (
                <div className="flex justify-center py-4">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              )}
              {ctrl.hasMore && <div ref={sentinelRef} className="h-4" />}
              {!ctrl.hasMore && ctrl.posts.length > 0 && (
                <p className="text-center text-xs text-muted-foreground py-4">You've reached the end</p>
              )}
            </div>
          )}
        </div>

        <div className="hidden lg:block">
          <Sidebar ctrl={ctrl} />
        </div>
      </div>

      <CreatePostModal ctrl={ctrl} />
      <PostDetailModal ctrl={ctrl} />
      <UserProfileModal ctrl={ctrl} />
      <ReportModal ctrl={ctrl} />
    </>
  );
}
