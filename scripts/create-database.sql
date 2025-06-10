-- Создание базы данных для Sedona
CREATE DATABASE IF NOT EXISTS sedona_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Создание базы данных для Life
CREATE DATABASE IF NOT EXISTS life_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Использование базы данных Sedona
USE sedona_db;

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    account_type ENUM('seiji', 'diego') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Таблица финансов
CREATE TABLE IF NOT EXISTS finances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    -- Белая бухгалтерия
    cash DECIMAL(15,2) DEFAULT 0.00,
    bank_account DECIMAL(15,2) DEFAULT 0.00,
    deposit DECIMAL(15,2) DEFAULT 0.00,
    -- Тёмная бухгалтерия
    dirty_money DECIMAL(15,2) DEFAULT 0.00,
    org_account DECIMAL(15,2) DEFAULT 0.00,
    territory_account DECIMAL(15,2) DEFAULT 0.00,
    -- Настройки отмыва
    laundering_percentage DECIMAL(5,2) DEFAULT 75.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Таблица истории транзакций
CREATE TABLE IF NOT EXISTS transaction_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    transaction_type ENUM('white', 'black', 'laundering') NOT NULL,
    operation_type ENUM('add', 'subtract', 'transfer', 'launder') NOT NULL,
    account_field VARCHAR(50) NOT NULL, -- cash, bank_account, deposit, dirty_money, org_account, territory_account
    amount DECIMAL(15,2) NOT NULL,
    reason TEXT,
    balance_before DECIMAL(15,2) NOT NULL,
    balance_after DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Вставка тестовых пользователей
INSERT INTO users (username, display_name, account_type) VALUES 
('seiji_ogata', 'Seiji Ogata', 'seiji'),
('diego_salcatore', 'Diego Salcatore', 'diego');

-- Создание записей финансов для пользователей
INSERT INTO finances (user_id) VALUES 
((SELECT id FROM users WHERE username = 'seiji_ogata')),
((SELECT id FROM users WHERE username = 'diego_salcatore'));
