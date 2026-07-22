import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import CommunityPost from "../models/CommunityPost.js";
import Comment from "../models/Comment.js";
import Like from "../models/Like.js";
import Bookmark from "../models/Bookmark.js";
import Report from "../models/Report.js";
import NotInterested from "../models/NotInterested.js";
import Achievement from "../models/Achievement.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import Donation from "../models/Donation.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ObjectId = mongoose.Types.ObjectId;

function createNotification(userId, fromUserId, type, postId, message) {
  return Notification.create({
    recipientUser: userId,
    senderUser: fromUserId,
    type: type === "like" ? "community_like" : type === "comment" ? "community_comment" : type === "reply" ? "community_reply" : "system",
    title: message,
    message: "",
    relatedId: postId,
    isRead: false,
  });
}

function getTrendingScore(post, now) {
  const ageHours = (now - new Date(post.createdAt)) / 3600000;
  const recency = Math.max(0, 1 - ageHours / 168);
  return (post.likeCount || 0) * 2 + (post.commentCount || 0) * 3 + (post.bookmarkCount || 0) * 1.5 + recency * 10;
}

async function checkAchievements(userId) {
  const postCount = await CommunityPost.countDocuments({ userId, isDeleted: false });
  const donationPosts = await CommunityPost.countDocuments({ userId, category: "Donation", isDeleted: false });
  const totalLikes = await CommunityPost.aggregate([
    { $match: { userId: new ObjectId(userId), isDeleted: false } },
    { $group: { _id: null, total: { $sum: "$likeCount" } } },
  ]);
  const recipePosts = await CommunityPost.countDocuments({ userId, category: "Recipes", isDeleted: false });
  const ecoDonations = await Donation.countDocuments({ userId, status: "Completed" });

  const badges = [];
  if (postCount >= 1) badges.push("First Post");
  if (donationPosts >= 1) badges.push("First Donation");
  if (donationPosts >= 5) badges.push("Top Donor");
  if ((totalLikes[0]?.total || 0) >= 10) badges.push("Helpful Member");
  if (recipePosts >= 5) badges.push("Recipe Expert");
  if (ecoDonations >= 5) badges.push("Eco Champion");

  for (const badge of badges) {
    await Achievement.updateOne(
      { userId, badge },
      { $setOnInsert: { userId, badge } },
      { upsert: true }
    );
  }
}

export async function createPost(req, res) {
  try {
    const userId = req.user.id;
    const isMultipart = req.files !== undefined;

    let title, content, category, tags, location, pickupAvailable, visibility, donationId, inventoryItemIds;
    let images = [];
    let videos = [];

    if (isMultipart) {
      title = req.body.title;
      content = req.body.content;
      category = req.body.category;
      tags = req.body.tags ? (typeof req.body.tags === "string" ? JSON.parse(req.body.tags) : req.body.tags) : [];
      location = req.body.location ? (typeof req.body.location === "string" ? JSON.parse(req.body.location) : req.body.location) : undefined;
      pickupAvailable = req.body.pickupAvailable === "true" || req.body.pickupAvailable === true;
      visibility = req.body.visibility || "public";
      donationId = req.body.donationId || null;
      inventoryItemIds = req.body.inventoryItemIds ? (typeof req.body.inventoryItemIds === "string" ? JSON.parse(req.body.inventoryItemIds) : req.body.inventoryItemIds) : [];

      for (const file of req.files) {
        const url = `/uploads/${file.filename}`;
        if (file.mimetype.startsWith("video/")) {
          videos.push(url);
        } else {
          images.push(url);
        }
      }
    } else {
      title = req.body.title;
      content = req.body.content;
      category = req.body.category;
      images = req.body.images || [];
      videos = req.body.videos || [];
      tags = req.body.tags || [];
      location = req.body.location;
      pickupAvailable = req.body.pickupAvailable;
      visibility = req.body.visibility;
      donationId = req.body.donationId;
      inventoryItemIds = req.body.inventoryItemIds;
    }

    if (!content) return res.status(400).json({ message: "Content is required" });
    if (images.length > 5) return res.status(400).json({ message: "Maximum 5 images allowed" });
    if (videos.length > 5) return res.status(400).json({ message: "Maximum 5 videos allowed" });

    const post = await CommunityPost.create({
      userId,
      title: title || "",
      content,
      category: category || "Other",
      images,
      videos,
      tags: tags || [],
      location: location || { type: "Point", coordinates: [0, 0], city: "", district: "", country: "", displayName: "" },
      pickupAvailable: pickupAvailable || false,
      visibility: visibility || "public",
      donationId: donationId || null,
      inventoryItemIds: inventoryItemIds || [],
    });

    await checkAchievements(userId);

    const populated = await CommunityPost.findById(post._id).populate("userId", "name profilePicture").lean();

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: "Failed to create post", error: err.message });
  }
}

