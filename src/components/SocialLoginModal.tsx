import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Lock, ShieldCheck, HeartHandshake, Image as ImageIcon, Sparkles, 
  AlertCircle, Mail, Key, User as UserIcon, Eye, EyeOff, CheckCircle2, ArrowRight,
  UserPlus, LogIn, Zap
} from 'lucide-react';
import { useFirebase } from '../firebaseContext';
import logoImg from '../assets/images/casa_sandrissima_green_white_logo_1779323893215.png';
import PencilLoader from './PencilLoader';

interface SocialLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
  reason?: 'galeria' | 'doacoes' | 'portal' | 'geral' | 'aluno_apoiador';
  message?: string;
}

export default function SocialLoginModal({
  isOpen,
  onClose,
  onSuccess,
  title,
  reason = 'geral',
  message
}: SocialLoginModalProps) {
  const { loginWithEmail, registerWithEmail, resetPassword } = useFirebase();
  
  // Auth Modes: 'login' | 'register' | 'quick' | 'forgot'
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'quick' | 'forgot'>('login');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  const getReasonConfig = () => {
    switch (reason) {
      case 'aluno_apoiador':
        return {
          badge: 'Portal do Aluno & Apoiador',
          icon: Sparkles,
          defaultTitle: 'Acesso de Alunos e Apoiadores',
          defaultDesc: 'Acesse ou crie sua conta para acompanhar oficinas, presenças, materiais pedagógicos e histórico de apoio na Casa Sandríssima.',
          color: 'text-emerald-700 bg-emerald-50 border-emerald-200'
        };
      case 'galeria':
        return {
          badge: 'Galeria Restrita',
          icon: ImageIcon,
          defaultTitle: 'Acesse a Galeria de Fotos',
          defaultDesc: 'Para preservar a privacidade e o direito de imagem de nossas crianças e voluntários, as fotos são visíveis para membros cadastrados.',
          color: 'text-amber-700 bg-amber-50 border-amber-200'
        };
      case 'doacoes':
        return {
          badge: 'Doação Segura',
          icon: HeartHandshake,
          defaultTitle: 'Autentique-se para Doar',
          defaultDesc: 'Por conformidade de segurança e geração do seu comprovante nominal instantâneo no Banco Central, acesse sua conta.',
          color: 'text-emerald-700 bg-emerald-50 border-emerald-200'
        };
      case 'portal':
        return {
          badge: 'Área do Sistema',
          icon: ShieldCheck,
          defaultTitle: 'Acesso ao Sistema',
          defaultDesc: 'Autentique-se com sua conta de e-mail e senha cadastrados para acessar os recursos da Casa Sandríssima.',
          color: 'text-emerald-700 bg-emerald-50 border-emerald-200'
        };
      case 'geral':
      default:
        return {
          badge: 'Identificação Segura',
          icon: Lock,
          defaultTitle: 'Conectar à Casa Sandríssima',
          defaultDesc: 'Acesse sua conta ou cadastre-se com seu e-mail para navegar com acesso a todas as áreas, fotos e projetos.',
          color: 'text-emerald-700 bg-emerald-50 border-emerald-200'
        };
    }
  };

  const config = getReasonConfig();
  const IconComponent = config.icon;

  // Email & Password Auth handler
  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Por favor, informe seu endereço de e-mail.');
      return;
    }

    // Password reset mode
    if (authMode === 'forgot') {
      setIsSubmitting(true);
      try {
        await resetPassword(cleanEmail);
        setIsSubmitting(false);
        setSuccessMessage(`Um link de redefinição de senha foi enviado para ${cleanEmail}. Verifique sua caixa de entrada e spam.`);
      } catch (err: any) {
        setIsSubmitting(false);
        const code = err?.code || '';
        if (code === 'auth/user-not-found') {
          setErrorMessage('Não encontramos nenhuma conta com este e-mail.');
        } else if (code === 'auth/invalid-email') {
          setErrorMessage('Endereço de e-mail inválido.');
        } else {
          setErrorMessage('Não foi possível enviar o e-mail de redefinição. Tente novamente mais tarde.');
        }
      }
      return;
    }

    // Login or Register validations
    if (!password) {
      setErrorMessage('Por favor, digite sua senha.');
      return;
    }

    if (authMode === 'register') {
      if (!name.trim()) {
        setErrorMessage('Por favor, informe seu nome completo.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('A senha deve conter no mínimo 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('As senhas digitadas não coincidem.');
        return;
      }

      setIsSubmitting(true);
      try {
        await registerWithEmail(cleanEmail, password, name.trim());
        setIsSubmitting(false);
        if (onSuccess) onSuccess();
        handleClose();
      } catch (err: any) {
        setIsSubmitting(false);
        const code = err?.code || '';
        if (code === 'auth/email-already-in-use') {
          setErrorMessage('Este e-mail já está cadastrado. Faça login com ele na aba "Entrar" ou recupere sua senha.');
        } else if (code === 'auth/invalid-email') {
          setErrorMessage('O formato do e-mail é inválido.');
        } else if (code === 'auth/weak-password') {
          setErrorMessage('A senha é muito fraca. Utilize ao menos 6 caracteres.');
        } else {
          setErrorMessage('Falha ao criar sua conta. Verifique os dados digitados e tente novamente.');
        }
      }
    } else {
      // Login mode
      setIsSubmitting(true);
      try {
        await loginWithEmail(cleanEmail, password);
        setIsSubmitting(false);
        if (onSuccess) onSuccess();
        handleClose();
      } catch (err: any) {
        setIsSubmitting(false);
        const code = err?.code || '';
        if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
          setErrorMessage('E-mail ou senha incorretos. Se ainda não possui cadastro, clique na aba "Criar Conta".');
        } else if (code === 'auth/invalid-email') {
          setErrorMessage('O formato do e-mail informado é inválido.');
        } else if (code === 'auth/too-many-requests') {
          setErrorMessage('Muitas tentativas sem sucesso. Aguarde alguns minutos ou redefina sua senha.');
        } else {
          setErrorMessage('Não foi possível realizar o login. Verifique seus dados e tente novamente.');
        }
      }
    }
  };

  // Fast demo / quick login helper for instant testing
  const handleQuickLogin = async (roleEmail: string, rolePass: string, roleName: string) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      try {
        await loginWithEmail(roleEmail, rolePass);
      } catch (loginErr: any) {
        // If not created yet in Firebase Auth, auto-register it
        if (loginErr?.code === 'auth/user-not-found' || loginErr?.code === 'auth/invalid-credential') {
          await registerWithEmail(roleEmail, rolePass, roleName);
        } else {
          throw loginErr;
        }
      }
      setIsSubmitting(false);
      if (onSuccess) onSuccess();
      handleClose();
    } catch (e: any) {
      setIsSubmitting(false);
      console.warn("Quick login error: ", e);
      setErrorMessage(`Não foi possível inicializar o acesso: ${e?.message || 'Erro inesperado'}. Você pode criar uma conta na aba "Criar Conta".`);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto"
        id="unified-auth-modal-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget && !isSubmitting) {
            handleClose();
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-150 p-5 sm:p-7 text-center overflow-hidden my-6 max-h-[92vh] flex flex-col justify-between"
          id="unified-auth-modal-card"
        >
          {/* Close button */}
          {!isSubmitting && (
            <button
              onClick={handleClose}
              id="unified-auth-close-btn"
              className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer z-10"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          {/* Scrollable Container */}
          <div className="overflow-y-auto pr-1">
            {/* Top Logo & Badge */}
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="relative">
                <img
                  src={logoImg}
                  alt="Casa Sandríssima"
                  className="h-13 w-13 rounded-full object-cover border-2 border-emerald-600/30 shadow-md p-0.5 bg-white"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-full shadow-sm">
                  <Sparkles className="h-3 w-3" />
                </div>
              </div>

              <div className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold border ${config.color}`}>
                <IconComponent className="h-3.5 w-3.5" />
                <span>{config.badge}</span>
              </div>

              <h3 className="font-sans font-extrabold text-xl sm:text-2xl text-stone-900 tracking-tight leading-snug" id="unified-auth-title">
                {authMode === 'register' 
                  ? 'Cadastre-se no Site' 
                  : authMode === 'quick'
                    ? 'Acesso Rápido de Testes'
                    : authMode === 'forgot' 
                      ? 'Recuperar Senha' 
                      : (title || config.defaultTitle)}
              </h3>

              <p className="text-stone-600 text-xs leading-relaxed max-w-sm">
                {authMode === 'register'
                  ? 'Preencha seus dados para criar sua conta no site da Casa Sandríssima.'
                  : authMode === 'quick'
                    ? 'Escolha um perfil para autenticar em 1 clique durante seus testes e avaliações.'
                    : authMode === 'forgot'
                      ? 'Digite seu e-mail cadastrado para receber as instruções de redefinição.'
                      : (message || config.defaultDesc)}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            {authMode !== 'forgot' && !isSubmitting && (
              <div className="mt-4 p-1 bg-stone-100 rounded-2xl flex items-center gap-1 border border-stone-200" id="auth-mode-tabs">
                <button
                  type="button"
                  id="tab-mode-login"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    authMode === 'login'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Entrar</span>
                </button>
                <button
                  type="button"
                  id="tab-mode-register"
                  onClick={() => {
                    setAuthMode('register');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    authMode === 'register'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Criar Conta</span>
                </button>
                <button
                  type="button"
                  id="tab-mode-quick"
                  onClick={() => {
                    setAuthMode('quick');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`py-1.5 px-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    authMode === 'quick'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-emerald-700 hover:bg-emerald-50'
                  }`}
                  title="Acesso Rápido de Demonstração"
                >
                  <Zap className="h-3.5 w-3.5" />
                  <span>Demo</span>
                </button>
              </div>
            )}

            {/* Error notice if present */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3.5 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-left flex items-start gap-2.5 text-xs text-rose-900 font-sans"
                id="unified-auth-error-box"
              >
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold block text-rose-950">Aviso</span>
                  <span className="text-[11.5px] leading-relaxed text-rose-800">{errorMessage}</span>
                </div>
              </motion.div>
            )}

            {/* Success notice */}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3.5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-left flex items-start gap-2.5 text-xs text-emerald-800 font-sans"
                id="unified-auth-success-box"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Sucesso!</span>
                  <span>{successMessage}</span>
                </div>
              </motion.div>
            )}

            {/* Active loader during authentication */}
            {isSubmitting ? (
              <div className="py-8 flex flex-col items-center justify-center space-y-2">
                <PencilLoader
                  size="md"
                  message={
                    authMode === 'register' 
                      ? 'Cadastrando sua conta no site...'
                      : authMode === 'quick'
                        ? 'Entrando com o perfil selecionado...'
                        : authMode === 'forgot'
                          ? 'Enviando link de recuperação...'
                          : 'Validando suas credenciais...'
                  }
                  submessage="Autenticação segura Casa Sandríssima"
                />
              </div>
            ) : authMode === 'quick' ? (
              /* QUICK DEMO LOGIN VIEW */
              <div className="mt-4 space-y-2.5 text-left" id="quick-demo-access-panel">
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 mb-1">
                    <Zap className="h-4 w-4 text-emerald-600" />
                    <span>Acesso Instantâneo para Testes</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-snug">
                    Autentique-se diretamente em 1 clique para testar todos os módulos (painel administrativo, presenças, financeiro e oficinas):
                  </p>
                </div>

                <div className="space-y-2">
                  {/* Diretor Geral Master Admin */}
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('brendomdev@gmail.com', '123456', 'Brendom Siqueira Dev')}
                    className="w-full p-3 rounded-2xl border border-emerald-300 bg-white hover:bg-emerald-50/50 shadow-2xs hover:shadow transition-all text-left flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                        👑
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-900 group-hover:text-emerald-900">
                          Diretor Geral & Administrador Master
                        </div>
                        <div className="text-[10px] text-stone-500">
                          brendomdev@gmail.com (Acesso total SGE, Alunos e Finanças)
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
                  </button>

                  {/* Coordenadora Pedagógica */}
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('sandra@casa.org', '123456', 'Ana Sandra Abreu')}
                    className="w-full p-3 rounded-2xl border border-stone-200 bg-white hover:bg-stone-50 shadow-2xs hover:shadow transition-all text-left flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                        👩‍🏫
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-900 group-hover:text-teal-900">
                          Coordenadora Pedagógica
                        </div>
                        <div className="text-[10px] text-stone-500">
                          sandra@casa.org (Oficinas, Aulas e Avaliações)
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-teal-600 group-hover:translate-x-1 transition-transform" />
                  </button>

                  {/* Apoiador e Voluntário */}
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('roberto.santos@gmail.com', '123456', 'Roberto Santos')}
                    className="w-full p-3 rounded-2xl border border-stone-200 bg-white hover:bg-stone-50 shadow-2xs hover:shadow transition-all text-left flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                        🤝
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-900 group-hover:text-amber-900">
                          Voluntário & Apoiador Comunitário
                        </div>
                        <div className="text-[10px] text-stone-500">
                          roberto.santos@gmail.com (Ouvidoria e Galeria)
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-amber-600 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="w-full py-2 text-xs text-stone-500 hover:text-stone-800 font-semibold text-center cursor-pointer"
                >
                  ← Voltar para o Login com E-mail
                </button>
              </div>
            ) : (
              /* EMAIL & PASSWORD AUTH FORM */
              <form onSubmit={handleEmailAuthSubmit} className="mt-4 space-y-3 text-left" id="email-auth-form">
                
                {/* Name field (Only in Register mode) */}
                {authMode === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Nome Completo
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Maria Silva"
                        className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Email Field */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Endereço de E-mail
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu.email@exemplo.com"
                      className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                </div>

                {/* Password Field (Login & Register) */}
                {authMode !== 'forgot' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-stone-700">
                        Senha
                      </label>
                      {authMode === 'login' && (
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode('forgot');
                            setErrorMessage(null);
                            setSuccessMessage(null);
                          }}
                          className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer underline decoration-dotted"
                        >
                          Esqueci a senha
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Key className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-10 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Confirm Password (Register mode) */}
                {authMode === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Confirmar Senha
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repita a senha digitada"
                        className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Action Submit Button */}
                <button
                  type="submit"
                  id="btn-submit-email-auth"
                  className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>
                    {authMode === 'register' 
                      ? 'Cadastrar Minha Conta' 
                      : authMode === 'forgot'
                        ? 'Enviar Link de Redefinição'
                        : 'Entrar na Conta'}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                {/* Switcher links */}
                <div className="pt-2 text-center text-xs text-stone-500">
                  {authMode === 'login' ? (
                    <p>
                      Não possui uma conta?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('register');
                          setErrorMessage(null);
                          setSuccessMessage(null);
                        }}
                        className="text-emerald-700 hover:text-emerald-800 font-bold underline cursor-pointer"
                      >
                        Cadastre-se agora
                      </button>
                    </p>
                  ) : authMode === 'register' ? (
                    <p>
                      Já tem cadastro?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('login');
                          setErrorMessage(null);
                          setSuccessMessage(null);
                        }}
                        className="text-emerald-700 hover:text-emerald-800 font-bold underline cursor-pointer"
                      >
                        Entrar na conta
                      </button>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="w-full py-1 text-xs text-stone-500 hover:text-stone-800 font-semibold text-center cursor-pointer"
                    >
                      ← Voltar para o Login
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>

          {/* Privacy and Terms Footer note */}
          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-center gap-2 text-[11px] text-stone-400 font-sans">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>Autenticação direta no site. Seus dados estão seguros.</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
