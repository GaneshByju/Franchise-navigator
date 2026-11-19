-- ========================================================================
-- FRANCHISE INVESTMENT DECISION SUPPORT SYSTEM
-- Database: MySQL 8.0+ / Relational Schema
-- ========================================================================

CREATE DATABASE IF NOT EXISTS franchise_dss_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE franchise_dss_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(191) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('investor', 'franchiser', 'admin') NOT NULL,
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(50),
  avatar VARCHAR(255),
  is_verified TINYINT(1) DEFAULT 1,
  is_suspended TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_users_role (role),
  INDEX idx_users_email (email)
) ENGINE=InnoDB;

-- 2. Investor Profiles
CREATE TABLE IF NOT EXISTS investor_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  min_budget DECIMAL(15, 2) DEFAULT 500000.00,
  max_budget DECIMAL(15, 2) DEFAULT 5000000.00,
  preferred_categories JSON,
  preferred_investment_type VARCHAR(100) DEFAULT 'Full Franchise',
  expected_roi DECIMAL(5, 2) DEFAULT 25.00,
  preferred_payback_months INT DEFAULT 24,
  experience_level VARCHAR(100) DEFAULT 'Intermediate',
  preferred_locations JSON,
  max_distance_km INT DEFAULT 50,
  plan_type ENUM('Free', 'Premium', 'Professional') DEFAULT 'Free',
  max_investments INT DEFAULT 2,
  active_investments INT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Franchiser Profiles
CREATE TABLE IF NOT EXISTS franchiser_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  company_name VARCHAR(200) NOT NULL,
  logo VARCHAR(255),
  description TEXT,
  website VARCHAR(255),
  industry VARCHAR(100),
  founded_year INT,
  headquarters VARCHAR(150),
  business_address TEXT,
  contact_person VARCHAR(150),
  email VARCHAR(191),
  phone VARCHAR(50),
  registration_number VARCHAR(100),
  tax_gst_number VARCHAR(100),
  business_type VARCHAR(100),
  operating_locations JSON,
  expansion_locations JSON,
  verification_status ENUM('Pending', 'Under Review', 'Verified', 'Rejected') DEFAULT 'Verified',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Categories
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) UNIQUE NOT NULL,
  slug VARCHAR(150) UNIQUE NOT NULL,
  icon VARCHAR(50) NOT NULL,
  description TEXT,
  avg_investment_min DECIMAL(15, 2),
  avg_investment_max DECIMAL(15, 2),
  avg_roi DECIMAL(5, 2),
  is_active TINYINT(1) DEFAULT 1
) ENGINE=InnoDB;

-- 5. Franchise Listings
CREATE TABLE IF NOT EXISTS franchise_listings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  franchiser_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  category_slug VARCHAR(150) NOT NULL,
  business_type VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  business_model VARCHAR(150) NOT NULL,
  founded_year INT,
  headquarters VARCHAR(150),
  website VARCHAR(255),
  contact_phone VARCHAR(50),
  contact_email VARCHAR(191),
  
  -- Investment breakdown
  min_investment DECIMAL(15, 2) NOT NULL,
  max_investment DECIMAL(15, 2) NOT NULL,
  franchise_fee DECIMAL(15, 2) NOT NULL,
  setup_cost DECIMAL(15, 2) NOT NULL,
  equipment_cost DECIMAL(15, 2) NOT NULL,
  interior_cost DECIMAL(15, 2) NOT NULL,
  working_capital DECIMAL(15, 2) NOT NULL,
  training_cost DECIMAL(15, 2) NOT NULL,
  tech_cost DECIMAL(15, 2) NOT NULL,
  license_cost DECIMAL(15, 2) NOT NULL,
  other_costs DECIMAL(15, 2) NOT NULL,
  gst_rate DECIMAL(5, 2) DEFAULT 18.00,
  total_investment_est DECIMAL(15, 2) NOT NULL,

  -- Royalties & Sharing
  royalty_type ENUM('Fixed Royalty', 'Percentage Royalty', 'Revenue Sharing', 'Profit Sharing') NOT NULL,
  royalty_value DECIMAL(10, 2) NOT NULL,
  marketing_fee DECIMAL(5, 2) DEFAULT 2.00,
  tech_fee DECIMAL(5, 2) DEFAULT 1.00,
  maintenance_fee DECIMAL(10, 2) DEFAULT 5000.00,
  payment_frequency VARCHAR(50) DEFAULT 'Monthly',
  other_recurring_fees VARCHAR(255) DEFAULT 'None',

  -- Financial Estimates
  est_monthly_revenue DECIMAL(15, 2) NOT NULL,
  est_monthly_expenses DECIMAL(15, 2) NOT NULL,
  est_monthly_profit DECIMAL(15, 2) NOT NULL,
  est_annual_profit DECIMAL(15, 2) NOT NULL,
  est_roi DECIMAL(5, 2) NOT NULL,
  payback_months INT NOT NULL,
  breakeven_months INT NOT NULL,

  -- Units & Availability
  total_units INT DEFAULT 10,
  available_units INT DEFAULT 6,
  reserved_units INT DEFAULT 2,
  sold_units INT DEFAULT 2,

  -- Status
  status ENUM('Draft', 'Pending Approval', 'Active', 'Suspended', 'Sold Out') DEFAULT 'Active',
  is_featured TINYINT(1) DEFAULT 0,
  is_beginner_friendly TINYINT(1) DEFAULT 1,
  listing_fee_paid TINYINT(1) DEFAULT 1,
  maintenance_fee_status ENUM('Paid', 'Grace Period', 'Overdue') DEFAULT 'Paid',
  maintenance_due_date DATE,
  views_count INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (franchiser_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_listings_cat (category_slug),
  INDEX idx_listings_status (status)
) ENGINE=InnoDB;

