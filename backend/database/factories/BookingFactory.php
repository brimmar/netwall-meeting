<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\BookingStatus;
use App\Models\Room;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Booking>
 */
final class BookingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startTime = fake()->dateTimeBetween('now', '+2 weeks');
        $hour = fake()->numberBetween(11, 18);
        $startTime->setTime($hour, 0, 0);

        $endTime = (new Carbon($startTime))
            ->addHours(fake()->numberBetween(1, 3));

        return [
            'room_id' => Room::factory(),
            'user_id' => User::factory(),
            'responsible_name' => fn (array $attributes) => User::find($attributes['user_id'])->name ?? fake()->name(),
            'start_time' => $startTime,
            'end_time' => $endTime,
            'status' => fake()->randomElement(['scheduled', 'cancelled']),
            'created_at' => fake()->dateTimeBetween('-1 year', 'now'),
            'updated_at' => fn (array $attributes) => $attributes['created_at'],
        ];
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => BookingStatus::SCHEDULED,
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => BookingStatus::CANCELLED,
        ]);
    }

    public function completed(): static
    {
        return $this->state(function (): array {
            $startTime = fake()->dateTimeBetween('-2 weeks', '-1 day');
            $hour = fake()->numberBetween(9, 16);
            $startTime->setTime($hour, 0, 0);

            return [
                'start_time' => $startTime,
                'end_time' => (new Carbon($startTime))->addHours(fake()->numberBetween(1, 3)),
                'status' => BookingStatus::COMPLETED,
            ];
        });
    }

    public function inProgress(): static
    {
        return $this->state(function (): array {
            $startTime = now()->subHour();

            return [
                'start_time' => $startTime,
                'end_time' => $startTime->copy()->addHours(2),
                'status' => BookingStatus::IN_PROGRESS,
            ];
        });
    }

    public function future(): static
    {
        return $this->state(function (array $attributes): array {
            $startTime = fake()->dateTimeBetween('tomorrow', '+2 weeks');
            $hour = fake()->numberBetween(9, 16);
            $startTime->setTime($hour, 0, 0);

            return [
                'start_time' => $startTime,
                'end_time' => (new Carbon($startTime))->addHours(fake()->numberBetween(1, 3)),
            ];
        });
    }

    public function past(): static
    {
        return $this->state(function (): array {
            $startTime = fake()->dateTimeBetween('-2 weeks', 'yesterday');
            $hour = fake()->numberBetween(9, 16);
            $startTime->setTime($hour, 0, 0);

            return [
                'start_time' => $startTime,
                'end_time' => (new Carbon($startTime))
                    ->addHours(fake()->numberBetween(1, 3)),
            ];
        });
    }
}
