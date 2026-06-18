# Sistema de Gerenciamento de Estágios Acadêmicos

## 📝 Contexto do Sistema

### Visão Geral

O projeto consiste em um sistema de gerenciamento voltado para a disciplina de estágio, com o objetivo de auxiliar no controle e na organização das atividades relacionadas aos estágios acadêmicos. A plataforma permite centralizar informações de alunos, professores orientadores e supervisores, facilitando o acompanhamento do progresso dos estudantes durante o período de estágio.

O escopo engloba funcionalidades como cadastro de alunos e empresas, registro e armazenamento de documentos obrigatórios, controle de carga horária, acompanhamento de relatórios e avaliações, além de um canal de comunicação integrada entre todos os envolvidos no processo.

### Personas

**Cláudio (21 anos) - Aluno Estagiário**
Universitário em fase de estágio supervisionado. Organizado, proativo e tecnológico, busca fluxos de trabalho rápidos e intuitivos. Seu maior medo é perder prazos de entrega devido a sistemas lentos ou interfaces poluídas.

**Ana (40 anos) - Professora Orientadora**
Docente com pós-graduação responsável por acompanhar múltiplos alunos em estágio. Altamente analítica, valoriza ferramentas centralizadas que automatizam tarefas administrativas repetitivas. Sua maior frustração é com sistemas instáveis que geram duplicidade de informações ou processos de aprovação burocráticos.

### Épicos

- **EP01 - Painel de Controle e Dashboards (Visão Centralizada):** Telas com indicadores visuais de status, prazos e controle de horas.
- **EP02 - Gestão e Fluxo Digital de Documentos:** Envio simplificado, armazenamento, validação e aprovação digital.
- **EP03 - Comunicação Integrada e Notificações:** Sistema de notificações e alertas automáticos de prazos e pendências.

---

## 📖 Histórias de Usuário

### EP01 - Painel de Controle e Dashboards

**US01 - Painel do Aluno (Carga Horária e Status)**
> *Como* Cláudio (Aluno Estagiário)
> *Quero* visualizar um painel interativo com minhas horas cumpridas e pendências
> *Para* acompanhar minha evolução acadêmica sem precisar realizar cálculos manuais.

- Gráfico de progresso da carga horária acumulada
- Indicadores de documentos (total, aprovados, pendentes, rejeitados)
- Notificações recentes
- Cards com horas, empresa vinculada e curso

**US02 - Painel Multi-Alunos do Orientador**
> *Como* Ana (Professora Orientadora)
> *Quero* acessar um painel centralizado com filtros avançados
> *Para* monitorar a situação individual ou coletiva de múltiplos alunos.

- Tabela com todos os alunos orientados
- Filtro por nome e matrícula
- Indicadores de documentos pendentes por aluno
- Cards com total de alunos, revisões pendentes e horas totais

### EP02 - Gestão e Fluxo Digital de Documentos

**US03 - Upload Simplificado de Arquivos**
> *Como* Cláudio (Aluno Estagiário)
> *Quero* realizar o upload de documentos obrigatórios em até 3 etapas simples
> *Para* evitar perda de tempo e formulários manuais cansativos.

- Fluxo em 3 etapas: Selecionar Categoria → Anexar Arquivo → Confirmar Envio
- Categorias: termo de compromisso, plano de atividades, relatório mensal, relatório final, ficha de avaliação, outros
- Arquivos suportados: PDF, DOC, DOCX, JPG, PNG (máx. 10MB)

**US04 - Aprovação Digital e Relatórios**
> *Como* Ana (Professora Orientadora)
> *Quero* validar e aprovar digitalmente os documentos dos alunos
> *Para* reduzir o fluxo de papéis físicos e otimizar tarefas administrativas.

- Aprovação ou rejeição de documentos com motivo
- Notificação automática ao aluno sobre o status

### EP03 - Comunicação Integrada e Notificações

**US05 - Alertas Automáticos de Prazos**
> *Como* Cláudio ou Ana
> *Quero* receber notificações automáticas sobre novos prazos e pendências
> *Para* mitigar o risco de perda de datas importantes.

