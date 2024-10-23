<?php

declare(strict_types=1);

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Room>
 */
final class RoomFactory extends Factory
{
    /** @var list<string> */
    private array $roomNames = [
        'Sala de Conferências A',
        'Sala da Diretoria',
        'Sala de Reunião 101',
        'Suíte Executiva',
        'Sala de Treinamento',
        'Sala de Oficina',
        'Sala de Projeto',
        'Sala de Estratégia',
        'Sala de Workshop',
        'Sala de Desenvolvimento',
        'Sala de Design',
    ];

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->randomElement($this->roomNames),
            'capacity' => fake()->numberBetween(4, 20),
        ];
    }

    public function large(): static
    {
        return $this->state(function (array $attributes): array {
            /** @var string|null */
            $roomName = $attributes['name'];

            return [
                'capacity' => fake()->numberBetween(15, 50),
                'name' => 'Grande '.$roomName,
            ];
        });
    }

    public function small(): static
    {
        return $this->state(function (array $attributes): array {
            /** @var string|null */
            $roomName = $attributes['name'];

            return [
                'capacity' => fake()->numberBetween(2, 6),
                'name' => 'Pequena '.$roomName,
            ];
        });
    }
}
