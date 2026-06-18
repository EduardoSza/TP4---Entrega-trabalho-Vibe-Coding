# AGENTS.md — meu-app

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS + Shadcn/ui |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (bcryptjs + jsonwebtoken) |
| Upload | Multer (arquivos salvos em `./uploads`) |

## Estrutura

```
meu-app/
├── packages/
│   ├── server/          # Backend Express
│   │   ├── prisma/      # Schema e seed
│   │   ├── src/
│   │   │   ├── routes/  # auth, students, documents, companies, dashboard, notifications
│   │   │   ├── middleware/  # auth (JWT), errorHandler
│   │   │   └── index.ts     # Entrypoint, prisma client global
│   └── web/             # Frontend React
│       └── src/
│           ├── pages/   # Login, StudentDashboard, AdvisorDashboard, DocumentUpload
│           ├── components/ui/  # button, card, input, badge, progress, avatar, etc.
│           └── lib/     # api.ts (fetch wrapper), auth.tsx (context), utils.ts (cn)
├── package.json         # Monorepo root (npm workspaces)
└── AGENTS.md
```

## Banco de Dados

7 tabelas no schema (`packages/server/prisma/schema.prisma`):
- `users` — autenticação, role (STUDENT, ADVISOR, SUPERVISOR, ADMIN)
- `students` — vinculado a user, empresa e orientador
- `companies` — dados da empresa conveniada
- `documents` — uploads com status (PENDING, APPROVED, REJECTED)
- `reports` — relatórios de estágio
- `notifications` — notificações por usuário
- `messages` — mensagens entre usuários

Roles do enum `Role`: `STUDENT`, `ADVISOR`, `SUPERVISOR`, `ADMIN`

## Comandos Essenciais

```bash
# Instalar tudo
npm install

# Gerar Prisma client + criar schema no banco + seed
npm run db:generate   # gera Prisma Client
npm run db:push       # sincroniza schema com PostgreSQL (cria tabelas)
npm run db:seed       # popula dados de exemplo

# Ou tudo de uma vez:
npm run setup

# Desenvolvimento (servidor + frontend concurrently)
npm run dev

# Individual
npm run dev:server    # http://localhost:3001
npm run dev:web       # http://localhost:5173 (proxy /api -> 3001)

# Verificação
npm run typecheck     # server + web
npm run build         # produção
```

## Credenciais de Teste (seed)

| Papel | Email | Senha |
|-------|-------|-------|
| Aluno | claudio.aluno@universidade.edu | 123456 |
| Orientador | ana.orientadora@universidade.edu | 123456 |

## Arquitetura da API

- `POST /api/auth/login` — login, retorna JWT
- `POST /api/auth/register` — registro (se role=STUDENT, cria perfil automaticamente)
- `GET /api/auth/me` — dados do usuário logado
- `GET /api/dashboard/student` — dashboard do aluno (horas, docs, notificações)
- `GET /api/dashboard/advisor` — dashboard do orientador (todos os alunos)
- `GET/PUT /api/students` — CRUD alunos (ADVISOR/ADMIN pode listar/filtrar)
- `GET/POST /api/documents` — listar e fazer upload (3 etapas: categoria -> anexo -> confirmação)
- `PATCH /api/documents/:id/approve|reject` — aprovação/rejeição (ADVISOR/ADMIN)
- `GET/POST/PUT /api/companies` — CRUD empresas
- `GET /api/notifications` — notificações do usuário logado

### Upload de Documentos

Fluxo de 3 etapas no frontend (DocumentUpload.tsx):
1. Selecionar categoria (termo_de_compromisso, plano_de_atividades, relatorio_mensal, etc.)
2. Anexar arquivo (PDF, DOC, JPG, PNG — máx 10MB)
3. Confirmar envio

Upload cria notificação automática para o aluno e para o orientador (se vinculado).

## Convenções

- Roles no banco em UPPER_SNAKE_CASE
- Categorias de documento em snake_case (enums do backend)
- Rotas RESTful em inglês no plural
- Datas armazenadas como `created_at` (snake_case no banco via `@map`)
- Não há testes configurados ainda
- Vite faz proxy de `/api` para `localhost:3001` em dev
- Uploads servidos estaticamente em `/uploads`
