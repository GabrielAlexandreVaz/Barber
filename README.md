# The Guetto Barber — Sistema de Gestão

Plataforma web de gestão para barbearia (agendamento de clientes, agenda de
barbeiros e painel administrativo). Visual premium escuro/dourado inspirado na
identidade da **The Guetto** ([@theguettoofc](https://www.instagram.com/theguettoofc/)).

> Status: **MVP completo (Etapas 1–15)** — da autenticação ao deploy.

## Funcionalidades
- **Autenticação** JWT + refresh (login, cadastro de cliente, RBAC por papel).
- **Usuários** — perfil próprio, troca de senha, gestão admin (papéis, ativar/desativar).
- **Barbeiros** — cadastro/edição (foto, bio, especialidade, redes); o barbeiro edita o próprio perfil.
- **Serviços** — catálogo (preço, duração, categoria, imagem).
- **Agenda** — horários de trabalho, folgas/bloqueios e cálculo de horários livres.
- **Agendamento** — fluxo cliente (serviço → barbeiro → data → horário) com trava de conflito.
- **Dashboard** — métricas do dia/período e receita.
- **Histórico** — filtros e paginação por papel.
- **Avaliações** — nota + comentário após atendimento; média por barbeiro.
- **Upload** de imagens (Multer) para barbeiros/serviços/logo.
- **Relatórios** — faturamento por barbeiro, top serviços, taxa de cancelamento, export CSV.
- **Configurações** — dados da barbearia (nome, contato, logo) editáveis pelo admin.

## Deploy
Guia de produção (VPS Ubuntu + PM2 + Nginx + SSL) em [DEPLOY.md](DEPLOY.md).

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

## Principais domínios da API
| Prefixo             | Descrição                                                        |
|---------------------|------------------------------------------------------------------|
| `/api/auth`         | register, login, refresh, logout, me                             |
| `/api/users`        | perfil próprio + gestão admin (lista, papel, ativar/desativar)   |
| `/api/barbers`      | CRUD de barbeiros, perfil próprio, horários, bloqueios, avaliações|
| `/api/services`     | catálogo de serviços                                             |
| `/api/appointments` | criar/listar/cancelar/reagendar/status + avaliar                 |
| `/api/dashboard`    | métricas (escopo por papel)                                      |
| `/api/reports`      | relatórios analíticos + export CSV (admin)                       |
| `/api/uploads`      | upload de imagens (Multer)                                        |
| `/api/settings`     | configurações da barbearia (GET público, PUT admin)              |
