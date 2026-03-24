-- SQL Migration Script for Bulk Marketplace Negotiation Chat System
-- Note: If using Spring Boot with spring.jpa.hibernate.ddl-auto=update, 
-- these tables will be created automatically. This script is provided for manual execution.

-- Table for Bulk Products
CREATE TABLE bulk_products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    farmer_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    quantity INT NOT NULL,
    minimum_price DECIMAL(10,2) NOT NULL,
    location VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bulk_product_farmer FOREIGN KEY (farmer_id) REFERENCES users(id)
);

-- Table for Conversations
CREATE TABLE conversations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    bulk_product_id BIGINT NOT NULL,
    farmer_id BIGINT NOT NULL,
    wholesaler_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_conv_bulk_product FOREIGN KEY (bulk_product_id) REFERENCES bulk_products(id),
    CONSTRAINT fk_conv_farmer FOREIGN KEY (farmer_id) REFERENCES users(id),
    CONSTRAINT fk_conv_wholesaler FOREIGN KEY (wholesaler_id) REFERENCES users(id),
    -- Prevent duplicate active conversations for the same product and wholesaler
    UNIQUE KEY uk_conv_product_wholesaler (bulk_product_id, wholesaler_id)
);

-- Table for Negotiation Messages
CREATE TABLE negotiation_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    message TEXT NOT NULL,
    message_type VARCHAR(50) NOT NULL DEFAULT 'TEXT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_msg_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id),
    CONSTRAINT fk_msg_sender FOREIGN KEY (sender_id) REFERENCES users(id)
);

-- Table for Deal Offers
CREATE TABLE deal_offers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    price_per_unit DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_deal_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id)
);

-- =========================================================
-- Table for Bulk Orders (created ONLY after payment verified)
-- =========================================================
CREATE TABLE IF NOT EXISTS bulk_orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    deal_offer_id BIGINT NOT NULL,
    farmer_id BIGINT NOT NULL,
    wholesaler_id BIGINT NOT NULL,
    bulk_product_id BIGINT NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    platform_fee DECIMAL(12,2) NOT NULL,
    farmer_payout DECIMAL(12,2) NOT NULL,
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    payment_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    order_status VARCHAR(50) NOT NULL DEFAULT 'AWAITING_PAYMENT',
    -- Shipping / delivery address
    shipping_name VARCHAR(100),
    shipping_phone VARCHAR(20),
    shipping_address VARCHAR(500),
    shipping_city VARCHAR(100),
    shipping_state VARCHAR(100),
    shipping_pincode VARCHAR(10),
    estimated_delivery TIMESTAMP,
    -- Shiprocket tracking
    shipment_id VARCHAR(100),
    awb_code VARCHAR(100),
    courier_name VARCHAR(100),
    tracking_url VARCHAR(500),
    delivery_status VARCHAR(50) NOT NULL DEFAULT 'NOT_SHIPPED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_bulk_order_deal FOREIGN KEY (deal_offer_id) REFERENCES deal_offers(id),
    CONSTRAINT fk_bulk_order_farmer FOREIGN KEY (farmer_id) REFERENCES users(id),
    CONSTRAINT fk_bulk_order_wholesaler FOREIGN KEY (wholesaler_id) REFERENCES users(id),
    CONSTRAINT fk_bulk_order_product FOREIGN KEY (bulk_product_id) REFERENCES bulk_products(id)
);

-- =========================================================
-- ALTER TABLE statements for existing databases (MySQL < 8.0.3 compatible)
-- Uses a stored procedure to safely add columns only when missing.
-- Run this block once; drop the procedure afterwards if desired.
-- =========================================================
DROP PROCEDURE IF EXISTS add_column_if_missing;

DELIMITER $$
CREATE PROCEDURE add_column_if_missing(
    IN tbl  VARCHAR(64),
    IN col  VARCHAR(64),
    IN col_def TEXT
)
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME  = tbl
          AND COLUMN_NAME = col
    ) THEN
        SET @sql = CONCAT('ALTER TABLE `', tbl, '` ADD COLUMN `', col, '` ', col_def);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$
DELIMITER ;

CALL add_column_if_missing('bulk_orders', 'shipping_name',     'VARCHAR(100)');
CALL add_column_if_missing('bulk_orders', 'shipping_phone',    'VARCHAR(20)');
CALL add_column_if_missing('bulk_orders', 'shipping_address',  'VARCHAR(500)');
CALL add_column_if_missing('bulk_orders', 'shipping_city',     'VARCHAR(100)');
CALL add_column_if_missing('bulk_orders', 'shipping_state',    'VARCHAR(100)');
CALL add_column_if_missing('bulk_orders', 'shipping_pincode',  'VARCHAR(10)');
CALL add_column_if_missing('bulk_orders', 'estimated_delivery','TIMESTAMP NULL');
CALL add_column_if_missing('bulk_orders', 'shipment_id',       'VARCHAR(100)');
CALL add_column_if_missing('bulk_orders', 'awb_code',          'VARCHAR(100)');
CALL add_column_if_missing('bulk_orders', 'courier_name',      'VARCHAR(100)');
CALL add_column_if_missing('bulk_orders', 'tracking_url',      'VARCHAR(500)');
CALL add_column_if_missing('bulk_orders', 'delivery_status',   "VARCHAR(50) NOT NULL DEFAULT 'NOT_SHIPPED'");

DROP PROCEDURE IF EXISTS add_column_if_missing;

-- -- Farmer Ratings Table -----------------------------------------------------
CREATE TABLE IF NOT EXISTS farmer_ratings (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  farmer_id     BIGINT NOT NULL,
  wholesaler_id BIGINT NOT NULL,
  order_id      BIGINT NOT NULL,
  rating        INT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review        TEXT,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_fr_farmer     FOREIGN KEY (farmer_id)     REFERENCES users(id)        ON DELETE CASCADE,
  CONSTRAINT fk_fr_wholesaler FOREIGN KEY (wholesaler_id) REFERENCES users(id)        ON DELETE CASCADE,
  CONSTRAINT fk_fr_order      FOREIGN KEY (order_id)      REFERENCES bulk_orders(id)  ON DELETE CASCADE,
  CONSTRAINT uq_rating_per_order UNIQUE (wholesaler_id, order_id)
);
