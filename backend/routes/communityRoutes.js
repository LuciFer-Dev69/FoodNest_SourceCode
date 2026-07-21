import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import {
  createPost, getPosts, getPost, updatePost, deletePost,
  toggleLike, getComments, createComment, updateComment, deleteComment,
  toggleBookmark, getBookmarks, createReport,
  getTrending, getStats, getNearbyPosts, getDonationMap, sharePost,
  getUserProfile, getUserPosts, getTrendingTopics, getNewestMembers,
  getPopularCategories, getRecentDonations, getAchievements,
} from "../controllers/communityController.js";

const router = express.Router();

router.get("/posts", authenticateToken, getPosts);
router.post("/posts", authenticateToken, createPost);
router.get("/posts/trending", authenticateToken, getTrending);
router.get("/posts/nearby", authenticateToken, getNearbyPosts);
router.get("/posts/donation-map", authenticateToken, getDonationMap);
router.get("/posts/stats", authenticateToken, getStats);
router.get("/posts/trending-topics", authenticateToken, getTrendingTopics);
router.get("/posts/newest-members", authenticateToken, getNewestMembers);
router.get("/posts/popular-categories", authenticateToken, getPopularCategories);
router.get("/posts/recent-donations", authenticateToken, getRecentDonations);
router.get("/posts/:id", authenticateToken, getPost);
router.put("/posts/:id", authenticateToken, updatePost);
router.delete("/posts/:id", authenticateToken, deletePost);
router.post("/posts/:id/like", authenticateToken, toggleLike);
router.post("/posts/:id/bookmark", authenticateToken, toggleBookmark);
router.post("/posts/:id/report", authenticateToken, createReport);
router.post("/posts/:id/share", authenticateToken, sharePost);
router.get("/posts/:id/comments", authenticateToken, getComments);
router.post("/posts/:id/comments", authenticateToken, createComment);
router.put("/comments/:commentId", authenticateToken, updateComment);
router.delete("/comments/:commentId", authenticateToken, deleteComment);
router.get("/bookmarks", authenticateToken, getBookmarks);
router.get("/users/:userId/profile", authenticateToken, getUserProfile);
router.get("/users/:userId/posts", authenticateToken, getUserPosts);
router.get("/achievements/:userId", authenticateToken, getAchievements);

export default router;
