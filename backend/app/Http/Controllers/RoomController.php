<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Resources\RoomResource;
use App\Models\Room;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Http\JsonResponse;
use Knuckles\Scribe\Attributes\Authenticated;
use Knuckles\Scribe\Attributes\Group;
use Knuckles\Scribe\Attributes\Response;
use Knuckles\Scribe\Attributes\ResponseField;
use Knuckles\Scribe\Attributes\UrlParam;

#[Group('Salas')]
final class RoomController extends Controller
{
    /**
     * Listar todas as salas
     *
     * Retorna uma lista de todas as salas de reunião disponíveis.
     */
    #[Authenticated]
    #[Response([
        'data' => [
            [
                'id' => 1,
                'name' => 'Sala de Conferência A',
                'capacity' => 20,
                'bookings' => [
                    [
                        'id' => 1,
                        'responsible_name' => 'João Silva',
                        'start_time' => '2024-10-25 10:00:00',
                        'end_time' => '2024-10-25 11:00:00',
                        'status' => 'active',
                    ],
                    [
                        'start_time' => '2024-10-25 14:00:00',
                        'end_time' => '2024-10-25 16:00:00',
                        'status' => 'scheduled',
                    ],
                ],
            ],
        ],
    ], status: 200)]
    #[ResponseField('data', 'Array de objetos de sala')]
    #[ResponseField('data[].id', 'ID da sala')]
    #[ResponseField('data[].name', 'Nome da sala')]
    #[ResponseField('data[].capacity', 'Capacidade máxima da sala')]
    #[ResponseField('data[].bookings', 'Reservas da sala')]
    #[Response(['message' => 'Unauthorized'], status: 401, description: 'Token inválido ou expirado')]
    public function index(): JsonResponse
    {
        /** @phpstan-ignore-next-line */
        $rooms = Room::with(['bookings' => fn (HasMany $query) => $query->active()])->get();

        return RoomResource::collection($rooms)->response();
    }

    /**
     * Detalhes da sala
     *
     * Retorna informações detalhadas sobre uma sala específica, incluindo suas reservas ativas.
     */
    #[Authenticated]
    #[UrlParam('room', 'ID da sala', example: 1)]
    #[Response([
        'data' => [
            'id' => 1,
            'name' => 'Sala de Conferência A',
            'capacity' => 20,
            'bookings' => [
                [
                    'id' => 1,
                    'responsible_name' => 'João Silva',
                    'start_time' => '2024-10-25 10:00:00',
                    'end_time' => '2024-10-25 11:00:00',
                    'status' => 'active',
                ],
            ],
        ],
    ], status: 200)]
    #[Response(status: 404, description: 'Sala não encontrada')]
    #[Response(['message' => 'Unauthorized'], status: 401, description: 'Token inválido ou expirado')]
    public function show(Room $room): JsonResponse
    {
        return (new RoomResource($room->load(['bookings' => /** @param HasMany<Booking, Room> $query */ function (HasMany $query): void {
            /** @phpstan-ignore-next-line */
            $query->active()
                ->where('end_time', '>=', now())
                ->orderBy('start_time');
        }])))->response();
    }
}
