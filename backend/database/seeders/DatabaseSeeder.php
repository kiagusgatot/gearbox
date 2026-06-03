<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();

        // Truncate tables to get a clean slate
        DB::table('users')->truncate();
        DB::table('vehicles')->truncate();
        DB::table('services')->truncate();
        DB::table('bookings')->truncate();
        DB::table('payments')->truncate();
        DB::table('inspections')->truncate();
        DB::table('reviews')->truncate();

        // 1. Seed Users
        DB::table('users')->insert([
            [
                'id' => '1',
                'email' => 'fallback@example.com',
                'password' => bcrypt('password123'),
                'phone' => '081111111111',
                'name' => 'Fallback User',
                'role' => 'customer',
                'is_active' => true,
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => '550e8400-e29b-41d4-a716-446655440001',
                'email' => 'customer@example.com',
                'password' => bcrypt('password123'),
                'phone' => '081234567890',
                'name' => 'John Doe',
                'role' => 'customer',
                'is_active' => true,
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => '550e8400-e29b-41d4-a716-446655440002',
                'email' => 'mechanic@example.com',
                'password' => bcrypt('password123'),
                'phone' => '082345678901',
                'name' => 'Ahmad Mekanik',
                'role' => 'mechanic',
                'is_active' => true,
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => '550e8400-e29b-41d4-a716-446655440003',
                'email' => 'admin@example.com',
                'password' => bcrypt('password123'),
                'phone' => '083456789012',
                'name' => 'Admin User',
                'role' => 'admin',
                'is_active' => true,
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 2. Seed Vehicles
        DB::table('vehicles')->insert([
            [
                'id' => '1',
                'user_id' => '1',
                'brand' => 'Honda',
                'model' => 'Civic',
                'plate' => 'B 1234 ABC',
                'year' => 2020,
                'engine_type' => 'automatic',
                'color' => 'Black',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => '550e8400-e29b-41d4-a716-446655440004',
                'user_id' => '550e8400-e29b-41d4-a716-446655440001',
                'brand' => 'Toyota',
                'model' => 'Avanza',
                'plate' => 'B 9876 XYZ',
                'year' => 2019,
                'engine_type' => 'manual',
                'color' => 'White',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 3. Seed Services
        DB::table('services')->insert([
            [
                'id' => '1',
                'name' => 'Fallback Service',
                'description' => 'Deskripsi service fallback',
                'base_price' => 100000.00,
                'labor_price' => 50000.00,
                'parts_price' => 50000.00,
                'estimated_duration' => 30,
                'category' => 'routine',
                'max_booking_per_day' => 8,
                'terms_conditions' => 'Syarat standar',
                'is_active' => true,
                'display_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => '550e8400-e29b-41d4-a716-446655440005',
                'name' => 'Ganti Oli',
                'description' => 'Penggantian oli mesin berkualitas',
                'base_price' => 150000.00,
                'labor_price' => 50000.00,
                'parts_price' => 100000.00,
                'estimated_duration' => 60,
                'category' => 'routine',
                'max_booking_per_day' => 8,
                'terms_conditions' => 'Oli original, garansi mesin bersih',
                'is_active' => true,
                'display_order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => '550e8400-e29b-41d4-a716-446655440006',
                'name' => 'Tune-Up',
                'description' => 'Optimasi performa mesin kendaraan',
                'base_price' => 300000.00,
                'labor_price' => 100000.00,
                'parts_price' => 200000.00,
                'estimated_duration' => 120,
                'category' => 'routine',
                'max_booking_per_day' => 8,
                'terms_conditions' => 'Termasuk pembersihan filter, pemeriksaan busi',
                'is_active' => true,
                'display_order' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => '550e8400-e29b-41d4-a716-446655440007',
                'name' => 'Service Umum',
                'description' => 'Pemeriksaan dan perawatan umum berkala',
                'base_price' => 400000.00,
                'labor_price' => 150000.00,
                'parts_price' => 250000.00,
                'estimated_duration' => 180,
                'category' => 'maintenance',
                'max_booking_per_day' => 8,
                'terms_conditions' => 'Pemeriksaan menyeluruh, gratis konsultasi',
                'is_active' => true,
                'display_order' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => '550e8400-e29b-41d4-a716-446655440009',
                'name' => 'Kelistrikan',
                'description' => 'Perbaikan dan diagnosa sistem kelistrikan',
                'base_price' => 500000.00,
                'labor_price' => 200000.00,
                'parts_price' => 300000.00,
                'estimated_duration' => 150,
                'category' => 'repair',
                'max_booking_per_day' => 8,
                'terms_conditions' => 'Garansi 1 bulan untuk spare parts kelistrikan',
                'is_active' => true,
                'display_order' => 5,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 4. Seed Bookings
        DB::table('bookings')->insert([
            [
                'id' => '1',
                'user_id' => '1',
                'vehicle_id' => '1',
                'service_id' => '1',
                'scheduled_date' => '2026-06-01',
                'scheduled_time' => '10:00:00',
                'notes' => 'Booking fallback',
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => '550e8400-e29b-41d4-a716-446655440008',
                'user_id' => '550e8400-e29b-41d4-a716-446655440001',
                'vehicle_id' => '550e8400-e29b-41d4-a716-446655440004',
                'service_id' => '550e8400-e29b-41d4-a716-446655440005',
                'scheduled_date' => '2026-06-02',
                'scheduled_time' => '13:00:00',
                'notes' => 'Mesin berisik',
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        Schema::enableForeignKeyConstraints();
    }
}
