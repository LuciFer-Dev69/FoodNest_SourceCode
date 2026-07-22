import MealPlan from "../models/MealPlan.js";
import FavoriteRecipe from "../models/FavoriteRecipe.js";
import Inventory from "../models/Inventory.js";
import Notification from "../models/Notification.js";

const RECIPE_DATABASE = [
  { name: "Chiura (Beaten Rice)", emoji: "🍚", ingredients: ["Chiura", "Yogurt", "Sugar", "Banana"], difficulty: "Easy", time: "5 min", category: "Breakfast" },
  { name: "Chiya & Biscuit", emoji: "🍪", ingredients: ["Tea", "Milk", "Sugar", "Biscuit"], difficulty: "Easy", time: "10 min", category: "Breakfast" },
  { name: "Aloo Paratha", emoji: "🫓", ingredients: ["Flour", "Potato", "Butter", "Salt", "Spices"], difficulty: "Medium", time: "25 min", category: "Breakfast" },
  { name: "Vegetable Paratha", emoji: "🫓", ingredients: ["Flour", "Cauliflower", "Onion", "Butter", "Spices"], difficulty: "Medium", time: "25 min", category: "Breakfast" },
  { name: "Roti & Tarkari", emoji: "🫓", ingredients: ["Flour", "Potato", "Tomato", "Onion", "Spices"], difficulty: "Medium", time: "30 min", category: "Breakfast" },
  { name: "Sel Roti", emoji: "🍩", ingredients: ["Rice", "Sugar", "Butter", "Spices"], difficulty: "Medium", time: "30 min", category: "Breakfast" },
  { name: "Boiled Eggs", emoji: "🥚", ingredients: ["Eggs", "Salt", "Pepper"], difficulty: "Easy", time: "10 min", category: "Breakfast" },
  { name: "Omelette", emoji: "🍳", ingredients: ["Eggs", "Onion", "Tomato", "Salt", "Spices"], difficulty: "Easy", time: "10 min", category: "Breakfast" },
  { name: "Bread & Jam", emoji: "🍞", ingredients: ["Bread", "Jam"], difficulty: "Easy", time: "5 min", category: "Breakfast" },
  { name: "Bread & Peanut Butter", emoji: "🥜", ingredients: ["Bread", "Peanut Butter"], difficulty: "Easy", time: "5 min", category: "Breakfast" },
  { name: "Porridge", emoji: "🥣", ingredients: ["Oats", "Milk", "Sugar", "Banana"], difficulty: "Easy", time: "10 min", category: "Breakfast" },
  { name: "Suji Halwa", emoji: "🍮", ingredients: ["Semolina", "Sugar", "Butter", "Milk", "Spices"], difficulty: "Easy", time: "15 min", category: "Breakfast" },
  { name: "Milk & Cornflakes", emoji: "🥛", ingredients: ["Milk", "Cornflakes", "Sugar"], difficulty: "Easy", time: "5 min", category: "Breakfast" },
  { name: "Fruits", emoji: "🍎", ingredients: ["Banana", "Apple", "Orange", "Mango", "Papaya"], difficulty: "Easy", time: "5 min", category: "Breakfast" },
  { name: "Yogurt & Fruits", emoji: "🥛", ingredients: ["Yogurt", "Banana", "Apple", "Sugar"], difficulty: "Easy", time: "5 min", category: "Breakfast" },
  { name: "Nasi Lemak", emoji: "🍚", ingredients: ["Rice", "Coconut Milk", "Eggs", "Cucumber", "Peanuts"], difficulty: "Medium", time: "30 min", category: "Breakfast" },
  { name: "Roti Canai", emoji: "🫓", ingredients: ["Flour", "Butter", "Eggs", "Milk"], difficulty: "Medium", time: "25 min", category: "Breakfast" },
  { name: "Roti Telur", emoji: "🫓", ingredients: ["Flour", "Eggs", "Butter", "Onion"], difficulty: "Medium", time: "20 min", category: "Breakfast" },
  { name: "Kaya Toast", emoji: "🍞", ingredients: ["Bread", "Eggs", "Butter"], difficulty: "Easy", time: "10 min", category: "Breakfast" },
  { name: "Half-Boiled Eggs", emoji: "🥚", ingredients: ["Eggs", "Soy Sauce", "Pepper"], difficulty: "Easy", time: "8 min", category: "Breakfast" },
  { name: "Fried Noodles", emoji: "🍜", ingredients: ["Noodles", "Eggs", "Soy Sauce", "Carrot", "Cabbage"], difficulty: "Easy", time: "15 min", category: "Breakfast" },
  { name: "Banana Pancakes", emoji: "🥞", ingredients: ["Banana", "Flour", "Eggs", "Milk", "Butter"], difficulty: "Easy", time: "15 min", category: "Breakfast" },
  { name: "Cereal & Milk", emoji: "🥣", ingredients: ["Milk", "Oats", "Sugar"], difficulty: "Easy", time: "5 min", category: "Breakfast" },
  { name: "Dal Bhat Tarkari", emoji: "🍛", ingredients: ["Rice", "Lentils", "Potato", "Tomato", "Onion", "Spices"], difficulty: "Medium", time: "40 min", category: "Lunch" },
  { name: "Dal Bhat Chicken Curry", emoji: "🍗", ingredients: ["Rice", "Lentils", "Chicken", "Onion", "Tomato", "Spices"], difficulty: "Medium", time: "45 min", category: "Lunch" },
  { name: "Dal Bhat Mutton Curry", emoji: "🐑", ingredients: ["Rice", "Lentils", "Mutton", "Onion", "Tomato", "Spices"], difficulty: "Medium", time: "50 min", category: "Lunch" },
  { name: "Dal Bhat Fish Curry", emoji: "🐟", ingredients: ["Rice", "Lentils", "Fish", "Tomato", "Onion", "Spices"], difficulty: "Medium", time: "35 min", category: "Lunch" },
  { name: "Dal Bhat Egg Curry", emoji: "🥚", ingredients: ["Rice", "Lentils", "Eggs", "Tomato", "Onion", "Spices"], difficulty: "Easy", time: "30 min", category: "Lunch" },
  { name: "Aloo Tama", emoji: "🥘", ingredients: ["Potato", "Bamboo Shoots", "Onion", "Tomato", "Spices"], difficulty: "Medium", time: "35 min", category: "Lunch" },
  { name: "Aloo Cauli Tarkari", emoji: "🥦", ingredients: ["Potato", "Cauliflower", "Tomato", "Onion", "Spices"], difficulty: "Easy", time: "25 min", category: "Lunch" },
  { name: "Saag", emoji: "🥬", ingredients: ["Spinach", "Garlic", "Butter", "Salt", "Spices"], difficulty: "Easy", time: "15 min", category: "Lunch" },
  { name: "Gundruk", emoji: "🥬", ingredients: ["Gundruk", "Onion", "Tomato", "Garlic", "Spices"], difficulty: "Easy", time: "20 min", category: "Lunch" },
  { name: "Gundruk Ko Jhol", emoji: "🥣", ingredients: ["Gundruk", "Potato", "Onion", "Garlic", "Spices"], difficulty: "Easy", time: "25 min", category: "Lunch" },
  { name: "Kwati", emoji: "🥣", ingredients: ["Lentils", "Chickpeas", "Kidney Beans", "Soybeans", "Spices"], difficulty: "Medium", time: "50 min", category: "Lunch" },
  { name: "Rajma Curry", emoji: "🫘", ingredients: ["Kidney Beans", "Onion", "Tomato", "Garlic", "Spices"], difficulty: "Easy", time: "35 min", category: "Lunch" },
  { name: "Chana Curry", emoji: "🫘", ingredients: ["Chickpeas", "Onion", "Tomato", "Garlic", "Spices"], difficulty: "Easy", time: "30 min", category: "Lunch" },
  { name: "Soybean Curry", emoji: "🫘", ingredients: ["Soybeans", "Onion", "Tomato", "Garlic", "Spices"], difficulty: "Easy", time: "30 min", category: "Lunch" },
  { name: "Paneer Curry", emoji: "🧀", ingredients: ["Paneer", "Tomato", "Onion", "Garlic", "Spices"], difficulty: "Easy", time: "25 min", category: "Lunch" },
  { name: "Vegetable Curry", emoji: "🥗", ingredients: ["Potato", "Carrot", "Cauliflower", "Onion", "Spices"], difficulty: "Easy", time: "30 min", category: "Lunch" },
  { name: "Mushroom Curry", emoji: "🍄", ingredients: ["Mushroom", "Onion", "Tomato", "Garlic", "Spices"], difficulty: "Easy", time: "25 min", category: "Lunch" },
  { name: "Chicken Curry", emoji: "🍗", ingredients: ["Chicken", "Onion", "Tomato", "Garlic", "Spices"], difficulty: "Medium", time: "35 min", category: "Lunch" },
  { name: "Pork Curry", emoji: "🥩", ingredients: ["Pork", "Onion", "Tomato", "Garlic", "Spices"], difficulty: "Medium", time: "40 min", category: "Lunch" },
  { name: "Buffalo Curry", emoji: "🥩", ingredients: ["Buffalo Meat", "Onion", "Tomato", "Garlic", "Spices"], difficulty: "Medium", time: "45 min", category: "Lunch" },
  { name: "Spinach Curry", emoji: "🥬", ingredients: ["Spinach", "Onion", "Garlic", "Butter", "Spices"], difficulty: "Easy", time: "20 min", category: "Lunch" },
  { name: "Pumpkin Curry", emoji: "🎃", ingredients: ["Pumpkin", "Onion", "Garlic", "Spices", "Coconut Milk"], difficulty: "Easy", time: "25 min", category: "Lunch" },
  { name: "Bitter Gourd Fry", emoji: "🥒", ingredients: ["Bitter Gourd", "Onion", "Garlic", "Spices", "Salt"], difficulty: "Easy", time: "20 min", category: "Lunch" },
  { name: "Okra Fry", emoji: "🫘", ingredients: ["Okra", "Onion", "Garlic", "Spices", "Salt"], difficulty: "Easy", time: "20 min", category: "Lunch" },
  { name: "Mixed Vegetable Tarkari", emoji: "🥗", ingredients: ["Potato", "Carrot", "Green Beans", "Cabbage", "Spices"], difficulty: "Easy", time: "25 min", category: "Lunch" },
  { name: "Fried Rice", emoji: "🍚", ingredients: ["Rice", "Eggs", "Soy Sauce", "Garlic", "Butter"], difficulty: "Easy", time: "15 min", category: "Lunch" },
  { name: "Nasi Goreng", emoji: "🍚", ingredients: ["Rice", "Eggs", "Soy Sauce", "Garlic", "Chicken"], difficulty: "Easy", time: "20 min", category: "Lunch" },
  { name: "Mee Goreng", emoji: "🍜", ingredients: ["Noodles", "Eggs", "Soy Sauce", "Cabbage", "Chicken"], difficulty: "Easy", time: "20 min", category: "Lunch" },
  { name: "Beef Rendang", emoji: "🥩", ingredients: ["Beef", "Coconut Milk", "Garlic", "Spices", "Chili"], difficulty: "Hard", time: "90 min", category: "Lunch" },
  { name: "Sambal Chicken", emoji: "🍗", ingredients: ["Chicken", "Chili", "Garlic", "Soy Sauce", "Sugar"], difficulty: "Medium", time: "30 min", category: "Lunch" },
  { name: "Sweet & Sour Chicken", emoji: "🍗", ingredients: ["Chicken", "Tomato", "Vinegar", "Sugar", "Soy Sauce"], difficulty: "Medium", time: "25 min", category: "Lunch" },
  { name: "Kangkung Belacan", emoji: "🥬", ingredients: ["Kangkung", "Shrimp Paste", "Garlic", "Chili", "Salt"], difficulty: "Easy", time: "15 min", category: "Lunch" },
  { name: "Egg Fried Rice", emoji: "🍚", ingredients: ["Rice", "Eggs", "Soy Sauce", "Garlic", "Butter"], difficulty: "Easy", time: "15 min", category: "Lunch" },
  { name: "Stir-fried Mixed Vegetables", emoji: "🥗", ingredients: ["Cabbage", "Carrot", "Cauliflower", "Garlic", "Soy Sauce"], difficulty: "Easy", time: "15 min", category: "Lunch" },
  { name: "Fish Curry", emoji: "🐟", ingredients: ["Fish", "Tomato", "Onion", "Garlic", "Spices"], difficulty: "Medium", time: "30 min", category: "Lunch" },
  { name: "Grilled Fish", emoji: "🐟", ingredients: ["Fish", "Lemon", "Garlic", "Butter", "Spices"], difficulty: "Medium", time: "25 min", category: "Lunch" },
  { name: "Chicken Soup", emoji: "🥣", ingredients: ["Chicken", "Carrot", "Onion", "Garlic", "Noodles"], difficulty: "Easy", time: "30 min", category: "Lunch" },
  { name: "Tomato Soup", emoji: "🥣", ingredients: ["Tomato", "Onion", "Garlic", "Butter", "Spices"], difficulty: "Easy", time: "25 min", category: "Lunch" },
  { name: "Mushroom Soup", emoji: "🥣", ingredients: ["Mushroom", "Onion", "Garlic", "Butter", "Milk"], difficulty: "Easy", time: "25 min", category: "Lunch" },
  { name: "Fried Chicken", emoji: "🍗", ingredients: ["Chicken", "Flour", "Eggs", "Spices", "Oil"], difficulty: "Medium", time: "30 min", category: "Lunch" },
  { name: "Fried Tofu", emoji: "🧈", ingredients: ["Tofu", "Soy Sauce", "Garlic", "Oil", "Spices"], difficulty: "Easy", time: "15 min", category: "Lunch" },
  { name: "Sambal Egg", emoji: "🥚", ingredients: ["Eggs", "Chili", "Onion", "Garlic", "Soy Sauce"], difficulty: "Easy", time: "15 min", category: "Lunch" },
  { name: "Momo", emoji: "🥟", ingredients: ["Flour", "Chicken", "Onion", "Garlic", "Spices"], difficulty: "Hard", time: "60 min", category: "Quick & Easy" },
  { name: "Chowmein", emoji: "🍜", ingredients: ["Noodles", "Cabbage", "Carrot", "Soy Sauce", "Garlic"], difficulty: "Easy", time: "15 min", category: "Quick & Easy" },
  { name: "Chatpate", emoji: "🌶️", ingredients: ["Chiura", "Onion", "Tomato", "Lemon", "Spices"], difficulty: "Easy", time: "10 min", category: "Quick & Easy" },
  { name: "Pakoda", emoji: "🫘", ingredients: ["Chickpeas", "Onion", "Spinach", "Spices", "Oil"], difficulty: "Easy", time: "20 min", category: "Quick & Easy" },
  { name: "Samosa", emoji: "🥟", ingredients: ["Flour", "Potato", "Spices", "Oil", "Salt"], difficulty: "Hard", time: "45 min", category: "Quick & Easy" },
  { name: "Aloo Chop", emoji: "🥔", ingredients: ["Potato", "Flour", "Spices", "Oil", "Salt"], difficulty: "Medium", time: "25 min", category: "Quick & Easy" },
  { name: "Wai Wai Sadeko", emoji: "🍜", ingredients: ["Noodles", "Onion", "Tomato", "Lemon", "Spices"], difficulty: "Easy", time: "10 min", category: "Quick & Easy" },
  { name: "Curry Puff", emoji: "🥟", ingredients: ["Flour", "Potato", "Spices", "Oil", "Salt"], difficulty: "Medium", time: "35 min", category: "Quick & Easy" },
  { name: "Pisang Goreng", emoji: "🍌", ingredients: ["Banana", "Flour", "Sugar", "Oil", "Salt"], difficulty: "Easy", time: "15 min", category: "Quick & Easy" },
  { name: "Popiah", emoji: "🥟", ingredients: ["Flour", "Carrot", "Cabbage", "Garlic", "Soy Sauce"], difficulty: "Medium", time: "30 min", category: "Quick & Easy" },
  { name: "Spring Rolls", emoji: "🥟", ingredients: ["Flour", "Cabbage", "Carrot", "Garlic", "Oil"], difficulty: "Medium", time: "30 min", category: "Quick & Easy" },
  { name: "Roti John", emoji: "🥪", ingredients: ["Bread", "Eggs", "Chicken", "Onion", "Sauce"], difficulty: "Easy", time: "15 min", category: "Quick & Easy" },
];

