-- =====================================================================
-- SISTEM BOOKING BENGKEL - DATABASE SCHEMA
-- Database: MySQL 8.0+
-- Framework: Laravel
-- Created: 2024
-- FIXED: Removed NULLABLE keyword (replaced with NULL)
-- =====================================================================

-- =====================================================================
-- USERS TABLE - Untuk customer, admin, dan mechanic
-- =====================================================================
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY COMMENT 'UUID',
    email VARCHAR(255) NOT NULL UNIQUE COMMENT 'Email address (login)',
    password VARCHAR(255) NOT NULL COMMENT 'Hashed password (bcrypt)',
    phone VARCHAR(20) NULL UNIQUE COMMENT 'Phone number',
    name VARCHAR(255) NOT NULL COMMENT 'Full name',
    role ENUM('customer', 'admin', 'mechanic') NOT NULL DEFAULT 'customer' COMMENT 'User role',
    avatar_url VARCHAR(500) NULL COMMENT 'URL to profile photo (S3/GCS)',
    is_active BOOLEAN NOT NULL DEFAULT true COMMENT 'Account status',
    email_verified_at TIMESTAMP NULL COMMENT 'Email verification timestamp',
    phone_verified_at TIMESTAMP NULL COMMENT 'Phone verification timestamp',
    last_login_at TIMESTAMP NULL COMMENT 'Last login timestamp',
    remember_token VARCHAR(100) NULL COMMENT 'Laravel remember me token',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
    
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_role (role),
    INDEX idx_is_active (is_active),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- VEHICLES TABLE - Kendaraan milik customer
