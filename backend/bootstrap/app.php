<?php

declare(strict_types=1);

use App\Exceptions\RoomUnavailableException;
use App\Exceptions\UpdateBookingCompletedException;
use App\Exceptions\UpdateBookingInProgressException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(fn (Request $request, Throwable $e): true => true);
        $exceptions->renderable(fn (RoomUnavailableException $e): JsonResponse => response()->json([
            'message' => $e->getMessage(),
        ], 422));

        $exceptions->renderable(fn (UpdateBookingInProgressException $e): JsonResponse => response()->json([
            'message' => $e->getMessage(),
        ], 422));

        $exceptions->renderable(fn (UpdateBookingCompletedException $e): JsonResponse => response()->json([
            'message' => $e->getMessage(),
        ], 422));

        $exceptions->renderable(fn (UpdateBookingInProgressException $e): JsonResponse => response()->json([
            'message' => $e->getMessage(),
        ], 422));
    })->create();
