<?php

declare(strict_types=1);

namespace Tests\Feature\Room;

use App\Models\Booking;
use App\Models\Room;
use App\Models\User;
use Illuminate\Testing\Fluent\AssertableJson;

beforeEach(function (): void {
    $this->user = User::factory()->create();
    $this->rooms = Room::factory(3)->create();
});

test('users can see all rooms', function (): void {
    $this->actingAs($this->user);

    $this->get('/api/v1/rooms')
        ->assertOk()
        ->assertJson(fn (AssertableJson $json) => $json
            ->has('data', 3)
            ->has('data.0', fn (AssertableJson $json) => $json
                ->hasAll(['id', 'name', 'capacity'])
                ->has('bookings')
                ->whereType('id', 'integer')
                ->whereType('name', 'string')
                ->whereType('capacity', 'integer')
                ->whereType('bookings', 'array')
            )
        );
});

test('users can see room details with bookings', function (): void {
    $this->actingAs($this->user);
    $room = $this->rooms->first();

    Booking::factory(3)
        ->for($room)
        ->for($this->user)
        ->create();

    $this->get("/api/v1/rooms/{$room->id}")
        ->assertOk()
        ->assertJson(fn (AssertableJson $json) => $json
            ->has('data', fn (AssertableJson $json) => $json
                ->hasAll(['id', 'name', 'capacity'])
                ->has('bookings')
                ->etc()
            )
        );
});

test('other users can only see limited booking details', function (): void {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $room = Room::factory()->create();

    $booking = Booking::factory()
        ->future()
        ->active()
        ->for($otherUser)
        ->for($room)
        ->create();

    $this->actingAs($user)
        ->get("/api/v1/rooms/{$room->id}")
        ->assertOk()
        ->assertJson(fn (AssertableJson $json) => $json
            ->has('data.bookings.0', fn (AssertableJson $json) => $json
                ->hasAll(['start_time', 'end_time', 'status'])
            )
        );
});
