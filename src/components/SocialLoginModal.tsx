import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Lock, ShieldCheck, HeartHandshake, Image as ImageIcon, Sparkles, 
  AlertCircle, Mail, Key, User as UserIcon, Eye, EyeOff, CheckCircle2, ArrowRight,
  UserPlus, LogIn, ExternalLink, Copy, Check, Zap, Info, HelpCircle
} from 'lucide-react';
import { useFirebase } from '../firebaseContext';
import { useModal } from './ModalContext';
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
  const { loginWithSocial, loginWithEmail, registerWithEmail, resetPassword } = useFirebase();
  const { alert } = useModal();
  
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
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'facebook' | 'microsoft' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<{ code?: string; actionType?: 'new_tab' | 'copy_domain' | 'email_mode' } | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check if running inside an iframe (AI Studio preview)
  const isInsideIframe = typeof window !== 'undefined' && window.self !== window.top;
  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setErrorMessage(null);
    setErrorDetails(null);
    setSuccessMessage(null);
    setIsSubmitting(false);
    setLoadingProvider(null);
  };

  const handleClose = () => {
    if (!isSubmitting && !loadingProvider) {
      resetForm();
      onClose();
    }
  };

  const copyCurrentDomain = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(currentHostname);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 3000);
    }
  };

  const openInNewTab = () => {
    if (typeof window !== 'undefined') {
      window.open(window.location.href, '_blank', 'noopener,noreferrer');
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
          defaultDesc: 'Autentique-se com sua conta de e-mail e senha ou rede social para acessar os recursos da Casa Sandríssima.',
          color: 'text-emerald-700 bg-emerald-50 border-emerald-200'
        };
      case 'geral':
      default:
        return {
          badge: 'Identificação Segura',
          icon: Lock,
          defaultTitle: 'Conectar à Casa Sandríssima',
          defaultDesc: 'Faça login com seu e-mail ou rede social para navegar com acesso ilimitado a todas as áreas, fotos e projetos.',
          color: 'text-emerald-700 bg-emerald-50 border-emerald-200'
        };
    }
  };

  const config = getReasonConfig();
  const IconComponent = config.icon;

  // Social login handler with smart diagnostics & fallbacks
  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'microsoft') => {
    setLoadingProvider(provider);
    setErrorMessage(null);
    setErrorDetails(null);
    setSuccessMessage(null);

    // Facebook / Microsoft guidance
    if (provider !== 'google') {
      setLoadingProvider(null);
      setErrorMessage(`O login via ${provider === 'facebook' ? 'Facebook' : 'Microsoft'} requer chaves de cliente OAuth no console. Recomendamos entrar com o Google ou com seu E-mail.`);
      setErrorDetails({ code: 'provider_notice', actionType: 'email_mode' });
      return;
    }

    try {
      await loginWithSocial(provider);
      setLoadingProvider(null);
      if (onSuccess) {
        onSuccess();
      }
      handleClose();
    } catch (err: any) {
      setLoadingProvider(null);
      const errorCode = err?.code || '';
      
      if (errorCode === 'auth/popup-closed-by-user' || errorCode === 'auth/cancelled-popup-request') {
        setErrorMessage(null);
        setErrorDetails(null);
        return;
      }
      
      console.warn(`Erro ao autenticar com ${provider}:`, err);
      
      if (errorCode === 'auth/unauthorized-domain') {
        setErrorMessage(`O domínio atual (${currentHostname}) ainda não foi adicionado aos domínios autorizados do Firebase Console.`);
        setErrorDetails({ code: 'auth/unauthorized-domain', actionType: 'copy_domain' });
      } else if (errorCode === 'auth/popup-blocked') {
        setErrorMessage('A janela pop-up de autenticação do Google foi bloqueada pelo navegador.');
        setErrorDetails({ code: 'auth/popup-blocked', actionType: 'new_tab' });
      } else if (errorCode === 'auth/account-exists-with-different-credential') {
        setErrorMessage('Já existe uma conta cadastrada com este e-mail através de outro método. Tente utilizar seu e-mail e senha.');
        setErrorDetails({ code: 'account_exists', actionType: 'email_mode' });
      } else if (errorCode === 'auth/operation-not-allowed' || errorCode === 'auth/configuration-not-found') {
        setErrorMessage('O provedor Google precisa estar ativado no Firebase Authentication. Você pode entrar diretamente com E-mail e Senha.');
        setErrorDetails({ code: 'operation_not_allowed', actionType: 'email_mode' });
      } else if (errorCode === 'auth/network-request-failed') {
        setErrorMessage('Falha na comunicação de rede com o Firebase ou restrição de cookies no iframe. Abra em uma nova aba ou use E-mail e Senha.');
        setErrorDetails({ code: 'network_failed', actionType: 'new_tab' });
      } else {
        setErrorMessage(`Não foi possível autenticar com o Google (${errorCode || 'erro de conexão'}). Experimente abrir em uma nova aba ou entrar com E-mail e Senha.`);
        setErrorDetails({ code: errorCode, actionType: isInsideIframe ? 'new_tab' : 'email_mode' });
      }
    }
  };

  // Email & Password Auth handler
  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setErrorDetails(null);
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
          setErrorMessage('Este e-mail já está cadastrado. Faça login com ele ou utilize a recuperação de senha.');
          setErrorDetails({ code: 'email_in_use', actionType: 'email_mode' });
        } else if (code === 'auth/invalid-email') {
          setErrorMessage('O formato do e-mail é inválido.');
        } else if (code === 'auth/weak-password') {
          setErrorMessage('A senha é muito fraca. Utilize ao menos 6 caracteres combinando letras e números.');
        } else {
          setErrorMessage('Falha ao criar sua conta. Verifique os dados e tente novamente.');
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
          setErrorMessage('E-mail ou senha incorretos. Se não possui cadastro, clique na aba "Criar Conta".');
        } else if (code === 'auth/invalid-email') {
          setErrorMessage('O formato do e-mail é inválido.');
        } else if (code === 'auth/too-many-requests') {
          setErrorMessage('Muitas tentativas sem sucesso. Aguarde alguns minutos ou redefina sua senha.');
        } else {
          setErrorMessage('Não foi possível realizar o login. Verifique sua conexão e tente novamente.');
        }
      }
    }
  };

  // Fast demo / quick login helper for instant testing
  const handleQuickLogin = async (roleEmail: string, rolePass: string, roleName: string) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setErrorDetails(null);
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
      console.warn("Quick login fallback: ", e);
      setErrorMessage(`Não foi possível inicializar o acesso rápido: ${e?.message || 'Erro inesperado'}. Você pode criar uma conta na aba "Criar Conta".`);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto"
        id="unified-auth-modal-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget && !loadingProvider && !isSubmitting) {
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
          {!loadingProvider && !isSubmitting && (
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
                  ? 'Criar Nova Conta' 
                  : authMode === 'quick'
                    ? 'Acesso Rápido de Testes'
                    : authMode === 'forgot' 
                      ? 'Recuperar Senha' 
                      : (title || config.defaultTitle)}
              </h3>

              <p className="text-stone-600 text-xs leading-relaxed max-w-sm">
                {authMode === 'register'
                  ? 'Cadastre-se com seu e-mail e senha para participar das atividades e oficinas.'
                  : authMode === 'quick'
                    ? 'Escolha um perfil para autenticar em 1 clique durante seus testes e avaliações.'
                    : authMode === 'forgot'
                      ? 'Digite seu e-mail cadastrado para receber as instruções de redefinição.'
                      : (message || config.defaultDesc)}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            {authMode !== 'forgot' && !loadingProvider && !isSubmitting && (
              <div className="mt-4 p-1 bg-stone-100 rounded-2xl flex items-center gap-1 border border-stone-200" id="auth-mode-tabs">
                <button
                  type="button"
                  id="tab-mode-login"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMessage(null);
                    setErrorDetails(null);
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
                    setErrorDetails(null);
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
                    setErrorDetails(null);
                    setSuccessMessage(null);
                  }}
                  className={`py-1.5 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    authMode === 'quick'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-emerald-700 hover:bg-emerald-50'
                  }`}
                  title="Acesso Rápido de Testes"
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
                className="mt-3.5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-left flex flex-col gap-2 text-xs text-rose-900 font-sans"
                id="unified-auth-error-box"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-bold block text-rose-950">Aviso de Autenticação</span>
                    <span className="text-[11.5px] leading-relaxed text-rose-800">{errorMessage}</span>
                  </div>
                </div>

                {/* Helpful contextual action buttons inside error box */}
                <div className="flex flex-wrap gap-1.5 pt-1 border-t border-rose-200/60 mt-1">
                  {errorDetails?.actionType === 'copy_domain' && (
                    <button
                      type="button"
                      onClick={copyCurrentDomain}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-100/80 hover:bg-rose-200 text-rose-900 font-bold text-[11px] transition-colors cursor-pointer"
                    >
                      {copiedDomain ? <Check className="h-3 w-3 text-emerald-700" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedDomain ? 'Domínio Copiado!' : 'Copiar Domínio p/ Firebase'}</span>
                    </button>
                  )}

                  {(errorDetails?.actionType === 'new_tab' || isInsideIframe) && (
                    <button
                      type="button"
                      onClick={openInNewTab}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors cursor-pointer shadow-xs"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>Abrir em Nova Aba</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setErrorMessage(null);
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-stone-100 text-stone-800 font-bold text-[11px] border border-rose-200 transition-colors cursor-pointer"
                  >
                    <Mail className="h-3 w-3 text-emerald-600" />
                    <span>Usar E-mail e Senha</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('quick');
                      setErrorMessage(null);
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[11px] transition-colors cursor-pointer"
                  >
                    <Zap className="h-3 w-3 text-amber-700" />
                    <span>Acesso Rápido 1-Clique</span>
                  </button>
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
            {loadingProvider || isSubmitting ? (
              <div className="py-8 flex flex-col items-center justify-center space-y-2">
                <PencilLoader
                  size="md"
                  message={
                    loadingProvider 
                      ? `Conectando com ${loadingProvider === 'google' ? 'Google' : loadingProvider === 'facebook' ? 'Facebook' : 'Microsoft'}...`
                      : authMode === 'register' 
                        ? 'Criando e registrando sua conta...'
                        : authMode === 'quick'
                          ? 'Entrando com o perfil selecionado...'
                          : authMode === 'forgot'
                            ? 'Enviando link de recuperação...'
                            : 'Validando credenciais...'
                  }
                  submessage="Autenticação segura via Firebase"
                />
              </div>
            ) : authMode === 'quick' ? (
              /* QUICK DEMO LOGIN VIEW */
              <div className="mt-4 space-y-2.5 text-left" id="quick-demo-access-panel">
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 mb-1">
                    <Zap className="h-4 w-4 text-emerald-600" />
                    <span>Acesso Instantâneo para Demonstração</span>
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
                  ← Voltar para Login Normal
                </button>
              </div>
            ) : (
              <>
                {/* Email and Password Form */}
                <form onSubmit={handleEmailAuthSubmit} className="mt-4 space-y-2.5 text-left" id="email-auth-form">
                  
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
                              setErrorDetails(null);
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
                    className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>
                      {authMode === 'register' 
                        ? 'Criar Minha Conta' 
                        : authMode === 'forgot'
                          ? 'Enviar Link de Redefinição'
                          : 'Entrar na Conta'}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  {/* Back to login from forgot password */}
                  {authMode === 'forgot' && (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setErrorMessage(null);
                        setErrorDetails(null);
                        setSuccessMessage(null);
                      }}
                      className="w-full py-2 text-xs text-stone-500 hover:text-stone-800 font-semibold text-center cursor-pointer"
                    >
                      ← Voltar para o Login
                    </button>
                  )}
                </form>

                {/* Divider for Social Login */}
                {authMode !== 'forgot' && (
                  <>
                    <div className="relative my-3.5">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-stone-200" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-stone-400 font-bold text-[10px] tracking-wider">
                          ou conecte-se com
                        </span>
                      </div>
                    </div>

                    {/* Social Logins */}
                    <div className="space-y-2 text-left" id="social-login-buttons-container">
                      {/* Google */}
                      <button
                        type="button"
                        id="btn-login-google"
                        onClick={() => handleSocialLogin('google')}
                        className="w-full flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-stone-800 font-semibold text-xs sm:text-sm border border-stone-200 shadow-2xs hover:shadow transition-all cursor-pointer group"
                      >
                        <svg className="w-4 h-4 group-hover:scale-105 transition-transform shrink-0" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                        <span>Continuar com Google</span>
                      </button>

                      {/* Open in full tab helper for iframe preview environments */}
                      {isInsideIframe && (
                        <div className="p-2 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between text-[11px] text-stone-600">
                          <span className="flex items-center gap-1.5">
                            <Info className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span>Preview no Iframe?</span>
                          </span>
                          <button
                            type="button"
                            onClick={openInNewTab}
                            className="text-emerald-700 hover:text-emerald-800 font-bold underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>Abrir em Nova Aba</span>
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* Privacy and Terms Footer note */}
          <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-center gap-2 text-[11px] text-stone-400 font-sans">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>Sessão segura com Firebase. Seus dados estão protegidos.</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
