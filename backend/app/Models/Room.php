<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

final class Room extends Model
{
    /** @use HasFactory<\Database\Factories\RoomFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $guarded = [];

    /**
     * Get the bookings for the room
     *
     * @return HasMany<Booking, Room>
     */
    public function bookings(): HasMany
    {
        /** @var HasMany<Booking, self> */
        return $this->hasMany(Booking::class);
    }

    public function isAvailable(Carbon $startTime, Carbon $endTime, ?int $excludeBookingId = null): bool
    {
        /** @var Builder<Booking> $query */
        $query = $this->bookings()
            ->active();

        if ($excludeBookingId !== null) {
            $query = $query->where('id', '!=', $excludeBookingId);
        }

        return ! $query
            ->where(
                fn (Builder $query): Builder => $query->where(fn (Builder $query): Builder => $query->whereBetween('start_time', [$startTime, $endTime->subSecond()])
                    ->orWhereBetween('end_time', [$startTime->addSecond(), $endTime]))
                    ->orWhere(fn (Builder $query): Builder => $query
                        ->where('start_time', '<=', $startTime)
                        ->where('end_time', '>=', $endTime))
            )
            ->exists();
    }
}
