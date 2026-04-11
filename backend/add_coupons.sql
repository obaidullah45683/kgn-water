-- ================================================
-- KGN Waters - Add Coupons Table
-- Run this once in MySQL to add coupon support:
-- mysql -u root -p kgn_waters < add_coupons.sql
-- ================================================

USE kgn_waters;

CREATE TABLE IF NOT EXISTS coupons (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  code        VARCHAR(50) NOT NULL UNIQUE,
  discount    DECIMAL(5,2) NOT NULL,         -- percentage e.g. 25.00 = 25%
  description VARCHAR(200),
  max_uses    INT DEFAULT NULL,              -- NULL = unlimited
  used_count  INT DEFAULT 0,
  active      TINYINT(1) DEFAULT 1,
  expires_at  DATETIME DEFAULT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed: first order coupon
INSERT IGNORE INTO coupons (code, discount, description, max_uses)
VALUES ('KGNFIRST', 25.00, 'First order - 25% off', 100);