export async function getPosts(req, res) {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, category, sort, search, tag } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const filter = { isDeleted: false };

    const hiddenIds = await NotInterested.find({ userId }).select("postId").lean();
    const hiddenPostIds = hiddenIds.map((h) => h.postId);
    if (hiddenPostIds.length > 0) filter._id = { $nin: hiddenPostIds };

    if (category) filter.category = category;
    if (tag) filter.tags = tag;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === "popular") sortOption = { likeCount: -1, commentCount: -1, createdAt: -1 };
    if (sort === "trending") sortOption = { likeCount: -1, bookmarkCount: -1, createdAt: -1 };

    const [posts, total] = await Promise.all([
      CommunityPost.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .populate("userId", "name profilePicture")
        .lean(),
      CommunityPost.countDocuments(filter),
    ]);

    const postIds = posts.map((p) => p._id);
    const userBookmarks = await Bookmark.find({ userId, postId: { $in: postIds } }).lean();
    const bookmarkedIds = new Set(userBookmarks.map((b) => b.postId.toString()));

    const enriched = posts.map((p) => ({
      ...p,
      isBookmarked: bookmarkedIds.has(p._id.toString()),
      isLiked: p.likes?.some((id) => id.toString() === userId) || false,
    }));

    res.json({
      posts: enriched,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum), hasMore: skip + limitNum < total },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load posts", error: err.message });
  }
}

export async function getPost(req, res) {
  try {
    const userId = req.user.id;
    const post = await CommunityPost.findById(req.params.id)
      .populate("userId", "name profilePicture")
      .lean();
    if (!post || post.isDeleted) return res.status(404).json({ message: "Post not found" });

    const isBookmarked = !!(await Bookmark.findOne({ userId, postId: post._id }).lean());
    const isLiked = post.likes?.some((id) => id.toString() === userId) || false;

    res.json({ ...post, isBookmarked, isLiked });
  } catch (err) {
    res.status(500).json({ message: "Failed to load post", error: err.message });
  }
}

