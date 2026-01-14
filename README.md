# 🎫 Ticket Report - Sistema de Gestão de Tickets Industrial

> Sistema completo de gestão de tickets e relatórios de bugs desenvolvido com arquitetura moderna, seguindo Clean Architecture e Domain-Driven Design (DDD).

![.NET](https://img.shields.io/badge/.NET-9.0-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Tecnologias e Skills](#-tecnologias-e-skills)
- [Arquitetura](#-arquitetura)
- [Funcionalidades](#-funcionalidades)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Execução](#-instalação-e-execução)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [API Documentation](#-api-documentation)
- [Contribuindo](#-contribuindo)

## 🎯 Sobre o Projeto

**Ticket Report** é uma aplicação full-stack desenvolvida para gestão de tickets e relatórios de bugs em ambientes industriais. O sistema implementa um sistema robusto de autenticação e autorização baseado em roles (RBAC), permitindo diferentes níveis de acesso para usuários, administradores e gestores.

### Características Principais

- ✅ **Autenticação JWT** com refresh tokens
- ✅ **Sistema de Roles (RBAC)** - UserReport, Admin, Manager
- ✅ **Gestão completa de tickets** com status e atribuição
- ✅ **Sistema de mensagens** em tempo real por ticket
- ✅ **Dashboard interativo** com métricas e filtros
- ✅ **Interface moderna e responsiva** com Tailwind CSS
- ✅ **API RESTful** documentada com Swagger/OpenAPI
- ✅ **Containerização** com Docker e Docker Compose

## 🛠 Tecnologias e Skills

### Backend

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **.NET 9.0** | Latest | Framework principal da API |
| **ASP.NET Core** | 9.0 | Web API e middleware |
| **Entity Framework Core** | 9.0 | ORM e migrations |
| **PostgreSQL** | 16 | Banco de dados relacional |
| **JWT Bearer** | - | Autenticação e autorização |
| **Swagger/OpenAPI** | - | Documentação da API |
| **Docker** | - | Containerização |

**Skills Demonstradas:**
- 🏗️ **Clean Architecture** - Separação em camadas (Domain, Application, Infrastructure, API)
- 📐 **Domain-Driven Design (DDD)** - Modelagem orientada ao domínio
- 🔐 **Segurança** - JWT, password hashing (BCrypt), CORS, validação de tokens
- 🗄️ **ORM e Migrations** - Entity Framework Core com PostgreSQL
- 📝 **API RESTful** - Endpoints bem estruturados e documentados
- 🐳 **Docker** - Multi-stage builds e containerização
- 🧪 **Testabilidade** - Arquitetura preparada para testes unitários e de integração

### Frontend

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **React** | 19.2 | Biblioteca UI |
| **Vite** | 7.3 | Build tool e dev server |
| **Tailwind CSS** | 4.0 | Framework CSS utility-first |
| **React Router DOM** | 7.12 | Roteamento SPA |
| **Axios** | 1.13 | Cliente HTTP |
| **Phosphor Icons** | 2.1 | Biblioteca de ícones |

**Skills Demonstradas:**
- ⚛️ **React Hooks** - useState, useEffect, useContext, custom hooks
- 🎨 **Component-Based Architecture** - Componentes reutilizáveis e modulares
- 🛣️ **Client-Side Routing** - Navegação SPA com React Router
- 🎯 **Context API** - Gerenciamento de estado global (Auth, Toast)
- 🔒 **Protected Routes** - Rotas protegidas baseadas em autenticação e roles
- 📱 **Responsive Design** - Interface adaptável a diferentes dispositivos
- 🎭 **Modern UI/UX** - Design system com Tailwind CSS

### DevOps & Infraestrutura

| Tecnologia | Uso |
|------------|-----|
| **Docker** | Containerização da aplicação |
| **Docker Compose** | Orquestração de serviços |
| **PostgreSQL** | Banco de dados containerizado |
| **Multi-stage Builds** | Otimização de imagens Docker |

**Skills Demonstradas:**
- 🐳 **Containerização** - Docker e Docker Compose
- 🔄 **CI/CD Ready** - Estrutura preparada para pipelines
- 🌐 **Microservices Architecture** - Separação frontend/backend
- 📊 **Health Checks** - Monitoramento de serviços

## 🏛 Arquitetura

O projeto segue os princípios de **Clean Architecture** e **DDD**, organizando o código em camadas bem definidas:

```
┌─────────────────────────────────────┐
│         Frontend (React)            │
│  - Components, Pages, Contexts     │
│  - Vite + Tailwind CSS             │
└──────────────┬──────────────────────┘
               │ HTTP/REST
┌──────────────▼──────────────────────┐
│      API Layer (ASP.NET Core)       │
│  - Controllers, Middleware          │
│  - JWT Authentication               │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Application Layer                 │
│  - Use Cases, DTOs, Validations    │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Domain Layer                      │
│  - Entities, Enums, Interfaces     │
│  - Business Logic                   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Infrastructure Layer              │
│  - EF Core, Repositories            │
│  - Services (JWT, Email, Hash)     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      PostgreSQL Database            │
└─────────────────────────────────────┘
```

### Camadas do Backend

1. **Domain** - Entidades, enums e interfaces (camada de negócio)
2. **Application** - Casos de uso, DTOs e lógica de aplicação
3. **Infrastructure** - Implementações concretas (EF Core, repositórios, serviços)
4. **API** - Controllers, middleware e configuração da aplicação

## ✨ Funcionalidades

### Autenticação e Autorização
- 🔐 Login e registro de usuários
- 🎫 JWT tokens com refresh
- 👥 Sistema de roles (UserReport, Admin, Manager)
- 🛡️ Rotas protegidas baseadas em roles

### Gestão de Tickets
- ➕ Criação de tickets com título, descrição e anexos
- 📊 Visualização de tickets com filtros (status, data, atribuição)
- ✏️ Atualização de status (Pending, InProgress, Resolved, Closed)
- 👤 Atribuição de tickets a usuários
- 📎 Suporte a anexos (URLs)

### Sistema de Mensagens
- 💬 Mensagens por ticket
- 👥 Comunicação entre reporter e assigned user
- 📝 Histórico completo de conversas

### Dashboard e Administração
- 📈 Dashboard com métricas e estatísticas
- 👥 Gestão de usuários (Admin)
- ⚙️ Configurações de perfil
- 🔍 Filtros avançados e busca

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [.NET 9.0 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js](https://nodejs.org/) (v18 ou superior)
- [Docker](https://www.docker.com/get-started) e Docker Compose
- [Git](https://git-scm.com/)

## 🚀 Instalação e Execução

### Opção 1: Docker Compose (Recomendado)

A forma mais simples de executar o projeto é usando Docker Compose:

```bash
# Clone o repositório
git clone <repository-url>
cd "TicketingBug Reporting"

# Execute com Docker Compose
docker-compose up -d

# O backend estará disponível em: http://localhost:5000
# O frontend estará disponível em: http://localhost:3000
# O PostgreSQL estará disponível em: localhost:5432
```

### Opção 2: Execução Manual

#### Backend

```bash
cd backend

# Restaure as dependências
dotnet restore

# Configure a connection string no appsettings.json
# ConnectionStrings__DefaultConnection=Host=localhost;Database=ticketreport;Username=postgres;Password=postgres123

# Execute as migrations
dotnet ef database update --project src/TicketReport.Infrastructure --startup-project src/TicketReport.API

# Execute a API
cd src/TicketReport.API
dotnet run

# A API estará disponível em: http://localhost:5000
# Swagger UI: http://localhost:5000
```

#### Frontend

```bash
cd frontend

# Instale as dependências
npm install

# Execute o servidor de desenvolvimento
npm run dev

# O frontend estará disponível em: http://localhost:3000
```

### Credenciais Padrão

Após executar as migrations, um usuário administrador é criado automaticamente:

- **Email:** `admin@ticketreport.com`
- **Password:** `Admin123!`

## 📁 Estrutura do Projeto

```
TicketingBug Reporting/
│
├── backend/
│   ├── src/
│   │   ├── TicketReport.API/          # Camada de apresentação
│   │   │   ├── Controllers/           # Controllers da API
│   │   │   ├── Program.cs             # Configuração e startup
│   │   │   └── Properties/
│   │   │
│   │   ├── TicketReport.Application/  # Camada de aplicação
│   │   │   └── (Use Cases, DTOs)
│   │   │
│   │   ├── TicketReport.Domain/       # Camada de domínio
│   │   │   ├── Entities/              # Entidades (Ticket, User, Message)
│   │   │   ├── Enums/                 # Enumeradores
│   │   │   └── Interfaces/            # Contratos
│   │   │
│   │   └── TicketReport.Infrastructure/ # Camada de infraestrutura
│   │       ├── Data/                  # EF Core, DbContext, Migrations
│   │       ├── Repositories/          # Implementações dos repositórios
│   │       └── Services/              # JWT, Email, Password Hash
│   │
│   ├── Dockerfile                      # Imagem Docker do backend
│   └── TicketReport.sln               # Solution file
│
├── frontend/
│   ├── src/
│   │   ├── components/                # Componentes React
│   │   │   ├── layout/               # Layout, Sidebar, ProtectedRoute
│   │   │   └── ui/                   # Componentes UI reutilizáveis
│   │   ├── contexts/                 # Context API (Auth, Toast)
│   │   ├── pages/                    # Páginas da aplicação
│   │   ├── services/                 # API client (Axios)
│   │   └── App.jsx                   # Componente raiz
│   │
│   ├── package.json
│   └── vite.config.js
│
├── docker-compose.yaml                # Orquestração dos serviços
└── README.md                          # Este arquivo
```

## 📚 API Documentation

A documentação completa da API está disponível em:

- **Swagger UI:** `http://localhost:5000` (quando em desenvolvimento)
- **Documentação Frontend:** `frontend/API_DOCUMENTATION.md`

### Endpoints Principais

- `POST /auth/login` - Autenticação
- `POST /auth/register` - Registro de usuário
- `GET /tickets` - Listar tickets
- `POST /tickets` - Criar ticket
- `GET /tickets/{id}` - Detalhes do ticket
- `PUT /tickets/{id}` - Atualizar ticket
- `GET /tickets/{id}/messages` - Mensagens do ticket
- `POST /tickets/{id}/messages` - Criar mensagem
- `GET /users` - Listar usuários (Admin)
- `PUT /users/{id}` - Atualizar usuário

## 🎓 Skills e Competências Demonstradas

### Backend Development
- ✅ Arquitetura em camadas (Clean Architecture)
- ✅ Domain-Driven Design (DDD)
- ✅ SOLID principles
- ✅ Repository Pattern
- ✅ Dependency Injection
- ✅ JWT Authentication & Authorization
- ✅ Entity Framework Core
- ✅ Database Migrations
- ✅ RESTful API Design
- ✅ Swagger/OpenAPI Documentation
- ✅ Docker & Containerization

### Frontend Development
- ✅ React 19 com Hooks
- ✅ Component-Based Architecture
- ✅ Context API para State Management
- ✅ React Router para SPA
- ✅ Protected Routes
- ✅ Responsive Design
- ✅ Modern CSS com Tailwind
- ✅ Axios para HTTP requests
- ✅ Error Handling & Loading States

### DevOps & Infrastructure
- ✅ Docker & Docker Compose
- ✅ Multi-stage Docker builds
- ✅ Service orchestration
- ✅ Database containerization
- ✅ Health checks

### Soft Skills
- ✅ Documentação completa
- ✅ Código limpo e organizado
- ✅ Boas práticas de desenvolvimento
- ✅ Versionamento com Git

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abrir um Pull Request

## 📄 Licença

Este projeto foi desenvolvido para fins de portfólio e demonstração de habilidades.

## 🎯 Business Value & Industrial Focus
This isn't just a "bug tracker". It's a tool designed to solve the communication gap in technical environments (inspired by my experience at Efacec). 

**Key Business Benefits:**
- **Zero Missing Data:** Mandatory attachments and structured logs ensure no information is lost between shifts.
- **Accountability:** Role-based flow ensures every change is signed by a responsible user.
- **Process Optimization:** Built-in metrics for "Resolution Time" allow managers to identify bottlenecks in the operation.
- 
---

**Desenvolvido com ❤️ para demonstrar competências em Full-Stack Development**
