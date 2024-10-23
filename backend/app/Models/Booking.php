<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\BookingStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class Booking extends Model
{
    /** @use HasFactory<\Database\Factories\BookingFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $guarded = [];

    /** @var array<string, string> */
    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'status' => BookingStatus::class,
    ];

    /**
     * Gets the room of the booking
     *
     * @return BelongsTo<Room, Booking>
     */
    public function room(): BelongsTo
    {
        /** @var BelongsTo<Room, self> */
        return $this->belongsTo(Room::class);
    }

    /**
     * Gets the user who made the booking
     *
     * @return BelongsTo<User, Booking>
     */
    public function user(): BelongsTo
    {
        /** @var BelongsTo<User, self> */
        return $this->belongsTo(User::class);
    }

    /**
     * @param  Builder<Booking>  $query
     * @return Builder<Booking>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->whereIn('status', [
            BookingStatus::SCHEDULED,
            BookingStatus::IN_PROGRESS,
        ]);
    }
}