export async function updatePost(req, res) {
  try {
    const userId = req.user.id;
    const post = await CommunityPost.findById(req.params.id);
    if (!post || post.isDeleted) return res.status(404).json({ message: "Post not found" });
    if (post.userId.toString() !== userId) return res.status(403).json({ message: "Not authorized" });

    const isMultipart = req.files !== undefined;

    if (isMultipart) {
      const allowed = ["title", "content", "category", "tags", "location", "pickupAvailable", "visibility"];
      for (const field of allowed) {
        if (req.body[field] !== undefined) {
          if (field === "tags" || field === "location") {
            post[field] = typeof req.body[field] === "string" ? JSON.parse(req.body[field]) : req.body[field];
          } else if (field === "pickupAvailable") {
            post[field] = req.body[field] === "true" || req.body[field] === true;
          } else {
            post[field] = req.body[field];
          }
        }
      }
      if (req.body.keepImages) {
        post.images = typeof req.body.keepImages === "string" ? JSON.parse(req.body.keepImages) : req.body.keepImages;
      }
      if (req.body.keepVideos) {
        post.videos = typeof req.body.keepVideos === "string" ? JSON.parse(req.body.keepVideos) : req.body.keepVideos;
      }
      if (req.files.length > 0) {
        for (const file of req.files) {
          const url = `/uploads/${file.filename}`;
          if (file.mimetype.startsWith("video/")) {
            if (!post.videos.includes(url)) post.videos.push(url);
          } else {
            if (!post.images.includes(url)) post.images.push(url);
          }
        }
      }
      if (post.images.length > 5) return res.status(400).json({ message: "Maximum 5 images" });
      if (post.videos.length > 5) return res.status(400).json({ message: "Maximum 5 videos" });

      if (req.body.removeImages) {
        const toRemove = typeof req.body.removeImages === "string" ? JSON.parse(req.body.removeImages) : req.body.removeImages;
        post.images = post.images.filter((img) => !toRemove.includes(img));
        for (const imgPath of toRemove) {
          const filePath = path.join(__dirname, "..", imgPath);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
      }
      if (req.body.removeVideos) {
        const toRemove = typeof req.body.removeVideos === "string" ? JSON.parse(req.body.removeVideos) : req.body.removeVideos;
        post.videos = post.videos.filter((v) => !toRemove.includes(v));
        for (const vPath of toRemove) {
          const filePath = path.join(__dirname, "..", vPath);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
      }
    } else {
      const allowed = ["title", "content", "category", "images", "videos", "tags", "location", "pickupAvailable", "visibility"];
      for (const field of allowed) {
        if (req.body[field] !== undefined) post[field] = req.body[field];
      }
      if (req.body.images && req.body.images.length > 5) return res.status(400).json({ message: "Maximum 5 images" });
      if (req.body.videos && req.body.videos.length > 5) return res.status(400).json({ message: "Maximum 5 videos" });
    }

    await post.save();
    const updated = await CommunityPost.findById(post._id).populate("userId", "name profilePicture").lean();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update post", error: err.message });
  }
}

export async function deletePost(req, res) {
  try {
    const userId = req.user.id;
    const post = await CommunityPost.findById(req.params.id);
    if (!post || post.isDeleted) return res.status(404).json({ message: "Post not found" });
    if (post.userId.toString() !== userId) return res.status(403).json({ message: "Not authorized" });

    post.isDeleted = true;
    await post.save();

    await Comment.updateMany({ postId: post._id }, { isDeleted: true });

    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete post", error: err.message });
  }
}

export async function toggleLike(req, res) {
  try {
    const userId = req.user.id;
    const postId = req.params.id;

    const post = await CommunityPost.findById(postId);
    if (!post || post.isDeleted) return res.status(404).json({ message: "Post not found" });

    const existing = await Like.findOne({ postId, userId });
    if (existing) {
      await Like.deleteOne({ _id: existing._id });
      post.likes = post.likes.filter((id) => id.toString() !== userId);
      post.likeCount = Math.max(0, post.likeCount - 1);
      await post.save();
      return res.json({ liked: false, likeCount: post.likeCount });
    }

    await Like.create({ postId, userId });
    post.likes.push(userId);
    post.likeCount = (post.likeCount || 0) + 1;
    await post.save();

    if (post.userId.toString() !== userId) {
      await createNotification(post.userId, userId, "like", postId, "Someone liked your post.");
    }

    res.json({ liked: true, likeCount: post.likeCount });
  } catch (err) {
    res.status(500).json({ message: "Failed to toggle like", error: err.message });
  }
}

export async function getComments(req, res) {
  try {
    const postId = req.params.id;
    const { sort: sortOrder = "newest" } = req.query;
    const sortDir = sortOrder === "oldest" ? 1 : -1;

    const comments = await Comment.find({ postId, parentId: null, isDeleted: false })
      .sort({ createdAt: sortDir })
      .populate("userId", "name profilePicture")
      .lean();

    const commentIds = comments.map((c) => c._id);
    const replies = await Comment.find({ parentId: { $in: commentIds }, isDeleted: false })
      .sort({ createdAt: 1 })
      .populate("userId", "name profilePicture")
      .lean();

    const replyMap = {};
    for (const r of replies) {
      const pid = r.parentId.toString();
      if (!replyMap[pid]) replyMap[pid] = [];
      replyMap[pid].push(r);
    }

    const enriched = comments.map((c) => ({ ...c, replies: replyMap[c._id.toString()] || [] }));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: "Failed to load comments", error: err.message });
  }
}

