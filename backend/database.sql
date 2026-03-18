-- ============================
-- KGN Waters - MySQL Schema
-- ============================
-- Run this file once to set up your database:
-- mysql -u root -p < database.sql

CREATE DATABASE IF NOT EXISTS kgn_waters;
USE kgn_waters;

-- -----------------------------------------------
-- ADMINS TABLE
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  username    VARCHAR(50) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,         -- bcrypt hashed
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------
-- PRODUCTS TABLE
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  price       DECIMAL(10,2) NOT NULL,
  unit        VARCHAR(30) NOT NULL,          -- e.g. "per jar", "per bottle"
  available   TINYINT(1) DEFAULT 1,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------
-- ORDERS TABLE
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  order_id     VARCHAR(20) NOT NULL UNIQUE,  -- e.g. KGN1234567
  customer_name VARCHAR(100) NOT NULL,
  phone        VARCHAR(20) NOT NULL,
  address      TEXT NOT NULL,
  product_id   INT NOT NULL,
  product_name VARCHAR(100) NOT NULL,        -- snapshot at order time
  quantity     INT NOT NULL DEFAULT 1,
  unit_price   DECIMAL(10,2) NOT NULL,       -- snapshot at order time
  total        DECIMAL(10,2) NOT NULL,
  status       ENUM('new','processing','delivered','cancelled') DEFAULT 'new',
  notes        TEXT,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- -----------------------------------------------
-- SEED: Default Admin (password: kgn2024)
-- -----------------------------------------------
INSERT IGNORE INTO admins (username, password)
VALUES ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');

-- -----------------------------------------------
-- SEED: Default Products
-- -----------------------------------------------
INSERT IGNORE INTO products (name, description, price, unit) VALUES
  ('20L Water Jar',    'Pure mineral water in reusable 20-litre jar',  60.00, 'per jar'),
  ('10L Water Bottle', 'Fresh drinking water in sealed 10-litre bottle', 35.00, 'per bottle'),
  ('5L Water Bottle',  'Convenient 5-litre bottle for home or office',   20.00, 'per bottle'),
  ('1L Water Bottle',  'Single-serve 1-litre pure water bottle',          8.00, 'per bottle');
