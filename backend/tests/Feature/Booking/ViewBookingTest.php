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

test('users can see their own booking details', function (): void {
    $this->actingAs($this->user);
    $booking = Booking::factory()
        ->for($this->user)
        ->for($this->room)
        ->create();

    $this->get("/api/v1/bookings/{$booking->id}")
        ->assertOk()
        ->assertJson(fn (AssertableJson $json) => $json
            ->has('data', fn (AssertableJson $json) => $json
                ->where('id', $booking->id)
                ->has('room')
                ->etc()
            )
        );
});

test('users cannot see other users booking details', function (): void {
    $this->actingAs($this->user);
    $otherUserBooking = Booking::factory()
        ->for($this->otherUser)
        ->for($this->room)
        ->create();

    $this->get("/api/v1/bookings/{$otherUserBooking->id}")
        ->assertForbidden();
});

test('users cannot view any bookings directly', function (): void {
    $user = User::factory()->create();
    $this->actingAs($user);

    expect($user->cannot('viewAny', Booking::class))->toBeTrue();
});

test('booking controller handles non-existent room', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson('/api/v1/bookings', [
            'room_id' => 999999,
            'responsible_name' => 'Test User',
            'start_time' => now()->addDay()->setHour(10)->format('Y-m-d H:i:s'),
            'end_time' => now()->addDay()->setHour(11)->format('Y-m-d H:i:s'),
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['room_id']);
});
