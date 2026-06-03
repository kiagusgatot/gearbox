-- =====================================================================
-- SISTEM BOOKING BENGKEL - DATABASE SCHEMA
-- Database: MySQL 8.0+
-- Framework: Laravel
-- Created: 2024
-- =====================================================================

-- =====================================================================
-- USERS TABLE - Untuk customer, admin, dan mechanic
-- =====================================================================
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY COMMENT 'UUID',
    email VARCHAR(255) NOT NULL UNIQUE COMMENT 'Email address (login)',
    password VARCHAR(255) NOT NULL COMMENT 'Hashed password (bcrypt)',
    phone VARCHAR(20) UNIQUE NULLABLE COMMENT 'Phone number',
    name VARCHAR(255) NOT NULL COMMENT 'Full name',
    role ENUM('customer', 'admin', 'mechanic') NOT NULL DEFAULT 'customer' COMMENT 'User role',
    avatar_url VARCHAR(500) NULLABLE COMMENT 'URL to profile photo (S3/GCS)',
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
    color VARCHAR(50) NULLABLE COMMENT 'Vehicle color',
    vin VARCHAR(50) NULLABLE COMMENT 'Vehicle Identification Number',
    odometer INT NULLABLE COMMENT 'Current odometer reading',
    notes TEXT NULLABLE COMMENT 'Additional notes about vehicle',
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
    description TEXT NULLABLE COMMENT 'Service description',
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
    mechanic_id CHAR(36) NULLABLE COMMENT 'Assigned mechanic',
    scheduled_date DATE NOT NULL COMMENT 'Booking date',
    scheduled_time TIME NOT NULL COMMENT 'Booking time',
    status ENUM(
        'pending', 'confirmed', 'assigned', 'ready', 
        'checked_in', 'in_progress', 'completed', 'cancelled'
    ) NOT NULL DEFAULT 'pending' COMMENT 'Booking status',
    notes TEXT NULLABLE COMMENT 'Customer notes',
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
    transaction_id VARCHAR(255) NULLABLE UNIQUE COMMENT 'External payment provider transaction ID',
    gateway VARCHAR(50) NULLABLE COMMENT 'Payment gateway (stripe, midtrans, etc)',
    gateway_response JSON NULLABLE COMMENT 'Full response from payment gateway',
    notes TEXT NULLABLE COMMENT 'Payment notes',
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
    actual_cost DECIMAL(10, 2) NULLABLE COMMENT 'Actual cost after completion',
    actual_duration INT NULLABLE COMMENT 'Actual duration after completion',
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
    description TEXT NULLABLE COMMENT 'Photo description',
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
    title VARCHAR(255) NULLABLE COMMENT 'Review title',
    comment TEXT NULLABLE COMMENT 'Review comment',
    photos JSON NULLABLE COMMENT 'Array of photo URLs',
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
    action_url VARCHAR(500) NULLABLE COMMENT 'Deep link to action',
    related_id CHAR(36) NULLABLE COMMENT 'Related entity ID (booking, payment, etc)',
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
    notes TEXT NULLABLE COMMENT 'Schedule notes',
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
    percentage DECIMAL(5, 2) NULLABLE COMMENT 'Percentage cut from total',
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
    bank_name VARCHAR(100) NULLABLE COMMENT 'Bank name',
    status ENUM('pending', 'approved', 'rejected', 'processed') NOT NULL DEFAULT 'pending' COMMENT 'Request status',
    rejection_reason TEXT NULLABLE COMMENT 'Rejection reason if rejected',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL COMMENT 'When withdrawal was processed',
    
    FOREIGN KEY (mechanic_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_mechanic_id (mechanic_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- MIGRATION HISTORY TABLE (Laravel standard)
-- =====================================================================
CREATE TABLE migrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    migration VARCHAR(255) NOT NULL,
    batch INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- VIEWS untuk ease of querying
-- =====================================================================

-- View: Booking dengan detail lengkap
CREATE VIEW vw_booking_details AS
SELECT 
    b.id,
    b.user_id,
    u.name as customer_name,
    u.email as customer_email,
    u.phone as customer_phone,
    v.brand,
    v.model,
    v.plate,
    s.name as service_name,
    s.base_price,
    s.estimated_duration,
    b.scheduled_date,
    b.scheduled_time,
    b.status,
    m.name as mechanic_name,
    m.phone as mechanic_phone,
    b.notes,
    b.created_at,
    b.updated_at
FROM bookings b
JOIN users u ON b.user_id = u.id
JOIN vehicles v ON b.vehicle_id = v.id
JOIN services s ON b.service_id = s.id
LEFT JOIN users m ON b.mechanic_id = m.id AND m.role = 'mechanic';

-- View: Mechanic Performance
CREATE VIEW vw_mechanic_performance AS
SELECT 
    m.id,
    m.name,
    COUNT(DISTINCT b.id) as total_jobs,
    COUNT(DISTINCT CASE WHEN b.status = 'completed' THEN b.id END) as completed_jobs,
    ROUND(AVG(r.rating), 2) as avg_rating,
    COUNT(r.id) as total_reviews,
    ROUND(SUM(CASE WHEN me.status = 'pending' THEN me.amount ELSE 0 END), 2) as pending_earnings,
    ROUND(SUM(CASE WHEN me.status IN ('paid', 'withdrawn') THEN me.amount ELSE 0 END), 2) as total_earned
FROM users m
LEFT JOIN bookings b ON m.id = b.mechanic_id
LEFT JOIN reviews r ON m.id = r.mechanic_id
LEFT JOIN mechanic_earnings me ON m.id = me.mechanic_id
WHERE m.role = 'mechanic' AND m.deleted_at IS NULL
GROUP BY m.id, m.name;

-- View: Monthly Revenue
CREATE VIEW vw_monthly_revenue AS
SELECT 
    DATE_TRUNC(p.created_at, MONTH) as month,
    COUNT(DISTINCT b.id) as total_bookings,
    ROUND(SUM(CASE WHEN p.status = 'success' THEN p.amount ELSE 0 END), 2) as total_revenue,
    ROUND(AVG(CASE WHEN p.status = 'success' THEN p.amount ELSE NULL END), 2) as avg_booking_value,
    ROUND(SUM(CASE WHEN p.status = 'success' AND p.payment_type = 'full' THEN p.amount ELSE 0 END), 2) as full_payments,
    ROUND(SUM(CASE WHEN p.status = 'success' AND p.payment_type = 'dp' THEN p.amount ELSE 0 END), 2) as dp_payments
FROM bookings b
LEFT JOIN payments p ON b.id = p.booking_id
WHERE p.status = 'success'
GROUP BY DATE_TRUNC(p.created_at, MONTH)
ORDER BY month DESC;

-- =====================================================================
-- SAMPLE DATA (untuk testing)
-- =====================================================================

-- Insert sample users
INSERT INTO users (id, email, password, phone, name, role) VALUES
('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'customer@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '081234567890', 'John Doe', 'customer'),
('f47ac10b-58cc-4372-a567-0e02b2c3d480', 'mechanic@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '082345678901', 'Ahmad Mekanik', 'mechanic'),
('f47ac10b-58cc-4372-a567-0e02b2c3d481', 'admin@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '083456789012', 'Admin User', 'admin');

-- Insert sample vehicles
INSERT INTO vehicles (id, user_id, brand, model, plate, year, engine_type, color) VALUES
('f47ac10b-58cc-4372-a567-0e02b2c3d482', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Toyota', 'Avanza', 'B 1234 ABC', 2020, 'manual', 'Silver');

-- Insert sample services
INSERT INTO services (id, name, description, base_price, estimated_duration, category) VALUES
('f47ac10b-58cc-4372-a567-0e02b2c3d483', 'Perawatan Rutin', 'Ganti oli, filter, dan service berkala', 150000, 60, 'routine'),
('f47ac10b-58cc-4372-a567-0e02b2c3d484', 'Perbaikan Mesin', 'Service dan perbaikan mesin', 500000, 240, 'repair'),
('f47ac10b-58cc-4372-a567-0e02b2c3d485', 'Ganti Sparepart', 'Penggantian onderdil kendaraan', 300000, 120, 'parts');

-- =====================================================================
-- END OF DATABASE SCHEMA
-- =====================================================================
