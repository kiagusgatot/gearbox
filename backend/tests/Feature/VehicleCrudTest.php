<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class VehicleCrudTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('users');
        Schema::dropIfExists('vehicles');
        Schema::dropIfExists('bookings');

        Schema::create('users', function ($table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->string('email');
            $table->string('password');
            $table->string('phone');
            $table->string('role');
            $table->boolean('is_active')->default(true);
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('vehicles', function ($table) {
            $table->string('id')->primary();
            $table->string('user_id');
            $table->string('brand');
            $table->string('model');
            $table->string('plate')->unique();
            $table->integer('year');
            $table->string('engine_type')->nullable();
            $table->string('color')->nullable();
            $table->string('transmission')->default('manual');
            $table->string('fuel_type')->default('bensin');
            $table->timestamps();
        });

        Schema::create('bookings', function ($table) {
            $table->string('id')->primary();
            $table->string('booking_code')->nullable()->unique();
            $table->string('user_id');
            $table->string('vehicle_id');
            $table->string('service_id')->nullable();
            $table->string('mechanic_id')->nullable();
            $table->date('scheduled_date')->nullable();
            $table->time('scheduled_time')->nullable();
            $table->string('status');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::enableForeignKeyConstraints();

        // Seed some base users
        DB::table('users')->insert([
            [
                'id' => 'u-cust-1',
                'name' => 'Customer One',
                'email' => 'cust1@example.com',
                'password' => bcrypt('password'),
                'phone' => '08123456781',
                'role' => 'customer',
            ],
            [
                'id' => 'u-cust-2',
                'name' => 'Customer Two',
                'email' => 'cust2@example.com',
                'password' => bcrypt('password'),
                'phone' => '08123456782',
                'role' => 'customer',
            ],
            [
                'id' => 'u-admin',
                'name' => 'Admin User',
                'email' => 'admin@example.com',
                'password' => bcrypt('password'),
                'phone' => '08123456783',
                'role' => 'admin',
            ]
        ]);
    }

    protected function tearDown(): void
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('users');
        Schema::dropIfExists('vehicles');
        Schema::dropIfExists('bookings');
        Schema::enableForeignKeyConstraints();

        parent::tearDown();
    }

    public function test_can_create_vehicle_with_new_fields()
    {
        $token = base64_encode('u-cust-1');

        $payload = [
            'user_id' => 'u-cust-1',
            'brand' => 'Honda',
            'model' => 'Civic Turbo',
            'plate' => 'B 1234 TUR',
            'year' => 2021,
            'transmission' => 'automatic',
            'fuel_type' => 'hybrid',
            'color' => 'Red'
        ];

        $response = $this->postJson('/api/vehicles', $payload, [
            'Authorization' => 'Bearer ' . $token
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('data.brand', 'Honda');
        $response->assertJsonPath('data.transmission', 'automatic');
        $response->assertJsonPath('data.fuel_type', 'hybrid');

        // Check CORS header
        $response->assertHeader('Access-Control-Allow-Origin', '*');
    }

    public function test_owner_can_update_vehicle()
    {
        // Seed vehicle owned by u-cust-1
        DB::table('vehicles')->insert([
            'id' => 'v-1',
            'user_id' => 'u-cust-1',
            'brand' => 'Honda',
            'model' => 'Jazz',
            'plate' => 'B 888 JZ',
            'year' => 2018,
            'transmission' => 'manual',
            'fuel_type' => 'bensin',
        ]);

        $token = base64_encode('u-cust-1');

        $payload = [
            'brand' => 'Honda',
            'model' => 'Jazz RS',
            'plate' => 'B 888 JZ',
            'year' => 2019,
            'transmission' => 'automatic',
            'fuel_type' => 'electric',
            'color' => 'White'
        ];

        $response = $this->putJson('/api/vehicles/v-1', $payload, [
            'Authorization' => 'Bearer ' . $token
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('data.model', 'Jazz RS');
        $response->assertJsonPath('data.transmission', 'automatic');
        $response->assertJsonPath('data.fuel_type', 'electric');
    }

    public function test_other_user_cannot_update_vehicle()
    {
        // Seed vehicle owned by u-cust-1
        DB::table('vehicles')->insert([
            'id' => 'v-1',
            'user_id' => 'u-cust-1',
            'brand' => 'Honda',
            'model' => 'Jazz',
            'plate' => 'B 888 JZ',
            'year' => 2018,
            'transmission' => 'manual',
            'fuel_type' => 'bensin',
        ]);

        // Token of u-cust-2 trying to edit u-cust-1's vehicle
        $token = base64_encode('u-cust-2');

        $payload = [
            'brand' => 'Honda',
            'model' => 'Jazz RS',
            'plate' => 'B 888 JZ',
            'year' => 2019,
            'transmission' => 'automatic',
            'fuel_type' => 'electric',
        ];

        $response = $this->putJson('/api/vehicles/v-1', $payload, [
            'Authorization' => 'Bearer ' . $token
        ]);

        $response->assertStatus(403);
    }

    public function test_cannot_delete_vehicle_with_active_booking()
    {
        // Seed vehicle owned by u-cust-1
        DB::table('vehicles')->insert([
            'id' => 'v-1',
            'user_id' => 'u-cust-1',
            'brand' => 'Honda',
            'model' => 'Jazz',
            'plate' => 'B 888 JZ',
            'year' => 2018,
            'transmission' => 'manual',
            'fuel_type' => 'bensin',
        ]);

        // Seed active booking (pending)
        DB::table('bookings')->insert([
            'id' => 'b-1',
            'user_id' => 'u-cust-1',
            'vehicle_id' => 'v-1',
            'status' => 'pending'
        ]);

        $token = base64_encode('u-cust-1');

        $response = $this->deleteJson('/api/vehicles/v-1', [], [
            'Authorization' => 'Bearer ' . $token
        ]);

        $response->assertStatus(422);
        $response->assertJsonStructure(['error', 'message']);
        $response->assertJsonPath('error', 'Tidak bisa menghapus. Kendaraan ini memiliki booking aktif.');
    }

    public function test_can_delete_vehicle_if_booking_is_completed_or_cancelled()
    {
        DB::table('vehicles')->insert([
            'id' => 'v-1',
            'user_id' => 'u-cust-1',
            'brand' => 'Honda',
            'model' => 'Jazz',
            'plate' => 'B 888 JZ',
            'year' => 2018,
            'transmission' => 'manual',
            'fuel_type' => 'bensin',
        ]);

        // Seed inactive booking (completed)
        DB::table('bookings')->insert([
            'id' => 'b-1',
            'user_id' => 'u-cust-1',
            'vehicle_id' => 'v-1',
            'status' => 'completed'
        ]);

        $token = base64_encode('u-cust-1');

        $response = $this->deleteJson('/api/vehicles/v-1', [], [
            'Authorization' => 'Bearer ' . $token
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('message', 'Kendaraan berhasil dihapus');
    }
}
