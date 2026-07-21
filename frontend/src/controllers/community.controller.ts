import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { CommunityPost, PostsResponse, CommentType, CommunityStats, UserProfile, MapMarker, TrendingTopic, NewestMember, PopularCategory } from "@/models/community.model";

export function useCommunityController() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [category, setCategory] = useState<string>("");
  const [sort, setSort] = useState<string>("newest");
  const [search, setSearch] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailPost, setShowDetailPost] = useState<CommunityPost | null>(null);
  const [showUserProfile, setShowUserProfile] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState<string | null>(null);

  const [detailComments, setDetailComments] = useState<CommentType[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);

  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [newestMembers, setNewestMembers] = useState<NewestMember[]>([]);
  const [popularCategories, setPopularCategories] = useState<PopularCategory[]>([]);
  const [recentDonations, setRecentDonations] = useState<CommunityPost[]>([]);

  const fetchPosts = useCallback(async (pageNum: number, replace = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);
      setError(null);

      const params = new URLSearchParams({ page: String(pageNum), limit: "10", sort });
      if (category) params.set("category", category);
      if (search) params.set("search", search);

      const result = await api.get<PostsResponse>(`/api/community/posts?${params}`);

      if (replace) {
        setPosts(result.posts);
      } else {
        setPosts((prev) => [...prev, ...result.posts]);
      }
      setHasMore(result.pagination.hasMore);
      setPage(pageNum);
    } catch (err: any) {
      setError(err.message || "Failed to load posts");
      toast.error(err.message || "Failed to load posts");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [category, sort, search]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) fetchPosts(page + 1);
  }, [loadingMore, hasMore, page, fetchPosts]);

  useEffect(() => {
    fetchPosts(1, true);
  }, [fetchPosts]);

  const loadSidebar = useCallback(async () => {
    try {
      const [statsRes, topicsRes, membersRes, categoriesRes, donationsRes] = await Promise.all([
        api.get<CommunityStats>("/api/community/posts/stats").catch(() => null),
        api.get<TrendingTopic[]>("/api/community/posts/trending-topics").catch(() => null),
        api.get<NewestMember[]>("/api/community/posts/newest-members").catch(() => null),
        api.get<PopularCategory[]>("/api/community/posts/popular-categories").catch(() => null),
        api.get<CommunityPost[]>("/api/community/posts/recent-donations").catch(() => null),
      ]);
      if (statsRes) setStats(statsRes);
      if (topicsRes) setTrendingTopics(topicsRes);
      if (membersRes) setNewestMembers(membersRes);
      if (categoriesRes) setPopularCategories(categoriesRes);
      if (donationsRes) setRecentDonations(donationsRes);
    } catch {}
  }, []);

  const refreshSidebar = useCallback(() => {
    loadSidebar();
  }, [loadSidebar]);

  useEffect(() => {
    if (!loading) loadSidebar();
  }, [loading, loadSidebar]);

  const createPost = useCallback(async (data: FormData | Record<string, any>) => {
    try {
      let result: CommunityPost;
      if (data instanceof FormData) {
        result = await api.post<CommunityPost>("/api/community/posts", {}, {
          method: "POST",
          body: data,
        });
      } else {
        result = await api.post<CommunityPost>("/api/community/posts", data as any);
      }
      setPosts((prev) => [result, ...prev]);
      setShowCreateModal(false);
      toast.success("Post created!");
      refreshSidebar();
    } catch (err: any) {
      toast.error(err.message || "Failed to create post");
    }
  }, [refreshSidebar]);

  const updatePost = useCallback(async (postId: string, data: Partial<CommunityPost>) => {
    try {
      const result = await api.put<CommunityPost>(`/api/community/posts/${postId}`, data as any);
      setPosts((prev) => prev.map((p) => (p._id === postId ? { ...p, ...result } : p)));
      if (showDetailPost?._id === postId) setShowDetailPost({ ...showDetailPost, ...result } as CommunityPost);
      toast.success("Post updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update post");
    }
  }, [showDetailPost]);

  const deletePost = useCallback(async (postId: string) => {
    try {
      await api.delete(`/api/community/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      if (showDetailPost?._id === postId) setShowDetailPost(null);
      toast.success("Post deleted");
      refreshSidebar();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete post");
    }
  }, [showDetailPost, refreshSidebar]);

  const toggleLike = useCallback(async (postId: string) => {
    try {
      const result = await api.post<{ liked: boolean; likeCount: number }>(`/api/community/posts/${postId}/like`);
      setPosts((prev) => prev.map((p) => p._id === postId ? { ...p, isLiked: result.liked, likeCount: result.likeCount } : p));
      if (showDetailPost?._id === postId) setShowDetailPost({ ...showDetailPost, isLiked: result.liked, likeCount: result.likeCount } as CommunityPost);
      refreshSidebar();
    } catch (err: any) {
      toast.error(err.message || "Failed to like post");
    }
  }, [showDetailPost, refreshSidebar]);

  const toggleBookmark = useCallback(async (postId: string) => {
    try {
      const result = await api.post<{ bookmarked: boolean; bookmarkCount: number }>(`/api/community/posts/${postId}/bookmark`);
      setPosts((prev) => prev.map((p) => p._id === postId ? { ...p, isBookmarked: result.bookmarked, bookmarkCount: result.bookmarkCount } : p));
      if (showDetailPost?._id === postId) setShowDetailPost({ ...showDetailPost, isBookmarked: result.bookmarked, bookmarkCount: result.bookmarkCount } as CommunityPost);
      toast.success(result.bookmarked ? "Bookmarked!" : "Bookmark removed");
      refreshSidebar();
    } catch (err: any) {
      toast.error(err.message || "Failed to bookmark post");
    }
  }, [showDetailPost, refreshSidebar]);

  const sharePost = useCallback(async (postId: string) => {
    try {
      const result = await api.post<{ shareUrl: string }>(`/api/community/posts/${postId}/share`);
      await navigator.clipboard.writeText(result.shareUrl);
      toast.success("Link copied to clipboard!");
      setPosts((prev) => prev.map((p) => p._id === postId ? { ...p, shareCount: (p.shareCount || 0) + 1 } : p));
    } catch {
      toast.error("Failed to copy link");
    }
  }, []);

  const reportPost = useCallback(async (postId: string, reason: string, description?: string) => {
    try {
      await api.post(`/api/community/posts/${postId}/report`, { reason, description });
      setShowReportModal(null);
      toast.success("Report submitted");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit report");
    }
  }, []);

  const loadComments = useCallback(async (postId: string) => {
    setDetailLoading(true);
    try {
      const comments = await api.get<CommentType[]>(`/api/community/posts/${postId}/comments`);
      setDetailComments(comments);
    } catch {
      toast.error("Failed to load comments");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const createComment = useCallback(async (postId: string, text: string, parentId?: string) => {
    try {
      const comment = await api.post<CommentType>(`/api/community/posts/${postId}/comments`, { text, parentId });
      if (parentId) {
        setDetailComments((prev) => prev.map((c) => c._id === parentId ? { ...c, replies: [...(c.replies || []), comment] } : c));
      } else {
        setDetailComments((prev) => [...prev, comment]);
      }
      setPosts((prev) => prev.map((p) => p._id === postId ? { ...p, commentCount: p.commentCount + 1 } : p));
      if (showDetailPost?._id === postId) setShowDetailPost({ ...showDetailPost, commentCount: showDetailPost.commentCount + 1 } as CommunityPost);
      refreshSidebar();
    } catch (err: any) {
      toast.error(err.message || "Failed to comment");
    }
  }, [showDetailPost, refreshSidebar]);

  const deleteComment = useCallback(async (commentId: string, postId: string) => {
    try {
      await api.delete(`/api/community/comments/${commentId}`);
      setDetailComments((prev) => prev.filter((c) => c._id !== commentId));
      setPosts((prev) => prev.map((p) => p._id === postId ? { ...p, commentCount: Math.max(0, p.commentCount - 1) } : p));
      refreshSidebar();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete comment");
    }
  }, [refreshSidebar]);

  const loadProfile = useCallback(async (userId: string) => {
    try {
      const profile = await api.get<UserProfile>(`/api/community/users/${userId}/profile`);
      setProfileData(profile);
    } catch {
      toast.error("Failed to load profile");
    }
  }, []);

  const clearFilters = useCallback(() => {
    setCategory("");
    setSearch("");
    setSort("newest");
  }, []);

  return {
    posts, loading, loadingMore, hasMore, error,
    page, category, sort, search,
    showCreateModal, showDetailPost, showUserProfile, showReportModal,
    detailComments, detailLoading, profileData,
    stats, trendingTopics, newestMembers, popularCategories, recentDonations,

    setCategory, setSort, setSearch,
    setShowCreateModal, setShowDetailPost, setShowUserProfile, setShowReportModal,
    setDetailComments, setProfileData,
    fetchPosts, loadMore, clearFilters,
    createPost, updatePost, deletePost,
    toggleLike, toggleBookmark, sharePost, reportPost,
    loadComments, createComment, deleteComment,
    loadProfile, refreshSidebar,
  };
}

export type CommunityController = ReturnType<typeof useCommunityController>;
