<?php

declare(strict_types=1);

use App\Http\Controllers\BookingController;
use App\Http\Controllers\RoomController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::middleware('auth:api')->group(function () {
        Route::apiResource('rooms', RoomController::class)->only(['index', 'show']);
        Route::apiResource('bookings', BookingController::class)->except('delete');
    });
});

require __DIR__.'/auth.php';
