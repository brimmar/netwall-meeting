<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Room;
use App\Models\User;
use Illuminate\Database\Seeder;

final class BookingSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        $rooms = Room::all();

        Booking::factory(20)
            ->active()
            ->future()
            ->recycle($users)
            ->recycle($rooms)
            ->create();

        Booking::factory(5)
            ->past()
            ->completed()
            ->recycle($users)
            ->recycle($rooms)
            ->create();

        Booking::factory(5)
            ->cancelled()
            ->future()
            ->recycle($users)
            ->recycle($rooms)
            ->create();

        Booking::factory(5)
            ->cancelled()
            ->past()
            ->recycle($users)
            ->recycle($rooms)
            ->create();

        $testUser = User::query()->where('email', 'test@example.com')->first();
        if ($testUser) {
            Booking::factory(10)
                ->active()
                ->future()
                ->for($testUser)
                ->recycle($rooms)
                ->create();
        }
    }
}