export async function createComment(req, res) {
  try {
    const userId = req.user.id;
    const postId = req.params.id;
    const { text, parentId } = req.body;

    if (!text || !text.trim()) return res.status(400).json({ message: "Text is required" });

    const post = await CommunityPost.findById(postId);
    if (!post || post.isDeleted) return res.status(404).json({ message: "Post not found" });

    if (parentId) {
      const parent = await Comment.findById(parentId);
      if (!parent || parent.isDeleted) return res.status(404).json({ message: "Parent comment not found" });
    }

    const comment = await Comment.create({ postId, userId, text, parentId: parentId || null });
    post.commentCount = (post.commentCount || 0) + 1;
    await post.save();

    const populated = await Comment.findById(comment._id).populate("userId", "name profilePicture").lean();

    if (post.userId.toString() !== userId) {
      const notifType = parentId ? "reply" : "comment";
      await createNotification(post.userId, userId, notifType, postId, parentId ? "Someone replied to a comment." : "Someone commented on your post.");
    }

    if (parentId) {
      const parentComment = await Comment.findById(parentId);
      if (parentComment && parentComment.userId.toString() !== userId) {
        await createNotification(parentComment.userId, userId, "reply", postId, "Someone replied to your comment.");
      }
    }

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: "Failed to create comment", error: err.message });
  }
}

export async function updateComment(req, res) {
  try {
    const userId = req.user.id;
    const comment = await Comment.findById(req.params.commentId);
    if (!comment || comment.isDeleted) return res.status(404).json({ message: "Comment not found" });
    if (comment.userId.toString() !== userId) return res.status(403).json({ message: "Not authorized" });

    comment.text = req.body.text;
    await comment.save();
    res.json(comment);
  } catch (err) {
    res.status(500).json({ message: "Failed to update comment", error: err.message });
  }
}

export async function deleteComment(req, res) {
  try {
    const userId = req.user.id;
    const comment = await Comment.findById(req.params.commentId);
    if (!comment || comment.isDeleted) return res.status(404).json({ message: "Comment not found" });
    if (comment.userId.toString() !== userId) return res.status(403).json({ message: "Not authorized" });

    comment.isDeleted = true;
    await comment.save();

    await CommunityPost.updateOne({ _id: comment.postId }, { $inc: { commentCount: -1 } });

    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete comment", error: err.message });
  }
}

export async function toggleBookmark(req, res) {
  try {
    const userId = req.user.id;
    const postId = req.params.id;

    const post = await CommunityPost.findById(postId);
    if (!post || post.isDeleted) return res.status(404).json({ message: "Post not found" });

    const existing = await Bookmark.findOne({ postId, userId });
    if (existing) {
      await Bookmark.deleteOne({ _id: existing._id });
      post.bookmarkCount = Math.max(0, post.bookmarkCount - 1);
      await post.save();
      return res.json({ bookmarked: false, bookmarkCount: post.bookmarkCount });
    }

    await Bookmark.create({ postId, userId });
    post.bookmarkCount = (post.bookmarkCount || 0) + 1;
    await post.save();

    if (post.userId.toString() !== userId) {
      await createNotification(post.userId, userId, "bookmark", postId, "Someone bookmarked your post.");
    }

    res.json({ bookmarked: true, bookmarkCount: post.bookmarkCount });
  } catch (err) {
    res.status(500).json({ message: "Failed to toggle bookmark", error: err.message });
  }
}

export async function getBookmarks(req, res) {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    const bookmarks = await Bookmark.find({ userId })
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    const postIds = bookmarks.map((b) => b.postId);
    const posts = await CommunityPost.find({ _id: { $in: postIds }, isDeleted: false })
      .populate("userId", "name profilePicture")
      .lean();

    const postMap = {};
    for (const p of posts) postMap[p._id.toString()] = { ...p, isBookmarked: true };

    const enriched = bookmarks.map((b) => postMap[b.postId.toString()]).filter(Boolean);

    res.json({ posts: enriched });
  } catch (err) {
    res.status(500).json({ message: "Failed to load bookmarks", error: err.message });
  }
}

export async function createReport(req, res) {
  try {
    const userId = req.user.id;
    const postId = req.params.id;
    const { reason, description } = req.body;

    const post = await CommunityPost.findById(postId);
    if (!post || post.isDeleted) return res.status(404).json({ message: "Post not found" });

    const existing = await Report.findOne({ postId, userId });
    if (existing) return res.status(400).json({ message: "You already reported this post" });

    await Report.create({ postId, userId, reason, description: description || "" });
    res.json({ message: "Report submitted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to submit report", error: err.message });
  }
}

