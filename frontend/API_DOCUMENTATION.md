# Ticket Report API - Documentação para Frontend

## Base URL

```
http://localhost:5000
```

## Autenticação

A API utiliza **JWT Bearer Token** para autenticação. Após fazer login ou registo, o token será retornado na resposta e deve ser incluído em todas as requisições subsequentes.

### Como usar o Token

Incluir o token no header `Authorization` de todas as requisições protegidas:

```
Authorization: Bearer {token}
```

### Exemplo em JavaScript/Fetch

```javascript
const token = localStorage.getItem('authToken');

fetch('http://localhost:5000/tickets', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

---

## Endpoints

### 1. Autenticação

#### 1.1. Login

**POST** `/auth/login`

**Autenticação:** Não requerida

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response 200 OK:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "João Silva",
    "email": "user@example.com",
    "role": "UserReport"
  }
}
```

**Response 400 Bad Request:**
```json
{
  "error": "Credenciais inválidas."
}
```

**Exemplo de uso:**
```javascript
const response = await fetch('http://localhost:5000/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const data = await response.json();
if (response.ok) {
  localStorage.setItem('authToken', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
}
```

---

#### 1.2. Registro

**POST** `/auth/register`

**Autenticação:** Não requerida

**Request Body:**
```json
{
  "name": "João Silva",
  "email": "user@example.com",
  "password": "password123",
  "role": 1
}
```

**Roles:**
- `0` = Admin
- `1` = UserReport
- `2` = UserResolve

**Response 201 Created:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "João Silva",
    "email": "user@example.com",
    "role": "UserReport"
  }
}
```

**Response 400 Bad Request:**
```json
{
  "error": "Já existe um utilizador com este email."
}
```

**Exemplo de uso:**
```javascript
const response = await fetch('http://localhost:5000/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'João Silva',
    email: 'user@example.com',
    password: 'password123',
    role: 1
  })
});

const data = await response.json();
if (response.ok) {
  localStorage.setItem('authToken', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
}
```

---

### 2. Tickets

#### 2.1. Listar Tickets

**GET** `/tickets`

**Autenticação:** Requerida

**Permissões:**
- **Admin:** Vê todos os tickets
- **UserReport:** Vê apenas os tickets que criou
- **UserResolve:** Vê os tickets atribuídos a si e os que criou

**Response 200 OK:**
```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "title": "Bug no sistema de login",
    "description": "O botão de login não está a funcionar",
    "status": 0,
    "createdAt": "2024-01-13T10:00:00Z",
    "closedAt": null,
    "reporter": {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "name": "João Silva",
      "email": "user@example.com",
      "role": "UserReport"
    },
    "assignedTo": {
      "id": "7fa85f64-5717-4562-b3fc-2c963f66afa6",
      "name": "Maria Santos",
      "email": "maria@example.com",
      "role": "UserResolve"
    },
    "messages": []
  }
]
```

**Status do Ticket:**
- `0` = Pending
- `1` = InProgress
- `2` = FinalAnalysis
- `3` = Resolved

**Exemplo de uso:**
```javascript
const token = localStorage.getItem('authToken');

const response = await fetch('http://localhost:5000/tickets', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const tickets = await response.json();
```

---

#### 2.2. Obter Ticket por ID

**GET** `/tickets/{id}`

**Autenticação:** Requerida

**Parâmetros:**
- `id` (Guid) - ID do ticket

**Permissões:**
- **Admin:** Pode aceder a qualquer ticket
- **UserReport:** Apenas tickets que criou
- **UserResolve:** Tickets atribuídos a si ou que criou

**Response 200 OK:**
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "title": "Bug no sistema de login",
  "description": "O botão de login não está a funcionar",
  "status": 1,
  "createdAt": "2024-01-13T10:00:00Z",
  "closedAt": null,
  "reporter": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "João Silva",
    "email": "user@example.com",
    "role": "UserReport"
  },
  "assignedTo": {
    "id": "7fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "Maria Santos",
    "email": "maria@example.com",
    "role": "UserResolve"
  },
  "messages": [
    {
      "id": "8fa85f64-5717-4562-b3fc-2c963f66afa6",
      "content": "Vou investigar este problema",
      "attachmentUrl": null,
      "createdAt": "2024-01-13T11:00:00Z",
      "user": {
        "id": "7fa85f64-5717-4562-b3fc-2c963f66afa6",
        "name": "Maria Santos",
        "email": "maria@example.com",
        "role": "UserResolve"
      }
    }
  ]
}
```

**Response 404 Not Found:**
```json
{
  "error": "Ticket não encontrado."
}
```

**Response 400 Bad Request:**
```json
{
  "error": "Não tem permissão para aceder a este ticket."
}
```

**Exemplo de uso:**
```javascript
const ticketId = "3fa85f64-5717-4562-b3fc-2c963f66afa6";
const token = localStorage.getItem('authToken');

const response = await fetch(`http://localhost:5000/tickets/${ticketId}`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const ticket = await response.json();
```

---

#### 2.3. Criar Ticket

**POST** `/tickets`

**Autenticação:** Requerida

**Request Body:**
```json
{
  "title": "Bug no sistema de login",
  "description": "O botão de login não está a funcionar quando clicado",
  "assignedToId": "7fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

**Nota:** `assignedToId` é opcional. Se fornecido, deve ser um utilizador com role `UserResolve` ou `Admin`.

**Response 201 Created:**
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "title": "Bug no sistema de login",
  "description": "O botão de login não está a funcionar quando clicado",
  "status": 0,
  "createdAt": "2024-01-13T10:00:00Z",
  "closedAt": null,
  "reporter": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "João Silva",
    "email": "user@example.com",
    "role": "UserReport"
  },
  "assignedTo": {
    "id": "7fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "Maria Santos",
    "email": "maria@example.com",
    "role": "UserResolve"
  },
  "messages": []
}
```

**Response 400 Bad Request:**
```json
{
  "error": "Utilizador para atribuição não encontrado."
}
```

ou

```json
{
  "error": "O ticket só pode ser atribuído a um Resolver ou Admin."
}
```

**Exemplo de uso:**
```javascript
const token = localStorage.getItem('authToken');