- Notificações ao enviar documento
- Notificações ao aprovar/rejeitar documento
- Indicador de notificações não lidas

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS + Shadcn/ui |
| Backend | Node.js + Express + TypeScript |
| Banco de Dados | PostgreSQL + Prisma ORM |
| Autenticação | JWT (bcryptjs + jsonwebtoken) |
| Upload | Multer |

## 🗄️ Estrutura do Banco de Dados

7 tabelas principais:

- **users** — autenticação e roles (STUDENT, ADVISOR, SUPERVISOR, ADMIN)
- **students** — perfil do estudante vinculado a user, empresa e orientador
- **companies** — empresas conveniadas
- **documents** — documentos enviados com status (PENDING, APPROVED, REJECTED)
- **reports** — relatórios de estágio
- **notifications** — notificações por usuário
- **messages** — mensagens entre usuários

---

## 🚀 Como Executar o Projeto

### Pré-requisitos

- Node.js 18+
- PostgreSQL 16+

### Passo a passo

```bash
# 1. Clone o repositório
cd /home/eduardocorrea/Área\ de\ trabalho/TP4---Entrega-trabalho-Vibe-Coding/TEES/meu-app

# 2. Instale as dependências
npm install

# 3. Configure o banco de dados
# Crie o banco PostgreSQL:
createdb meu_app

# 4. Configure a variável de ambiente em packages/server/.env:
# DATABASE_URL="postgresql://SEU_USUARIO:SUA_SENHA@localhost:5432/meu_app"
# JWT_SECRET="sua-chave-secreta-aqui"
# PORT=3001

# 5. Setup completo (gera Prisma Client + cria tabelas + popula dados)
npm run setup

# 6. Inicie o servidor de desenvolvimento
npm run dev
```

O frontend estará em `http://localhost:5173` e o backend em `http://localhost:3001`.

### Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor e frontend simultaneamente |
| `npm run dev:server` | Inicia apenas o backend |
| `npm run dev:web` | Inicia apenas o frontend |
| `npm run setup` | Instala deps + gera Prisma + push schema + seed |
| `npm run db:generate` | Gera o Prisma Client |
| `npm run db:push` | Sincroniza schema com o banco |
| `npm run db:seed` | Popula dados de exemplo |
| `npm run typecheck` | Verifica tipos (server + web) |
| `npm run build` | Build de produção |

---

## 🧪 Instruções de Uso

### Credenciais de Teste

| Papel | Email | Senha |
|-------|-------|-------|
| Aluno | claudio.aluno@universidade.edu | 123456 |
| Orientador | ana.orientadora@universidade.edu | 123456 |

### Fluxo Aluno

1. Acesse `http://localhost:5173`
2. Faça login com as credenciais de aluno
3. Visualize o dashboard com:
   - Progresso da carga horária
   - Quantidade de documentos (aprovados, pendentes, rejeitados)
   - Empresa vinculada
   - Gráfico de horas por mês
4. Clique em "Novo Documento" para enviar um arquivo
5. Siga o fluxo de 3 etapas: categoria → anexar → confirmar
6. Acompanhe as notificações no ícone de sino

### Fluxo Orientador

1. Faça login com as credenciais de orientador
2. Visualize o dashboard com:
   - Total de alunos orientados
   - Revisões pendentes
   - Horas totais acumuladas
   - Empresas parceiras
3. Use a barra de busca para filtrar alunos por nome ou matrícula
4. Clique em "Detalhes" para ver informações completas de cada aluno
5. Aprove ou rejeite documentos na seção "Revisar Documentos"

### API Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Registro |
| GET | `/api/auth/me` | Dados do usuário logado |
| GET | `/api/dashboard/student` | Dashboard do aluno |
| GET | `/api/dashboard/advisor` | Dashboard do orientador |
| GET | `/api/students` | Listar alunos |
| GET | `/api/students/:id` | Detalhes do aluno |
| PUT | `/api/students/:id` | Atualizar aluno |
| GET | `/api/documents` | Listar documentos |
| POST | `/api/documents/upload` | Upload de documento |
| PATCH | `/api/documents/:id/approve` | Aprovar documento |
| PATCH | `/api/documents/:id/reject` | Rejeitar documento |
| GET | `/api/companies` | Listar empresas |
| POST | `/api/companies` | Cadastrar empresa |
| GET | `/api/notifications` | Listar notificações |
| PATCH | `/api/notifications/:id/read` | Marcar como lida |