export async function getTrending(req, res) {
  try {
    const posts = await CommunityPost.find({ isDeleted: false, createdAt: { $gte: new Date(Date.now() - 7 * 86400000) } })
      .populate("userId", "name profilePicture")
      .lean();

    const now = new Date();
    posts.sort((a, b) => getTrendingScore(b, now) - getTrendingScore(a, now));

    res.json(posts.slice(0, 10));
  } catch (err) {
    res.status(500).json({ message: "Failed to load trending", error: err.message });
  }
}

export async function getStats(req, res) {
  try {
    const userId = req.user.id;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart.getTime() - todayStart.getDay() * 86400000);
    const monthAgo = new Date(now.getTime() - 30 * 86400000);

    const [
      totalPosts,
      totalComments,
      totalLikes,
      totalBookmarks,
      todayPosts,
      weekPosts,
      activeUsers,
    ] = await Promise.all([
      CommunityPost.countDocuments({ isDeleted: false }),
      Comment.countDocuments({ isDeleted: false }),
      Like.countDocuments(),
      Bookmark.countDocuments(),
      CommunityPost.countDocuments({ isDeleted: false, createdAt: { $gte: todayStart } }),
      CommunityPost.countDocuments({ isDeleted: false, createdAt: { $gte: weekStart } }),
      CommunityPost.distinct("userId", { createdAt: { $gte: monthAgo }, isDeleted: false }).then((u) => u.length),
    ]);

    const userAchievements = await Achievement.find({ userId }).lean();
    const userPostCount = await CommunityPost.countDocuments({ userId, isDeleted: false });

    res.json({
      totalPosts,
      totalComments,
      totalLikes,
      totalBookmarks,
      todayPosts,
      weekPosts,
      activeUsers,
      userStats: { postCount: userPostCount, achievements: userAchievements },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load stats", error: err.message });
  }
}

export async function getNearbyPosts(req, res) {
  try {
    const userId = req.user.id;
    const { lng, lat, maxDistance = 50000, page = 1, limit = 10 } = req.query;

    if (!lng || !lat) return res.status(400).json({ message: "Longitude and latitude required" });

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    const filter = {
      isDeleted: false,
      "location.coordinates": {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(maxDistance),
        },
      },
    };

    const [posts, total] = await Promise.all([
      CommunityPost.find(filter)
        .limit(limitNum)
        .skip((pageNum - 1) * limitNum)
        .populate("userId", "name profilePicture")
        .lean(),
      CommunityPost.countDocuments(filter),
    ]);

    const enriched = posts.map((p) => ({
      ...p,
      distance: p.location?.coordinates ? calculateDistance(lat, lng, p.location.coordinates[1], p.location.coordinates[0]) : null,
    }));

    res.json({ posts: enriched, pagination: { page: pageNum, limit: limitNum, total, hasMore: (pageNum * limitNum) < total } });
  } catch (err) {
    res.status(500).json({ message: "Failed to load nearby posts", error: err.message });
  }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function getDonationMap(req, res) {
  try {
    const { maxDistance = 50000, lng, lat } = req.query;

    const filter = {
      isDeleted: false,
      category: "Donation",
      "location.coordinates": { $ne: [0, 0] },
    };

    if (lng && lat) {
      filter["location.coordinates"] = {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(maxDistance),
        },
      };
    }

    const posts = await CommunityPost.find(filter)
      .populate("userId", "name profilePicture")
      .limit(100)
      .lean();

    const markers = posts.map((p) => ({
      id: p._id,
      title: p.title || p.content?.slice(0, 50),
      foodName: p.title,
      quantity: p.donationId ? "" : "",
      image: p.images?.[0] || null,
      lng: p.location.coordinates[0],
      lat: p.location.coordinates[1],
      city: p.location.city,
      distance: (lng && lat) ? calculateDistance(parseFloat(lat), parseFloat(lng), p.location.coordinates[1], p.location.coordinates[0]) : null,
      postId: p._id,
    }));

    res.json({ markers });
  } catch (err) {
    res.status(500).json({ message: "Failed to load donation map", error: err.message });
  }
}

