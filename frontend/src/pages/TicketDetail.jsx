import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  PaperPlaneTilt,
  Clock,
  User,
  CalendarBlank,
  ArrowRight,
  Spinner,
  MagnifyingGlass,
  CheckCircle,
  Paperclip,
  LinkSimple,
  UserCirclePlus,
  X,
  File
} from '@phosphor-icons/react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { ticketAPI, STATUS_CONFIG, ROLE_CONFIG } from '../services/api';
import { Layout } from '../components/layout';
import { Button, StatusBadge, Select, SkeletonMessage } from '../components/ui';

export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, canChangeStatus, isAdmin } = useAuth();
  const toast = useToast();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [showAttachmentInput, setShowAttachmentInput] = useState(false);
  const [resolvers, setResolvers] = useState([]);

  // Track status changes for timeline
  const [statusHistory, setStatusHistory] = useState([]);

  useEffect(() => {
    loadTicket();
    if (isAdmin) {
      loadResolvers();
    }
  }, [id]);

  const loadResolvers = async () => {
    try {
      const data = await ticketAPI.getResolvers();
      setResolvers(data);
    } catch (error) {
      console.error('Erro ao carregar resolvers:', error);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [ticket?.messages]);

  const loadTicket = async () => {
    setIsLoading(true);
    try {
      const data = await ticketAPI.getTicket(id);
      setTicket(data);
      // Initialize status history with creation
      setStatusHistory([{
        status: 0,
        timestamp: data.createdAt,
        label: 'Ticket criado'
      }]);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao carregar ticket');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSending(true);
    try {
      const message = await ticketAPI.addMessage(
        ticket.id, 
        newMessage.trim(),
        attachmentUrl.trim() || null
      );
      setTicket(prev => ({
        ...prev,
        messages: [...prev.messages, message]
      }));
      setNewMessage('');
      setAttachmentUrl('');
      toast.success('Mensagem enviada');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao enviar mensagem');
    } finally {
      setIsSending(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === ticket.status) return;

    setIsUpdatingStatus(true);
    try {
      const updated = await ticketAPI.updateTicketStatus(ticket.id, newStatus);
      setTicket(updated);
      
      // Add to status history
      setStatusHistory(prev => [...prev, {
        status: newStatus,
        timestamp: new Date().toISOString(),
        label: `Estado alterado para ${STATUS_CONFIG[newStatus].label}`
      }]);
      
      toast.success(`Estado alterado para ${STATUS_CONFIG[newStatus].label}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao alterar estado');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAssignTicket = async (assignedToId) => {
    setIsAssigning(true);
    try {
      const updated = await ticketAPI.assignTicket(ticket.id, assignedToId || null);
      setTicket(updated);
      toast.success(assignedToId ? 'Ticket atribuído com sucesso!' : 'Atribuição removida');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao atribuir ticket');
    } finally {
      setIsAssigning(false);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getNextStatus = (currentStatus) => {
    if (currentStatus >= 3) return null;
    return currentStatus + 1;
  };

  // Build timeline items (status changes + messages)
  const buildTimeline = () => {
    const items = [];
    
    // Add creation
    items.push({
      type: 'status',
      status: 0,
      timestamp: ticket?.createdAt,
      label: 'Ticket criado'
    });

    // Add messages and status changes
    ticket?.messages?.forEach(msg => {
      items.push({
        type: 'message',
        ...msg
      });
    });

    // Add current status if different from created
    if (ticket?.status > 0) {
      items.push({
        type: 'status',
        status: ticket.status,
        timestamp: ticket.status === 3 ? ticket.closedAt : new Date().toISOString(),
        label: ticket.status === 3 ? 'Ticket resolvido' : `Em ${STATUS_CONFIG[ticket.status].label}`
      });
    }

    return items.sort((a, b) => new Date(a.timestamp || a.createdAt) - new Date(b.timestamp || b.createdAt));
  };

  const statusOptions = [
    { value: 0, label: 'Pendente' },
    { value: 1, label: 'Em Progresso' },
    { value: 2, label: 'Análise Final' },
    { value: 3, label: 'Resolvido' },
  ];

  const availableStatusOptions = isAdmin 
    ? statusOptions 
    : statusOptions.filter(opt => opt.value === ticket?.status || opt.value === getNextStatus(ticket?.status));

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <Spinner className="w-8 h-8 text-accent animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!ticket) return null;

  const timeline = buildTimeline();

  return (
    <Layout>
      <div className="h-screen flex flex-col">
        {/* Header */}
        <header className="shrink-0 px-6 py-4 border-b border-dark-800 bg-dark-900">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-md text-dark-400 hover:text-dark-100 hover:bg-dark-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-dark-500 tabular-nums">
                  #{ticket.id.slice(0, 8)}
                </span>
                <StatusBadge status={ticket.status} />
              </div>
              <h1 className="text-lg font-semibold text-dark-100 truncate mt-1">
                {ticket.title}
              </h1>
            </div>
            {canChangeStatus && (
              <Select
                value={ticket.status}
                onChange={(value) => handleStatusChange(parseInt(value))}
                options={availableStatusOptions}
                disabled={isUpdatingStatus}
                className="w-44"
              />
            )}
          </div>
        </header>

        {/* Main Content - 2 Columns */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Column - Ticket Info */}
          <div className="w-80 shrink-0 border-r border-dark-800 overflow-y-auto p-6 space-y-6">
            {/* Description */}
            <section>
              <h3 className="text-xs font-medium text-dark-500 uppercase tracking-wider mb-3">
                Descrição
              </h3>
              <p className="text-sm text-dark-200 leading-relaxed">
                {ticket.description}
              </p>
            </section>

            {/* Ticket Attachments */}
            {ticket.attachmentUrls && (
              <section>
                <h3 className="text-xs font-medium text-dark-500 uppercase tracking-wider mb-3">
                  Anexos do Ticket
                </h3>
                <div className="space-y-2">
                  {ticket.attachmentUrls.split(',').map((url, index) => (
                    <a
                      key={index}
                      href={url.trim()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 bg-dark-800 rounded-md border border-dark-700 hover:border-accent transition-colors"
                    >
                      <File className="w-4 h-4 text-accent shrink-0" />
                      <span className="text-xs text-dark-200 truncate">
                        Anexo {index + 1}
                      </span>
                      <Paperclip className="w-3 h-3 text-dark-500 ml-auto" />
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Admin Assignment Section */}
            {isAdmin && (
              <section>
                <h3 className="text-xs font-medium text-dark-500 uppercase tracking-wider mb-3">
                  <span className="flex items-center gap-2">
                    <UserCirclePlus className="w-4 h-4" />
                    Atribuir Ticket
                  </span>
                </h3>
                <div className="space-y-2">
                  <Select
                    value={ticket.assignedTo?.id || ''}
                    onChange={(value) => handleAssignTicket(value)}
                    options={[
                      { value: '', label: 'Sem atribuição' },
                      ...resolvers.map(r => ({ value: r.id, label: `${r.name} (${ROLE_CONFIG[r.role]?.label || r.role})` }))
                    ]}
                    disabled={isAssigning}
                  />
                  {ticket.assignedTo && (
                    <button
                      onClick={() => handleAssignTicket(null)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-red-400 bg-red-500/10 rounded-md hover:bg-red-500/20 transition-colors"
                      disabled={isAssigning}
                    >
                      <X className="w-3 h-3" />
                      Remover atribuição
                    </button>
                  )}
                </div>
              </section>
            )}

            {/* Reporter */}
            <section>
              <h3 className="text-xs font-medium text-dark-500 uppercase tracking-wider mb-3">
                Reportado por
              </h3>
              <UserInfo user={ticket.reporter} />
            </section>

            {/* Assigned To */}
            {ticket.assignedTo && (
              <section>
                <h3 className="text-xs font-medium text-dark-500 uppercase tracking-wider mb-3">
                  Atribuído a
                </h3>
                <UserInfo user={ticket.assignedTo} />
              </section>
            )}

            {/* Dates */}
            <section>
              <h3 className="text-xs font-medium text-dark-500 uppercase tracking-wider mb-3">
                Datas
              </h3>
              <div className="space-y-2">
                <DateItem 
                  label="Criado" 
                  date={ticket.createdAt} 
                  formatDateTime={formatDateTime}
                />
                {ticket.closedAt && (
                  <DateItem 
                    label="Resolvido" 
                    date={ticket.closedAt} 
                    formatDateTime={formatDateTime}
                  />
                )}
              </div>
            </section>

            {/* Status Timeline */}
            <section>
              <h3 className="text-xs font-medium text-dark-500 uppercase tracking-wider mb-3">
                Histórico de Estado
              </h3>
              <div className="space-y-3">
                {[0, 1, 2, 3].map((status) => {
                  const config = STATUS_CONFIG[status];
                  const isActive = ticket.status >= status;
                  const isCurrent = ticket.status === status;
                  
                  return (
                    <div 
                      key={status}
                      className={`flex items-center gap-3 ${isActive ? 'opacity-100' : 'opacity-40'}`}
                    >
                      <div className={`w-2 h-2 rounded-full ${isActive ? config.bgColor : 'bg-dark-700'} ${isCurrent ? 'ring-2 ring-offset-2 ring-offset-dark-900' : ''}`} 
                        style={{ borderColor: isActive ? 'currentColor' : undefined }}
                      />
                      <span className={`text-sm ${isCurrent ? config.textColor : 'text-dark-400'}`}>
                        {config.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Right Column - Chat/Timeline */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Messages */}
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 chat-scroll"
            >
              {timeline.map((item, index) => (
                item.type === 'status' ? (
                  <StatusLogEntry 
                    key={`status-${index}`}
                    status={item.status}
                    timestamp={item.timestamp}
                    label={item.label}
                    formatDateTime={formatDateTime}
                  />
                ) : (
                  <MessageBubble 
                    key={item.id}
                    message={item}
                    isOwn={item.user?.id === user?.id}
                    formatDateTime={formatDateTime}
                  />
                )
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form 
              onSubmit={handleSendMessage}
              className="shrink-0 p-4 border-t border-dark-800 bg-dark-900"
            >
              {/* Attachment URL input - collapsible */}
              {showAttachmentInput && (
                <div className="flex items-center gap-2 mb-3 animate-in slide-in-from-top-2 duration-200">
                  <LinkSimple className="w-4 h-4 text-dark-500 shrink-0" />
                  <input
                    type="url"
                    placeholder="Cole aqui a URL do anexo (imagem, documento, etc.)"
                    value={attachmentUrl}
                    onChange={(e) => setAttachmentUrl(e.target.value)}
                    className="flex-1 h-9 px-3 text-sm bg-dark-800 border border-dark-700 rounded-md text-dark-200 placeholder-dark-500 focus:outline-none focus:border-accent"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowAttachmentInput(false);
                      setAttachmentUrl('');
                    }}
                    className="p-2 text-dark-500 hover:text-dark-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Attachment preview */}
              {attachmentUrl && (
                <div className="flex items-center gap-2 mb-2 px-2 py-1.5 bg-accent/10 border border-accent/20 rounded-md">
                  <Paperclip className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span className="text-xs text-accent truncate flex-1">{attachmentUrl}</span>
                  <button
                    type="button"
                    onClick={() => setAttachmentUrl('')}
                    className="p-1 text-accent/60 hover:text-accent transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              
              <div className="flex items-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAttachmentInput(!showAttachmentInput)}
                  className={`p-2.5 rounded-md transition-colors ${
                    showAttachmentInput || attachmentUrl
                      ? 'bg-accent/10 text-accent' 
                      : 'bg-dark-800 text-dark-400 hover:text-dark-200 hover:bg-dark-700'
                  }`}
                  title="Adicionar anexo"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  placeholder="Escreva uma mensagem..."
                  rows={2}
                  className="flex-1 px-3 py-2 bg-dark-800 border border-dark-700 rounded-md text-sm text-dark-100 placeholder-dark-500 resize-none focus:outline-none focus:border-accent"
                />
                <Button
                  type="submit"
                  isLoading={isSending}
                  disabled={!newMessage.trim()}
                  icon={PaperPlaneTilt}
                >
                  Enviar
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function UserInfo({ user }) {
  const roleConfig = ROLE_CONFIG[user?.role] || { label: 'User', color: 'text-dark-400' };
  
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-dark-700 flex items-center justify-center text-sm font-medium text-dark-300">
        {user?.name?.charAt(0)?.toUpperCase() || '?'}
      </div>
      <div>
        <p className="text-sm font-medium text-dark-100">{user?.name}</p>
        <p className={`text-xs ${roleConfig.color}`}>{roleConfig.label}</p>
      </div>
    </div>
  );
}

function DateItem({ label, date, formatDateTime }) {
  const { date: dateStr, time } = formatDateTime(date);
  
  return (
    <div className="flex items-center gap-3">
      <CalendarBlank className="w-4 h-4 text-dark-500" />
      <div>
        <p className="text-sm text-dark-200">{label}</p>
        <p className="text-xs text-dark-500 tabular-nums">{dateStr} às {time}</p>
      </div>
    </div>
  );
}

function StatusLogEntry({ status, timestamp, label, formatDateTime }) {
  const config = STATUS_CONFIG[status];
  const { date, time } = formatDateTime(timestamp);
  const icons = {
    0: Clock,
    1: Spinner,
    2: MagnifyingGlass,
    3: CheckCircle,
  };
  const Icon = icons[status] || Clock;

  return (
    <div className="flex items-center justify-center gap-3 py-2">
      <div className="flex-1 h-px bg-dark-800" />
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bgColor} border border-current/10`}>
        <Icon className={`w-3.5 h-3.5 ${config.textColor}`} weight="bold" />
        <span className={`text-xs font-medium ${config.textColor}`}>{label}</span>
        <span className="text-xs text-dark-500 tabular-nums">{time}</span>
      </div>
      <div className="flex-1 h-px bg-dark-800" />
    </div>
  );
}

function MessageBubble({ message, isOwn, formatDateTime }) {
  const { date, time } = formatDateTime(message.createdAt);
  const roleConfig = ROLE_CONFIG[message.user?.role] || { label: 'User', color: 'text-dark-400' };

  return (
    <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
      <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center text-xs font-medium text-dark-300 shrink-0">
        {message.user?.name?.charAt(0)?.toUpperCase() || '?'}
      </div>
      <div className={`max-w-md ${isOwn ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-dark-200">{message.user?.name}</span>
          <span className={`text-2xs ${roleConfig.color}`}>{roleConfig.label}</span>
          <span className="text-xs text-dark-500 tabular-nums">{time}</span>
        </div>
        <div className={`px-4 py-2.5 rounded-lg ${isOwn ? 'bg-accent/10 border border-accent/20' : 'bg-dark-800 border border-dark-700'}`}>
          <p className="text-sm text-dark-100 whitespace-pre-wrap">{message.content}</p>
          {message.attachmentUrl && (
            <a 
              href={message.attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 mt-2 text-xs text-accent hover:underline"
            >
              <Paperclip className="w-3 h-3" />
              Ver anexo
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
