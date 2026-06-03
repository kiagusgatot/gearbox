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
        Schema::table('vehicles', function (Blueprint $table) {
            $table->enum('transmission', ['manual', 'automatic'])->default('manual')->after('color');
            $table->enum('fuel_type', ['bensin', 'diesel', 'electric', 'hybrid'])->default('bensin')->after('transmission');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->dropColumn(['transmission', 'fuel_type']);
        });
    }
};
