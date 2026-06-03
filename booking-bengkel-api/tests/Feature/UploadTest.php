<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class UploadTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        
        // Create minimal table structure needed for the upload tests
        Schema::dropIfExists('users');
        Schema::dropIfExists('services');
        
        Schema::create('users', function ($table) {
            $table->string('id')->primary();
            $table->string('role');
            $table->softDeletes();
        });
        
        Schema::create('services', function ($table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->string('image_url', 500)->nullable();
            $table->softDeletes();
        });
        
        // Seed the exact user IDs expected by the tests
        DB::table('users')->insert([
            ['id' => '550e8400-e29b-41d4-a716-446655440001', 'role' => 'customer'],
            ['id' => '550e8400-e29b-41d4-a716-446655440003', 'role' => 'admin']
        ]);
    }

    protected function tearDown(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('services');
        
        parent::tearDown();
    }

    public function test_unauthorized_user_cannot_upload_image()
    {
        // Customer User Token: base64 of customer ID
        $token = base64_encode('550e8400-e29b-41d4-a716-446655440001');

        $response = $this->postJson('/api/upload/image', [], [
            'Authorization' => 'Bearer ' . $token
        ]);

        $response->assertStatus(403);
    }

    public function test_validation_fails_for_missing_parameters()
    {
        // Admin User Token
        $token = base64_encode('550e8400-e29b-41d4-a716-446655440003');

        $response = $this->postJson('/api/upload/image', [], [
            'Authorization' => 'Bearer ' . $token
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['file', 'folder']);
    }

    public function test_successful_image_upload_by_admin()
    {
        Storage::fake('public');

        $token = base64_encode('550e8400-e29b-41d4-a716-446655440003');
        
        // Use create() instead of image() to avoid dependency on GD library
        $file = UploadedFile::fake()->create('ganti-oli.jpg', 100, 'image/jpeg');

        $response = $this->postJson('/api/upload/image', [
            'file' => $file,
            'folder' => 'services'
        ], [
            'Authorization' => 'Bearer ' . $token
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                'url',
                'path',
                'filename',
                'size',
                'mime_type'
            ]
        ]);

        $path = $response->json('data.path');
        Storage::disk('public')->assertExists($path);
        $this->assertStringContainsString('uploads/services', $path);
    }
}
