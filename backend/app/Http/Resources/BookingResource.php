<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property int $id
 * @property string $responsible_name
 * @property string $start_time
 * @property string $end_time
 * @property string $status
 * @property int $user_id
 */
final class BookingResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        if ($this->user_id === $request->user()?->id) {
            return [
                'id' => $this->id,
                'responsible_name' => $this->responsible_name,
                'start_time' => $this->start_time,
                'end_time' => $this->end_time,
                'status' => $this->status,
                'room' => new RoomResource($this->whenLoaded('room')),
                'user' => new UserResource($this->whenLoaded('user')),
            ];
        }

        return [
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'status' => $this->status,
        ];
    }
}
