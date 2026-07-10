# The Guetto Barber — Sistema de Gestão

Plataforma web de gestão para barbearia (agendamento de clientes, agenda de
barbeiros e painel administrativo). Visual premium escuro/dourado inspirado na
identidade da **The Guetto** ([@theguettoofc](https://www.instagram.com/theguettoofc/)).

> Status: **Fundação (Etapas 1–3)** — scaffold, banco de dados e autenticação.
> Roadmap completo (etapas 4–15) no arquivo de plano do projeto.

## Stack
- **Backend**: Node.js + Express + Prisma + PostgreSQL (estilo funcional, camadas
  Controller → Service → Repository). Segurança com Helmet, CORS, rate limit, JWT, bcrypt.
- **Frontend**: Next.js (App Router) + TypeScript + Tailwind + shadcn/ui + TanStack Query
  + React Hook Form + Zod + Axios + Framer Motion.
- **Produção**: VPS Linux Ubuntu com PM2 + Nginx + SSL (Let's Encrypt).

## Estrutura
```
The Guetto/
├── backend/    API REST (Express + Prisma)
└── frontend/   App web (Next.js)
```

## Pré-requisitos
- Node.js 20+ (testado com v22)
- PostgreSQL 16 instalado localmente (Windows: instalador oficial em postgresql.org)

## Setup do backend
```bash
cd backend
npm install
cp .env.example .env        # ajuste DATABASE_URL e os segredos JWT
# crie o banco 'the_guetto' no PostgreSQL antes de migrar
npm run prisma:migrate       # cria as tabelas
npm run prisma:seed          # popula roles, admin, barbeiro e serviços
npm run dev                  # sobe a API em http://localhost:4000
```
Health check: `GET http://localhost:4000/api/health`

### Credenciais do seed
- **Admin**: `julianoferrasso@hotmail.com` / senha em `SEED_ADMIN_PASSWORD` (padrão `Admin@123`)
- **Barbeiro**: `barbeiro@theguetto.com` / `Barber@123`

## Setup do frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local   # defina NEXT_PUBLIC_API_URL
npm run dev                        # http://localhost:3000
```

## Endpoints de autenticação
| Método | Rota                  | Descrição                         |
|--------|-----------------------|-----------------------------------|
| POST   | `/api/auth/register`  | Auto-cadastro de cliente          |
| POST   | `/api/auth/login`     | Login (retorna access + refresh)  |
| POST   | `/api/auth/refresh`   | Rotaciona o refresh token         |
| POST   | `/api/auth/logout`    | Revoga o refresh token            |
| GET    | `/api/auth/me`        | Perfil do usuário autenticado     |
