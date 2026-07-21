export type Location = {
  type: "Point";
  coordinates: [number, number];
  city: string;
  district: string;
  country: string;
  displayName: string;
};

export type CommunityUser = {
  _id: string;
  name: string;
  profilePicture?: string;
};

export type CommunityPost = {
  _id: string;
  userId: CommunityUser;
  title: string;
  content: string;
  category: string;
  images: string[];
  tags: string[];
  location: Location;
  pickupAvailable: boolean;
  visibility: "public" | "community";
  donationId?: string;
  mealPlanId?: string;
  inventoryItemIds: string[];
  likes: string[];
  likeCount: number;
  commentCount: number;
  bookmarkCount: number;
  shareCount: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  isLiked: boolean;
  isBookmarked: boolean;
};

export type CommentType = {
  _id: string;
  postId: string;
  userId: CommunityUser;
  parentId: string | null;
  text: string;
  isDeleted: boolean;
  createdAt: string;
  replies?: CommentType[];
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasMore: boolean;
};

export type PostsResponse = {
  posts: CommunityPost[];
  pagination: Pagination;
};

export type CommunityStats = {
  totalPosts: number;
  totalComments: number;
  totalLikes: number;
  totalBookmarks: number;
  todayPosts: number;
  weekPosts: number;
  activeUsers: number;
  userStats: {
    postCount: number;
    achievements: { badge: string }[];
  };
};

export type TrendingTopic = {
  tag: string;
  count: number;
};

export type NewestMember = {
  _id: string;
  name: string;
  profilePicture?: string;
  createdAt: string;
  postCount: number;
};

export type PopularCategory = {
  category: string;
  count: number;
  likes: number;
};

export type UserProfile = {
  user: CommunityUser & { createdAt: string };
  stats: {
    postCount: number;
    totalLikes: number;
    donations: number;
    foodSaved: string;
    joinedDate: string;
    badges: string[];
  };
  recentPosts: CommunityPost[];
};

export type MapMarker = {
  id: string;
  title: string;
  foodName: string;
  quantity: string;
  image: string | null;
  lng: number;
  lat: number;
  city: string;
  distance: number | null;
  postId: string;
};

export const CATEGORIES = [
  "Recipes",
  "Food Tips",
  "Donation",
  "Question",
  "Discussion",
  "Success Story",
  "Events",
  "Volunteer",
  "Other",
] as const;

export const REPORT_REASONS = ["Spam", "Harassment", "Fake Donation", "Other"] as const;

export const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Most Popular", value: "popular" },
  { label: "Trending", value: "trending" },
] as const;

export const DISTANCE_OPTIONS = [
  { label: "5 km", value: 5000 },
  { label: "10 km", value: 10000 },
  { label: "25 km", value: 25000 },
  { label: "50 km", value: 50000 },
] as const;

export const NEPAL_CENTER = { lat: 27.7172, lng: 85.3240 };
export const MALAYSIA_CENTER = { lat: 3.1390, lng: 101.6869 };
export const ALLOWED_COUNTRIES = ["Nepal", "Malaysia"];
