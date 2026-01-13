import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { EnvelopeSimple, Lock, User, Code, UserPlus } from '@phosphor-icons/react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Button, Input, Modal, Select } from '../components/ui';
import { ROLE_VALUES } from '../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const toast = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  
  // Login form
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginErrors, setLoginErrors] = useState({});

  // Register form
  const [registerForm, setRegisterForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    role: ROLE_VALUES.UserReport 
  });
  const [registerErrors, setRegisterErrors] = useState({});

  const from = location.state?.from?.pathname || '/';

  const validateLogin = () => {
    const errors = {};
    if (!loginForm.email) errors.email = 'Email é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(loginForm.email)) errors.email = 'Email inválido';
    if (!loginForm.password) errors.password = 'Password é obrigatória';
    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRegister = () => {
    const errors = {};
    if (!registerForm.name) errors.name = 'Nome é obrigatório';
    if (!registerForm.email) errors.email = 'Email é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(registerForm.email)) errors.email = 'Email inválido';
    if (!registerForm.password) errors.password = 'Password é obrigatória';
    else if (registerForm.password.length < 6) errors.password = 'Mínimo 6 caracteres';
    if (registerForm.password !== registerForm.confirmPassword) {
      errors.confirmPassword = 'Passwords não coincidem';
    }
    setRegisterErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;

    setIsLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
      toast.success('Login efetuado com sucesso!');
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Credenciais inválidas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateRegister()) return;

    setIsLoading(true);
    try {
      await register(registerForm.name, registerForm.email, registerForm.password, registerForm.role);
      toast.success('Registo efetuado com sucesso!');
      setShowRegister(false);
      navigate('/', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao registar');
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = [
    { value: ROLE_VALUES.UserReport, label: 'Reporter - Reportar tickets' },
    { value: ROLE_VALUES.UserResolve, label: 'Resolver - Resolver tickets' },
  ];

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4">
            <Code className="w-7 h-7 text-accent" weight="bold" />
          </div>
          <h1 className="text-xl font-semibold text-dark-100">Elder Fernandes</h1>
          <p className="text-sm text-dark-400 mt-1">Tech Solutions | Ticket System</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="bg-dark-900 border border-dark-800 rounded-lg p-6 space-y-4">
            <Input
              label="Email"
              type="email"
              icon={EnvelopeSimple}
              placeholder="user@example.com"
              value={loginForm.email}
              onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
              error={loginErrors.email}
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              value={loginForm.password}
              onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
              error={loginErrors.password}
              autoComplete="current-password"
            />

            <Button 
              type="submit" 
              isLoading={isLoading} 
              className="w-full"
            >
              Entrar
            </Button>
          </div>
        </form>

        {/* Register Link */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setShowRegister(true)}
            className="text-sm text-dark-400 hover:text-accent transition-colors inline-flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Criar nova conta
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-dark-600 mt-8">
          © 2026 Elder Fernandes | Tech Solutions
        </p>
      </div>

      {/* Register Modal */}
      <Modal
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
        title="Criar Conta"
        size="md"
      >
        <form onSubmit={handleRegister} className="space-y-4">
          <Input
            label="Nome"
            icon={User}
            placeholder="João Silva"
            value={registerForm.name}
            onChange={(e) => setRegisterForm(prev => ({ ...prev, name: e.target.value }))}
            error={registerErrors.name}
            autoComplete="name"
          />

          <Input
            label="Email"
            type="email"
            icon={EnvelopeSimple}
            placeholder="user@example.com"
            value={registerForm.email}
            onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
            error={registerErrors.email}
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            icon={Lock}
            placeholder="Mínimo 6 caracteres"
            value={registerForm.password}
            onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
            error={registerErrors.password}
            autoComplete="new-password"
          />

          <Input
            label="Confirmar Password"
            type="password"
            icon={Lock}
            placeholder="Repetir password"
            value={registerForm.confirmPassword}
            onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
            error={registerErrors.confirmPassword}
            autoComplete="new-password"
          />

          <Select
            label="Tipo de Conta"
            value={registerForm.role}
            onChange={(value) => setRegisterForm(prev => ({ ...prev, role: value }))}
            options={roleOptions}
          />

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowRegister(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              className="flex-1"
            >
              Registar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
