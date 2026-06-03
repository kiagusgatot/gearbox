<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class MigrationSeeder extends Seeder
{
    public function run()
    {
        DB::transaction(function () {
            // 1. Update status ENUM in bookings table
            DB::statement("ALTER TABLE bookings MODIFY COLUMN status ENUM(
                'pending', 'confirmed', 'ready', 'inspection_done', 'estimation_sent',
                'customer_approved', 'service_started', 'in_progress', 'waiting_payment',
                'completed', 'cancelled'
            ) NOT NULL DEFAULT 'pending'");
            echo "1. Updated status ENUM in bookings table successfully.\n";

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
        });
    }
}
