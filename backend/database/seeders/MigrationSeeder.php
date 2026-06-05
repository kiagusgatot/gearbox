<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class MigrationSeeder extends Seeder
{
    public function run()
    {
        // 1. Update status ENUM in bookings table
        DB::statement("ALTER TABLE bookings MODIFY COLUMN status ENUM(
            'pending', 'confirmed', 'ready', 'inspection_done', 'estimation_sent',
            'customer_approved', 'service_started', 'in_progress', 'waiting_payment',
            'completed', 'cancelled'
        ) NOT NULL DEFAULT 'pending'");
        echo "1. Updated status ENUM in bookings table successfully.\n";

        // 1b. Add pricing and capacity columns to services table
        if (!Schema::hasColumn('services', 'labor_price')) {
            DB::statement("ALTER TABLE services ADD COLUMN (
                labor_price DECIMAL(10,2) NOT NULL DEFAULT 0,
                parts_price DECIMAL(10,2) NOT NULL DEFAULT 0,
                max_booking_per_day INT NOT NULL DEFAULT 8,
                terms_conditions TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL
            )");
            echo "1b. Added labor_price, parts_price, max_booking_per_day, and terms_conditions to services table successfully.\n";
        } else {
            echo "1b. Columns in services table already exist.\n";
        }

        // 1c. Modify category ENUM on services table to include 'maintenance'
        DB::statement("ALTER TABLE services MODIFY COLUMN category ENUM('routine', 'repair', 'parts', 'maintenance', 'other') NOT NULL DEFAULT 'other'");
        echo "1c. Updated services category ENUM successfully.\n";

        // 1d. Add service_id column and foreign key to reviews table if it does not exist
        if (!Schema::hasColumn('reviews', 'service_id')) {
            DB::statement("ALTER TABLE reviews ADD COLUMN service_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL");
            DB::statement("UPDATE reviews r JOIN bookings b ON r.booking_id = b.id SET r.service_id = b.service_id WHERE r.service_id IS NULL");
            DB::statement("ALTER TABLE reviews MODIFY COLUMN service_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL");
            DB::statement("ALTER TABLE reviews ADD CONSTRAINT fk_reviews_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE");
            DB::statement("ALTER TABLE reviews ADD INDEX idx_reviews_service (service_id)");
            echo "1d. Added service_id column, mapped reviews, and added constraints/indexes successfully.\n";
        } else {
            echo "1d. Column service_id in reviews table already exists.\n";
        }

        // 2. Add columns to inspections table if they do not exist
        if (!Schema::hasColumn('inspections', 'mechanic_notes')) {
            DB::statement("ALTER TABLE inspections ADD COLUMN (
                mechanic_notes TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
                admin_notes TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
                approval_status ENUM('pending','sent','approved','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
                sent_at TIMESTAMP NULL,
                approved_at TIMESTAMP NULL,
                approved_by CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL
            )");
            echo "2. Added columns to inspections table successfully.\n";
        } else {
            echo "2. Columns in inspections table already exist.\n";
        }

        // 3. Create estimation_items table with matching collation
        DB::statement("CREATE TABLE IF NOT EXISTS estimation_items (
            id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci PRIMARY KEY,
            inspection_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
            booking_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
            name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
            qty INT NOT NULL DEFAULT 1,
            unit_price DECIMAL(10,2) NOT NULL,
            total_price DECIMAL(10,2) NOT NULL,
            duration_minutes INT NOT NULL DEFAULT 0,
            photo_url VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
            notes TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (inspection_id) REFERENCES inspections(id) ON DELETE CASCADE,
            FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
        echo "3. Created estimation_items table successfully.\n";

        // 4. Create service_checklist_items table with matching collation
        DB::statement("CREATE TABLE IF NOT EXISTS service_checklist_items (
            id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci PRIMARY KEY,
            booking_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
            mechanic_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
            item_name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
            is_completed TINYINT(1) DEFAULT 0,
            completed_at TIMESTAMP NULL,
            display_order INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
            FOREIGN KEY (mechanic_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
        echo "4. Created service_checklist_items table successfully.\n";
    }
}
