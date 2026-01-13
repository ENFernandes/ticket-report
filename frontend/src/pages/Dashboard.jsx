import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  MagnifyingGlass, 
  Funnel, 
  Calendar,
  CaretRight,
  Ticket as TicketIcon,
  Clock,
  CheckCircle,
  Spinner,
  ArrowRight,
  Paperclip,
  X
} from '@phosphor-icons/react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { ticketAPI, STATUS_CONFIG, ROLE_CONFIG } from '../services/api';
import { Layout } from '../components/layout';
import { Button, Modal, Input, Textarea, Select, StatusBadge, SkeletonCard } from '../components/ui';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, isAdmin, isResolver } = useAuth();
  const toast = useToast();

  const [tickets, setTickets] = useState([]);
  const [resolvers, setResolvers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showNewTicket, setShowNewTicket] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // New ticket form
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    assignedToId: '',
    attachmentUrls: []
  });
  const [ticketErrors, setTicketErrors] = useState({});
  const [newAttachmentUrl, setNewAttachmentUrl] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [ticketsData, resolversData] = await Promise.all([
        ticketAPI.getTickets(),
        isAdmin || isResolver ? ticketAPI.getResolvers().catch(() => []) : Promise.resolve([])
      ]);
      setTickets(ticketsData);
      setResolvers(resolversData);
    } catch (error) {
      toast.error('Erro ao carregar tickets');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter logic
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          ticket.title.toLowerCase().includes(query) ||
          ticket.description.toLowerCase().includes(query) ||
          ticket.id.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && ticket.status !== parseInt(statusFilter)) {
        return false;
      }

      // Date filter
      if (dateFilter !== 'all') {
        const ticketDate = new Date(ticket.createdAt);
        const now = new Date();
        
        switch (dateFilter) {
          case 'today':
            if (ticketDate.toDateString() !== now.toDateString()) return false;
            break;
          case 'week':
            const weekAgo = new Date(now);
            weekAgo.setDate(now.getDate() - 7);
            if (ticketDate < weekAgo) return false;
            break;
          case 'month':
            const monthAgo = new Date(now);
            monthAgo.setMonth(now.getMonth() - 1);
            if (ticketDate < monthAgo) return false;
            break;
        }
      }

      return true;
    });
  }, [tickets, searchQuery, statusFilter, dateFilter]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: tickets.length,
      pending: tickets.filter(t => t.status === 0).length,
      inProgress: tickets.filter(t => t.status === 1).length,
      resolved: tickets.filter(t => t.status === 3).length,
    };
  }, [tickets]);

  const validateNewTicket = () => {
    const errors = {};
    if (!newTicket.title.trim()) errors.title = 'Título é obrigatório';
    if (!newTicket.description.trim()) errors.description = 'Descrição é obrigatória';
    setTicketErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!validateNewTicket()) return;

    setIsCreating(true);
    try {
      const attachmentUrlsString = newTicket.attachmentUrls.length > 0 
        ? newTicket.attachmentUrls.join(',') 
        : null;
      const created = await ticketAPI.createTicket(
        newTicket.title,
        newTicket.description,
        newTicket.assignedToId || null,
        attachmentUrlsString
      );
      setTickets(prev => [created, ...prev]);
      setShowNewTicket(false);
      setNewTicket({ title: '', description: '', assignedToId: '', attachmentUrls: [] });
      setNewAttachmentUrl('');
      toast.success('Ticket criado com sucesso!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao criar ticket');
    } finally {
      setIsCreating(false);
    }
  };

  const handleAddAttachment = () => {
    if (newAttachmentUrl.trim()) {
      setNewTicket(prev => ({
        ...prev,
        attachmentUrls: [...prev.attachmentUrls, newAttachmentUrl.trim()]
      }));
      setNewAttachmentUrl('');
    }
  };

  const handleRemoveAttachment = (index) => {
    setNewTicket(prev => ({
      ...prev,
      attachmentUrls: prev.attachmentUrls.filter((_, i) => i !== index)
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', { 
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-PT', { 
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusOptions = [
    { value: 'all', label: 'Todos os estados' },
    { value: '0', label: 'Pendente' },
    { value: '1', label: 'Em Progresso' },
    { value: '2', label: 'Análise Final' },
    { value: '3', label: 'Resolvido' },
  ];

  const dateOptions = [
    { value: 'all', label: 'Todas as datas' },
    { value: 'today', label: 'Hoje' },
    { value: 'week', label: 'Última semana' },
    { value: 'month', label: 'Último mês' },
  ];

  const resolverOptions = [
    { value: '', label: 'Sem atribuição' },
    ...resolvers.map(r => ({ value: r.id, label: r.name }))
  ];

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-dark-100">Dashboard</h1>
            <p className="text-sm text-dark-400 mt-1">
              Bem-vindo, {user?.name}
            </p>
          </div>
          <Button icon={Plus} onClick={() => setShowNewTicket(true)}>
            Novo Ticket
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard 
            label="Total" 
            value={stats.total} 
            icon={TicketIcon}
            color="text-dark-100"
          />
          <StatCard 
            label="Pendentes" 
            value={stats.pending} 
            icon={Clock}
            color="text-status-pending"
          />
          <StatCard 
            label="Em Progresso" 
            value={stats.inProgress} 
            icon={Spinner}
            color="text-status-progress"
          />
          <StatCard 
            label="Resolvidos" 
            value={stats.resolved} 
            icon={CheckCircle}
            color="text-status-resolved"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
            <input
              type="text"
              placeholder="Pesquisar tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-10 pr-3 rounded-md bg-dark-800 border border-dark-700 text-sm text-dark-100 placeholder-dark-500 focus:outline-none focus:border-accent"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Funnel className="w-4 h-4 text-dark-500" />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions}
              className="w-44"
            />
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-dark-500" />
            <Select
              value={dateFilter}
              onChange={setDateFilter}
              options={dateOptions}
              className="w-40"
            />
          </div>
        </div>

        {/* Tickets Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-12">
            <TicketIcon className="w-12 h-12 text-dark-700 mx-auto mb-3" />
            <p className="text-dark-400">Nenhum ticket encontrado</p>
            <Button 
              variant="ghost" 
              className="mt-4" 
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setDateFilter('all');
              }}
            >
              Limpar filtros
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTickets.map(ticket => (
              <TicketCard 
                key={ticket.id} 
                ticket={ticket} 
                onClick={() => navigate(`/ticket/${ticket.id}`)}
                formatDate={formatDate}
                formatTime={formatTime}
              />
            ))}
          </div>
        )}
      </div>

      {/* New Ticket Modal */}
      <Modal
        isOpen={showNewTicket}
        onClose={() => setShowNewTicket(false)}
        title="Novo Ticket"
        size="lg"
      >
        <form onSubmit={handleCreateTicket} className="space-y-4">
          <Input
            label="Título"
            placeholder="Resumo do problema..."
            value={newTicket.title}
            onChange={(e) => setNewTicket(prev => ({ ...prev, title: e.target.value }))}
            error={ticketErrors.title}
          />

          <Textarea
            label="Descrição"
            placeholder="Descreva o problema em detalhe..."
            rows={4}
            value={newTicket.description}
            onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
            error={ticketErrors.description}
          />

          {resolvers.length > 0 && (
            <Select
              label="Atribuir a (opcional)"
              value={newTicket.assignedToId}
              onChange={(value) => setNewTicket(prev => ({ ...prev, assignedToId: value }))}
              options={resolverOptions}
            />
          )}

          {/* Anexos */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-dark-300">
              Anexos (opcional)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Paperclip className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                <input
                  type="url"
                  placeholder="URL do anexo (imagem, documento, etc.)"
                  value={newAttachmentUrl}
                  onChange={(e) => setNewAttachmentUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAttachment();
                    }
                  }}
                  className="w-full h-10 pl-10 pr-3 rounded-md bg-dark-800 border border-dark-700 text-sm text-dark-100 placeholder-dark-500 focus:outline-none focus:border-accent"
                />
              </div>
              <button
                type="button"
                onClick={handleAddAttachment}
                className="px-3 h-10 rounded-md bg-dark-700 text-dark-200 hover:bg-dark-600 text-sm transition-colors"
              >
                Adicionar
              </button>
            </div>
            {newTicket.attachmentUrls.length > 0 && (
              <div className="space-y-2 mt-2">
                {newTicket.attachmentUrls.map((url, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-dark-800 rounded-md border border-dark-700">
                    <Paperclip className="w-4 h-4 text-dark-500 shrink-0" />
                    <a 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 text-xs text-accent hover:underline truncate"
                    >
                      {url}
                    </a>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(index)}
                      className="p-1 text-dark-500 hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowNewTicket(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={isCreating}
              className="flex-1"
            >
              Criar Ticket
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-dark-900 border border-dark-800 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className={`w-9 h-9 rounded-lg bg-dark-800 flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" weight="fill" />
        </div>
        <span className={`text-2xl font-semibold tabular-nums ${color}`}>{value}</span>
      </div>
      <p className="text-sm text-dark-400 mt-2">{label}</p>
    </div>
  );
}

function TicketCard({ ticket, onClick, formatDate, formatTime }) {
  const roleConfig = ROLE_CONFIG[ticket.reporter?.role] || { label: 'User', color: 'text-dark-400' };

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-dark-900 border border-dark-800 rounded-lg p-4 hover:border-dark-700 hover:bg-dark-850 transition-all duration-150 group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="font-mono text-xs text-dark-500 tabular-nums">
          #{ticket.id.slice(0, 8)}
        </span>
        <StatusBadge status={ticket.status} size="sm" />
      </div>

      <h3 className="font-medium text-dark-100 line-clamp-1 group-hover:text-accent transition-colors">
        {ticket.title}
      </h3>
      <p className="text-sm text-dark-400 line-clamp-2 mt-1">
        {ticket.description}
      </p>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-dark-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-dark-700 flex items-center justify-center text-xs font-medium text-dark-300">
            {ticket.reporter?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <span className="text-xs text-dark-400">{ticket.reporter?.name}</span>
        </div>
        <div className="flex items-center gap-1.5 text-dark-500">
          <span className="text-xs tabular-nums">{formatDate(ticket.createdAt)}</span>
          <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </button>
  );
}
