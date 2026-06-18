# TP4 — Entrega Trabalho Vibe Coding

## Contexto da Atividade

Atividade da disciplina **TEES (Técnicas de Engenharia de Software)**, voltada para a prototipação de projetos com o uso de Inteligências Artificiais. O objetivo foi explorar o desenvolvimento acelerado de software ("Vibe Coding") utilizando assistentes de IA como ferramenta principal de codificação, onde o desenvolvedor atua como **arquiteto e orientador**, enquanto a IA executa a implementação.

## Problema

Desenvolver um **Sistema de Gerenciamento de Estágios Acadêmicos** que centralize informações de alunos, professores orientadores e supervisores, facilitando o acompanhamento de estágios. O sistema deveria contemplar:

- Cadastro e login de usuários com diferentes papéis (aluno, orientador)
- Dashboards individuais com indicadores de carga horária e documentos
- Upload e aprovação digital de documentos obrigatórios
- Sistema de notificações automáticas sobre prazos e pendências

## Processo de Desenvolvimento

### Stack escolhida
- **Frontend:** React + TypeScript + Vite + Tailwind CSS + Shadcn/ui
- **Backend:** Node.js + Express + TypeScript
- **Banco:** PostgreSQL com Prisma ORM
- **Autenticação:** JWT

### Metodologia

1. **Planejamento:** Definição das histórias de usuário, épicos e personas (Cláudio - Aluno, Ana - Orientadora)
2. **Arquitetura:** Decisão de monorepo com npm workspaces, separação clara entre frontend e backend
3. **Modelagem de dados:** Schema Prisma com 7 tabelas (users, students, companies, documents, reports, notifications, messages)
4. **Implementação via IA:** Criação sequencial dos módulos usando comandos em linguagem natural:
   - Estrutura do projeto e configurações
   - Schema do banco e seed de dados
   - API REST com autenticação JWT e middlewares de role
   - Frontend com componentes Shadcn/ui e páginas responsivas
   - Fluxo de upload em 3 etapas
5. **Verificação:** Typecheck e build bem-sucedidos em ambos os pacotes

### Resultado

MVP funcional com:
- Autenticação e controle de acesso por papel (aluno/orientador)
- Dashboard do aluno com gráfico de horas, indicadores de documentos e notificações
- Dashboard do orientador com visão multi-aluno, filtros e métricas
- Upload de documentos em 3 etapas com categorias pré-definidas
- Aprovação/rejeição de documentos com notificação automática
- API REST documentada com 14 endpoints

O código-fonte do projeto está em `./TEES/meu-app/`.
