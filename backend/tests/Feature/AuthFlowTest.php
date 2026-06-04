<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\TestCase;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthFlowTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('activity_logs');

        Schema::create('users', function ($table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('verification_token')->nullable();
            $table->string('password');
            $table->string('phone')->unique();
            $table->string('role');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('password_reset_tokens', function ($table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('activity_logs', function ($table) {
            $table->string('id')->primary();
            $table->string('booking_id')->nullable();
            $table->string('user_id')->nullable();
            $table->string('actor_id')->nullable();
            $table->string('actor_role');
            $table->string('action');
            $table->text('description');
            $table->text('metadata')->nullable();
            $table->timestamps();
        });

        Schema::enableForeignKeyConstraints();
    }

    protected function tearDown(): void
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('activity_logs');
        Schema::enableForeignKeyConstraints();

        parent::tearDown();
    }

    public function test_complete_registration_and_email_verification_flow()
    {
        // 1. Register a new user
        $registerData = [
            'name' => 'Jane Smith',
            'email' => 'jane@example.com',
            'phone' => '08987654321',
            'password' => 'password123',
        ];

        $response = $this->postJson('/api/register', $registerData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'user' => ['id', 'email', 'name', 'phone']
            ]);

        $user = User::where('email', 'jane@example.com')->first();
        $this->assertNotNull($user);
        $this->assertNull($user->email_verified_at);
        $this->assertNotNull($user->verification_token);

        // 2. Try to login with unverified email
        $loginData = [
            'email' => 'jane@example.com',
            'password' => 'password123'
        ];

        $loginResponse = $this->postJson('/api/login', $loginData);
        $loginResponse->assertStatus(403)
            ->assertJsonFragment([
                'message' => 'Email belum diverifikasi. Silakan cek email Anda.'
            ]);

        // 3. Verify Email
        $verifyData = [
            'email' => 'jane@example.com',
            'token' => $user->verification_token
        ];

        $verifyResponse = $this->postJson('/api/verify-email', $verifyData);
        $verifyResponse->assertStatus(200)
            ->assertJsonFragment([
                'message' => 'Email Anda berhasil diverifikasi. Silakan login.'
            ]);

        $user->refresh();
        $this->assertNotNull($user->email_verified_at);
        $this->assertNull($user->verification_token);

        // 4. Login after verification
        $loginResponse2 = $this->postJson('/api/login', $loginData);
        $loginResponse2->assertStatus(200)
            ->assertJsonStructure([
                'user',
                'token'
            ]);
    }

    public function test_forgot_password_and_reset_password_flow()
    {
        // Setup user
        $user = User::create([
            'id' => 'u-alice-1',
            'name' => 'Alice Jones',
            'email' => 'alice@example.com',
            'phone' => '08777777777',
            'password' => bcrypt('oldpassword'),
            'role' => 'customer',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        // 1. Forgot password request
        $forgotResponse = $this->postJson('/api/forgot-password', [
            'email' => 'alice@example.com'
        ]);

        $forgotResponse->assertStatus(200)
            ->assertJsonFragment([
                'message' => 'Link reset password berhasil dikirim ke email Anda.'
            ]);

        // Check if token exists in DB
        $resetRecord = DB::table('password_reset_tokens')
            ->where('email', 'alice@example.com')
            ->first();
        $this->assertNotNull($resetRecord);

        // Get verification token we generated (simulated in test - we can generate a new reset token manually to test reset)
        // Since we hash the token using Hash::make, we can use a known token and insert it directly or mock.
        // Let's create a known token directly in the database to test the resetPassword endpoint reliably.
        $token = 'my-super-secret-token';
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => 'alice@example.com'],
            [
                'token' => Hash::make($token),
                'created_at' => now()
            ]
        );

        // 2. Reset password
        $resetResponse = $this->postJson('/api/reset-password', [
            'email' => 'alice@example.com',
            'token' => $token,
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123'
        ]);

        $resetResponse->assertStatus(200)
            ->assertJsonFragment([
                'message' => 'Password berhasil diubah. Silakan login.'
            ]);

        // 3. Login with new password
        $loginResponse = $this->postJson('/api/login', [
            'email' => 'alice@example.com',
            'password' => 'newpassword123'
        ]);
        $loginResponse->assertStatus(200);

        // 4. Try to login with old password
        $loginResponseOld = $this->postJson('/api/login', [
            'email' => 'alice@example.com',
            'password' => 'oldpassword'
        ]);
        $loginResponseOld->assertStatus(422);
    }
}
