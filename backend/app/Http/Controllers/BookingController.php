<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\BookingStatus;
use App\Exceptions\RoomUnavailableException;
use App\Exceptions\UpdateBookingCancelledException;
use App\Exceptions\UpdateBookingCompletedException;
use App\Exceptions\UpdateBookingInProgressException;
use App\Http\Requests\CreateBookingRequest;
use App\Http\Requests\UpdateBookingRequest;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use App\Models\Room;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Knuckles\Scribe\Attributes\Authenticated;
use Knuckles\Scribe\Attributes\BodyParam;
use Knuckles\Scribe\Attributes\Group;
use Knuckles\Scribe\Attributes\Response;
use Knuckles\Scribe\Attributes\ResponseField;
use Knuckles\Scribe\Attributes\UrlParam;

#[Group('Reservas')]
final class BookingController extends Controller
{
    /**
     * Listar reservas do usuário
     *
     * Retorna uma lista de todas as reservas feitas pelo usuário autenticado.
     */
    #[Authenticated]
    #[Response([
        'data' => [
            [
                'id' => 1,
                'responsible_name' => 'João Silva',
                'start_time' => '2024-10-25 10:00:00',
                'end_time' => '2024-10-25 11:00:00',
                'status' => 'scheduled',
                'room' => [
                    'id' => 1,
                    'name' => 'Sala de Conferência A',
                    'capacity' => 20,
                ],
            ],
        ],
    ], status: 200)]
    #[ResponseField('data', 'Array de objetos de reserva')]
    #[ResponseField('data[].id', 'ID da reserva')]
    #[ResponseField('data[].responsible_name', 'Nome do responsável')]
    #[ResponseField('data[].start_time', 'Horário de início (Y-m-d H:i:s)')]
    #[ResponseField('data[].end_time', 'Horário de término (Y-m-d H:i:s)')]
    #[ResponseField('data[].status', 'Status da reserva (scheduled/completed/in_progress/cancelled)')]
    #[ResponseField('data[].room', 'Detalhes da sala reservada')]
    #[Response(['message' => 'Unauthorized'], status: 401, description: 'Token inválido ou expirado')]
    public function index(): JsonResponse
    {
        $bookings = auth()->user()?->bookings()->with('room')->orderBy('start_time')->get();

        return BookingResource::collection($bookings)->response();
    }

    /**
     * Criar reserva
     *
     * Cria uma nova reserva de sala. A sala deve estar disponível no horário solicitado
     * e o horário de início deve ser posterior ao momento atual.
     */
    #[Authenticated]
    #[BodyParam('room_id', 'integer', 'ID da sala a ser reservada', required: true, example: 1)]
    #[BodyParam('responsible_name', 'string', 'Nome do responsável pela reserva', required: true, example: 'João Silva')]
    #[BodyParam('start_time', 'string', 'Horário de início (Y-m-d H:i:s)', required: true, example: '2024-10-25 10:00:00')]
    #[BodyParam('end_time', 'string', 'Horário de término (Y-m-d H:i:s)', required: true, example: '2024-10-25 11:00:00')]
    #[Response([
        'data' => [
            'id' => 1,
            'responsible_name' => 'João Silva',
            'start_time' => '2024-10-25 10:00:00',
            'end_time' => '2024-10-25 11:00:00',
            'status' => 'scheduled',
            'room' => [
                'id' => 1,
                'name' => 'Sala de Conferência A',
                'capacity' => 20,
            ],
        ],
    ], status: 201, description: 'Reserva criada com sucesso')]
    #[Response(['message' => 'Sala indisponível neste horário!'], status: 422)]
    #[Response(['message' => 'O horário de início deve ser posterior ao momento atual.'], status: 422)]
    #[Response(['message' => 'Unauthorized'], status: 401, description: 'Token inválido ou expirado')]
    public function store(CreateBookingRequest $request): JsonResponse
    {
        if ($request->user()?->cannot('create', Booking::class)) {
            abort(403);
        }

        /** @var Room */
        $room = Room::query()->findOrFail($request->room_id);

        /** @var Carbon */
        $startTime = Carbon::parse($request->start_time);

        /** @var Carbon */
        $endTime = Carbon::parse($request->end_time);

        throw_if(! $room->isAvailable($startTime, $endTime), new RoomUnavailableException('Sala indisponível neste horário!'));

        $booking = new Booking($request->validated());

        $booking->room()->associate($room);
        $booking->user()->associate($request->user());

        $booking->save();

        return (new BookingResource($booking->refresh()))->response();
    }

    /**
     * Detalhes da reserva
     *
     * Retorna informações detalhadas sobre uma reserva específica.
     * O usuário só pode visualizar suas próprias reservas.
     */
    #[Authenticated]
    #[UrlParam('booking', 'ID da reserva', example: 1)]
    #[Response([
        'data' => [
            'id' => 1,
            'responsible_name' => 'João Silva',
            'start_time' => '2024-10-25 10:00:00',
            'end_time' => '2024-10-25 11:00:00',
            'status' => 'scheduled',
            'room' => [
                'id' => 1,
                'name' => 'Sala de Conferência A',
                'capacity' => 20,
            ],
            'user' => [
                'name' => 'João Silva',
                'email' => 'joao@exemplo.com',
            ],
        ],
    ], status: 200)]
    #[Response(status: 403, description: 'Proibido - Não é sua reserva')]
    #[Response(status: 404, description: 'Reserva não encontrada')]
    #[Response(['message' => 'Unauthorized'], status: 401, description: 'Token inválido ou expirado')]
    public function show(Request $request, Booking $booking): JsonResponse
    {
        if ($request->user()?->cannot('view', $booking)) {
            abort(403);
        }

        return (new BookingResource($booking->load('room', 'user')))->response();
    }

    /**
     * Atualizar reserva
     *
     * Atualiza uma reserva existente. Pode ser usado para modificar detalhes ou cancelar a reserva.
     * O usuário só pode atualizar suas próprias reservas.
     */
    #[Authenticated]
    #[UrlParam('booking', 'ID da reserva', example: 1)]
    #[BodyParam('responsible_name', 'string', 'Nome do responsável pela reserva', required: false, example: 'Maria Silva')]
    #[BodyParam('start_time', 'string', 'Novo horário de início (Y-m-d H:i:s)', required: false, example: '2024-10-25 14:00:00')]
    #[BodyParam('end_time', 'string', 'Novo horário de término (Y-m-d H:i:s)', required: false, example: '2024-10-25 15:00:00')]
    #[BodyParam('status', 'string', 'Define como "cancelled" para cancelar a reserva', required: false, example: 'cancelled')]
    #[Response([
        'data' => [
            'id' => 1,
            'responsible_name' => 'Maria Silva',
            'start_time' => '2024-10-25 14:00:00',
            'end_time' => '2024-10-25 15:00:00',
            'status' => 'scheduled',
            'room' => [
                'id' => 1,
                'name' => 'Sala de Conferência A',
                'capacity' => 20,
            ],
        ],
    ], status: 200, description: 'Reserva atualizada com sucesso')]
    #[Response(['message' => 'Sala indisponível neste horário!'], status: 422)]
    #[Response(['message' => 'O horário de início deve ser posterior ao momento atual.'], status: 422)]
    #[Response(['message' => 'Não é possível alterar uma reserva passada!'], status: 422)]
    #[Response(['message' => 'Não é possível alterar uma reserva em andamento!'], status: 422)]
    #[Response(['message' => 'Não é possível alterar uma reserva cancelada!'], status: 422)]
    #[Response(status: 403, description: 'Proibido - Não é sua reserva')]
    #[Response(status: 404, description: 'Reserva não encontrada')]
    #[Response(['message' => 'Unauthorized'], status: 401, description: 'Token inválido ou expirado')]
    public function update(UpdateBookingRequest $request, Booking $booking): JsonResponse
    {
        if ($request->user()?->cannot('update', $booking)) {
            abort(403);
        }

        if ($booking->status === BookingStatus::COMPLETED) {
            throw new UpdateBookingCompletedException('Não é possível alterar uma reserva passada!', 422);
        }

        if ($request->status !== BookingStatus::CANCELLED->value && $booking->status === BookingStatus::IN_PROGRESS) {
            throw new UpdateBookingInProgressException('Não é possível alterar uma reserva em andamento!', 422);
        }

        if ($booking->status === BookingStatus::CANCELLED) {
            throw new UpdateBookingCancelledException('Não é possível alterar uma reserva cancelada!', 422);
        }

        /** @var Carbon */
        $startTime = Carbon::parse($request->start_time);

        /** @var Carbon */
        $endTime = Carbon::parse($request->end_time);

        if ($request->has(['start_time', 'end_time']) && $request->status !== BookingStatus::CANCELLED->value && ! $booking->room?->isAvailable(
            $startTime,
            $endTime,
            $booking->id,
        )) {
            throw new RoomUnavailableException('Sala indisponível neste horário!', 422);
        }

        $booking->update($request->validated());

        return (new BookingResource($booking->refresh()))->response();
    }
}