const response = await fetch('http://localhost:5000/tickets', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Bug no sistema de login',
    description: 'O botão de login não está a funcionar quando clicado',
    assignedToId: '7fa85f64-5717-4562-b3fc-2c963f66afa6' // Opcional
  })
});

const ticket = await response.json();
```

---

#### 2.4. Atualizar Status do Ticket

**PATCH** `/tickets/{id}/status`

**Autenticação:** Requerida

**Permissões:** Apenas `Admin` e `UserResolve`

**Parâmetros:**
- `id` (Guid) - ID do ticket

**Request Body:**
```json
{
  "status": 1
}
```

**Status válidos:**
- `0` = Pending
- `1` = InProgress
- `2` = FinalAnalysis
- `3` = Resolved

**Workflow de Status (Linear):**
- Pending → InProgress → FinalAnalysis → Resolved
- **UserResolve** só pode avançar para o próximo status
- **Admin** pode alterar para qualquer status

**Response 200 OK:**
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "title": "Bug no sistema de login",
  "description": "O botão de login não está a funcionar",
  "status": 1,
  "createdAt": "2024-01-13T10:00:00Z",
  "closedAt": null,
  "reporter": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "João Silva",
    "email": "user@example.com",
    "role": "UserReport"
  },
  "assignedTo": {
    "id": "7fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "Maria Santos",
    "email": "maria@example.com",
    "role": "UserResolve"
  },
  "messages": []
}
```

**Response 400 Bad Request:**
```json
{
  "error": "Reporters não podem alterar o status de tickets."
}
```

ou

```json
{
  "error": "Só pode alterar o status de tickets que lhe foram atribuídos."
}
```

ou

```json
{
  "error": "Transição de status inválida: Pending -> Resolved"
}
```

**Nota:** Quando o status é alterado para `Resolved` (3), o campo `closedAt` é automaticamente preenchido.

**Exemplo de uso:**
```javascript
const ticketId = "3fa85f64-5717-4562-b3fc-2c963f66afa6";
const token = localStorage.getItem('authToken');

const response = await fetch(`http://localhost:5000/tickets/${ticketId}/status`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    status: 1 // InProgress
  })
});

const ticket = await response.json();
```

---

### 3. Mensagens

#### 3.1. Adicionar Mensagem a um Ticket

**POST** `/tickets/{id}/messages`

**Autenticação:** Requerida

**Parâmetros:**
- `id` (Guid) - ID do ticket

**Request Body:**
```json
{
  "content": "Vou investigar este problema e reportar em breve",
  "attachmentUrl": "https://example.com/file.pdf"
}
```

**Nota:** `attachmentUrl` é opcional.

**Permissões:**
- **Admin:** Pode adicionar mensagens a qualquer ticket
- **UserReport:** Apenas em tickets que criou
- **UserResolve:** Apenas em tickets atribuídos a si ou que criou

**Response 201 Created:**
```json
{
  "id": "8fa85f64-5717-4562-b3fc-2c963f66afa6",
  "content": "Vou investigar este problema e reportar em breve",
  "attachmentUrl": "https://example.com/file.pdf",
  "createdAt": "2024-01-13T11:00:00Z",
  "user": {
    "id": "7fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "Maria Santos",
    "email": "maria@example.com",
    "role": "UserResolve"
  }
}
```

**Response 400 Bad Request:**
```json
{
  "error": "Ticket não encontrado."
}
```

ou

```json
{
  "error": "Não tem permissão para adicionar mensagens a este ticket."
}
```

**Nota:** Quando uma mensagem é adicionada, um email automático é enviado (simulado) para:
- O reporter do ticket (se não for o autor da mensagem)
- O utilizador atribuído ao ticket (se não for o autor da mensagem)

**Exemplo de uso:**
```javascript
const ticketId = "3fa85f64-5717-4562-b3fc-2c963f66afa6";
const token = localStorage.getItem('authToken');

