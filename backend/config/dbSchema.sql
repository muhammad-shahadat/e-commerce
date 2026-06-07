-- ======================================================================================================
-- 🚀 SHOPPER ECOMMERCE - PRODUCTION DATABASE SCHEMA (MVP v1.0) For GUEST CHECKOUT E-COMMERCE PLATFORM
-- ======================================================================================================

-- Enable UUID extension for better security
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Function to handle automatic updated_at timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';



-- 3. CATEGORIES TABLE
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(120) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    category_code VARCHAR(10) UNIQUE,--for sku generation
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER set_timestamp_categories BEFORE UPDATE ON categories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE INDEX idx_categories_parent_id ON categories(parent_id);

-- 4. PRODUCTS TABLE
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(220) UNIQUE NOT NULL,
    description TEXT,
    base_price DECIMAL(12, 2) NOT NULL CHECK (base_price >= 0),
    discount_percent DECIMAL(5, 2) DEFAULT 0.00 CHECK (discount_percent BETWEEN 0 AND 100),
    sku VARCHAR(100) UNIQUE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sold_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER set_timestamp_products BEFORE UPDATE ON products FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category_id ON products(category_id) WHERE is_active = TRUE;

-- 5. PRODUCT VARIANTS TABLE (For Size, Color etc.)
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    price_modifier DECIMAL(12, 2) DEFAULT 0.00,
    sku VARCHAR(100) UNIQUE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER set_timestamp_product_variants BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 6. VARIANT OPTIONS TABLE
CREATE TABLE variant_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    option_name VARCHAR(100) NOT NULL, -- e.g., 'Color'
    option_value VARCHAR(100) NOT NULL, -- e.g., 'Red'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER set_timestamp_variant_options BEFORE UPDATE ON variant_options FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 7. INVENTORY TABLE
CREATE TABLE inventory (
    product_variant_id UUID PRIMARY KEY REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_timestamp_inventory BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 8. PRODUCT IMAGES TABLE
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    product_variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    image_url TEXT NOT NULL, -- Renamed from image_path for Cloudinary URLs
    public_id VARCHAR(255), -- For Cloudinary management
    is_main BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_timestamp_product_images BEFORE UPDATE ON product_images FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();



-- 10. ORDERS TABLE
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    shipping_address_id UUID REFERENCES user_addresses(id) ON DELETE SET NULL,

    -- কন্টাক্ট ইনফো (লগইন ইউজারের ইমেইল/ফোন এখান থেকেই ডুপ্লিকেট হয়ে আসবে)
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,

    -- স্ন্যাপশট অ্যাড্রেস (সব সময় ইনসার্ট হবে)
    shipping_address_line1 VARCHAR(255) NOT NULL,
    shipping_address_line2 VARCHAR(255),
    shipping_city VARCHAR(100) NOT NULL,
    shipping_state VARCHAR(100),
    shipping_postal_code VARCHAR(20),
    shipping_country VARCHAR(100) NOT NULL,

    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'completed', 'cancelled')),
    total DECIMAL(12, 2) NOT NULL,
    shipping_charge DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    
    payment_method VARCHAR(20) DEFAULT 'COD' CHECK (payment_method IN ('COD', 'BKASH', 'NAGAD', 'ROCKET', 'CARD')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_timestamp_orders BEFORE UPDATE ON orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 11. ORDER ITEMS TABLE
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    product_variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    price DECIMAL(12, 2) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0)
);

-- =====================================================
-- ✅ END OF PRODUCTION SCHEMA (MVP v1.0)
-- =====================================================







-- =====================================================
-- ❌ SKIPPED FOR MVP v1.0 (Comment this entire section)
-- =====================================================



-- -- 2. USERS TABLE
-- CREATE TABLE users (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     name VARCHAR(100) NOT NULL,
--     username VARCHAR(100) UNIQUE NOT NULL,
--     email VARCHAR(150) UNIQUE NOT NULL,
--     hash_password VARCHAR(255) NOT NULL,
--     role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
--     is_banned BOOLEAN DEFAULT FALSE,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
-- );
-- CREATE TRIGGER set_timestamp_users BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
-- CREATE INDEX idx_users_email_lower ON users (LOWER(email));

-- -- 9. USER ADDRESSES TABLE
-- CREATE TABLE user_addresses (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     address_line1 VARCHAR(255) NOT NULL,
--     address_line2 VARCHAR(255),
--     city VARCHAR(100) NOT NULL,
--     state VARCHAR(100),
--     postal_code VARCHAR(20),
--     country VARCHAR(100) NOT NULL,
--     is_default BOOLEAN DEFAULT FALSE,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
-- );

-- CREATE TRIGGER set_timestamp_user_addresses BEFORE UPDATE ON user_addresses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
-- -- 12. CARTS & CART ITEMS
-- CREATE TABLE carts (
--     id SERIAL PRIMARY KEY,
--     user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
-- );

-- CREATE TABLE cart_items (
--     id SERIAL PRIMARY KEY,
--     cart_id INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
--     product_variant_id INTEGER NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
--     quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
--     updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
-- );



-- =====================================================
-- ✅ END OF SKIPPED SECTION
-- =====================================================




