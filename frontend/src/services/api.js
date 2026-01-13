import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * TicketReport API Service
 * Baseado na documentação oficial da API
 */
class TicketReportAPI {
  // ==================== AUTH ====================
  
  /**
   * Login do utilizador
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<{token: string, user: UserDto}>}
   */
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data;
    
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  }

  /**
   * Registo de novo utilizador
   * @param {string} name 
   * @param {string} email 
   * @param {string} password 
   * @param {number} role - 0=Admin, 1=UserReport, 2=UserResolve
   * @returns {Promise<{token: string, user: UserDto}>}
   */
  async register(name, email, password, role = 1) {
    const response = await api.post('/auth/register', { name, email, password, role });
    const { token, user } = response.data;
    
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  }

  /**
   * Logout - limpa tokens do localStorage
   */
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  /**
   * Verifica se o utilizador está autenticado
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  }

  /**
   * Obtém o utilizador atual do localStorage
   * @returns {UserDto|null}
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // ==================== TICKETS ====================

  /**
   * Lista todos os tickets (filtrados por permissões do utilizador)
   * - Admin: todos os tickets
   * - UserReport: apenas tickets que criou
   * - UserResolve: tickets atribuídos ou que criou
   * @returns {Promise<TicketDto[]>}
   */
  async getTickets() {
    const response = await api.get('/tickets');
    return response.data;
  }

  /**
   * Obtém um ticket por ID
   * @param {string} id - GUID do ticket
   * @returns {Promise<TicketDto>}
   */
  async getTicket(id) {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
  }

  /**
   * Cria um novo ticket
   * @param {string} title 
   * @param {string} description 
   * @param {string|null} assignedToId - GUID do utilizador a atribuir (opcional)
   * @param {string|null} attachmentUrls - URLs de anexos separados por vírgula (opcional)
   * @returns {Promise<TicketDto>}
   */
  async createTicket(title, description, assignedToId = null, attachmentUrls = null) {
    const response = await api.post('/tickets', { title, description, assignedToId, attachmentUrls });
    return response.data;
  }

  /**
   * Atribui um ticket a uma equipa/pessoa (apenas Admin)
   * @param {string} ticketId - GUID do ticket
   * @param {string|null} assignedToId - GUID do utilizador a atribuir (null para remover atribuição)
   * @returns {Promise<TicketDto>}
   */
  async assignTicket(ticketId, assignedToId) {
    const response = await api.patch(`/tickets/${ticketId}/assign`, { assignedToId });
    return response.data;
  }

  /**
   * Atualiza o status de um ticket
   * Status: 0=Pending, 1=InProgress, 2=FinalAnalysis, 3=Resolved
   * Workflow linear: Pending → InProgress → FinalAnalysis → Resolved
   * @param {string} ticketId - GUID do ticket
   * @param {number} status - Novo status
   * @returns {Promise<TicketDto>}
   */
  async updateTicketStatus(ticketId, status) {
    const response = await api.patch(`/tickets/${ticketId}/status`, { status });
    return response.data;
  }

  // ==================== MESSAGES ====================

  /**
   * Adiciona uma mensagem a um ticket
   * @param {string} ticketId - GUID do ticket
   * @param {string} content - Conteúdo da mensagem
   * @param {string|null} attachmentUrl - URL do anexo (opcional)
   * @returns {Promise<MessageDto>}
   */
  async addMessage(ticketId, content, attachmentUrl = null) {
    const response = await api.post(`/tickets/${ticketId}/messages`, { content, attachmentUrl });
    return response.data;
  }

  // ==================== ADMIN ====================

  /**
   * Lista todos os utilizadores (apenas Admin)
   * @returns {Promise<UserDto[]>}
   */
  async getUsers() {
    const response = await api.get('/admin/users');
    return response.data;
  }

  /**
   * Aprova registo de um utilizador (apenas Admin)
   * @param {string} userId - GUID do utilizador
   * @returns {Promise<void>}
   */
  async approveUser(userId) {
    await api.post(`/admin/users/${userId}/approve`);
  }

  /**
   * Altera o role de um utilizador (apenas Admin)
   * @param {string} userId - GUID do utilizador
   * @param {number} role - 0=Admin, 1=UserReport, 2=UserResolve
   * @returns {Promise<void>}
   */
  async updateUserRole(userId, role) {
    await api.patch(`/admin/users/${userId}/role`, { role });
  }

  /**
   * Reset de password de um utilizador (apenas Admin)
   * @param {string} userId - GUID do utilizador
   * @returns {Promise<{temporaryPassword: string}>}
   */
  async resetUserPassword(userId) {
    const response = await api.post(`/admin/users/${userId}/reset-password`);
    return response.data;
  }

  /**
   * Lista utilizadores disponíveis para atribuição (Resolvers e Admins)
   * @returns {Promise<UserDto[]>}
   */
  async getResolvers() {
    const response = await api.get('/admin/resolvers');
    return response.data;
  }

  // ==================== SETTINGS ====================

  /**
   * Atualiza email do utilizador atual
   * @param {string} email 
   * @returns {Promise<void>}
   */
  async updateEmail(email) {
    await api.patch('/settings/email', { email });
    const user = this.getCurrentUser();
    if (user) {
      user.email = email;
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  /**
   * Atualiza password do utilizador atual
   * @param {string} currentPassword 
   * @param {string} newPassword 
   * @returns {Promise<void>}
   */
  async updatePassword(currentPassword, newPassword) {
    await api.patch('/settings/password', { currentPassword, newPassword });
  }
}

// Status labels e cores
export const STATUS_CONFIG = {
  0: { label: 'Pendente', color: 'status-pending', bgColor: 'bg-status-pending/10', textColor: 'text-status-pending' },
  1: { label: 'Em Progresso', color: 'status-progress', bgColor: 'bg-status-progress/10', textColor: 'text-status-progress' },
  2: { label: 'Análise Final', color: 'status-analysis', bgColor: 'bg-status-analysis/10', textColor: 'text-status-analysis' },
  3: { label: 'Resolvido', color: 'status-resolved', bgColor: 'bg-status-resolved/10', textColor: 'text-status-resolved' },
};

// Role labels
export const ROLE_CONFIG = {
  'Admin': { label: 'Administrador', color: 'text-status-analysis' },
  'UserReport': { label: 'Reporter', color: 'text-status-pending' },
  'UserResolve': { label: 'Resolver', color: 'text-status-progress' },
};

// Role numbers para registo
export const ROLE_VALUES = {
  Admin: 0,
  UserReport: 1,
  UserResolve: 2,
};

// Exporta instância singleton
export const ticketAPI = new TicketReportAPI();
export default ticketAPI;
