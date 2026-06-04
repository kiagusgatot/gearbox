<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Service;
use App\Models\Vehicle;

class FreshTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Truncate all tables in the correct foreign key order
        Schema::disableForeignKeyConstraints();

        $tables = [
            'activity_logs',
            'service_checklist_items',
            'estimation_items',
            'inspection_photos',
            'inspections',
            'payments',
            'reviews',
            'bookings',
            'vehicles',
            'services',
            'users',
            'mechanic_earnings',
            'mechanic_schedules',
            'notifications',
            'withdrawal_requests',
        ];

        foreach ($tables as $table) {
            if (Schema::hasTable($table)) {
                DB::table($table)->truncate();
            }
        }

        Schema::enableForeignKeyConstraints();

        // 2. Seed Users
        $admin = User::create([
            'name'              => 'Admin',
            'email'             => 'admin@gearbox.co.id',
            'password'          => Hash::make('password123'),
            'phone'             => '081200000001',
            'role'              => 'admin',
            'is_active'         => true,
            'email_verified_at' => now(),
        ]);

        $customer = User::create([
            'name'              => 'Budi Santoso',
            'email'             => 'budi@gearbox.co.id',
            'password'          => Hash::make('password123'),
            'phone'             => '081200000002',
            'role'              => 'customer',
            'is_active'         => true,
            'email_verified_at' => now(),
        ]);

        $mechanic = User::create([
            'name'              => 'Ahmad Prasetyo',
            'email'             => 'ahmad@gearbox.co.id',
            'password'          => Hash::make('password123'),
            'phone'             => '081200000003',
            'role'              => 'mechanic',
            'is_active'         => true,
            'email_verified_at' => now(),
        ]);

        // 3. Seed Services
        Service::create([
            'name'                => 'Ganti Oli',
            'description'         => 'Penggantian oli mesin berkualitas untuk menjaga performa dan umur mesin kendaraan Anda. Termasuk pemeriksaan filter oli.',
            'category'            => 'routine',
            'labor_price'         => 50000,
            'parts_price'         => 100000,
            'base_price'          => 150000,
            'estimated_duration'  => 60,
            'max_booking_per_day' => 8,
            'terms_conditions'    => 'Oli yang digunakan adalah oli standar pabrikan. Upgrade oli premium dikenakan biaya tambahan.',
            'image_url'           => 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800&h=600&fit=crop',
            'is_active'           => true,
            'display_order'       => 1,
        ]);

        Service::create([
            'name'                => 'Service Umum',
            'description'         => 'Pemeriksaan dan perawatan rutin kendaraan secara menyeluruh. Meliputi cek oli, air radiator, rem, ban, kelistrikan, dan AC.',
            'category'            => 'maintenance',
            'labor_price'         => 200000,
            'parts_price'         => 200000,
            'base_price'          => 400000,
            'estimated_duration'  => 120,
            'max_booking_per_day' => 6,
            'terms_conditions'    => 'Jika ditemukan kerusakan tambahan, estimasi biaya akan dikirimkan untuk persetujuan terlebih dahulu.',
            'image_url'           => 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&h=600&fit=crop',
            'is_active'           => true,
            'display_order'       => 2,
        ]);

        Service::create([
            'name'                => 'Kelistrikan',
            'description'         => 'Perbaikan dan pemeriksaan sistem kelistrikan kendaraan. Termasuk cek aki, alternator, kabel, lampu, dan klakson.',
            'category'            => 'repair',
            'labor_price'         => 300000,
            'parts_price'         => 200000,
            'base_price'          => 500000,
            'estimated_duration'  => 90,
            'max_booking_per_day' => 4,
            'terms_conditions'    => 'Penggantian komponen kelistrikan dikenakan biaya sesuai part yang dibutuhkan.',
            'image_url'           => 'https://images.unsplash.com/photo-1597766325363-f5576d851d6a?w=800&h=600&fit=crop',
            'is_active'           => true,
            'display_order'       => 3,
        ]);

        Service::create([
            'name'                => 'Tune-Up',
            'description'         => 'Penyetelan mesin untuk performa optimal. Meliputi cek busi, filter udara, filter bensin, dan setting karburator/injeksi.',
            'category'            => 'routine',
            'labor_price'         => 150000,
            'parts_price'         => 150000,
            'base_price'          => 300000,
            'estimated_duration'  => 90,
            'max_booking_per_day' => 6,
            'terms_conditions'    => 'Tune-up standar. Jika diperlukan penggantian part, biaya menyesuaikan.',
            'image_url'           => 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=600&fit=crop',
            'is_active'           => true,
            'display_order'       => 4,
        ]);

        // 4. Seed Vehicles
        Vehicle::create([
            'user_id'      => $customer->id,
            'brand'        => 'Honda',
            'model'        => 'Civic',
            'year'         => 2020,
            'color'        => 'Hitam',
            'plate'        => 'B 1234 ABC',
            'transmission' => 'manual',
            'fuel_type'    => 'bensin',
        ]);

        Vehicle::create([
            'user_id'      => $customer->id,
            'brand'        => 'Toyota',
            'model'        => 'Avanza',
            'year'         => 2019,
            'color'        => 'Putih',
            'plate'        => 'B 9876 XYZ',
            'transmission' => 'automatic',
            'fuel_type'    => 'bensin',
        ]);
    }
}
