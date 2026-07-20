import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

let pool = null;
let isMockDatabase = false;

// In-memory mock database fallback
class MockDatabase {
  constructor() {
    this.users = [];
    this.inventory = [];
    this.donations = [];
    this.meal_plans = [];
    this.notifications = [];
    console.warn("MySQL is not configured or reachable. Falling back to an in-memory database simulation.");

    isMockDatabase = true;
  }

  async execute(query, params = []) {
    // Basic query analyzer fallback
    const q = query.toLowerCase().trim();
    
    if (q.startsWith("select") && q.includes("users")) {
      if (q.includes("email =")) {
        const email = params[0];
        const user = this.users.find(u => u.email === email);
        return [user ? [user] : []];
      }
      return [this.users];
    }
    
    if (q.startsWith("insert into users")) {
      const newUser = {
        id: this.users.length + 1,
        name: params[0],
        email: params[1],
        password_hash: params[2],
        two_factor_secret: null,
        two_factor_enabled: false
      };
      this.users.push(newUser);
      return [{ insertId: newUser.id }];
    }

    if (q.includes("update users") && q.includes("two_factor")) {
      const secret = params[0];
      const enabled = params[1] ? 1 : 0;
      const id = params[2];
      const user = this.users.find(u => u.id === id);
      if (user) {
        user.two_factor_secret = secret;
        user.two_factor_enabled = enabled;
      }
      return [{ affectedRows: 1 }];
    }

    if (q.includes("inventory")) {
      if (q.startsWith("select")) {
        const userId = params[0];
        return [this.inventory.filter(i => i.user_id === userId)];
      }
      if (q.startsWith("insert")) {
        const newItem = {
          id: this.inventory.length + 1,
          user_id: params[0],
          name: params[1],
          emoji: params[2],
          qty: params[3],
          cat: params[4],
          loc: params[5],
          expires_in_days: params[6]
        };
        this.inventory.push(newItem);
        return [{ insertId: newItem.id }];
      }
      if (q.startsWith("delete")) {
        const id = params[0];
        this.inventory = this.inventory.filter(i => i.id !== id);
        return [{ affectedRows: 1 }];
      }
    }

    if (q.includes("donations")) {
      if (q.startsWith("select")) {
        return [this.donations];
      }
      if (q.startsWith("insert")) {
        const newDonation = {
          id: this.donations.length + 1,
          donor_id: params[0],
          name: params[1],
          emoji: params[2],
          qty: params[3],
          cat: params[4],
          pickup_time: params[5],
          km: params[6] || 1.0,
          status: "Available"
        };
        this.donations.push(newDonation);
        return [{ insertId: newDonation.id }];
      }
      if (q.includes("update") && q.includes("status")) {
        const status = params[0];
        const claimantId = params[1];
        const id = params[2];
        const item = this.donations.find(d => d.id === id);
        if (item) {
          item.status = status;
          item.claimant_id = claimantId;
        }
        return [{ affectedRows: 1 }];
      }
    }

    if (q.includes("meal_plans")) {
      if (q.startsWith("select")) {
        const userId = params[0];
        return [this.meal_plans.filter(m => m.user_id === userId)];
      }
      if (q.startsWith("insert") || q.startsWith("replace")) {
        const userId = params[0];
        const slotKey = params[1];
        const name = params[2];
        const emoji = params[3];
        const uses = params[4];
        
        // Remove existing
        this.meal_plans = this.meal_plans.filter(m => !(m.user_id === userId && m.slot_key === slotKey));
        
        const newMeal = { id: this.meal_plans.length + 1, user_id: userId, slot_key: slotKey, name, emoji, uses_count: uses };
        this.meal_plans.push(newMeal);
        return [{ affectedRows: 1 }];
      }
    }

    if (q.includes("notifications")) {
      if (q.startsWith("select")) {
        const userId = params[0];
        return [this.notifications.filter(n => n.user_id === userId)];
      }
      if (q.startsWith("insert")) {
        const newNotif = {
          id: this.notifications.length + 1,
          user_id: params[0],
          message: params[1],
          type: params[2] || "info",
          is_read: false
        };
        this.notifications.push(newNotif);
        return [{ insertId: newNotif.id }];
      }
    }

    return [[]];
  }
}

try {
  // Attempt to build pool
  pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "foodnest",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  
  // Test connection
  await pool.query("SELECT 1");
  console.log("MySQL database connected successfully!");

} catch (error) {
  // Fallback
  pool = new MockDatabase();
}

export const db = pool;
export const isMock = () => isMockDatabase;
