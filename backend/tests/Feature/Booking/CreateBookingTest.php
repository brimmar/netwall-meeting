<?php

declare(strict_types=1);

namespace Tests\Feature\Booking;

use App\Models\Booking;
use App\Models\Room;
use App\Models\User;
use App\Policies\BookingPolicy;
use Illuminate\Testing\Fluent\AssertableJson;
use Mockery;

beforeEach(function (): void {
    $this->user = User::factory()->create();
    $this->room = Room::factory()->create();
});

test('users can create bookings', function (): void {
    $this->actingAs($this->user);

    $bookingData = [
        'room_id' => $this->room->id,
        'responsible_name' => $this->user->name,
        'start_time' => now()->addDay()->setHour(10)->format('Y-m-d H:i:s'),
        'end_time' => now()->addDay()->setHour(11)->format('Y-m-d H:i:s'),
    ];

    $this->post('/api/v1/bookings', $bookingData)
        ->assertCreated()
        ->assertJson(fn (AssertableJson $json) => $json
            ->has('data', fn (AssertableJson $json) => $json
                ->where('responsible_name', $this->user->name)
                ->where('status', 'scheduled')
                ->etc()
            )
        );
});

test('users cannot create overlapping bookings', function (): void {
    $this->actingAs($this->user);

    $startTime = now()->addDay()->setHour(10);
    $endTime = now()->addDay()->setHour(12);

    Booking::factory()->create([
        'room_id' => $this->room->id,
        'start_time' => $startTime,
        'end_time' => $endTime,
        'status' => 'scheduled',
    ]);

    $overlappingData = [
        'room_id' => $this->room->id,
        'responsible_name' => $this->user->name,
        'start_time' => $startTime->copy()->addHour()->format('Y-m-d H:i:s'),
        'end_time' => $endTime->copy()->addHour()->format('Y-m-d H:i:s'),
    ];

    $this->post('/api/v1/bookings', $overlappingData)
        ->assertUnprocessable();
});

test('users cannot create bookings in the past', function (): void {
    $this->actingAs($this->user);

    $pastBookingData = [
        'room_id' => $this->room->id,
        'responsible_name' => $this->user->name,
        'start_time' => now()->subDay()->format('Y-m-d H:i:s'),
        'end_time' => now()->subDay()->addHour()->format('Y-m-d H:i:s'),
    ];

    $this->post('/api/v1/bookings', $pastBookingData)
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['start_time']);
});

test('users can create bookings in the same time slot of a cancelled booking', function (): void {
    $this->actingAs($this->user);

    $cancelledBooking = Booking::factory()
        ->for($this->room)
        ->for($this->user)
        ->create([
            'start_time' => now()->addDay()->setHour(10),
            'end_time' => now()->addDay()->setHour(11),
            'status' => 'cancelled',
        ]);

    $newBookingData = [
        'room_id' => $this->room->id,
        'responsible_name' => $this->user->name,
        'start_time' => $cancelledBooking->start_time->format('Y-m-d H:i:s'),
        'end_time' => $cancelledBooking->end_time->format('Y-m-d H:i:s'),
    ];

    $this->post('/api/v1/bookings', $newBookingData)
        ->assertCreated()
        ->assertJson(fn (AssertableJson $json) => $json
            ->has('data', fn (AssertableJson $json) => $json
                ->where('status', 'scheduled')
                ->etc()
            )
        );
});

test('users cannot create bookings without proper authorization', function (): void {
    $user = User::factory()->create();
    $room = Room::factory()->create();

    $policy = Mockery::mock(new BookingPolicy());
    $policy->shouldReceive('create')->andReturn(false);

    $this->instance(BookingPolicy::class, $policy);

    $this->actingAs($user)
        ->postJson('/api/v1/bookings', [
            'room_id' => $room->id,
            'responsible_name' => 'Test User',
            'start_time' => now()->addDay()->setHour(10)->format('Y-m-d H:i:s'),
            'end_time' => now()->addDay()->setHour(11)->format('Y-m-d H:i:s'),
        ])
        ->assertForbidden();
});
