<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

final class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::factory()->create([
            'email' => 'test@example.com',
            'name' => 'Test User',
        ]);

        User::factory(9)->create();
    }
}
