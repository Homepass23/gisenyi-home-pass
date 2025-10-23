-- Enable UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE user_role AS ENUM ('admin', 'host', 'customer');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'rejected', 'cancelled');
CREATE TYPE accommodation_type AS ENUM ('house', 'room');
CREATE TYPE cancellation_policy AS ENUM ('free', 'partial', 'none');
CREATE TYPE inquiry_status AS ENUM ('new', 'responded', 'closed');

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255), -- Not used by application, but exists in database
    role user_role NOT NULL DEFAULT 'customer',
    
    -- Shared info (some optional based on role)
    full_name VARCHAR(255),
    phone_number VARCHAR(20),
    street_address TEXT,
    city VARCHAR(100),
    profile_image_url TEXT,
    date_of_birth DATE,
    verified BOOLEAN DEFAULT FALSE,
    
    -- Owner-only fields
    national_id_or_passport VARCHAR(100),
    tin_number VARCHAR(50),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Role-based constraints
    CONSTRAINT admin_minimal_fields CHECK (
        role != 'admin' OR (
            full_name IS NULL AND 
            phone_number IS NULL AND 
            street_address IS NULL AND 
            city IS NULL AND 
            date_of_birth IS NULL AND
            national_id_or_passport IS NULL AND 
            tin_number IS NULL
        )
    ),
    CONSTRAINT customer_required_fields CHECK (
        role != 'customer' OR (
            full_name IS NOT NULL AND 
            phone_number IS NOT NULL AND 
            street_address IS NOT NULL AND 
            city IS NOT NULL AND 
            date_of_birth IS NOT NULL
        )
    ),
    CONSTRAINT host_required_fields CHECK (
        role != 'host' OR (
            full_name IS NOT NULL AND 
            phone_number IS NOT NULL AND 
            street_address IS NOT NULL AND 
            city IS NOT NULL AND 
            date_of_birth IS NOT NULL AND 
            national_id_or_passport IS NOT NULL AND 
            tin_number IS NOT NULL
        )
    )
);

-- ============================================================
-- ACCOMMODATIONS TABLE
-- ============================================================
CREATE TABLE accommodations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type accommodation_type NOT NULL DEFAULT 'house',
    location VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    price_per_night DECIMAL(10, 2) NOT NULL,
    num_of_guests INTEGER NOT NULL,
    num_of_rooms INTEGER NOT NULL,
    num_of_bathrooms INTEGER NOT NULL,
    amenities TEXT[] DEFAULT '{}',
    cancellation_policy cancellation_policy DEFAULT 'partial',
    allow_independent_room_booking BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3, 2) DEFAULT 0,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_rating CHECK (rating >= 0 AND rating <= 5)
);

-- ============================================================
-- ACCOMMODATION ROOMS (For Houses that allow room booking)
-- ============================================================
CREATE TABLE accommodation_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    accommodation_id UUID REFERENCES accommodations(id) ON DELETE CASCADE,
    room_name VARCHAR(255) NOT NULL,
    description TEXT,
    price_per_night DECIMAL(10,2) NOT NULL,
    num_of_guests INTEGER NOT NULL,
    num_of_beds INTEGER DEFAULT 1,
    private_bathroom BOOLEAN DEFAULT FALSE,
    image_gallery TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- ACCOMMODATION GALLERY (Multiple images per accommodation)
-- ============================================================
CREATE TABLE accommodation_gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    accommodation_id UUID REFERENCES accommodations(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- BOOKINGS TABLE
-- ============================================================
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    accommodation_id UUID REFERENCES accommodations(id) ON DELETE CASCADE,
    room_id UUID REFERENCES accommodation_rooms(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    street_address TEXT,
    city VARCHAR(100) NOT NULL,
    
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    num_of_guests INTEGER NOT NULL,
    status booking_status DEFAULT 'pending',
    cancellation_requested BOOLEAN DEFAULT FALSE,
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_dates CHECK (check_out_date > check_in_date)
);

-- ============================================================
-- REVIEWS TABLE
-- ============================================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    accommodation_id UUID REFERENCES accommodations(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    reviewer_name VARCHAR(255) NOT NULL,
    reviewer_image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- CUSTOMER INQUIRIES TABLE
-- ============================================================
CREATE TABLE customer_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status inquiry_status DEFAULT 'new',
    response TEXT,
    responded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- EMAIL LOGS / NOTIFICATIONS
-- ============================================================
CREATE TABLE email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    to_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    event VARCHAR(100)
);

-- ============================================================
-- AUTHENTICATION SUPPORTING TABLES
-- ============================================================

-- Email verification tokens
CREATE TABLE email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Password reset tokens
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Host approval requests
CREATE TABLE host_approval_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    admin_notes TEXT,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User sessions (for server-side session management)
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs for authentication events
CREATE TABLE auth_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL, -- login, logout, signup, verification, password_reset, etc.
    ip_address VARCHAR(45),
    user_agent TEXT,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);
CREATE INDEX idx_email_verification_tokens_token ON email_verification_tokens(token);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_host_approval_requests_user_id ON host_approval_requests(user_id);
CREATE INDEX idx_host_approval_requests_status ON host_approval_requests(status);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_session_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_auth_audit_logs_user_id ON auth_audit_logs(user_id);
CREATE INDEX idx_auth_audit_logs_event_type ON auth_audit_logs(event_type);
CREATE INDEX idx_auth_audit_logs_created_at ON auth_audit_logs(created_at);

-- ============================================================
-- TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_users BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_accommodations BEFORE UPDATE ON accommodations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_bookings BEFORE UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_host_approval_requests 
BEFORE UPDATE ON host_approval_requests
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_user_sessions 
BEFORE UPDATE ON user_sessions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_customer_inquiries 
BEFORE UPDATE ON customer_inquiries
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- AUTO UPDATE RATINGS ON REVIEWS
-- ============================================================
CREATE OR REPLACE FUNCTION update_accommodation_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE accommodations
    SET rating = (
        SELECT COALESCE(AVG(rating), 0)
        FROM reviews
        WHERE accommodation_id = COALESCE(NEW.accommodation_id, OLD.accommodation_id)
    )
    WHERE id = COALESCE(NEW.accommodation_id, OLD.accommodation_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_rating_insert
AFTER INSERT ON reviews
FOR EACH ROW EXECUTE FUNCTION update_accommodation_rating();

CREATE TRIGGER trg_update_rating_update
AFTER UPDATE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_accommodation_rating();

CREATE TRIGGER trg_update_rating_delete
AFTER DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_accommodation_rating();

-- ============================================================
-- DEFAULT ADMIN ACCOUNT
-- ============================================================
-- Note: Admin account should be created through Supabase Auth first
-- This is just a placeholder - the actual admin user should be created
-- through the application's signup process or manually in Supabase Auth