-- 6. Territories
CREATE TABLE IF NOT EXISTS franchise_territories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  franchise_id INT NOT NULL,
  country VARCHAR(100) DEFAULT 'India',
  state VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  territory_name VARCHAR(200) NOT NULL,
  is_exclusive TINYINT(1) DEFAULT 1,
  status ENUM('Available', 'Reserved', 'Sold') DEFAULT 'Available',
  FOREIGN KEY (franchise_id) REFERENCES franchise_listings(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Licenses & Legal Requirements
CREATE TABLE IF NOT EXISTS franchise_licenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  franchise_id INT NOT NULL,
  license_name VARCHAR(255) NOT NULL,
  license_number VARCHAR(100),
  issuing_authority VARCHAR(255) NOT NULL,
  issue_date DATE,
  expiry_date DATE,
  verification_status ENUM('Pending', 'Under Review', 'Verified', 'Rejected', 'Expired') DEFAULT 'Verified',
  estimated_cost DECIMAL(12, 2) DEFAULT 15000.00,
  acquisition_time_weeks INT DEFAULT 4,
  responsible_party VARCHAR(150) DEFAULT 'Franchiser & Investor Jointly',
  franchiser_assistance TINYINT(1) DEFAULT 1,
  FOREIGN KEY (franchise_id) REFERENCES franchise_listings(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Business Challenges
CREATE TABLE IF NOT EXISTS franchise_challenges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  franchise_id INT NOT NULL,
  sector VARCHAR(100) NOT NULL,
  challenge_title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  mitigation_strategy TEXT NOT NULL,
  FOREIGN KEY (franchise_id) REFERENCES franchise_listings(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 9. Documents
CREATE TABLE IF NOT EXISTS franchise_documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  franchise_id INT NOT NULL,
  doc_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  file_url VARCHAR(255),
  issue_date DATE,
  expiry_date DATE,
  status ENUM('Pending', 'Under Review', 'Verified', 'Rejected', 'Expired') DEFAULT 'Verified',
  admin_notes TEXT,
  FOREIGN KEY (franchise_id) REFERENCES franchise_listings(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 10. Investor Applications
CREATE TABLE IF NOT EXISTS applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  franchise_id INT NOT NULL,
  investor_id INT NOT NULL,
  proposed_budget DECIMAL(15, 2) NOT NULL,
  target_location VARCHAR(200) NOT NULL,
  experience_years INT NOT NULL,
  message TEXT,
  status ENUM('Submitted', 'Under Review', 'Approved', 'Rejected', 'Withdrawn') DEFAULT 'Submitted',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (franchise_id) REFERENCES franchise_listings(id) ON DELETE CASCADE,
  FOREIGN KEY (investor_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 11. Contracts & Agreements
CREATE TABLE IF NOT EXISTS contracts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT UNIQUE,
  franchise_id INT NOT NULL,
  investor_id INT NOT NULL,
  franchiser_id INT NOT NULL,
  territory VARCHAR(255) NOT NULL,
  total_investment DECIMAL(15, 2) NOT NULL,
  royalty_terms VARCHAR(255) NOT NULL,
  duration_years INT DEFAULT 5,
  terms_text LONGTEXT NOT NULL,
  status ENUM('Draft', 'Investor Review', 'Franchiser Review', 'Signed', 'Active', 'Terminated') DEFAULT 'Investor Review',
  investor_signed_at TIMESTAMP NULL,
  franchiser_signed_at TIMESTAMP NULL,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE SET NULL,
  FOREIGN KEY (franchise_id) REFERENCES franchise_listings(id) ON DELETE CASCADE,
  FOREIGN KEY (investor_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (franchiser_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 12. Payments
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  related_franchise_id INT,
  related_contract_id INT,
  transaction_ref VARCHAR(100) UNIQUE NOT NULL,
  purpose VARCHAR(255) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  payment_type ENUM('Listing Fee', 'Monthly Maintenance', 'Investor Subscription', 'Franchise Investment Deposit') NOT NULL,
  status ENUM('Pending', 'Processing', 'Successful', 'Failed', 'Refunded', 'Overdue') DEFAULT 'Successful',
  payment_method VARCHAR(100) DEFAULT 'UPI / NetBanking',
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 13. Feasibility Evaluations
CREATE TABLE IF NOT EXISTS feasibility_evaluations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  investor_id INT NOT NULL,
  franchise_id INT NOT NULL,
  budget DECIMAL(15, 2) NOT NULL,
  location VARCHAR(150) NOT NULL,
  experience_level VARCHAR(100) NOT NULL,
  capital_available DECIMAL(15, 2) NOT NULL,
  duration_months INT DEFAULT 60,
  financial_score INT NOT NULL,
  location_score INT NOT NULL,
  market_score INT NOT NULL,
  competition_score INT NOT NULL,
  experience_score INT NOT NULL,
  overall_score INT NOT NULL,
  suitability_label VARCHAR(100) NOT NULL,
  recommendations TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (investor_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (franchise_id) REFERENCES franchise_listings(id) ON DELETE CASCADE
) ENGINE=InnoDB;
