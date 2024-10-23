<?php

declare(strict_types=1);

return [
    'theme' => 'scalar',

    'title' => 'Documentação da API de Salas de Reunião',

    'description' => 'Documentação da API para o Sistema de Reserva de Salas de Reunião',

    'base_url' => env('APP_URL'),

    'routes' => [
        [
            'match' => [
                'prefixes' => ['api/*'],
                'domains' => ['*'],
            ],
            'include' => ['*'],
            'exclude' => [
                'sanctum/csrf-cookie',
                'up',
                'storage/{path}',
                'api/v1/forgot-password',
                'api/v1/reset-password',
            ],
            'apply' => [
                'headers' => [
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                ],
                'response_calls' => [
                    'methods' => ['GET'],
                    'config' => [
                        'app.env' => 'documentation',
                    ],
                    'cookies' => [],
                    'query' => [],
                    'body' => [],
                ],
            ],
        ],
    ],

    'auth' => [
        'enabled' => true,
        'default' => false,
        'in' => 'bearer',
        'name' => 'Authorization',
        'use_value' => 'Bearer {token}',
        'placeholder' => '{token}',
        'extra_info' => '
Você pode obter um token JWT através de:

1. Registrando uma nova conta usando POST /api/register
2. Fazendo login usando POST /api/login
3. Use o token recebido no cabeçalho Authorization como "Bearer {token}"
4. Os tokens expiram após 60 minutos
5. Use POST /api/refresh para obter um novo token antes da expiração
        ',
    ],

    'examples' => [
        'faker_seed' => 12345,
        'models_source' => ['factoryCreate', 'factoryMake', 'databaseFirst'],
    ],

    'type' => 'external_laravel',
    'static' => [
        'output_path' => 'public/docs',
    ],

    'laravel' => [
        'add_routes' => true,
        'docs_url' => '/docs',
        'middleware' => [],
        'assets_directory' => null,
    ],

    'try_it_out' => [
        'enabled' => true,
        'base_url' => null,
        'use_csrf' => false,
        'csrf_url' => '/sanctum/csrf-cookie',
    ],

    'openapi' => [
        'enabled' => true,
    ],

    'groups' => [
        'default' => 'Endpoints',
        'order' => [
            'Autenticação',
            'Salas',
            'Reservas',
        ],
    ],
    'external' => ['html_attributes' => []],
    'intro_text' => <<<'INTRO'
    INTRO,
    'postman' => ['enabled' => true, 'overrides' => []],
    'logo' => false,
    'last_updated' => 'Last updated: {date:F j, Y}',
    'fractal' => [
        'serializer' => null,
    ],
    'routeMatcher' => Knuckles\Scribe\Matching\RouteMatcher::class,
];
