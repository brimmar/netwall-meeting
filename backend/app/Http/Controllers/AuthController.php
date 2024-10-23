<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Knuckles\Scribe\Attributes\Authenticated;
use Knuckles\Scribe\Attributes\BodyParam;
use Knuckles\Scribe\Attributes\Group;
use Knuckles\Scribe\Attributes\Response;

#[Group('Autenticação')]
final class AuthController extends Controller
{
    /**
     * Registrar novo usuário
     *
     * Cria uma nova conta de usuário e retorna um token JWT.
     */
    #[BodyParam('name', 'string', 'Nome completo do usuário', required: true, example: 'João Silva')]
    #[BodyParam('email', 'string', 'Endereço de e-mail', required: true, example: 'joao@exemplo.com')]
    #[BodyParam('password', 'string', 'Senha (mínimo 8 caracteres)', required: true, example: 'senha123')]
    #[BodyParam('password_confirmation', 'string', 'Confirmação da senha', required: true, example: 'senha123')]
    #[Response([
        'access_token' => 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
        'refresh_token' => 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
        'token_type' => 'bearer',
        'expires_in' => 3600,
    ], status: 200, description: 'Usuário registrado com sucesso')]
    #[Response(['message' => 'O e-mail já está sendo utilizado.'], status: 422)]
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make((string) $request->string('password')),
        ]);

        event(new Registered($user));

        $token = auth()->login($user);

        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth()->factory()->getTTL() * 60,
        ], 200);
    }

    /**
     * Login do usuário
     *
     * Autentica um usuário e retorna um token JWT.
     */
    #[BodyParam('email', 'string', 'Endereço de e-mail', required: true, example: 'joao@exemplo.com')]
    #[BodyParam('password', 'string', 'Senha', required: true, example: 'senha123')]
    #[Response([
        'access_token' => 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
        'token_type' => 'bearer',
        'expires_in' => 3600,
    ], status: 200, description: 'Login realizado com sucesso')]
    #[Response([
        'status' => 401,
        'error' => 'Unauthorized',
        'message' => 'Email ou senha inválidos!',
    ], status: 401, description: 'Credenciais inválidas')]
    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->only(['email', 'password']);

        if (! $token = auth()->attempt($credentials)) {
            return response()->json([
                'status' => 401,
                'error' => 'Unauthorized',
                'message' => 'Email ou senha inválidos!',
            ], 401);
        }

        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth()->factory()->getTTL() * 60,
        ], 200);
    }

    /**
     * Logout do usuário
     *
     * Invalida o token JWT atual.
     */
    #[Authenticated]
    #[Response(['message' => 'Logout realizado com sucesso'], status: 200)]
    #[Response(['message' => 'Unauthorized'], status: 401, description: 'Token inválido ou expirado')]
    public function logout(Request $request): JsonResponse
    {
        auth()->logout(true);

        return response()->json([
            'message' => 'Logout realizado com sucesso',
        ], 200);
    }

    /**
     * Atualizar token
     *
     * Obtém um novo token JWT usando o token atual.
     */
    #[Authenticated]
    #[Response([
        'access_token' => 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
        'token_type' => 'bearer',
        'expires_in' => 3600,
    ], status: 200)]
    #[Response(['message' => 'Unauthorized'], status: 401, description: 'Token inválido ou expirado')]
    public function refresh(Request $request): JsonResponse
    {
        return response()->json([
            'access_token' => auth()->refresh(true, true),
            'token_type' => 'bearer',
            'expires_in' => auth()->factory()->getTTL() * 60,
        ], 200);
    }

    /**
     * Obtém as informações do usuário
     *
     * Obtém as informações do usuário que está atualmente autenticado.
     */
    #[Authenticated]
    #[Response([
        'id' => 5,
        'email' => 'test@example.com',
        'name' => 'Test User',
    ], status: 200)]
    #[Response(['message' => 'Unauthorized'], status: 401, description: 'Token inválido ou expirado')]
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'id' => auth()->user()?->id,
            'email' => auth()->user()?->email,
            'name' => auth()->user()?->name,
        ]);
    }
}