export async function sharePost(req, res) {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post || post.isDeleted) return res.status(404).json({ message: "Post not found" });

    post.shareCount = (post.shareCount || 0) + 1;
    await post.save();

    const shareUrl = `${req.protocol}://${req.get("host") || "localhost:8080"}/app/community?post=${post._id}`;

    res.json({ shareUrl, shareCount: post.shareCount });
  } catch (err) {
    res.status(500).json({ message: "Failed to share post", error: err.message });
  }
}

export async function toggleNotInterested(req, res) {
  try {
    const userId = req.user.id;
    const postId = req.params.id;

    const post = await CommunityPost.findById(postId);
    if (!post || post.isDeleted) return res.status(404).json({ message: "Post not found" });

    const existing = await NotInterested.findOne({ userId, postId });
    if (existing) {
      await NotInterested.deleteOne({ _id: existing._id });
      return res.json({ notInterested: false });
    }

    await NotInterested.create({ userId, postId });
    res.json({ notInterested: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to toggle not interested", error: err.message });
  }
}

export async function getUserProfile(req, res) {
  try {
    const profileUserId = req.params.userId;

    const user = await User.findById(profileUserId, "name profilePicture createdAt").lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const [postCount, totalLikesAgg, achievements, recentPosts, donationCount] = await Promise.all([
      CommunityPost.countDocuments({ userId: profileUserId, isDeleted: false }),
      CommunityPost.aggregate([
        { $match: { userId: new ObjectId(profileUserId), isDeleted: false } },
        { $group: { _id: null, total: { $sum: "$likeCount" } } },
      ]),
      Achievement.find({ userId: profileUserId }).lean(),
      CommunityPost.find({ userId: profileUserId, isDeleted: false })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("userId", "name profilePicture")
        .lean(),
      Donation.countDocuments({ userId: profileUserId, status: "Completed" }),
    ]);

    res.json({
      user,
      stats: {
        postCount,
        totalLikes: totalLikesAgg[0]?.total || 0,
        donations: donationCount,
        foodSaved: `${donationCount * 2} kg`,
        joinedDate: user.createdAt,
        badges: achievements.map((a) => a.badge),
      },
      recentPosts,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load profile", error: err.message });
  }
}

export async function getUserPosts(req, res) {
  try {
    const userId = req.params.userId;
    const posts = await CommunityPost.find({ userId, isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("userId", "name profilePicture")
      .lean();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Failed to load user posts", error: err.message });
  }
}

export async function getTrendingTopics(req, res) {
  try {
    const tags = await CommunityPost.aggregate([
      { $match: { isDeleted: false, tags: { $exists: true, $ne: [] } } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    res.json(tags.map((t) => ({ tag: t._id, count: t.count })));
  } catch (err) {
    res.status(500).json({ message: "Failed to load trending topics", error: err.message });
  }
}

export async function getNewestMembers(req, res) {
  try {
    const users = await User.find({}, "name profilePicture createdAt")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    const enriched = await Promise.all(
      users.map(async (u) => {
        const postCount = await CommunityPost.countDocuments({ userId: u._id, isDeleted: false });
        return { ...u, postCount };
      })
    );
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: "Failed to load newest members", error: err.message });
  }
}

export async function getPopularCategories(req, res) {
  try {
    const categories = await CommunityPost.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: "$category", count: { $sum: 1 }, likes: { $sum: "$likeCount" } } },
      { $sort: { count: -1 } },
    ]);
    res.json(categories.map((c) => ({ category: c._id, count: c.count, likes: c.likes })));
  } catch (err) {
    res.status(500).json({ message: "Failed to load categories", error: err.message });
  }
}

export async function getRecentDonations(req, res) {
  try {
    const posts = await CommunityPost.find({ category: "Donation", isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "name profilePicture")
      .lean();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Failed to load recent donations", error: err.message });
  }
}

export async function getAchievements(req, res) {
  try {
    const { userId } = req.params;
    const achievements = await Achievement.find({ userId }).lean();
    res.json(achievements.map((a) => a.badge));
  } catch (err) {
    res.status(500).json({ message: "Failed to load achievements", error: err.message });
  }
}