const TEMPLATES = {
  "Nepali Family Week": {
    Mon: { Breakfast: "Chiura (Beaten Rice)", Lunch: "Dal Bhat Tarkari", Dinner: "Aloo Cauli Tarkari" },
    Tue: { Breakfast: "Sel Roti", Lunch: "Dal Bhat Chicken Curry", Dinner: "Saag" },
    Wed: { Breakfast: "Aloo Paratha", Lunch: "Dal Bhat Mutton Curry", Dinner: "Gundruk" },
    Thu: { Breakfast: "Roti & Tarkari", Lunch: "Dal Bhat Fish Curry", Dinner: "Aloo Tama" },
    Fri: { Breakfast: "Chiura (Beaten Rice)", Lunch: "Dal Bhat Egg Curry", Dinner: "Mixed Vegetable Tarkari" },
    Sat: { Breakfast: "Vegetable Paratha", Lunch: "Chicken Curry", Dinner: "Momo" },
    Sun: { Breakfast: "Suji Halwa", Lunch: "Dal Bhat Tarkari", Dinner: "Pumpkin Curry" },
  },
  "Malaysian Family Week": {
    Mon: { Breakfast: "Nasi Lemak", Lunch: "Nasi Goreng", Dinner: "Chicken Curry" },
    Tue: { Breakfast: "Roti Canai", Lunch: "Mee Goreng", Dinner: "Beef Rendang" },
    Wed: { Breakfast: "Kaya Toast", Lunch: "Fried Rice", Dinner: "Sambal Chicken" },
    Thu: { Breakfast: "Roti Telur", Lunch: "Egg Fried Rice", Dinner: "Sweet & Sour Chicken" },
    Fri: { Breakfast: "Nasi Lemak", Lunch: "Nasi Goreng", Dinner: "Fish Curry" },
    Sat: { Breakfast: "Half-Boiled Eggs", Lunch: "Mee Goreng", Dinner: "Grilled Fish" },
    Sun: { Breakfast: "Kaya Toast", Lunch: "Fried Rice", Dinner: "Kangkung Belacan" },
  },
  "Healthy Week": {
    Mon: { Breakfast: "Porridge", Lunch: "Saag", Dinner: "Grilled Fish" },
    Tue: { Breakfast: "Yogurt & Fruits", Lunch: "Vegetable Curry", Dinner: "Spinach Curry" },
    Wed: { Breakfast: "Boiled Eggs", Lunch: "Mixed Vegetable Tarkari", Dinner: "Mushroom Soup" },
    Thu: { Breakfast: "Porridge", Lunch: "Aloo Cauli Tarkari", Dinner: "Chicken Soup" },
    Fri: { Breakfast: "Fruits", Lunch: "Stir-fried Mixed Vegetables", Dinner: "Grilled Fish" },
    Sat: { Breakfast: "Yogurt & Fruits", Lunch: "Kangkung Belacan", Dinner: "Tomato Soup" },
    Sun: { Breakfast: "Boiled Eggs", Lunch: "Vegetable Curry", Dinner: "Saag" },
  },
  "Vegetarian Week": {
    Mon: { Breakfast: "Aloo Paratha", Lunch: "Paneer Curry", Dinner: "Vegetable Curry" },
    Tue: { Breakfast: "Vegetable Paratha", Lunch: "Rajma Curry", Dinner: "Mixed Vegetable Tarkari" },
    Wed: { Breakfast: "Roti & Tarkari", Lunch: "Chana Curry", Dinner: "Mushroom Curry" },
    Thu: { Breakfast: "Sel Roti", Lunch: "Soybean Curry", Dinner: "Spinach Curry" },
    Fri: { Breakfast: "Suji Halwa", Lunch: "Kwati", Dinner: "Pumpkin Curry" },
    Sat: { Breakfast: "Chiura (Beaten Rice)", Lunch: "Paneer Curry", Dinner: "Okra Fry" },
    Sun: { Breakfast: "Aloo Paratha", Lunch: "Gundruk Ko Jhol", Dinner: "Bitter Gourd Fry" },
  },
  "Budget Week": {
    Mon: { Breakfast: "Bread & Jam", Lunch: "Dal Bhat Egg Curry", Dinner: "Aloo Cauli Tarkari" },
    Tue: { Breakfast: "Omelette", Lunch: "Egg Fried Rice", Dinner: "Chana Curry" },
    Wed: { Breakfast: "Bread & Peanut Butter", Lunch: "Tomato Soup", Dinner: "Fried Rice" },
    Thu: { Breakfast: "Boiled Eggs", Lunch: "Aloo Tama", Dinner: "Okra Fry" },
    Fri: { Breakfast: "Milk & Cornflakes", Lunch: "Chatpate", Dinner: "Soybean Curry" },
    Sat: { Breakfast: "Bread & Jam", Lunch: "Chowmein", Dinner: "Dal Bhat Egg Curry" },
    Sun: { Breakfast: "Omelette", Lunch: "Wai Wai Sadeko", Dinner: "Fried Rice" },
  },
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SLOTS = ["Breakfast", "Lunch", "Dinner"];

function getMealEmoji(mealName) {
  const recipe = RECIPE_DATABASE.find((r) => r.name === mealName);
  return recipe ? recipe.emoji : "🍽️";
}

function buildPlanFromTemplate(templateName) {
  const template = TEMPLATES[templateName];
  if (!template) return [];
  const meals = [];
  DAYS.forEach((day) => {
    SLOTS.forEach((slot) => {
      const mealName = template[day]?.[slot];
      if (mealName) {
        meals.push({ slotKey: `${day}-${slot}`, name: mealName, emoji: getMealEmoji(mealName), status: "planned" });
      }
    });
  });
  return meals;
}

function formatPlan(doc) {
  return {
    id: doc._id,
    name: doc.name,
    weekStart: doc.weekStart,
    meals: doc.meals || [],
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function getCurrentPlan(req, res) {
  try {
    const plan = await MealPlan.findOne({ userId: req.user.id }).sort({ createdAt: -1 }).lean();
    if (!plan) return res.json({ meals: [] });
    res.json(formatPlan(plan));
  } catch (err) {
    res.status(500).json({ message: "Failed to load meal plan", error: err.message });
  }
}

export async function saveCurrentPlan(req, res) {
  try {
    const { meals } = req.body;
    if (!Array.isArray(meals)) {
      return res.status(400).json({ message: "meals array is required" });
    }
    const sanitized = meals.map((m) => ({
      slotKey: m.slotKey,
      name: m.name || "",
      emoji: m.emoji || "🍽️",
      status: m.status || "planned",
    }));
    const doc = await MealPlan.create({ userId: req.user.id, meals: sanitized });

    await Notification.create({
      recipientUser: req.user.id,
      senderUser: null,
      type: "meal_saved",
      title: "Weekly meal plan saved",
      message: `Plan with ${sanitized.filter((m) => m.name).length} meals saved successfully.`,
      relatedId: doc._id,
      isRead: false,
    });

    res.status(201).json(formatPlan(doc));
  } catch (err) {
    res.status(500).json({ message: "Failed to save meal plan", error: err.message });
  }
}

export async function listPlans(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      MealPlan.find({ userId: req.user.id }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      MealPlan.countDocuments({ userId: req.user.id }),
    ]);

    res.json({
      plans: docs.map(formatPlan),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to list plans", error: err.message });
  }
}

export async function getPlan(req, res) {
  try {
    const doc = await MealPlan.findOne({ _id: req.params.id, userId: req.user.id }).lean();
    if (!doc) return res.status(404).json({ message: "Plan not found" });
    res.json(formatPlan(doc));
  } catch (err) {
    res.status(500).json({ message: "Failed to get plan", error: err.message });
  }
}

export async function deletePlan(req, res) {
  try {
    const doc = await MealPlan.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!doc) return res.status(404).json({ message: "Plan not found or unauthorized" });
    res.json({ message: "Plan deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete plan", error: err.message });
  }
}

export async function duplicatePlan(req, res) {
  try {
    const original = await MealPlan.findOne({ _id: req.params.id, userId: req.user.id }).lean();
    if (!original) return res.status(404).json({ message: "Plan not found" });

    const doc = await MealPlan.create({
      userId: req.user.id,
      name: `${original.name || "Plan"} (Copy)`,
      meals: original.meals.map((m) => ({ ...m })),
    });
    res.status(201).json(formatPlan(doc));
  } catch (err) {
    res.status(500).json({ message: "Failed to duplicate plan", error: err.message });
  }
}

export async function generateRandomPlan(req, res) {
  try {
    const templateNames = Object.keys(TEMPLATES);
    const randomName = templateNames[Math.floor(Math.random() * templateNames.length)];
    const meals = buildPlanFromTemplate(randomName);
    const doc = await MealPlan.create({
      userId: req.user.id,
      name: randomName,
      meals,
    });

    await Notification.create({
      recipientUser: req.user.id,
      senderUser: null,
      type: "meal_saved",
      title: `${randomName} plan generated`,
      message: `A new ${randomName.toLowerCase()} meal plan has been created for you.`,
      relatedId: doc._id,
      isRead: false,
    });

    res.status(201).json(formatPlan(doc));
  } catch (err) {
    res.status(500).json({ message: "Failed to generate plan", error: err.message });
  }
}

export async function getSuggestions(req, res) {
  try {
    const items = await Inventory.find({ userId: req.user.id }).lean();
    const inventoryNames = items.map((i) => i.foodName.toLowerCase());

    if (inventoryNames.length === 0) {
      return res.json({ suggestions: [] });
    }

    const suggestions = RECIPE_DATABASE.map((recipe) => {
      const recipeIng = recipe.ingredients.map((i) => i.toLowerCase());
      const available = recipeIng.filter((ing) => inventoryNames.some((inv) => inv.includes(ing)));
      const missing = recipeIng.filter((ing) => !inventoryNames.some((inv) => inv.includes(ing)));
      const matchPercent = recipeIng.length > 0 ? Math.round((available.length / recipeIng.length) * 100) : 0;

      return {
        name: recipe.name,
        emoji: recipe.emoji,
        ingredients: recipe.ingredients,
        ingredientsUsed: available.length,
        ingredientsTotal: recipeIng.length,
        itemsMissing: missing,
        availableCount: available.length,
        missingCount: missing.length,
        difficulty: recipe.difficulty,
        time: recipe.time,
        category: recipe.category,
        matchPercent,
      };
    })
      .filter((s) => s.availableCount > 0)
      .sort((a, b) => b.matchPercent - a.matchPercent)
      .slice(0, 10);

    res.json({ suggestions });
  } catch (err) {
    res.status(500).json({ message: "Failed to get suggestions", error: err.message });
  }
}

export async function updateMealStatus(req, res) {
  try {
    const { slotKey } = req.params;
    const { status, name, emoji } = req.body;

    const plan = await MealPlan.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
    if (!plan) return res.status(404).json({ message: "No meal plan found" });

    const meal = plan.meals.find((m) => m.slotKey === slotKey);
    if (!meal) {
      plan.meals.push({ slotKey, name: name || "", emoji: emoji || "🍽️", status: status || "planned" });
    } else {
      if (status) meal.status = status;
      if (name !== undefined) meal.name = name;
      if (emoji !== undefined) meal.emoji = emoji;
    }

    await plan.save();
    res.json({ message: "Meal updated", plan: formatPlan(plan) });
  } catch (err) {
    res.status(500).json({ message: "Failed to update meal", error: err.message });
  }
}

export async function getMealSummary(req, res) {
  try {
    const plan = await MealPlan.findOne({ userId: req.user.id }).sort({ createdAt: -1 }).lean();
    if (!plan || !plan.meals || plan.meals.length === 0) {
      return res.json({
        mealsPlanned: 0, mealsCompleted: 0, mealsSkipped: 0, recipesUsed: 0, ingredientsConsumed: 0,
      });
    }

    const meals = plan.meals;
    const mealsPlanned = meals.filter((m) => m.name).length;
    const mealsCompleted = meals.filter((m) => m.status === "completed").length;
    const mealsSkipped = meals.filter((m) => m.status === "skipped" || m.status === "cancelled").length;
    const recipesUsed = new Set(meals.filter((m) => m.name).map((m) => m.name)).size;

    let ingredientsConsumed = 0;
    meals.filter((m) => m.status === "completed").forEach((m) => {
      const recipe = RECIPE_DATABASE.find((r) => r.name === m.name);
      if (recipe) ingredientsConsumed += recipe.ingredients.length;
    });

    res.json({ mealsPlanned, mealsCompleted, mealsSkipped, recipesUsed, ingredientsConsumed });
  } catch (err) {
    res.status(500).json({ message: "Failed to get summary", error: err.message });
  }
}

export async function getShoppingList(req, res) {
  try {
    const plan = await MealPlan.findOne({ userId: req.user.id }).sort({ createdAt: -1 }).lean();
    if (!plan || !plan.meals) return res.json({ items: [] });

    const items = await Inventory.find({ userId: req.user.id }).lean();
    const inventoryNames = new Set(items.map((i) => i.foodName.toLowerCase()));

    const ingredientCount = {};
    plan.meals.forEach((m) => {
      if (!m.name) return;
      const recipe = RECIPE_DATABASE.find((r) => r.name === m.name);
      if (recipe) {
        recipe.ingredients.forEach((ing) => {
          if (!inventoryNames.has(ing.toLowerCase())) {
            ingredientCount[ing] = (ingredientCount[ing] || 0) + 1;
          }
        });
      }
    });

    const shoppingList = Object.entries(ingredientCount).map(([name, count]) => ({ name, count }));
    shoppingList.sort((a, b) => a.name.localeCompare(b.name));

    res.json({ items: shoppingList });
  } catch (err) {
    res.status(500).json({ message: "Failed to generate shopping list", error: err.message });
  }
}

export async function addFavorite(req, res) {
  try {
    const { name, emoji } = req.body;
    if (!name) return res.status(400).json({ message: "Recipe name is required" });

    const existing = await FavoriteRecipe.findOne({ userId: req.user.id, name });
    if (existing) return res.json({ message: "Already favorited", id: existing._id });

    const doc = await FavoriteRecipe.create({ userId: req.user.id, name, emoji: emoji || "🍽️" });
    res.status(201).json({ id: doc._id, name: doc.name, emoji: doc.emoji });
  } catch (err) {
    res.status(500).json({ message: "Failed to add favorite", error: err.message });
  }
}

export async function listFavorites(req, res) {
  try {
    const docs = await FavoriteRecipe.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();
    res.json({ favorites: docs.map((d) => ({ id: d._id, name: d.name, emoji: d.emoji })) });
  } catch (err) {
    res.status(500).json({ message: "Failed to list favorites", error: err.message });
  }
}

export async function removeFavorite(req, res) {
  try {
    const doc = await FavoriteRecipe.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!doc) return res.status(404).json({ message: "Favorite not found" });
    res.json({ message: "Favorite removed" });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove favorite", error: err.message });
  }
}

export async function searchRecipes(req, res) {
  try {
    const q = (req.query.q || "").toLowerCase();
    const filter = req.query.filter || "";
    let results = RECIPE_DATABASE;

    if (q) results = results.filter((r) => r.name.toLowerCase().includes(q));
    if (filter) results = results.filter((r) => r.category.toLowerCase() === filter.toLowerCase());

    res.json({ recipes: results });
  } catch (err) {
    res.status(500).json({ message: "Failed to search recipes", error: err.message });
  }
}

export async function getTemplates(req, res) {
  res.json({ templates: Object.keys(TEMPLATES) });
}
