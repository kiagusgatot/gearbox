<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->char('booking_id', 36)->nullable();
            $table->char('user_id', 36)->nullable();
            $table->char('actor_id', 36)->nullable();
            $table->enum('actor_role', ['admin', 'mechanic', 'customer', 'system']);
            $table->string('action', 100);
            $table->text('description');
            $table->json('metadata')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index('booking_id', 'idx_logs_booking');
            $table->index('actor_id', 'idx_logs_actor');
            $table->index('created_at', 'idx_logs_created');

            $table->foreign('booking_id')->references('id')->on('bookings')->onDelete('set null');
            $table->foreign('actor_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
