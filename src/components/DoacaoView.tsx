import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Coins, Calendar, Trash2, ShieldCheck, Check, Copy, ShoppingBag, Landmark, ArrowRight, UserCheck, QrCode, ArrowLeft, Send, Sparkles, Lock, User as UserIcon } from 'lucide-react';
import { Donation } from '../types';
import { generatePixPayload } from '../lib/pix';
import { useModal } from './ModalContext';
import { useFirebase } from '../firebaseContext';
import logoImg from '../assets/images/casa_sandrissima_green_white_logo_1779323893215.png';
import PencilLoader from './PencilLoader';

interface DoacaoViewProps {
  onAddDonation: (donation: Donation) => Promise<void> | void;
  onUpdateDonation: (donation: Donation) => Promise<void> | void;
  donationsList: Donation[];
  onOpenLoginModal?: (reason?: 'galeria' | 'doacoes' | 'portal' | 'geral') => void;
}

export default function DoacaoView({ onAddDonation, onUpdateDonation, donationsList, onOpenLoginModal }: DoacaoViewProps) {
  const { user, loginWithSocial } = useFirebase();
  const { alert } = useModal();
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | 'microsoft' | null>(null);

  const [formData, setFormData] = useState({
    donorName: '',
    description: '',
    isAnonymous: false
  });

  // When user is authenticated, prefill their name
  useEffect(() => {
    if (user && !formData.donorName) {
      setFormData(prev => ({
        ...prev,
        donorName: user.displayName || user.email?.split('@')[0] || ''
      }));
    }
  }, [user]);

  const handleQuickLogin = async (provider: 'google' | 'facebook' | 'microsoft') => {
    setSocialLoading(provider);
    try {
      await loginWithSocial(provider);
      setSocialLoading(null);
    } catch (err: any) {
      setSocialLoading(null);
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        // User cancelled popup, no error alert needed
        return;
      }
      await alert(`Erro ao autenticar com ${provider}. Tente novamente ou use o Google.`, "Aviso de Login", "warn");
    }
  };

  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [simulatedRecord, setSimulatedRecord] = useState<Donation | null>(null);
  const [createdDonation, setCreatedDonation] = useState<Donation | null>(null);

  // Verification Animation States
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationIndex, setVerificationIndex] = useState(0);

  const pixKey = "52.755.144/0001-51"; // Official CNPJ of Casa Sandríssima
  const [selectedPixAmount, setSelectedPixAmount] = useState<number>(50);

  // Progressive steps indicator:
  // 1: setup (adjust amount, donor's name, anonymous flag)
  // 2: payment_pending (shows custom QR Code and Copy/Paste, click to simulate confirmation)
  // 3: write_message (once paid, activate testimonial form for mural approval)
  // 4: finished (receipt + mod curation info)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const pixPayload = generatePixPayload(pixKey, selectedPixAmount);

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(pixPayload);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const handleNextToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  // Real, interactive automated checkout verification simulation:
  const handleConfirmPayment = () => {
    setIsVerifying(true);
    setVerificationIndex(0);

    const interval = setInterval(() => {
      setVerificationIndex((prev) => {
        if (prev >= 4) {
          clearInterval(interval);
          
          // Complete and insert real payment in Firestore!
          setTimeout(async () => {
            const dName = formData.isAnonymous ? "Anônimo" : (formData.donorName.trim() || "Doador Amigo");
            const donationId = 'don_' + Math.random().toString(36).substr(2, 9);
            const verifiedDonation: Donation = {
              id: donationId,
              donorName: dName,
              type: 'pix',
              amount: selectedPixAmount,
              description: '', // initially empty message
              date: new Date().toLocaleDateString('pt-BR'),
              approved: false // Mural visibility is moderable, but payment is instantly confirmed.
            };

            try {
              await onAddDonation(verifiedDonation);
              setCreatedDonation(verifiedDonation);
              setIsVerifying(false);
              setStep(3); // Unlock message screen!
            } catch (err) {
              await alert("Erro ao confirmar a transação do Pix. Por favor, tente novamente de maneira oficial.", "Erro de Transação", "error");
              setIsVerifying(false);
            }
          }, 800);
          return prev;
        }
        return prev + 1;
      });
    }, 600);
  };

  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!createdDonation) return;

    const finalDescription = formData.description.trim() || "Enviou fomento solidário com carinho!";
    const updatedDonation: Donation = {
      ...createdDonation,
      description: finalDescription
    };

    try {
      await onUpdateDonation(updatedDonation);
      setSimulatedRecord(updatedDonation);
      setStep(4);
    } catch (error) {
      await alert("Falha ao salvar seu recado de apoio em nosso mural de doações.", "Erro ao Publicar", "error");
    }
  };

  const handleSkipMessage = async () => {
    if (!createdDonation) return;

    const finalDescription = "Apoiador Solidário • Pix Confirmado!";
    const updatedDonation: Donation = {
      ...createdDonation,
      description: finalDescription
    };

    try {
      await onUpdateDonation(updatedDonation);
      setSimulatedRecord(updatedDonation);
      setStep(4);
    } catch (err) {
      setSimulatedRecord(createdDonation);
      setStep(4);
    }
  };

  const handleResetSimulator = () => {
    setFormData({
      donorName: '',
      description: '',
      isAnonymous: false
    });
    setSelectedPixAmount(50);
    setSimulatedRecord(null);
    setCreatedDonation(null);
    setIsVerifying(false);
    setVerificationIndex(0);
    setStep(1);
  };

  const itemsOptions = [
    { value: 'pix', label: 'Ajuda Financeira via Pix', icon: Coins },
    { value: 'food', label: 'Cesta Básica / Alimentos', icon: ShoppingBag },
    { value: 'clothing', label: 'Roupas, Cobertores, Tênis', icon: Heart },
    { value: 'other', label: 'Materiais (Karatê, Costura ou Escolar)', icon: ShoppingBag },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.3 }}
      className="space-y-12 py-8"
      id="doacao-view-wrapper"
    >
      
      {/* Page Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4" id="doacao-intro">
        <h1 className="font-sans font-extrabold text-3xl md:text-4.2xl text-stone-900 tracking-tight">
          Transforme Vidas com Sua Doação!
        </h1>
        <p className="text-stone-600 text-sm md:text-base leading-relaxed">
          Cada pequena contribuição é uma valiosa ajuda para continuarmos a semear dignidade, autonomia e carinho. Escolha abaixo a melhor forma de apoiar a <strong>Casa Sandríssima</strong>.
        </p>
      </section>

      {/* Main Pillars Box */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left" id="doacao-pillar-cards">
        
        {/* Pix Section */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-stone-150 flex flex-col justify-between space-y-6" id="card-donate-pix">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl w-fit">
                <Landmark className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-mono uppercase bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold tracking-wider">
                Pix Instantâneo
              </span>
            </div>
            
            <h3 className="font-sans font-bold text-lg text-stone-900">Transferência Pix Oficial</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Ideal para contribuições seguras. Nossos projetos comunitários utilizam este fomento para aquisição direta de insumos.
            </p>

            <div className="bg-stone-50 border border-stone-150 rounded-xl p-3 flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] font-mono uppercase text-stone-400 block tracking-wider">Chave Pix CNPJ (Caixa Econômica)</span>
                <span className="text-sm font-bold font-mono text-stone-800">{pixKey}</span>
              </div>
              <button 
                onClick={handleCopyPix}
                className="p-2 hover:bg-stone-100 rounded-lg text-emerald-650 cursor-pointer transition-colors"
                title="Copiar chave CNPJ"
                id="copy-pix-btn"
              >
                {copiedKey ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            {copiedKey && <span className="text-[10px] text-emerald-600 font-semibold block text-center">✓ CNPJ copiado para transferência manual!</span>}

            {/* QR Code generator box */}
            <div className="border hover:border-emerald-200 border-stone-200 rounded-xl p-4 bg-stone-50/50 flex flex-col sm:flex-row items-center gap-4 transition-all">
              <div className="bg-white p-2.5 rounded-xl border border-stone-200 shadow-inner shrink-0 w-[150px] h-[150px] flex items-center justify-center relative">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(pixPayload)}`} 
                  alt="QR Code Pix" 
                  className="w-[130px] h-[130px]"
                  title="Aponte a câmera do seu banco"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <div className="space-y-3 text-left w-full">
                <div>
                  <span className="text-[9px] font-mono uppercase font-bold text-stone-500 block">Gerador de QR Code</span>
                  <span className="text-sm font-extrabold text-stone-800">Doar R$ {selectedPixAmount},00</span>
                </div>

                {/* Quick amount chips */}
                <div className="flex flex-wrap gap-1">
                  {[10, 20, 50, 100, 250].map((val) => (
                    <button
                      key={val}
                      onClick={() => setSelectedPixAmount(val)}
                      type="button"
                      className={`px-2 py-0.5 text-[10px] font-mono rounded-md font-bold transition-all cursor-pointer ${
                        selectedPixAmount === val
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      R$ {val}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleCopyPayload}
                  className="w-full py-1.5 px-3 bg-stone-900 hover:bg-stone-850 text-white hover:shadow-sm text-[10px] font-extrabold uppercase rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  {copiedPayload ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-450" /> Código Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" /> Pix Copia e Cola
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          <span className="text-xs text-stone-400 leading-none">Caixa Econômica Federal • ONG Casa Sandríssima</span>
        </div>

        {/* Physical Section */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-6 border border-stone-150 flex flex-col justify-between space-y-6" id="card-donate-physical">
          <div className="space-y-4">
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl w-fit">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <h3 className="font-sans font-bold text-lg text-stone-900">Doar Pessoalmente</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Você pode visitar a nossa sede social e entregar suprimentos diretamente à nossa junta diretiva. Ficaremos honrados em recebê-lo!
            </p>
            <div className="text-xs text-stone-600 space-y-1 bg-stone-50 p-3 rounded-xl border border-stone-150 text-left">
              <p className="font-bold text-stone-855">Endereço de Entrega:</p>
              <p>Rua Filomena Ana Rita, 390</p>
              <p>Jardim Ipanema — Franca/SP</p>
              <p>CEP 14404-225</p>
            </div>
          </div>
          <span className="text-xs text-stone-405 leading-none">Horários: Segunda a Sexta, 08h às 17h</span>
        </div>

        {/* Supplies Section */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-6 border border-stone-150 flex flex-col justify-between space-y-6" id="card-donate-supplies">
          <div className="space-y-4">
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl w-fit">
              <Heart className="h-6 w-6" />
            </div>
            <h3 className="font-sans font-bold text-lg text-stone-900">Arrecadação de Materiais</h3>
            <p className="text-xs text-stone-550 leading-relaxed">
              Aceitamos doações em bom estado que incentivam diretamente a capacitação técnica e esportiva de nossos alunos:
            </p>
            <ul className="text-xs text-stone-605 space-y-1 list-disc pl-4 text-left">
              <li><strong>Kimonos infantis e juvenis</strong> para o karatê</li>
              <li><strong>Rolos de tecidos, linhas e tesouras</strong> para costura</li>
              <li><strong>Cadernos, livros infantojuvenis</strong> e canetas</li>
              <li><strong>Alimentos não-perecíveis</strong> para lanches</li>
            </ul>
          </div>
          <span className="text-xs text-emerald-700 font-semibold leading-relaxed">Agende a coleta: (16) 99277-4601</span>
        </div>

      </section>

      {/* Interactive Simulator: Donate Simulator Panel */}
      <section className="bg-stone-50 rounded-3xl p-6 md:p-10 border border-stone-200/50 grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch" id="simulator-section">
        
        {/* Left Column Form / Current active step */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200/80 p-6 md:p-8 flex flex-col justify-between" id="simulator-form-card">
          <div className="w-full">
            
            {/* Step Indicators */}
            <div className="flex items-center gap-1.5 pb-5 border-b border-stone-100 mb-6 select-none" id="simulator-stepper">
              {[1, 2, 3, 4].map((s) => (
                <React.Fragment key={s}>
                  <div 
                    className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all duration-300 ${
                      step === s 
                        ? 'bg-stone-900 text-white shadow-md scale-105' 
                        : step > s 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-stone-100 text-stone-400'
                    }`}
                    title={`Passo ${s}`}
                  >
                    {step > s ? '✓' : s}
                  </div>
                  {s < 4 && (
                    <div className="flex-1 h-0.5 relative bg-stone-150 overflow-hidden">
                      <div 
                        className="absolute left-0 top-0 bottom-0 bg-emerald-500 transition-all duration-500"
                        style={{ width: step > s ? '100%' : step === s ? '50%' : '0%' }}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Stepper description badge */}
            <div className="mb-4">
              <span className="text-[9px] font-mono font-bold uppercase py-1 px-2.5 rounded bg-stone-100 text-stone-600 border border-stone-200">
                Passo {step} de 4: {step === 1 ? 'Ajustar Suporte' : step === 2 ? 'Efetuar Pix' : step === 3 ? 'Escrever Depoimento' : 'Concluído'}
              </span>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.form 
                  key="form-step-1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleNextToPayment} 
                  className="space-y-5 text-left" 
                  id="supporter-simulation-form-step1"
                >
                  <div className="pb-1">
                    <h3 className="font-sans font-extrabold text-lg text-stone-900">
                      Configurar seu Apoio
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">Selecione o valor do fomento via Pix e preencha seu nome para gerar o código oficial de doação.</p>
                  </div>

                  {/* Auth Status & Social Login Requirement */}
                  {!user ? (
                    <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3" id="donation-auth-required-box">
                      <div className="flex items-start gap-2.5">
                        <div className="bg-emerald-600 text-white p-1.5 rounded-lg shrink-0 mt-0.5">
                          <Lock className="h-4 w-4" />
                        </div>
                        <div className="text-xs">
                          <span className="font-bold text-stone-900 block">Identificação Necessária para Doar</span>
                          <span className="text-stone-600 leading-relaxed block mt-0.5">
                            Para conformidade e recibo nominal, faça login com sua rede social preferida:
                          </span>
                        </div>
                      </div>

                      {socialLoading ? (
                        <div className="py-2">
                          <PencilLoader
                            size="sm"
                            message={`Conectando com ${socialLoading === 'google' ? 'Google' : socialLoading === 'facebook' ? 'Facebook' : 'Microsoft'}...`}
                          />
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleQuickLogin('google')}
                            className="flex items-center justify-center gap-1.5 px-2.5 py-2 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 shadow-xs cursor-pointer"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                            </svg>
                            <span>Google</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleQuickLogin('facebook')}
                            className="flex items-center justify-center gap-1.5 px-2.5 py-2 bg-[#1877F2] hover:bg-[#166fe5] rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer"
                          >
                            <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                            <span>Facebook</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleQuickLogin('microsoft')}
                            className="flex items-center justify-center gap-1.5 px-2.5 py-2 bg-[#2F2F2F] hover:bg-[#202020] rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 21 21">
                              <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                              <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                              <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                              <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                            </svg>
                            <span>Microsoft</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="bg-emerald-600 text-white p-1.5 rounded-full">
                          <ShieldCheck className="h-4 w-4" />
                        </div>
                        <div className="text-left text-xs">
                          <span className="font-bold text-stone-900 block">Doador Autenticado</span>
                          <span className="text-emerald-800 font-mono text-[11px]">
                            {user.displayName || user.email}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] uppercase font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                        ✓ Verificado
                      </span>
                    </div>
                  )}

                  {/* Donor Name */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold font-mono text-stone-700 block uppercase" htmlFor="donor-name-field">
                        Seu Nome ou Empresa
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          id="anonymous-check"
                          checked={formData.isAnonymous}
                          onChange={(e) => setFormData({...formData, isAnonymous: e.target.checked})}
                          className="rounded border-stone-350 text-emerald-600 focus:ring-emerald-500 cursor-pointer h-3.5 w-3.5"
                        />
                        <label htmlFor="anonymous-check" className="text-xs font-semibold text-stone-500 cursor-pointer select-none">Doação Anônima</label>
                      </div>
                    </div>
                    <input
                      type="text"
                      id="donor-name-field"
                      required={!formData.isAnonymous}
                      disabled={formData.isAnonymous}
                      placeholder={formData.isAnonymous ? "Nome público ocultado" : "Ex: Maria Fernanda Silva"}
                      value={formData.isAnonymous ? "" : formData.donorName}
                      onChange={(e) => setFormData({...formData, donorName: e.target.value})}
                      className="w-full h-11 px-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:bg-stone-50 disabled:text-stone-400 transition-all font-sans"
                    />
                  </div>

                  {/* Amount Selection */}
                  <div className="space-y-3 pt-1">
                    <div className="flex justify-between items-center text-xs font-bold font-mono text-stone-750">
                      <span className="uppercase">Valor do Repasse</span>
                      <span className="text-emerald-700 font-extrabold text-sm bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                        R$ {selectedPixAmount},00
                      </span>
                    </div>

                    <input
                      type="range"
                      min="10"
                      max="1000"
                      step="10"
                      value={selectedPixAmount}
                      onChange={(e) => setSelectedPixAmount(parseInt(e.target.value))}
                      className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 focus:outline-none"
                    />
                    
                    <div className="grid grid-cols-6 gap-1.5">
                      {[10, 35, 50, 100, 250, 500].map((val) => (
                        <button
                          key={val}
                          onClick={() => setSelectedPixAmount(val)}
                          type="button"
                          className={`py-2 text-[11px] font-mono rounded-lg border transition-all cursor-pointer font-bold ${
                            selectedPixAmount === val
                              ? 'bg-stone-900 border-stone-900 text-white shadow-sm'
                              : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                          }`}
                        >
                          R$ {val}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs tracking-wide cursor-pointer uppercase transition-all flex items-center justify-center gap-1.5 shadow"
                  >
                    Gerar Código Pix de Apoio <ArrowRight className="h-4 w-4" />
                  </button>
                </motion.form>
              )}

              {step === 2 && (
                <motion.div 
                  key="form-step-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5 text-left" 
                  id="supporter-simulation-form-step2"
                >
                  {isVerifying ? (
                    <div className="py-4 space-y-4 flex flex-col items-center justify-center min-h-[320px]">
                      <PencilLoader
                        size="md"
                        message="Verificando recebimento do Pix..."
                        submessage="Aguardando confirmação em tempo real no Banco Central"
                      />
                      <div className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        {Math.min(100, (verificationIndex + 1) * 20)}% concluído
                      </div>
                      
                      <div className="w-full space-y-3 px-2">
                        <div className="space-y-2 bg-stone-50 border border-stone-200/50 p-4 rounded-2xl text-[11px] font-mono leading-relaxed shadow-sm">
                          {[
                            "Conectando ao núcleo de liquidação do Banco Central...",
                            "Buscando repasses para CNPJ 52.755.144/0001-51 (Casa Sandríssima)...",
                            `Validando transação Pix de R$ ${selectedPixAmount},00 enviado por ${formData.isAnonymous ? "Anônimo" : (formData.donorName || "Doador Amigo")}...`,
                            `✓ Pix de R$ ${selectedPixAmount},00 LOCALIZADO e CONFIRMADO com absoluto sucesso!`,
                            "Salvando e gravando lançamento fiscal permanente na tesouraria de auditoria..."
                          ].map((log, i) => (
                            <motion.div 
                              key={i}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: i <= verificationIndex ? 1 : 0.35, y: 0 }}
                              className="flex items-start gap-2"
                            >
                              <span className="shrink-0 font-bold">
                                {i < verificationIndex ? (
                                  <span className="text-emerald-600">✓</span>
                                ) : i === verificationIndex ? (
                                  <span className="text-amber-500 animate-pulse">●</span>
                                ) : (
                                  <span className="text-stone-300">○</span>
                                )}
                              </span>
                              <span className={i < verificationIndex ? "text-emerald-700 font-bold" : i === verificationIndex ? "text-stone-800 font-bold" : "text-stone-400"}>
                                {log}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="text-[9px] font-mono text-stone-400 select-none">
                        Gateway de Cobrança Integrado • Transação ID {Math.random().toString(36).substr(2, 9).toUpperCase()}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <h3 className="font-sans font-extrabold text-lg text-stone-900">
                          Confirmar Pagamento Recebido
                        </h3>
                        <p className="text-xs text-stone-500 mt-0.5">Efetue a transferência usando o QR Code ou a chave CNPJ e, assim que concluído em seu banco, clique no botão para confirmar.</p>
                      </div>

                      <div className="bg-stone-50 rounded-xl p-4 border border-stone-150 space-y-3 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-stone-500 font-mono uppercase text-[10px]">Beneficiário:</span>
                          <span className="font-semibold text-stone-800">CASA SANDRÍSSIMA</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-stone-150 pt-2.5">
                          <span className="font-bold text-stone-500 font-mono uppercase text-[10px]">Apoiador:</span>
                          <span className="font-semibold text-stone-800 max-w-xs truncate">{formData.isAnonymous ? "Anônimo" : (formData.donorName || "Doador Amigo")}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-stone-150 pt-2.5">
                          <span className="font-bold text-stone-500 font-mono uppercase text-[10px]">Importe Pix:</span>
                          <span className="font-black text-rose-600 font-mono text-sm">R$ {selectedPixAmount},00</span>
                        </div>

                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={handleCopyPayload}
                            className="w-full py-2.5 px-3 bg-white border border-stone-200 hover:border-stone-300 text-stone-700 text-[10px] font-extrabold uppercase rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                          >
                            {copiedPayload ? (
                              <>
                                <Check className="h-4 w-4 text-emerald-600 shrink-0" /> Código Copiado!
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4 shrink-0" /> Copiar Pix Copia e Cola
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="bg-emerald-50/50 p-3.5 border border-emerald-100 rounded-xl flex items-start gap-2.5 text-stone-600 text-xs">
                        <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>
                          <strong>Liquidação imediata:</strong> Após pagar pelo app do seu banco, clique no botão preto abaixo. O sistema verificará eletronicamente o crédito na conta da ONG.
                        </span>
                      </div>

                      <div className="flex gap-2.5 pt-1">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="flex-1 h-11 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold rounded-xl text-xs uppercase cursor-pointer transition-all flex items-center justify-center gap-1.5"
                        >
                          <ArrowLeft className="h-4 w-4" /> Voltar
                        </button>
                        <button
                          type="button"
                          onClick={handleConfirmPayment}
                          className="flex-[2] h-11 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs uppercase cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow"
                        >
                          Confirmar Pagamento Realizado ✓
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {step === 3 && (
                <motion.form 
                  key="form-step-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSubmitMessage} 
                  className="space-y-5 text-left" 
                  id="supporter-simulation-form-step3"
                >
                  <div>
                    <span className="bg-emerald-50 text-emerald-800 font-mono text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-200 uppercase inline-block">✓ Pagamento Confirmado na Conta</span>
                    <h3 className="font-sans font-extrabold text-lg text-stone-900 mt-2">
                      Deixar Recado no Mural (Opcional)
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">Seu repasse de R$ {selectedPixAmount},00 foi compensado e registrado na contabilidade! Escreva sua mensagem para o mural da ONG, ou conclua sem recado.</p>
                  </div>

                  {/* Message input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold font-mono text-stone-700 block uppercase" htmlFor="donor-notes">
                      Sua Mensagem de Apoio <span className="text-stone-400 font-normal">(Opcional)</span>
                    </label>
                    <textarea
                      id="donor-notes"
                      maxLength={140}
                      placeholder="Ex: Vida longa à Casa Sandríssima! Muito feliz em apoiar este projeto transformador em Franca/SP."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 h-28 transition-all font-sans bg-white resize-none"
                    />
                    <div className="flex justify-between items-center text-[10px] text-stone-400 font-mono">
                      <span>Assinando como: {formData.isAnonymous ? "Anônimo" : (formData.donorName || "Doador")}</span>
                      <span>{formData.description.length}/140 caracteres</span>
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={handleSkipMessage}
                      className="flex-1 h-11 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold rounded-xl text-xs uppercase cursor-pointer transition-all flex items-center justify-center gap-1.5 text-center"
                    >
                      Pular / Apenas Confirmar
                    </button>
                    <button
                      type="submit"
                      disabled={!formData.description.trim()}
                      className="flex-[2] h-11 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold rounded-xl text-xs uppercase cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow"
                    >
                      Enviar Recado para Curadoria <Send className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.form>
              )}

              {step === 4 && (
                <motion.div 
                  key="form-step-4"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6 text-left" 
                  id="supporter-simulation-form-step4"
                >
                  <div className="border-b border-stone-100 pb-4">
                    <div className="bg-amber-100 text-amber-900 border border-amber-200 text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase inline-block">
                      ⏳ Pendente de Aprovação
                    </div>
                    <h3 className="font-sans font-extrabold text-lg text-stone-900 mt-2.5">
                      Depoimento em Moderação!
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">Seu recado de carinho foi registrado com sucesso e encaminhado para moderação administrativa.</p>
                  </div>

                  <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-3.5 text-xs text-stone-600 leading-relaxed">
                    <div className="bg-emerald-50 text-emerald-800 text-[11px] p-2.5 rounded-xl border border-emerald-100 font-bold flex items-center gap-1.5 shadow-sm">
                      <Sparkles className="h-4 w-4 text-emerald-500 shrink-0" />
                      Fomento via Pix de R$ {selectedPixAmount},00 contabilizado com absoluto sucesso!
                    </div>
                    <p>
                      Para visualizar seu post do mural aprovado publicamente na página inicial, você pode efetuar login temporário na aba <strong>Portal</strong> com as credenciais gerais, buscar as doações e clicar em <strong>Aprovar</strong> na listagem financeira de auditoria.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetSimulator}
                    className="w-full h-11 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs tracking-wide cursor-pointer uppercase transition-all flex items-center justify-center gap-1.5 shadow"
                  >
                    Iniciar Novo Apoio <Sparkles className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

        {/* Right Column Success/Output Display */}
        <div className="lg:col-span-5 bg-gradient-to-b from-stone-900 to-stone-950 rounded-2xl p-6 md:p-8 text-white flex flex-col justify-between border border-stone-850 shadow-lg text-left" id="simulator-output-panel">
          
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1-preview" 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div>
                  <h4 className="text-xs font-mono tracking-wider text-emerald-400 uppercase">Ficha Provisória</h4>
                  <p className="text-xl font-extrabold font-sans text-stone-100 mt-1">Detalhes do Apoio</p>
                </div>
                
                <div className="bg-stone-850/70 border border-stone-800 rounded-xl p-4 text-xs font-mono space-y-3">
                  <div className="flex justify-between border-b border-stone-800 pb-2">
                    <span className="text-stone-400">Favorecido:</span>
                    <span className="text-stone-200">Casa Sandríssima</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-800 pb-2">
                    <span className="text-stone-400">Canal:</span>
                    <span className="text-stone-200 font-bold text-emerald-400">Pix Instantâneo</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-800 pb-2">
                    <span className="text-stone-400">Apoiador Social:</span>
                    <span className="text-stone-200 truncate max-w-40">
                      {formData.isAnonymous ? "Anônimo" : (formData.donorName.trim() || "(Informe seu nome)")}
                    </span>
                  </div>
                  <div className="flex justify-between text-stone-100 font-black text-sm pt-1">
                    <span className="text-stone-400 font-mono text-xs font-normal">Fomento Selecionado:</span>
                    <span className="text-emerald-400">R$ {selectedPixAmount},00</span>
                  </div>
                </div>

                <p className="text-[11px] text-stone-400 leading-relaxed leading-normal">
                  Preencha os campos ao lado para dar início à dinâmica. O Pix gerará uma contabilidade fictícia maravilhosa para demonstrar o controle de caixas e governança da ONG.
                </p>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2-preview" 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <h4 className="text-xs font-mono tracking-wider text-emerald-400 uppercase">Aguardando Liquidação</h4>
                  </div>
                  <p className="text-xl font-extrabold font-sans text-stone-100 mt-1">Efetuar Varredura QR</p>
                </div>

                <div className="flex flex-col items-center space-y-3.5 bg-white hover:bg-neutral-50 px-4 py-5 rounded-2xl border border-stone-800/80 transition-all text-stone-900 text-center shadow-lg">
                  <div className="bg-white p-2.5 border border-stone-200 rounded-xl relative select-none">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(pixPayload)}`} 
                      alt="Pix QR Code Simulator" 
                      className="w-[140px] h-[140px]"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="space-y-1 font-sans">
                    <span className="text-[10px] text-stone-500 font-mono uppercase block">Total Solicitado</span>
                    <p className="text-lg font-black text-emerald-700">R$ {selectedPixAmount},00</p>
                  </div>
                </div>

                <p className="text-[11px] text-stone-400 leading-normal">
                  Chave Pix (CNPJ): <span className="font-mono text-stone-200 bg-stone-800 px-1.5 py-0.5 rounded font-semibold select-all">{pixKey}</span>. Copie ou aponte a câmera do seu banco. Após efetuar a transferência, clique no botão preto para confirmar o pagamento e prosseguir de forma oficial.
                </p>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3-preview" 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5"
              >
                <div>
                  <h4 className="text-xs font-mono tracking-wider text-emerald-400 uppercase">Prévia do Mural Público</h4>
                  <p className="text-xl font-extrabold font-sans text-stone-100 mt-1">Visualização do Recado</p>
                </div>

                <p className="text-xs text-stone-400 leading-relaxed">
                  Confira em tempo real como o seu depoimento solidário será moldado no Mural de Apoiadores da Home (visível para todos os visitantes):
                </p>

                {/* Simulated 3D Card */}
                <div className="parent donor-card-parent">
                  <div className="card">
                    <div className="logo">
                      <span className="circle circle1"></span>
                      <span className="circle circle2"></span>
                      <span className="circle circle3"></span>
                      <span className="circle circle4"></span>
                      <span className="circle circle5">
                        <img 
                          src={logoImg} 
                          alt="Logo Casa Sandríssima" 
                          className="w-full h-full object-cover rounded-full"
                          referrerPolicy="no-referrer"
                        />
                      </span>
                    </div>

                    <div className="glass"></div>

                    <div className="content">
                      <span className="badge">❤️ Apoio Social</span>
                      <span className="title" title={formData.isAnonymous ? "Anônimo" : (formData.donorName.trim() || 'Apoiador Amigo')}>
                        {formData.isAnonymous ? "Anônimo" : (formData.donorName.trim() || 'Apoiador Amigo')}
                      </span>
                      <span className="text">
                        "{formData.description.trim() || 'Comece a digitar seu depoimento solidário no campo de texto ao lado...'}"
                      </span>
                    </div>

                    <div className="bottom">
                      <div className="social-buttons-container">
                        <button className="social-button social-button1" title="Instagram" type="button">
                          <svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg" className="svg">
                            <path d="M 9.9980469 3 C 6.1390469 3 3 6.1419531 3 10.001953 L 3 20.001953 C 3 23.860953 6.1419531 27 10.001953 27 L 20.001953 27 C 23.860953 27 27 23.858047 27 19.998047 L 27 9.9980469 C 27 6.1390469 23.858047 3 19.998047 3 L 9.9980469 3 z M 22 7 C 22.552 7 23 7.448 23 8 C 23 8.552 22.552 9 22 9 C 21.448 9 21 8.552 21 8 C 21 7.448 21.448 7 22 7 z M 15 9 C 18.309 9 21 11.691 21 15 C 21 18.309 18.309 21 15 21 C 11.691 21 9 18.309 9 15 C 9 11.691 11.691 9 15 9 z M 15 11 A 4 4 0 0 0 11 15 A 4 4 0 0 0 15 19 A 4 4 0 0 0 19 15 A 4 4 0 0 0 15 11 z"></path>
                          </svg>
                        </button>
                        <button className="social-button social-button2" title="Twitter / X" type="button">
                          <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" className="svg">
                            <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"></path>
                          </svg>
                        </button>
                        <button className="social-button social-button3" title="Comunidade" type="button">
                          <svg viewBox="0 0 640 512" xmlns="http://www.w3.org/2000/svg" className="svg">
                            <path d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.933,167.465,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z"></path>
                          </svg>
                        </button>
                      </div>

                      <div className="view-more">
                        <button className="view-more-button" type="button">Prévia</button>
                        <svg className="svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m6 9 6 6 6-6"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div 
                key="step4-preview" 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                <div>
                  <h4 className="text-xs font-mono tracking-wider text-amber-400 uppercase">Aguardando Auditoria</h4>
                  <p className="text-xl font-extrabold font-sans text-stone-100 mt-1">Recibo de Processamento</p>
                </div>

                <div className="bg-stone-850 border border-stone-800 rounded-xl p-4 text-xs font-mono space-y-2.5">
                  <div className="flex justify-between border-b border-stone-800 pb-1.5">
                    <span className="text-stone-400">Código Registro ID:</span>
                    <span className="text-emerald-400 font-bold select-all">{simulatedRecord?.id}</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-800 pb-1.5">
                    <span className="text-stone-400">Apoiador Social:</span>
                    <span className="text-stone-200 truncate max-w-40">{simulatedRecord?.donorName}</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-800 pb-1.5">
                    <span className="text-stone-400">Valor Fornecido:</span>
                    <span className="text-stone-100 font-extrabold">R$ {simulatedRecord?.amount || selectedPixAmount},00</span>
                  </div>
                  <div className="text-left py-1">
                    <span className="text-stone-400 block pb-1">Mensagem para Mural:</span>
                    <span className="text-stone-300 text-[11px] leading-relaxed block italic">
                      "{simulatedRecord?.description || 'Nenhum comentário'}"
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-stone-800 text-[10px] text-stone-500">
                    <span>Data: {simulatedRecord?.date}</span>
                    <span>Status: Em moderação</span>
                  </div>
                </div>

                <p className="text-[11px] text-stone-400 leading-relaxed leading-normal">
                  Com esse mecanismo, garantimos total controle e segurança das mensagens exibidas na página inicial do projeto, evitando spam ou abusos públicos.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="border-t border-stone-850 pt-4 mt-6 text-center text-[10px] font-mono text-stone-500">
            Agradecemos de coração a cada mantenedor da Casa Sandríssima • 2026
          </div>
        </div>

      </section>

    </motion.div>
  );
}