const response = await fetch(`http://localhost:5000/tickets/${ticketId}/messages`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    content: 'Vou investigar este problema e reportar em breve',
    attachmentUrl: 'https://example.com/file.pdf' // Opcional
  })
});

const message = await response.json();
```

---

## Códigos de Status HTTP

| Código | Significado | Quando ocorre |
|--------|-------------|---------------|
| 200 | OK | Requisição bem-sucedida |
| 201 | Created | Recurso criado com sucesso |
| 400 | Bad Request | Erro de validação ou lógica de negócio |
| 401 | Unauthorized | Token inválido ou ausente |
| 403 | Forbidden | Sem permissão para aceder ao recurso |
| 404 | Not Found | Recurso não encontrado |
| 500 | Internal Server Error | Erro interno do servidor |

---

## Estruturas de Dados

### UserDto
```typescript
interface UserDto {
  id: string;           // Guid
  name: string;
  email: string;
  role: string;         // "Admin" | "UserReport" | "UserResolve"
}
```

### TicketDto
```typescript
interface TicketDto {
  id: string;           // Guid
  title: string;
  description: string;
  status: number;        // 0=Pending, 1=InProgress, 2=FinalAnalysis, 3=Resolved
  createdAt: string;     // ISO 8601 DateTime
  closedAt: string | null; // ISO 8601 DateTime ou null
  reporter: UserDto;
  assignedTo: UserDto | null;
  messages: MessageDto[];
}
```

### MessageDto
```typescript
interface MessageDto {
  id: string;           // Guid
  content: string;
  attachmentUrl: string | null;
  createdAt: string;    // ISO 8601 DateTime
  user: UserDto;
}
```

### AuthResponse
```typescript
interface AuthResponse {
  token: string;
  user: UserDto;
}
```

---

## Permissões por Role

### Admin
- ✅ Ver todos os tickets
- ✅ Criar tickets
- ✅ Alterar status de qualquer ticket para qualquer status
- ✅ Adicionar mensagens a qualquer ticket

### UserReport
- ✅ Ver apenas os tickets que criou
- ✅ Criar tickets
- ❌ Alterar status de tickets
- ✅ Adicionar mensagens apenas aos tickets que criou

### UserResolve
- ✅ Ver tickets atribuídos a si e os que criou
- ✅ Criar tickets
- ✅ Alterar status apenas dos tickets atribuídos a si (workflow linear)
- ✅ Adicionar mensagens aos tickets atribuídos a si ou que criou

---

## Exemplo Completo: Cliente API em JavaScript

```javascript
class TicketReportAPI {
  constructor(baseUrl = 'http://localhost:5000') {
    this.baseUrl = baseUrl;
  }

  getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async login(email, password) {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    
    const data = await response.json();
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  }

  async register(name, email, password, role) {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    
    const data = await response.json();
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  }

  async getTickets() {
    const response = await fetch(`${this.baseUrl}/tickets`, {
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    
    return await response.json();
  }

  async getTicket(id) {
    const response = await fetch(`${this.baseUrl}/tickets/${id}`, {
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    
    return await response.json();
  }

  async createTicket(title, description, assignedToId = null) {
    const response = await fetch(`${this.baseUrl}/tickets`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ title, description, assignedToId })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    
    return await response.json();
  }

  async updateTicketStatus(ticketId, status) {
    const response = await fetch(`${this.baseUrl}/tickets/${ticketId}/status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    
    return await response.json();
  }

  async addMessage(ticketId, content, attachmentUrl = null) {
    const response = await fetch(`${this.baseUrl}/tickets/${ticketId}/messages`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ content, attachmentUrl })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    
    return await response.json();
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}

// Uso:
const api = new TicketReportAPI();

// Login
await api.login('user@example.com', 'password123');

// Obter tickets
const tickets = await api.getTickets();

// Criar ticket
const newTicket = await api.createTicket(
  'Novo Bug',
  'Descrição do bug',
  null // ou um userId para atribuir
);

// Adicionar mensagem
await api.addMessage(newTicket.id, 'Vou investigar este problema');
```

---

## Notas Importantes

1. **Token Expiração:** O token JWT expira após 60 minutos (configurável). O frontend deve implementar refresh token ou redirecionar para login quando receber 401.

2. **Validação de Dados:** Todos os campos obrigatórios são validados no backend. Certifique-se de validar também no frontend para melhor UX.

3. **Tratamento de Erros:** Sempre verifique o campo `error` nas respostas de erro para exibir mensagens adequadas ao utilizador.

4. **CORS:** Se o frontend estiver em um domínio diferente, certifique-se de que o backend está configurado para aceitar requisições CORS.

5. **Formato de Datas:** Todas as datas são retornadas no formato ISO 8601 (ex: `2024-01-13T10:00:00Z`).

6. **Guids:** Todos os IDs são GUIDs (UUIDs) no formato string.
