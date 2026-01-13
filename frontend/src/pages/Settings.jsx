import { useState } from 'react';
import { 
  User,
  EnvelopeSimple,
  Lock,
  ShieldCheck,
  CheckCircle
} from '@phosphor-icons/react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { ticketAPI, ROLE_CONFIG } from '../services/api';
import { Layout } from '../components/layout';
import { Button, Input } from '../components/ui';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const roleConfig = ROLE_CONFIG[user?.role] || { label: 'User', color: 'text-dark-400' };

  // Email form
  const [emailForm, setEmailForm] = useState({ email: user?.email || '' });
  const [emailErrors, setEmailErrors] = useState({});
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const validateEmail = () => {
    const errors = {};
    if (!emailForm.email) errors.email = 'Email é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(emailForm.email)) errors.email = 'Email inválido';
    setEmailErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePassword = () => {
    const errors = {};
    if (!passwordForm.currentPassword) errors.currentPassword = 'Password atual é obrigatória';
    if (!passwordForm.newPassword) errors.newPassword = 'Nova password é obrigatória';
    else if (passwordForm.newPassword.length < 6) errors.newPassword = 'Mínimo 6 caracteres';
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords não coincidem';
    }
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    if (!validateEmail()) return;
    if (emailForm.email === user?.email) {
      toast.info('Email não foi alterado');
      return;
    }

    setIsSavingEmail(true);
    try {
      await ticketAPI.updateEmail(emailForm.email);
      updateUser({ email: emailForm.email });
      toast.success('Email atualizado com sucesso');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao atualizar email');
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    setIsSavingPassword(true);
    try {
      await ticketAPI.updatePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password atualizada com sucesso');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao atualizar password');
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <Layout>
      <div className="p-6 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-dark-100">Definições</h1>
          <p className="text-sm text-dark-400 mt-1">
            Gerir informações da conta
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-dark-900 border border-dark-800 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-dark-700 flex items-center justify-center text-2xl font-semibold text-dark-300">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-dark-100">{user?.name}</h2>
              <p className="text-sm text-dark-400">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <ShieldCheck className={`w-4 h-4 ${roleConfig.color}`} weight="fill" />
                <span className={`text-sm ${roleConfig.color}`}>{roleConfig.label}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Email Section */}
          <section className="bg-dark-900 border border-dark-800 rounded-lg p-6">
            <h3 className="text-lg font-medium text-dark-100 mb-4 flex items-center gap-2">
              <EnvelopeSimple className="w-5 h-5 text-dark-400" />
              Alterar Email
            </h3>
            <form onSubmit={handleUpdateEmail} className="space-y-4">
              <Input
                label="Novo Email"
                type="email"
                icon={EnvelopeSimple}
                placeholder="novo@email.com"
                value={emailForm.email}
                onChange={(e) => setEmailForm({ email: e.target.value })}
                error={emailErrors.email}
              />
              <Button
                type="submit"
                isLoading={isSavingEmail}
                icon={CheckCircle}
              >
                Guardar Email
              </Button>
            </form>
          </section>

          {/* Password Section */}
          <section className="bg-dark-900 border border-dark-800 rounded-lg p-6">
            <h3 className="text-lg font-medium text-dark-100 mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-dark-400" />
              Alterar Password
            </h3>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <Input
                label="Password Atual"
                type="password"
                icon={Lock}
                placeholder="••••••••"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                error={passwordErrors.currentPassword}
              />
              <Input
                label="Nova Password"
                type="password"
                icon={Lock}
                placeholder="Mínimo 6 caracteres"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                error={passwordErrors.newPassword}
              />
              <Input
                label="Confirmar Nova Password"
                type="password"
                icon={Lock}
                placeholder="Repetir nova password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                error={passwordErrors.confirmPassword}
              />
              <Button
                type="submit"
                isLoading={isSavingPassword}
                icon={CheckCircle}
              >
                Alterar Password
              </Button>
            </form>
          </section>

          {/* Account Info */}
          <section className="bg-dark-900 border border-dark-800 rounded-lg p-6">
            <h3 className="text-lg font-medium text-dark-100 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-dark-400" />
              Informações da Conta
            </h3>
            <div className="space-y-3">
              <InfoRow label="ID" value={user?.id} mono />
              <InfoRow label="Nome" value={user?.name} />
              <InfoRow label="Role" value={roleConfig.label} />
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}

function InfoRow({ label, value, mono = false }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-dark-800 last:border-0">
      <span className="text-sm text-dark-400">{label}</span>
      <span className={`text-sm text-dark-200 ${mono ? 'font-mono text-xs' : ''}`}>
        {value}
      </span>
    </div>
  );
}
