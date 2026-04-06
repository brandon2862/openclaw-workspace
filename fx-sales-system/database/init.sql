-- 创建数据库
CREATE DATABASE IF NOT EXISTS fx_sales_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE fx_sales_db;

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('ADMIN', 'STAFF') NOT NULL DEFAULT 'STAFF',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建客户表
CREATE TABLE IF NOT EXISTS customers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  customer_name VARCHAR(255) NOT NULL,
  marking VARCHAR(100),
  default_currency_pair VARCHAR(20) NOT NULL DEFAULT 'RMB/MYR',
  recipient_name VARCHAR(255),
  phone VARCHAR(50),
  bank_name VARCHAR(255),
  bank_account VARCHAR(255),
  remark TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_customer_name (customer_name),
  INDEX idx_marking (marking),
  INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建交易表
CREATE TABLE IF NOT EXISTS transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  customer_id INT NOT NULL,
  currency_pair VARCHAR(20) NOT NULL DEFAULT 'RMB/MYR',
  source_amount DECIMAL(15, 2) NOT NULL,
  source_currency VARCHAR(10) NOT NULL DEFAULT 'RMB',
  target_currency VARCHAR(10) NOT NULL DEFAULT 'MYR',
  agent_sx_cost DECIMAL(10, 4) NOT NULL,
  option_1_rate DECIMAL(10, 4) NOT NULL,
  option_2_rate DECIMAL(10, 4) NOT NULL,
  option_3_rate DECIMAL(10, 4) NOT NULL,
  manual_rate DECIMAL(10, 4),
  selected_option INT NOT NULL DEFAULT 1,
  selected_rate DECIMAL(10, 4) NOT NULL,
  converted_amount DECIMAL(15, 2) NOT NULL,
  pnl DECIMAL(15, 2) NOT NULL,
  remark TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  INDEX idx_transaction_date (transaction_date),
  INDEX idx_customer_id (customer_id),
  INDEX idx_currency_pair (currency_pair),
  INDEX idx_selected_option (selected_option)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入测试管理员用户 (密码: admin123)
INSERT INTO users (name, email, password_hash, role) VALUES
('系统管理员', 'admin@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye3Z6c7Z7.8ZQJzYVvq7v8QbQdK1JpW6y', 'ADMIN'),
('员工用户', 'staff@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye3Z6c7Z7.8ZQJzYVvq7v8QbQdK1JpW6y', 'STAFF')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- 插入测试客户数据
INSERT INTO customers (customer_name, marking, default_currency_pair, recipient_name, phone, bank_name, bank_account, remark) VALUES
('ABC贸易公司', 'ABC001', 'RMB/MYR', '张三', '+6012-3456789', 'Maybank', '1234567890', '长期合作客户'),
('XYZ有限公司', 'XYZ002', 'RMB/MYR', '李四', '+6013-9876543', 'CIMB Bank', '0987654321', '新客户'),
('DEF进出口公司', 'DEF003', 'RMB/MYR', '王五', '+6014-5678901', 'Public Bank', '1122334455', 'VIP客户')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- 插入测试交易数据
INSERT INTO transactions (
  customer_id, source_amount, agent_sx_cost, option_1_rate, option_2_rate, option_3_rate,
  selected_option, selected_rate, converted_amount, pnl, remark
) VALUES
(1, 10000.00, 1.5000, 1.4500, 1.4200, 1.4000, 1, 1.4500, 6896.55, 500.00, '测试交易1'),
(2, 5000.00, 1.5200, 1.4700, 1.4400, 1.4200, 2, 1.4400, 3472.22, 400.00, '测试交易2'),
(3, 20000.00, 1.4800, 1.4300, 1.4000, 1.3800, 3, 1.3800, 14492.75, 2000.00, '测试交易3')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;