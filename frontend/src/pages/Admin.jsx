import { useState, useEffect } from 'react';
import { 
  Users,
  UserCheck,
  Key,
  ShieldCheck,
  DotsThree,
  MagnifyingGlass,
  Copy,
  CheckCircle,
  Warning
} from '@phosphor-icons/react';
import { useToast } from '../contexts/ToastContext';
import { ticketAPI, ROLE_CONFIG, ROLE_VALUES } from '../services/api';
import { Layout } from '../components/layout';
import { Button, Modal, Select, SkeletonTable } from '../components/ui';

export default function AdminPage() {
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Action modals
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [newRole, setNewRole] = useState(1);
  const [tempPassword, setTempPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await ticketAPI.getUsers();
      setUsers(data);
    } catch (error) {
      toast.error('Erro ao carregar utilizadores');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!user.name.toLowerCase().includes(query) && 
          !user.email.toLowerCase().includes(query)) {
        return false;
      }
    }
    if (roleFilter !== 'all' && user.role !== roleFilter) {
      return false;
    }
    return true;
  });

  const handleApproveUser = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      await ticketAPI.approveUser(selectedUser.id);
      setUsers(prev => prev.map(u => 
        u.id === selectedUser.id ? { ...u, isApproved: true } : u
      ));
      toast.success(`${selectedUser.name} aprovado com sucesso`);
      setShowApproveModal(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao aprovar utilizador');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeRole = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      await ticketAPI.updateUserRole(selectedUser.id, newRole);
      const roleLabel = Object.entries(ROLE_VALUES).find(([, v]) => v === newRole)?.[0] || 'User';
      setUsers(prev => prev.map(u => 
        u.id === selectedUser.id ? { ...u, role: roleLabel } : u
      ));
      toast.success('Role alterado com sucesso');
      setShowRoleModal(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao alterar role');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      const result = await ticketAPI.resetUserPassword(selectedUser.id);
      setTempPassword(result.temporaryPassword);
      toast.success('Password resetada com sucesso');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao resetar password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(tempPassword);
    toast.success('Password copiada para clipboard');
  };

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setNewRole(ROLE_VALUES[user.role] ?? 1);
    setShowRoleModal(true);
  };

  const openResetModal = (user) => {
    setSelectedUser(user);
    setTempPassword('');
    setShowResetModal(true);
  };

  const openApproveModal = (user) => {
    setSelectedUser(user);
    setShowApproveModal(true);
  };

  const roleOptions = [
    { value: 'all', label: 'Todos os roles' },
    { value: 'Admin', label: 'Admin' },
    { value: 'UserReport', label: 'Reporter' },
    { value: 'UserResolve', label: 'Resolver' },
  ];

  const roleSelectOptions = [
    { value: ROLE_VALUES.Admin, label: 'Administrador' },
    { value: ROLE_VALUES.UserReport, label: 'Reporter' },
    { value: ROLE_VALUES.UserResolve, label: 'Resolver' },
  ];

  // Stats
  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'Admin').length,
    resolvers: users.filter(u => u.role === 'UserResolve').length,
    reporters: users.filter(u => u.role === 'UserReport').length,
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-dark-100">Gestão de Utilizadores</h1>
            <p className="text-sm text-dark-400 mt-1">
              Gerir contas, permissões e aprovações
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Total" value={stats.total} icon={Users} />
          <StatCard label="Admins" value={stats.admins} icon={ShieldCheck} color="text-status-analysis" />
          <StatCard label="Resolvers" value={stats.resolvers} icon={UserCheck} color="text-status-progress" />
          <StatCard label="Reporters" value={stats.reporters} icon={Users} color="text-status-pending" />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
            <input
              type="text"
              placeholder="Pesquisar utilizadores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-10 pr-3 rounded-md bg-dark-800 border border-dark-700 text-sm text-dark-100 placeholder-dark-500 focus:outline-none focus:border-accent"
            />
          </div>
          
          <Select
            value={roleFilter}
            onChange={setRoleFilter}
            options={roleOptions}
            className="w-40"
          />
        </div>

        {/* Users Table */}
        <div className="bg-dark-900 border border-dark-800 rounded-lg overflow-hidden">
          {isLoading ? (
            <SkeletonTable rows={5} cols={5} />
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-dark-700 mx-auto mb-3" />
              <p className="text-dark-400">Nenhum utilizador encontrado</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-800 text-left">
                  <th className="px-4 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">
                    Utilizador
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider text-right">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800">
                {filteredUsers.map(user => {
                  const roleConfig = ROLE_CONFIG[user.role] || { label: 'User', color: 'text-dark-400' };
                  const isApproved = user.isApproved !== false; // Default to true if not specified

                  return (
                    <tr key={user.id} className="hover:bg-dark-850 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center text-sm font-medium text-dark-300">
                            {user.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <span className="text-sm font-medium text-dark-100">
                            {user.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-dark-300 font-mono">
                          {user.email}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-medium ${roleConfig.color}`}>
                          {roleConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-status-resolved">
                            <CheckCircle className="w-3.5 h-3.5" weight="fill" />
                            Aprovado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs text-status-pending">
                            <Warning className="w-3.5 h-3.5" weight="fill" />
                            Pendente
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {!isApproved && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openApproveModal(user)}
                              className="text-status-resolved"
                            >
                              <UserCheck className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openRoleModal(user)}
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openResetModal(user)}
                          >
                            <Key className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Approve Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Aprovar Utilizador"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-dark-300">
            Tem a certeza que deseja aprovar o utilizador <strong className="text-dark-100">{selectedUser?.name}</strong>?
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowApproveModal(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleApproveUser}
              isLoading={isSubmitting}
              className="flex-1"
            >
              Aprovar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Role Modal */}
      <Modal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        title="Alterar Role"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-dark-300">
            Alterar role de <strong className="text-dark-100">{selectedUser?.name}</strong>
          </p>
          <Select
            label="Novo Role"
            value={newRole}
            onChange={setNewRole}
            options={roleSelectOptions}
          />
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowRoleModal(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleChangeRole}
              isLoading={isSubmitting}
              className="flex-1"
            >
              Alterar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Reset de Password"
        size="sm"
      >
        <div className="space-y-4">
          {tempPassword ? (
            <>
              <p className="text-sm text-dark-300">
                Password temporária para <strong className="text-dark-100">{selectedUser?.name}</strong>:
              </p>
              <div className="flex items-center gap-2 p-3 bg-dark-800 rounded-md border border-dark-700">
                <code className="flex-1 text-sm font-mono text-accent">
                  {tempPassword}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyPassword}
                  icon={Copy}
                />
              </div>
              <Button
                onClick={() => setShowResetModal(false)}
                className="w-full"
              >
                Fechar
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-dark-300">
                Tem a certeza que deseja resetar a password de <strong className="text-dark-100">{selectedUser?.name}</strong>?
              </p>
              <p className="text-xs text-dark-500">
                Uma password temporária será gerada e deve ser comunicada ao utilizador.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowResetModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  variant="danger"
                  onClick={handleResetPassword}
                  isLoading={isSubmitting}
                  className="flex-1"
                >
                  Resetar
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </Layout>
  );
}

function StatCard({ label, value, icon: Icon, color = 'text-dark-100' }) {
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
