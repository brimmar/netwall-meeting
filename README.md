# Sistema de Reserva de Salas de Reunião

Um sistema full-stack para gerenciamento de reservas de salas de reunião construído com Laravel 11, React 19 e PostgreSQL.

## Índice
- [Funcionalidades](#funcionalidades)
- [Requisitos](#requisitos)
- [Instalação](#instalação)
  - [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
  - [Configuração do Backend](#configuração-do-backend)
  - [Configuração do Frontend](#configuração-do-frontend)
- [Documentação da API](#documentação-da-api)
- [Desenvolvimento](#desenvolvimento)

## Funcionalidades

- Visualização de todas as salas e suas disponibilidades
- Realização de reservas com horário de início e fim
- Visualização de reservas
- Cancelamento de reservas existentes
- API RESTful com Laravel
- Frontend responsivo em React
- Banco de dados PostgreSQL

## Requisitos

### Backend
- PHP 8.3 ou superior
- Composer 2.x
- PostgreSQL 16+
- Extensões PHP:
  - pdo_pgsql
  - json
  - mbstring
  - xml
  - tokenizer

### Frontend
- Node.js 20 LTS ou superior
- npm
- Navegador web moderno

## Instalação

### Configuração do Banco de Dados

1. Conecte-se à sua instância PostgreSQL e execute os seguintes comandos:

```sql
CREATE USER netwall WITH PASSWORD 'password';

CREATE DATABASE netwall 
WITH 
    OWNER = netwall 
    ENCODING = 'UTF8' 
    LC_COLLATE = 'en_US.utf8' 
    LC_CTYPE = 'en_US.utf8' 
    TEMPLATE template0;

GRANT ALL PRIVILEGES ON DATABASE netwall TO netwall;
```

### Configuração do Backend

1. Clone o repositório:
```bash
git clone https://github.com/brimmar/netwall-meeting.git
cd netwall-meeting
```

2. Instale as dependências PHP:
```bash
cd backend
composer install
```

3. Configure o ambiente:
```bash
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
```

4. Atualize o `.env` com suas credenciais do banco de dados:
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=netwall
DB_USERNAME=netwall
DB_PASSWORD=password
```

5. Execute as migrations e seeders:
```bash
php artisan migrate --seed
```

6. Gere a documentação da API:
```bash
php artisan scribe:generate
```

7. Inicie o servidor de desenvolvimento:
```bash
php artisan serve
```

O backend estará disponível em `http://127.0.0.1:8000`

### Configuração do Frontend

1. Navegue até o diretório do frontend:
```bash
cd frontend
```

2. Instale as dependências:
```bash
pnpm install
# ou
npm install
```

3. Configure o ambiente:
```bash
cp .env.example .env
```

4. Atualize o `.env` com a URL do seu backend se diferente do padrão:
```env
VITE_BACKEND_URL=http://127.0.0.1:8000
```

5. Inicie o servidor de desenvolvimento:
```bash
pnpm dev
# ou
npm run dev
```

O frontend estará disponível em `http://localhost:5173`

## Documentação da API

A documentação completa da API está disponível na rota `/docs` após executar o comando `php artisan scribe:generate`.

## Desenvolvimento

### Executando Testes

Backend:
```bash
cd backend
composer test
```

Observação: O frontend atualmente não possui testes implementados.

Para informações mais detalhadas sobre os endpoints da API e seus parâmetros, consulte a documentação da API em `/docs` após gerar a documentação com `php artisan scribe:generate`.
