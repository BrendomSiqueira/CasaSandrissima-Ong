import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Compass, Sparkles, UserPlus, CheckCircle2, ShieldCheck, HeartHandshake } from 'lucide-react';
import { Associate } from '../types';
import { useModal } from './ModalContext';

interface AssociacaoViewProps {
  onAddAssociate: (associate: Associate) => void;
  associatesList: Associate[];
}

export default function AssociacaoView({ onAddAssociate, associatesList }: AssociacaoViewProps) {
  const { alert } = useModal();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Apoiador' as 'Doador Regular' | 'Voluntário' | 'Apoiador',
    contributionType: 'mensal' as 'mensal' | 'anual' | 'ocasional'
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredName, setRegisteredName] = useState('');

  const roles = [
    { value: 'Apoiador', label: 'Apoiador (Divulgação & Apoio Geral)' },
    { value: 'Doador Regular', label: 'Doador Regular (Apoio Financeiro Fixo)' },
    { value: 'Voluntário', label: 'Voluntário (Doação de Tempo e Oficinas)' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      await alert("Por favor, preencha todos os campos obrigatórios.", "Campos Requeridos", "warn");
      return;
    }

    const newAssociate: Associate = {
      id: 'assoc_' + Math.random().toString(36).substr(2, 9),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      contributionType: formData.contributionType,
      joinedAt: new Date().toLocaleDateString('pt-BR')
    };

    onAddAssociate(newAssociate);
    setRegisteredName(formData.name);
    setIsSuccess(true);

    // Reset Form
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'Apoiador',
      contributionType: 'mensal'
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.3 }}
      className="space-y-12 py-8"
      id="associacao-view-wrapper"
    >
      
      {/* Intro Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="font-sans font-extrabold text-3xl md:text-4.2xl text-stone-900 tracking-tight" id="associacao-title">
          Conecte-se com a Nossa Causa
        </h1>
        <p className="text-stone-600 text-sm md:text-base leading-relaxed">
          Venha fazer parte do comitê de apoio da <strong>Casa Sandríssima</strong>. Conheça nossa missão institucional e descubra como as suas habilidades ou doações estruturam nossas atividades diárias.
        </p>
      </section>

      {/* Grid: Mission, Objectives, Values */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8" id="institution-culture">
        
        {/* Mission card */}
        <div className="bg-white rounded-2xl p-6 border border-stone-150 relative overflow-hidden" id="card-culture-mission">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/50 rounded-full translate-x-8 -translate-y-8"></div>
          <div className="space-y-4 relative z-10">
            <div className="bg-emerald-105 p-3 rounded-xl w-fit text-emerald-600">
              <Compass className="h-6 w-6" />
            </div>
            <h3 className="font-sans font-bold text-lg text-stone-900">Nossa Missão</h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              Promover o desenvolvimento social, educativo, moral e cultural de famílias em situação de vulnerabilidade, por meio da educação popular participativa, da disciplina e da capacitação manual.
            </p>
          </div>
        </div>

        {/* Objective card */}
        <div className="bg-white rounded-2xl p-6 border border-stone-150 relative overflow-hidden" id="card-culture-objective">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/50 rounded-full translate-x-8 -translate-y-8"></div>
          <div className="space-y-4 relative z-10">
            <div className="bg-emerald-105 p-3 rounded-xl w-fit text-emerald-600">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="font-sans font-bold text-lg text-stone-900">Nosso Objetivo</h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              Semear dignidade, expandindo nossa rede de proteção para acolher cada vez mais famílias. Ajudando-os com monitoramento, fornecimento de materiais didáticos e inserção em oficinas qualificadoras.
            </p>
          </div>
        </div>

        {/* Values card */}
        <div className="bg-white rounded-2xl p-6 border border-stone-150 relative overflow-hidden" id="card-culture-values">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/50 rounded-full translate-x-8 -translate-y-8"></div>
          <div className="space-y-4 relative z-10">
            <div className="bg-emerald-105 p-3 rounded-xl w-fit text-emerald-600">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="font-sans font-bold text-lg text-stone-900">Nossos Valores</h3>
            <ul className="text-stone-600 text-sm leading-relaxed space-y-1.5 list-disc pl-4">
              <li>Dignidade Humana e Alento</li>
              <li>Respeito Incondicional à Diversidade</li>
              <li>Coletividade e Compartilhamento</li>
              <li>Educação Popular Emancipadora</li>
              <li>Ética e Governança Aberta</li>
            </ul>
          </div>
        </div>

      </section>

      {/* Main Content Area: Form & Dynamic Info Showcase */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start" id="associacao-workflow">
        
        {/* Left Column: Context guidelines */}
        <div className="lg:col-span-5 space-y-6 text-left">
          <h2 className="font-sans font-extrabold text-2xl text-stone-900 leading-tight">
            Como funciona a Associação?
          </h2>
          <p className="text-stone-600 text-sm md:text-base leading-relaxed">
            Se associar à Casa Sandríssima representa assumir um compromisso comunitário. Você decide seu papel de atuação conforme sua rotina e objetivos:
          </p>

          <div className="space-y-4" id="associacao-roles-desc">
            <div className="flex gap-3">
              <div className="h-2.5 w-2.5 bg-emerald-500 rounded-full mt-2 shrink-0"></div>
              <div>
                <p className="font-semibold text-sm text-stone-900">Apoio Regular</p>
                <p className="text-xs text-stone-500">Ajude mensalmente com repasses Pix de qualquer quantia para a manutenção hidráulica, compra de moldes de costura e livros de inglês.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-2.5 w-2.5 bg-emerald-500 rounded-full mt-2 shrink-0"></div>
              <div>
                <p className="font-semibold text-sm text-stone-900">Voluntariado Técnico</p>
                <p className="text-xs text-stone-500">Doe algumas horas semanais para auxiliar nas monitorias de karatê, palestras informativas ou aulas de apoio.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-2.5 w-2.5 bg-emerald-500 rounded-full mt-2 shrink-0"></div>
              <div>
                <p className="font-semibold text-sm text-stone-900">Conselho Consultivo</p>
                <p className="text-xs text-stone-500">Ajude na organização dos cadastros, acompanhamento escolar das crianças e estruturação dos relatórios anuais.</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-650 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-800 leading-relaxed">
              Todos os associados cadastrados pelo formulário ao lado são registrados localmente nesta sessão e podem ser vistos e auditados na <strong>Área de Associados</strong> em tempo real.
            </p>
          </div>
        </div>

        {/* Right Column: Portal Registration Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200/80 shadow-md p-6 md:p-8" id="associate-form-card">
          
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.form 
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-5 text-left"
                id="associacao-register-form"
              >
                <div className="border-b border-stone-100 pb-4">
                  <h3 className="font-sans font-extrabold text-lg text-stone-900 flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-emerald-650" />
                    Ficha de Cadastro de Associado
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">Insira suas informações abaixo para submeter sua solicitação social.</p>
                </div>

                {/* Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold font-mono text-stone-700 block uppercase" htmlFor="assoc-name">
                    Nome Completo <span className="text-emerald-600">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="assoc-name" 
                    required
                    placeholder="Ex: João da Silva"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full h-11 px-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-sans"
                  />
                </div>

                {/* Grid Contact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold font-mono text-stone-700 block uppercase" htmlFor="assoc-email">
                      E-mail Principal <span className="text-emerald-600">*</span>
                    </label>
                    <input 
                      type="email" 
                      id="assoc-email" 
                      required
                      placeholder="seuemail@exemplo.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full h-11 px-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-sans"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold font-mono text-stone-700 block uppercase" htmlFor="assoc-phone">
                      Telefone / WhatsApp <span className="text-emerald-600">*</span>
                    </label>
                    <input 
                      type="tel" 
                      id="assoc-phone" 
                      required
                      placeholder="Ex: (16) 99999-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full h-11 px-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-sans"
                    />
                  </div>
                </div>

                {/* Role selection */}
                <div className="space-y-1">
                  <label className="text-xs font-bold font-mono text-stone-700 block uppercase" htmlFor="assoc-role">
                    Como Deseja Apoiar <span className="text-emerald-600">*</span>
                  </label>
                  <select
                    id="assoc-role"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                    className="w-full h-11 px-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-sans bg-white"
                  >
                    {roles.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>

                {/* Contribution Type (if financial) */}
                {formData.role === 'Doador Regular' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-1"
                  >
                    <label className="text-xs font-bold font-mono text-stone-700 block uppercase">
                      Frequência da Contribuição
                    </label>
                    <div className="flex gap-3">
                      {['mensal', 'anual', 'ocasional'].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setFormData({...formData, contributionType: t as any})}
                          className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer capitalize ${
                            formData.contributionType === t 
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-700' 
                              : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                <button 
                  type="submit"
                  id="submit-associate-btn"
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 mt-2"
                >
                  Confirmar Inscrição Solidária
                </button>
              </motion.form>
            ) : (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10 space-y-6 flex flex-col items-center"
                id="associacao-success-banner"
              >
                <div className="bg-emerald-100 text-emerald-650 p-4 rounded-full w-16 h-16 flex items-center justify-center shadow-lg transform scale-110 animate-bounce">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                
                <div className="space-y-2 max-w-sm">
                  <h3 className="font-sans font-extrabold text-xl text-stone-900">Inscrição Enviada!</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">
                    Muito obrigado, <strong className="text-emerald-700">{registeredName}</strong>! Sua solicitação de apoio à <strong>Casa Sandríssima</strong> foi salva com sucesso no sistema.
                  </p>
                </div>

                <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-4 text-xs text-stone-500 leading-relaxed max-w-sm flex items-start gap-2.5">
                  <HeartHandshake className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Você agora é parte da nossa história! Pode consultar ou revogar seu cadastro indo em **Portal** &rarr; **Área do Professor/Associado** e visualizando a folha de associados cadastrados.
                  </span>
                </div>

                <button 
                  onClick={() => setIsSuccess(false)}
                  className="px-6 py-2 bg-stone-100 hover:bg-stone-250 text-stone-700 border border-stone-200 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                  id="reset-form-success-btn"
                >
                  Cadastrar novo associado
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </section>

    </motion.div>
  );
}
