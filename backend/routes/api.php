<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\InspectionController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\UploadController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::middleware('api')->group(function () {
    // Auth Routes
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    Route::post('/verify-email', [AuthController::class, 'verifyEmail']);

    // Status Checks
    Route::get('/', function () {
        return response()->json(['status' => 'OK', 'framework' => 'Laravel 13']);
    });
    Route::get('/status', function () {
        return response()->json(['status' => 'OK']);
    });

    // Users
    Route::apiResource('users', UserController::class);
    
    // Vehicles
    Route::apiResource('vehicles', VehicleController::class);
    
    // Services Sub-routes
    Route::get('/services/{id}/availability', [ServiceController::class, 'availability']);
    Route::get('/services/{id}/reviews', [ServiceController::class, 'reviews']);
    
    // Services
    Route::apiResource('services', ServiceController::class);
    
    // Custom Booking Sub-routes
    Route::get('/bookings/{id}/invoice', [BookingController::class, 'invoice']);
    Route::get('/bookings/{id}/documentation', [BookingController::class, 'documentation']);
    Route::get('/bookings/{id}/details', [BookingController::class, 'details']);
    Route::put('/bookings/{id}/send-estimation', [BookingController::class, 'sendEstimation']);
    Route::put('/bookings/{id}/start-service', [BookingController::class, 'startService']);
    Route::get('/bookings/{id}/estimation', [BookingController::class, 'getEstimation']);
    Route::put('/bookings/{id}/approve-estimation', [BookingController::class, 'approveEstimation']);
    Route::put('/bookings/{id}/confirm-start', [BookingController::class, 'confirmStart']);
    Route::get('/bookings/{id}/checklist', [BookingController::class, 'getChecklist']);
    Route::put('/bookings/{id}/checklist/{itemId}', [BookingController::class, 'toggleChecklistItem']);
    Route::put('/bookings/{id}/complete-service', [BookingController::class, 'completeService']);

    // Bookings
    Route::apiResource('bookings', BookingController::class);

    // Activity Logs
    Route::get('/activity-logs', [ActivityLogController::class, 'index']);
    Route::get('/bookings/{id}/logs', [ActivityLogController::class, 'bookingLogs']);
    
    // Image Upload
    Route::post('/upload/image', [UploadController::class, 'uploadImage']);
    
    // Payments
    Route::apiResource('payments', PaymentController::class);
    
    // Inspections
    Route::apiResource('inspections', InspectionController::class);
    
    // Reviews
    Route::apiResource('reviews', ReviewController::class);
});
