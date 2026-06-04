<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Models\Booking;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('bookings', 'booking_code')) {
            Schema::table('bookings', function (Blueprint $table) {
                $table->string('booking_code', 50)->nullable()->unique()->after('id');
            });

            // Populate existing bookings
            $bookings = Booking::orderBy('created_at', 'asc')->get();
            foreach ($bookings as $booking) {
                $booking->booking_code = Booking::generateBookingCode($booking->created_at);
                $booking->save();
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('bookings', 'booking_code')) {
            Schema::table('bookings', function (Blueprint $table) {
                $table->dropColumn('booking_code');
            });
        }
    }
};
