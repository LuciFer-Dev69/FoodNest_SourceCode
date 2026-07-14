-- MySQL Database Schema for FoodNest
CREATE DATABASE IF NOT EXISTS foodnest;
USE foodnest;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  two_factor_secret VARCHAR(255) DEFAULT NULL,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Food Inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  emoji VARCHAR(50) DEFAULT '🍲',
  qty VARCHAR(100) NOT NULL,
  cat VARCHAR(100) NOT NULL,
  loc VARCHAR(100) NOT NULL,
  expires_in_days INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Donations table
CREATE TABLE IF NOT EXISTS donations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  donor_id INT NOT NULL,
  claimant_id INT DEFAULT NULL,
  name VARCHAR(255) NOT NULL,
  emoji VARCHAR(50) DEFAULT '🍞',
  qty VARCHAR(100) NOT NULL,
  cat VARCHAR(100) NOT NULL,
  pickup_time VARCHAR(255) NOT NULL,
  status ENUM('Available', 'Reserved', 'Claimed', 'Expired') DEFAULT 'Available',
  km DECIMAL(3, 1) DEFAULT 0.0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (donor_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (claimant_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Weekly Meal Planner table
CREATE TABLE IF NOT EXISTS meal_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  slot_key VARCHAR(100) NOT NULL, -- Format: Day-Slot (e.g. Mon-Breakfast)
  name VARCHAR(255) NOT NULL,
  emoji VARCHAR(50) DEFAULT '🍳',
  uses_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY user_slot_idx (user_id, slot_key),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info', -- 'expiry', 'donation', 'system'
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
