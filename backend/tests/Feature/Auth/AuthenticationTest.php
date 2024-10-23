<?php

declare(strict_types=1);

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Testing\Fluent\AssertableJson;

beforeEach(function (): void {
    $this->validCredentials = [
        'email' => 'test@example.com',
        'password' => 'password123',
    ];

    $this->validRegistrationData = [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ];
});

test('users can register and receive jwt token', function (): void {
    $response = $this->postJson('/api/v1/register', $this->validRegistrationData);

    $response
        ->assertOk()
        ->assertJson(fn (AssertableJson $json) => $json
            ->has('access_token')
            ->where('token_type', 'bearer')
            ->has('expires_in')
        );

    $token = $response->json('access_token');
    $this->assertTrue(auth()->setToken($token)->check());

    $this->assertDatabaseHas('users', [
        'email' => $this->validRegistrationData['email'],
        'name' => $this->validRegistrationData['name'],
    ]);
});

test('users can login and receive jwt token', function (): void {
    User::factory()->create([
        'email' => $this->validCredentials['email'],
        'password' => Hash::make($this->validCredentials['password']),
    ]);

    $response = $this->postJson('/api/v1/login', $this->validCredentials);

    $response
        ->assertOk()
        ->assertJson(fn (AssertableJson $json) => $json
            ->has('access_token')
            ->where('token_type', 'bearer')
            ->has('expires_in')
        );

    $token = $response->json('access_token');
    $this->assertTrue(auth()->setToken($token)->check());
});

test('users cannot login with invalid credentials', function (array $invalidCredentials): void {
    User::factory()->create([
        'email' => $this->validCredentials['email'],
        'password' => Hash::make($this->validCredentials['password']),
    ]);

    $response = $this->postJson('/api/v1/login', $invalidCredentials);

    $response
        ->assertUnauthorized()
        ->assertJson([
            'status' => 401,
            'error' => 'Unauthorized',
            'message' => 'Email ou senha inválidos!',
        ]);
})->with([
    'wrong password' => [[
        'email' => 'test@example.com',
        'password' => 'wrong-password',
    ]],
    'wrong email' => [[
        'email' => 'wrong@example.com',
        'password' => 'password123',
    ]],
]);

test('users can access protected routes with valid jwt token', function (): void {
    $user = User::factory()->create();
    $token = auth()->login($user);

    $response = $this->withHeaders([
        'Authorization' => 'Bearer '.$token,
    ])->getJson('/api/v1/rooms');

    $response
        ->assertOk();
});

test('users cannot access protected routes with invalid jwt token', function (): void {
    $response = $this->withHeaders([
        'Authorization' => 'Bearer invalid-token',
    ])->getJson('/api/v1/rooms');

    $response->assertUnauthorized();
});

test('users can logout and invalidate token', function (): void {
    $user = User::factory()->create();
    $token = auth()->login($user);

    $response = $this->withHeaders([
        'Authorization' => 'Bearer '.$token,
    ])->postJson('/api/v1/logout');

    $response
        ->assertOk()
        ->assertJson(['message' => 'Logout realizado com sucesso']);

    $this->assertFalse(auth()->setToken($token)->check());
});

test('users can refresh their jwt token', function (): void {
    $user = User::factory()->create();
    $token = auth()->login($user);

    $response = $this->withHeaders([
        'Authorization' => 'Bearer '.$token,
    ])->postJson('/api/v1/refresh');

    $response
        ->assertOk()
        ->assertJson(fn (AssertableJson $json) => $json
            ->has('access_token')
            ->where('token_type', 'bearer')
            ->has('expires_in')
        );

    $newToken = $response->json('access_token');
    $this->assertNotEquals($token, $newToken);

    $this->assertTrue(auth()->setToken($newToken)->check());
});

test('blacklisted tokens cannot be used', function (): void {
    $user = User::factory()->create();
    $token = auth()->login($user);

    $this->withHeaders([
        'Authorization' => 'Bearer '.$token,
    ])->postJson('/api/v1/logout');

    $response = $this->withHeaders([
        'Authorization' => 'Bearer '.$token,
    ])->getJson('/api/v1/rooms');

    $response->assertUnauthorized();
});

test('tokens must have proper structure', function (): void {
    $user = User::factory()->create([
        'email' => $this->validCredentials['email'],
        'password' => Hash::make($this->validCredentials['password']),
    ]);

    $response = $this->postJson('/api/v1/login', $this->validCredentials);

    $token = $response->json('access_token');

    $this->assertCount(3, explode('.', $token));
});

test('users can get their own information', function (): void {
    $user = User::factory()->create();
    $token = auth()->login($user);

    $this->withHeaders([
        'Authorization' => 'Bearer '.$token,
    ])->get('/api/v1/me')
        ->assertOk()
        ->assertJson(fn (AssertableJson $json) => $json
            ->where('id', $user->id)
            ->where('email', $user->email)
            ->where('name', $user->name)
            ->etc()
        );
});

test('jwt custom claims are empty array', function (): void {
    $user = User::factory()->create();
    $claims = $user->getJWTCustomClaims();

    expect($claims)->toBe([]);
});