-- =====================================================================
CREATE TABLE vehicles (
    id CHAR(36) PRIMARY KEY COMMENT 'UUID',
    user_id CHAR(36) NOT NULL COMMENT 'Customer who owns vehicle',
    brand VARCHAR(100) NOT NULL COMMENT 'Vehicle brand (Toyota, Honda, etc)',
    model VARCHAR(100) NOT NULL COMMENT 'Vehicle model (Avanza, Civic, etc)',
    plate VARCHAR(20) NOT NULL UNIQUE COMMENT 'License plate number',
    year INT NOT NULL COMMENT 'Manufacturing year',
    engine_type ENUM('manual', 'automatic') NOT NULL COMMENT 'Transmission type',
    color VARCHAR(50) NULL COMMENT 'Vehicle color',
    vin VARCHAR(50) NULL COMMENT 'Vehicle Identification Number',
    odometer INT NULL COMMENT 'Current odometer reading',
    notes TEXT NULL COMMENT 'Additional notes about vehicle',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_user_id (user_id),
    INDEX idx_plate (plate),
    INDEX idx_brand (brand)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- SERVICES TABLE - Daftar layanan/servis yang tersedia
-- =====================================================================
CREATE TABLE services (
    id CHAR(36) PRIMARY KEY COMMENT 'UUID',
    name VARCHAR(255) NOT NULL COMMENT 'Service name',
    description TEXT NULL COMMENT 'Service description',
    base_price DECIMAL(10, 2) NOT NULL COMMENT 'Base service price',
    estimated_duration INT NOT NULL COMMENT 'Estimated duration in minutes',
    category ENUM('routine', 'repair', 'parts', 'other') NOT NULL DEFAULT 'other' COMMENT 'Service category',
    is_active BOOLEAN NOT NULL DEFAULT true COMMENT 'Service availability status',
    display_order INT DEFAULT 0 COMMENT 'Display order in UI',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_is_active (is_active),
    INDEX idx_category (category),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- BOOKINGS TABLE - Main table untuk booking/transaksi
-- =====================================================================
CREATE TABLE bookings (
    id CHAR(36) PRIMARY KEY COMMENT 'UUID',
    user_id CHAR(36) NOT NULL COMMENT 'Customer who created booking',
    vehicle_id CHAR(36) NOT NULL COMMENT 'Vehicle being serviced',
    service_id CHAR(36) NOT NULL COMMENT 'Service ordered',
    mechanic_id CHAR(36) NULL COMMENT 'Assigned mechanic',
    scheduled_date DATE NOT NULL COMMENT 'Booking date',
    scheduled_time TIME NOT NULL COMMENT 'Booking time',
    status ENUM(
        'pending', 'confirmed', 'assigned', 'ready', 
        'checked_in', 'in_progress', 'completed', 'cancelled'
    ) NOT NULL DEFAULT 'pending' COMMENT 'Booking status',
    notes TEXT NULL COMMENT 'Customer notes',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP NULL COMMENT 'Cancellation timestamp',
    started_at TIMESTAMP NULL COMMENT 'Service start time',
    completed_at TIMESTAMP NULL COMMENT 'Service completion time',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT,
    FOREIGN KEY (mechanic_id) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_user_id (user_id),
    INDEX idx_mechanic_id (mechanic_id),
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_status (status),
    INDEX idx_scheduled_date (scheduled_date),
    INDEX idx_user_status_date (user_id, status, scheduled_date),
    INDEX idx_mechanic_status (mechanic_id, status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- PAYMENTS TABLE - Riwayat pembayaran
-- =====================================================================
CREATE TABLE payments (
    id CHAR(36) PRIMARY KEY COMMENT 'UUID',
    booking_id CHAR(36) NOT NULL COMMENT 'Associated booking',
    amount DECIMAL(10, 2) NOT NULL COMMENT 'Payment amount',
    method ENUM(
        'credit_card', 'debit_card', 'bank_transfer', 'cash', 'e_wallet'
    ) NOT NULL COMMENT 'Payment method',
    payment_type ENUM('dp', 'full', 'remainder') NOT NULL COMMENT 'Payment type',
    status ENUM('pending', 'success', 'failed', 'refunded') NOT NULL DEFAULT 'pending' COMMENT 'Payment status',
    transaction_id VARCHAR(255) NULL UNIQUE COMMENT 'External payment provider transaction ID',
    gateway VARCHAR(50) NULL COMMENT 'Payment gateway (stripe, midtrans, etc)',
    gateway_response JSON NULL COMMENT 'Full response from payment gateway',
    notes TEXT NULL COMMENT 'Payment notes',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    
    INDEX idx_booking_id (booking_id),
    INDEX idx_status (status),
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- INSPECTIONS TABLE - Estimasi & temuan mekanik saat inspeksi
-- =====================================================================
CREATE TABLE inspections (
    id CHAR(36) PRIMARY KEY COMMENT 'UUID',
    booking_id CHAR(36) NOT NULL UNIQUE COMMENT 'Associated booking (1:1)',
    mechanic_id CHAR(36) NOT NULL COMMENT 'Mechanic who conducted inspection',
    findings TEXT NOT NULL COMMENT 'List of issues found',
    estimated_cost DECIMAL(10, 2) NOT NULL DEFAULT 0 COMMENT 'Estimated repair cost',
    estimated_duration INT NOT NULL COMMENT 'Estimated repair duration in minutes',
    actual_cost DECIMAL(10, 2) NULL COMMENT 'Actual cost after completion',
    actual_duration INT NULL COMMENT 'Actual duration after completion',
    status ENUM('pending_approval', 'approved', 'rejected') NOT NULL DEFAULT 'pending_approval' COMMENT 'Inspection status',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (mechanic_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_booking_id (booking_id),
    INDEX idx_mechanic_id (mechanic_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- INSPECTION_PHOTOS TABLE - Foto hasil inspeksi
-- =====================================================================
CREATE TABLE inspection_photos (
    id CHAR(36) PRIMARY KEY COMMENT 'UUID',
    inspection_id CHAR(36) NOT NULL COMMENT 'Associated inspection',
    photo_url VARCHAR(500) NOT NULL COMMENT 'URL to inspection photo',
    photo_type ENUM('damage', 'damage_detail', 'parts', 'work_result') NOT NULL COMMENT 'Type of photo',
    description TEXT NULL COMMENT 'Photo description',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (inspection_id) REFERENCES inspections(id) ON DELETE CASCADE,
    
    INDEX idx_inspection_id (inspection_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- REVIEWS TABLE - Rating dan review dari customer
-- =====================================================================
CREATE TABLE reviews (
    id CHAR(36) PRIMARY KEY COMMENT 'UUID',
    booking_id CHAR(36) NOT NULL UNIQUE COMMENT 'Associated booking (1:1)',
    user_id CHAR(36) NOT NULL COMMENT 'Customer who reviewed',
    mechanic_id CHAR(36) NOT NULL COMMENT 'Mechanic being reviewed',
    rating TINYINT NOT NULL COMMENT 'Star rating 1-5',
    title VARCHAR(255) NULL COMMENT 'Review title',
    comment TEXT NULL COMMENT 'Review comment',
    photos JSON NULL COMMENT 'Array of photo URLs',
    is_verified_purchase BOOLEAN NOT NULL DEFAULT true COMMENT 'Verified purchase flag',
    helpful_count INT DEFAULT 0 COMMENT 'Helpful count',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (mechanic_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_booking_id (booking_id),
    INDEX idx_user_id (user_id),
    INDEX idx_mechanic_id (mechanic_id),
    INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- NOTIFICATIONS TABLE - Push notifications dan in-app notifications
-- =====================================================================
CREATE TABLE notifications (
    id CHAR(36) PRIMARY KEY COMMENT 'UUID',
    user_id CHAR(36) NOT NULL COMMENT 'Recipient user',
    type VARCHAR(100) NOT NULL COMMENT 'Notification type',
    title VARCHAR(255) NOT NULL COMMENT 'Notification title',
    message TEXT NOT NULL COMMENT 'Notification message',
    is_read BOOLEAN NOT NULL DEFAULT false COMMENT 'Read status',
    action_url VARCHAR(500) NULL COMMENT 'Deep link to action',
    related_id CHAR(36) NULL COMMENT 'Related entity ID (booking, payment, etc)',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL COMMENT 'When notification was read',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_user_read (user_id, is_read),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- MECHANIC_SCHEDULES TABLE - Jadwal ketersediaan mekanik
-- =====================================================================
CREATE TABLE mechanic_schedules (
    id CHAR(36) PRIMARY KEY COMMENT 'UUID',
    mechanic_id CHAR(36) NOT NULL COMMENT 'Mechanic',
    date DATE NOT NULL COMMENT 'Schedule date',
    is_available BOOLEAN NOT NULL DEFAULT true COMMENT 'Availability status',
    max_bookings INT NOT NULL DEFAULT 5 COMMENT 'Max bookings per day',
    current_bookings INT NOT NULL DEFAULT 0 COMMENT 'Current booking count',
    notes TEXT NULL COMMENT 'Schedule notes',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (mechanic_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_mechanic_date (mechanic_id, date),
    
    INDEX idx_mechanic_id (mechanic_id),
    INDEX idx_date (date),
    INDEX idx_is_available (is_available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- MECHANIC_EARNINGS TABLE - Tracking penghasilan mekanik
-- =====================================================================
CREATE TABLE mechanic_earnings (
    id CHAR(36) PRIMARY KEY COMMENT 'UUID',
    mechanic_id CHAR(36) NOT NULL COMMENT 'Mechanic',
    booking_id CHAR(36) NOT NULL COMMENT 'Associated booking',
    amount DECIMAL(10, 2) NOT NULL COMMENT 'Earnings amount',
    percentage DECIMAL(5, 2) NULL COMMENT 'Percentage cut from total',
    status ENUM('pending', 'paid', 'withdrawn') NOT NULL DEFAULT 'pending' COMMENT 'Payment status',
    withdrawn_at TIMESTAMP NULL COMMENT 'Withdrawal timestamp',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (mechanic_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    
    INDEX idx_mechanic_id (mechanic_id),
    INDEX idx_booking_id (booking_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- WITHDRAWAL_REQUESTS TABLE - Permintaan pencairan dana mekanik
-- =====================================================================
CREATE TABLE withdrawal_requests (
    id CHAR(36) PRIMARY KEY COMMENT 'UUID',
    mechanic_id CHAR(36) NOT NULL COMMENT 'Mechanic requesting withdrawal',
    amount DECIMAL(10, 2) NOT NULL COMMENT 'Withdrawal amount',
    bank_account VARCHAR(255) NOT NULL COMMENT 'Encrypted bank account details',
    account_holder VARCHAR(255) NOT NULL COMMENT 'Account holder name',
    account_number VARCHAR(50) NOT NULL COMMENT 'Account number',
    bank_name VARCHAR(100) NULL COMMENT 'Bank name',
    status ENUM('pending', 'approved', 'rejected', 'processed') NOT NULL DEFAULT 'pending' COMMENT 'Request status',
    rejection_reason TEXT NULL COMMENT 'Rejection reason if rejected',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL COMMENT 'When withdrawal was processed',
    
    FOREIGN KEY (mechanic_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_mechanic_id (mechanic_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- SAMPLE DATA (untuk testing)
-- =====================================================================

INSERT INTO users (id, email, password, phone, name, role) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'customer@example.com', 'password123', '081234567890', 'John Doe', 'customer'),
('550e8400-e29b-41d4-a716-446655440002', 'mechanic@example.com', 'password123', '082345678901', 'Ahmad Mekanik', 'mechanic'),
('550e8400-e29b-41d4-a716-446655440003', 'admin@example.com', 'password123', '083456789012', 'Admin User', 'admin');

INSERT INTO vehicles (id, user_id, brand, model, plate, year, engine_type, color) VALUES
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'Toyota', 'Avanza', 'B 1234 ABC', 2020, 'manual', 'Silver');

INSERT INTO services (id, name, description, base_price, estimated_duration, category) VALUES
('550e8400-e29b-41d4-a716-446655440005', 'Perawatan Rutin', 'Ganti oli, filter, dan service berkala', 150000, 60, 'routine'),
('550e8400-e29b-41d4-a716-446655440006', 'Perbaikan Mesin', 'Service dan perbaikan mesin', 500000, 240, 'repair'),
('550e8400-e29b-41d4-a716-446655440007', 'Ganti Sparepart', 'Penggantian onderdil kendaraan', 300000, 120, 'parts');

-- =====================================================================
-- END OF DATABASE SCHEMA
-- =====================================================================
