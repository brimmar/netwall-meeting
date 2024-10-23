<?php

declare(strict_types=1);

namespace Tests\Feature\Booking;

use App\Models\Booking;
use App\Models\Room;
use App\Models\User;
use Illuminate\Testing\Fluent\AssertableJson;

beforeEach(function (): void {
    $this->user = User::factory()->create();
    $this->otherUser = User::factory()->create();
    $this->room = Room::factory()->create();
});

test('users can update their own bookings', function (): void {
    $this->actingAs($this->user);
    $booking = Booking::factory()
        ->for($this->user)
        ->for($this->room)
        ->create(['status' => 'scheduled']);

    $updateData = [
        'responsible_name' => 'Updated Name',
        'start_time' => now()->addDays(2)->setHour(14)->format('Y-m-d H:i:s'),
        'end_time' => now()->addDays(2)->setHour(15)->format('Y-m-d H:i:s'),
    ];

    $this->put("/api/v1/bookings/{$booking->id}", $updateData)
        ->assertOk()
        ->assertJson(fn (AssertableJson $json) => $json
            ->has('data', fn (AssertableJson $json) => $json
                ->where('responsible_name', 'Updated Name')
                ->etc()
            )
        );
});

test('users cannot update other users bookings', function (): void {
    $this->actingAs($this->user);
    $otherUserBooking = Booking::factory()
        ->for($this->otherUser)
        ->for($this->room)
        ->create();

    $updateData = [
        'responsible_name' => 'Trying to update',
        'status' => 'cancelled',
    ];

    $this->put("/api/v1/bookings/{$otherUserBooking->id}", $updateData)
        ->assertForbidden();
});

test('users can cancel their own bookings', function (): void {
    $this->actingAs($this->user);
    $booking = Booking::factory()
        ->for($this->user)
        ->for($this->room)
        ->create(['status' => 'scheduled']);

    $this->put("/api/v1/bookings/{$booking->id}", ['status' => 'cancelled'])
        ->assertOk()
        ->assertJson(fn (AssertableJson $json) => $json
            ->has('data', fn (AssertableJson $json) => $json
                ->where('status', 'cancelled')
                ->etc()
            )
        );
});

test('users cannot update to overlapping times with other bookings', function (): void {
    $this->actingAs($this->user);

    Booking::factory()
        ->for($this->otherUser)
        ->for($this->room)
        ->create([
            'start_time' => now()->addDays(2)->setHour(14),
            'end_time' => now()->addDays(2)->setHour(16),
            'status' => 'scheduled',
        ]);

    $userBooking = Booking::factory()
        ->for($this->user)
        ->for($this->room)
        ->create([
            'start_time' => now()->addDays(2)->setHour(10),
            'end_time' => now()->addDays(2)->setHour(12),
            'status' => 'scheduled',
        ]);

    $updateData = [
        'start_time' => now()->addDays(2)->setHour(15)->format('Y-m-d H:i:s'),
        'end_time' => now()->addDays(2)->setHour(17)->format('Y-m-d H:i:s'),
    ];

    $this->put("/api/v1/bookings/{$userBooking->id}", $updateData)
        ->assertUnprocessable()
        ->assertJson(fn (AssertableJson $json) => $json
            ->has('message')
            ->etc()
        );
});

test('users can update to the same time slot', function (): void {
    $this->actingAs($this->user);

    $startTime = now()->addDays(2)->setHour(14);
    $endTime = now()->addDays(2)->setHour(16);

    $booking = Booking::factory()
        ->for($this->user)
        ->for($this->room)
        ->create([
            'start_time' => $startTime,
            'end_time' => $endTime,
            'status' => 'scheduled',
        ]);

    $updateData = [
        'responsible_name' => 'Updated Name',
        'start_time' => $startTime->format('Y-m-d H:i:s'),
        'end_time' => $endTime->format('Y-m-d H:i:s'),
    ];

    $this->put("/api/v1/bookings/{$booking->id}", $updateData)
        ->assertOk()
        ->assertJson(fn (AssertableJson $json) => $json
            ->has('data', fn (AssertableJson $json) => $json
                ->where('responsible_name', 'Updated Name')
                ->etc()
            )
        );
});

test('users can update fields without changing time', function (): void {
    $this->actingAs($this->user);

    $booking = Booking::factory()
        ->for($this->user)
        ->for($this->room)
        ->create([
            'status' => 'scheduled',
            'responsible_name' => 'Original Name',
        ]);

    $updateData = [
        'responsible_name' => 'Updated Name',
    ];

    $this->put("/api/v1/bookings/{$booking->id}", $updateData)
        ->assertOk()
        ->assertJson(fn (AssertableJson $json) => $json
            ->has('data', fn (AssertableJson $json) => $json
                ->where('responsible_name', 'Updated Name')
                ->etc()
            )
        );
});

test('users cannot reactivate a cancelled booking', function (): void {
    $this->actingAs($this->user);

    $cancelledBooking = Booking::factory()
        ->for($this->room)
        ->for($this->user)
        ->create([
            'start_time' => now()->addDay()->setHour(10),
            'end_time' => now()->addDay()->setHour(11),
            'status' => 'cancelled',
        ]);

    $updateData = [
        'status' => 'scheduled',
    ];

    $this->put("/api/v1/bookings/{$cancelledBooking->id}", $updateData)
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['status']);
});
