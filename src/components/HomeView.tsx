import React from 'react';
import { motion } from 'motion/react';
import { Sprout, BookOpen, Scissors, Trophy, GraduationCap, MapPin, Phone, Mail, ChevronRight, Heart, Activity, Palette, Image as ImageIcon } from 'lucide-react';
import { ActiveTab } from '../types';
import logoImg from '../assets/images/casa_sandrissima_green_white_logo_1779323893215.png';
import { useFirebase } from '../firebaseContext';
import TactileButton from './TactileButton';
import DonorCommentsShowcase from './DonorCommentsShowcase';

interface HomeViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  onSelectWorkshop?: (workshopId: string) => void;
}

export default function HomeView({ setActiveTab, onSelectWorkshop }: HomeViewProps) {
  const { students, associates, donations } = useFirebase();

  const handleOpenWorkshop = (workshopId: string) => {
    if (onSelectWorkshop) {
      onSelectWorkshop(workshopId);
    } else {
      setActiveTab('projetos');
    }
  };

  const activeStudentsCount = students.filter(s => s.status === 'active').length;
  // Fully synchronized stats of live registered members
  const totalStudents = activeStudentsCount;
  const totalAssociates = associates.length;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  const activities = [
    {
      id: 'karate',
      title: "Karatê Comunitário",
      fullTitle: "Aulas de Karatê",
      description: "Disciplina, autodefesa e desenvolvimento motor para crianças e jovens.",
      detail: "Mais do que uma simples arte marcial, é uma ferramenta de transformação pessoal e cidadania.",
      icon: Trophy,
      emoji: "🥋",
      typeTag: "100% Gratuito",
      themeClass: "ticket-theme-karate",
      schedule: "Ter & Qui • 18h30",
      investment: "Gratuito",
      venue: "Sede Sandríssima",
      barcodeId: "CS-2026-KARATE-PASS",
      admitLabel: "Vagas",
      admitNum: "01",
      iconColor: "text-orange-600 bg-orange-100",
    },
    {
      id: 'english',
      title: "Inglês do Futuro",
      fullTitle: "Aulas de Inglês",
      description: "Vocabulário prático e conversação real abrindo portas para o mundo.",
      detail: "Aprender um novo idioma é abrir caminhos para oportunidades acadêmicas e profissionais.",
      icon: BookOpen,
      emoji: "🇬🇧",
      typeTag: "Capacitação",
      themeClass: "ticket-theme-english",
      schedule: "Seg & Qua • 15h00",
      investment: "Gratuito",
      venue: "Sala de Estudos",
      barcodeId: "CS-2026-ENGLISH-PASS",
      admitLabel: "Nível",
      admitNum: "02",
      iconColor: "text-blue-600 bg-blue-100",
    },
    {
      id: 'sewing',
      title: "Corte & Costura",
      fullTitle: "Aulas de Costura",
      description: "Modelagem técnica, confecção e customizações para autonomia e renda.",
      detail: "Facilita a autonomia financeira, geração de renda e reintegração com criatividade na comunidade.",
      icon: Scissors,
      emoji: "🧵",
      typeTag: "Oficina Prática",
      themeClass: "ticket-theme-sewing",
      schedule: "Terças • 14h00",
      investment: "Gratuito",
      venue: "Ateliê Criativo",
      barcodeId: "CS-2026-SEWING-PASS",
      admitLabel: "Ateliê",
      admitNum: "03",
      iconColor: "text-purple-600 bg-purple-100",
    },
    {
      id: 'pilates',
      title: "Pilates & Postura",
      fullTitle: "Aulas de Pilates",
      description: "Postura, flexibilidade e fortalecimento do core de forma segura e guiada.",
      detail: "Sessões semanais focadas em respiração, fortalecimento muscular e saúde integral.",
      icon: Activity,
      emoji: "🧘",
      typeTag: "Saúde & Corpo",
      themeClass: "ticket-theme-pilates",
      schedule: "Sextas • 09h00",
      investment: "R$ 40/mês",
      venue: "Espaço Saúde",
      barcodeId: "CS-2026-PILATES-PASS",
      admitLabel: "Turma",
      admitNum: "04",
      iconColor: "text-teal-600 bg-teal-100",
    },
    {
      id: 'embroidery',
      title: "Bordado & Arte",
      fullTitle: "Aulas de Bordados",
      description: "Bordado livre e tradicional aproximando afeto, terapia e arte manual.",
      detail: "Ideal para desenvolvimento pessoal, socialização, terapia ocupacional e renda.",
      icon: Palette,
      emoji: "🪡",
      typeTag: "100% Gratuito",
      themeClass: "ticket-theme-embroidery",
      schedule: "Terças • 13h00",
      investment: "Gratuito",
      venue: "Espaço de Artes",
      barcodeId: "CS-2026-EMBROID-PASS",
      admitLabel: "Artes",
      admitNum: "05",
      iconColor: "text-rose-600 bg-rose-105",
    },
  ];

  const stats = [
    { label: "Alunos Cadastrados", value: `${totalStudents}` },
    { label: "Cursos Oferecidos", value: "5" },
    { label: "Associados e Apoiadores", value: `${totalAssociates}` },
  ];

  return (
    <motion.div 
      initial="hidden" 
      animate="show" 
      variants={containerVariants}
      className="space-y-16 py-8"
      id="home-view-wrapper"
    >
      
      {/* Hero / Banner Section */}
      <section className="relative overflow-hidden bg-white/80 backdrop-blur-md rounded-3xl p-8 md:p-16 border border-emerald-100/80 shadow-sm hover:shadow-md transition-shadow" id="hero-section">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-100/35 via-transparent to-transparent opacity-70"></div>
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 items-center">
          <div className="lg:col-span-7 space-y-6 lg:pr-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100/60 rounded-full border border-emerald-200">
              <Sprout className="h-4 w-4 text-emerald-700 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-800 tracking-wide uppercase">Seja bem-vindo</span>
            </div>
            
            <h1 className="font-sans font-extrabold text-3xl md:text-5xl leading-tight text-stone-900 tracking-tight" id="hero-tagline">
              Imensidão de uma <span className="text-emerald-600 border-b-2 border-emerald-200">semente</span>. <br />
              Semear dignidade, cultivar inclusão, florescer em comunidade.
            </h1>
            
            <p className="text-stone-600 text-base md:text-lg leading-relaxed max-w-xl">
              A <strong>Casa Sandríssima</strong> é uma organização comunitária que busca melhorar a qualidade de vida de famílias em situação de risco e vulnerabilidade no bairro Jardim Ipanema em Franca - SP. Apoiamos a inclusão e transformação por meio da educação popular.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <TactileButton 
                id="hero-donate-btn"
                variant="primary"
                size="md"
                onClick={() => setActiveTab('doacoes')}
                icon={<Heart className="h-4 w-4 fill-white" />}
              >
                Quero Apoiar a Causa
              </TactileButton>

              <TactileButton 
                id="hero-projects-btn"
                variant="secondary"
                size="md"
                onClick={() => setActiveTab('projetos')}
                icon={<ChevronRight className="h-4 w-4 text-stone-500" />}
                iconPosition="right"
              >
                Ver Projetos
              </TactileButton>

              <TactileButton 
                id="hero-galeria-btn"
                variant="glass"
                size="md"
                onClick={() => setActiveTab('galeria')}
                icon={<ImageIcon className="h-4 w-4 text-emerald-700" />}
              >
                Galeria de Fotos
              </TactileButton>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col items-center justify-center w-full">
            {/* Visual Centered Logo Stage with Harmonious Orbital Constellation */}
            <div className="relative w-80 h-80 sm:w-[360px] sm:h-[360px] md:w-[390px] md:h-[390px] lg:w-[410px] lg:h-[410px] flex items-center justify-center my-4 sm:my-0 select-none" id="hero-visual-graphic">
              
              {/* Centered Soft Radial Halo */}
              <div className="absolute inset-2 sm:inset-3 rounded-full bg-radial from-emerald-100/75 via-emerald-50/30 to-transparent pointer-events-none" />

              {/* Centered Subtle Orbital Trajectory Ring */}
              <div className="absolute inset-3 sm:inset-4 rounded-full border border-dashed border-emerald-300/45 pointer-events-none" />

              {/* Subtle micro orbital sparkles */}
              <div className="absolute top-4 right-10 w-2 h-2 rounded-full bg-emerald-400/80 animate-pulse pointer-events-none" />
              <div className="absolute bottom-8 left-8 w-2 h-2 rounded-full bg-lime-400/80 animate-pulse pointer-events-none" />

              {/* Centered Casa Sandríssima Logo - Grand, Clear and Prominent */}
              <img
                src={logoImg}
                alt="Logo Casa Sandríssima"
                className="relative z-10 w-[84%] h-[84%] sm:w-[86%] sm:h-[86%] md:w-[88%] md:h-[88%] object-contain hover:scale-105 transition-transform duration-300 select-none drop-shadow-md"
                referrerPolicy="no-referrer"
              />
              
              {/* Symmetrically Distributed Orbital Course Pills (5-point harmonious constellation) */}
              {/* 1. Karatê Grátis - Top Center Apex (12 o'clock) */}
              <motion.button
                id="hero-orbit-karate"
                onClick={() => handleOpenWorkshop('karate')}
                animate={{ 
                  y: [0, -5, 0],
                  scale: [1, 1.03, 1]
                }}
                transition={{ 
                  duration: 3.2, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                whileHover={{ scale: 1.08, y: -7 }}
                whileTap={{ scale: 0.95 }}
                title="Ver detalhes da oficina de Karatê"
                className="absolute -top-2 sm:-top-3 left-1/2 -translate-x-1/2 z-20 bg-white/95 backdrop-blur-xs py-1.5 px-3.5 sm:px-4 rounded-full shadow-md hover:shadow-orange-200/80 text-[11px] sm:text-xs font-bold text-stone-800 border border-orange-200/90 flex items-center gap-1.5 cursor-pointer transition-colors hover:border-orange-400 group whitespace-nowrap"
              >
                <span className="text-xs sm:text-sm group-hover:scale-125 transition-transform">🥋</span>
                <span>Karatê Grátis</span>
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping ml-0.5 hidden sm:inline-block" />
              </motion.button>

              {/* 2. Inglês - Upper Right (approx. 2 o'clock) */}
              <motion.button
                id="hero-orbit-english"
                onClick={() => handleOpenWorkshop('english')}
                animate={{ 
                  y: [0, -5, 0],
                  x: [0, 2, 0],
                  scale: [1, 1.03, 1]
                }}
                transition={{ 
                  duration: 3.8, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 0.4
                }}
                whileHover={{ scale: 1.08, y: -7 }}
                whileTap={{ scale: 0.95 }}
                title="Ver detalhes do curso de Inglês"
                className="absolute top-[20%] -right-2 sm:-right-3 md:-right-5 z-20 bg-white/95 backdrop-blur-xs py-1.5 px-3.5 sm:px-4 rounded-full shadow-md hover:shadow-blue-200/80 text-[11px] sm:text-xs font-bold text-stone-800 border border-blue-200/90 flex items-center gap-1.5 cursor-pointer transition-colors hover:border-blue-400 group whitespace-nowrap"
              >
                <span className="text-xs sm:text-sm group-hover:scale-125 transition-transform">🇬🇧</span>
                <span>Inglês</span>
              </motion.button>

              {/* 3. Costura - Upper Left (approx. 10 o'clock, mirroring Inglês) */}
              <motion.button
                id="hero-orbit-sewing"
                onClick={() => handleOpenWorkshop('sewing')}
                animate={{ 
                  y: [0, -5, 0],
                  x: [0, -2, 0],
                  scale: [1, 1.03, 1]
                }}
                transition={{ 
                  duration: 3.9, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 0.7
                }}
                whileHover={{ scale: 1.08, y: -7 }}
                whileTap={{ scale: 0.95 }}
                title="Ver detalhes da oficina de Costura"
                className="absolute top-[20%] -left-2 sm:-left-3 md:-left-5 z-20 bg-white/95 backdrop-blur-xs py-1.5 px-3.5 sm:px-4 rounded-full shadow-md hover:shadow-purple-200/80 text-[11px] sm:text-xs font-bold text-stone-800 border border-purple-200/90 flex items-center gap-1.5 cursor-pointer transition-colors hover:border-purple-400 group whitespace-nowrap"
              >
                <span className="text-xs sm:text-sm group-hover:scale-125 transition-transform">🧵</span>
                <span>Costura</span>
              </motion.button>

              {/* 4. Pilates - Lower Right (approx. 4:30 o'clock) */}
              <motion.button
                id="hero-orbit-pilates"
                onClick={() => handleOpenWorkshop('pilates')}
                animate={{ 
                  y: [0, -5, 0],
                  scale: [1, 1.03, 1]
                }}
                transition={{ 
                  duration: 4.2, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 0.9
                }}
                whileHover={{ scale: 1.08, y: -7 }}
                whileTap={{ scale: 0.95 }}
                title="Ver detalhes das aulas de Pilates"
                className="absolute bottom-[10%] -right-1 sm:-right-2 md:-right-4 z-20 bg-white/95 backdrop-blur-xs py-1.5 px-3.5 sm:px-4 rounded-full shadow-md hover:shadow-teal-200/80 text-[11px] sm:text-xs font-bold text-stone-800 border border-teal-200/90 flex items-center gap-1.5 cursor-pointer transition-colors hover:border-teal-400 group whitespace-nowrap"
              >
                <span className="text-xs sm:text-sm group-hover:scale-125 transition-transform">🧘</span>
                <span>Pilates</span>
              </motion.button>

              {/* 5. Bordados - Lower Left (approx. 7:30 o'clock, mirroring Pilates) */}
              <motion.button
                id="hero-orbit-embroidery"
                onClick={() => handleOpenWorkshop('embroidery')}
                animate={{ 
                  y: [0, 5, 0],
                  scale: [1, 1.03, 1]
                }}
                transition={{ 
                  duration: 3.6, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 1.2
                }}
                whileHover={{ scale: 1.08, y: 7 }}
                whileTap={{ scale: 0.95 }}
                title="Ver detalhes da oficina de Bordados"
                className="absolute bottom-[10%] -left-1 sm:-left-2 md:-left-4 z-20 bg-white/95 backdrop-blur-xs py-1.5 px-3.5 sm:px-4 rounded-full shadow-md hover:shadow-rose-200/80 text-[11px] sm:text-xs font-bold text-stone-800 border border-rose-200/90 flex items-center gap-1.5 cursor-pointer transition-colors hover:border-rose-400 group whitespace-nowrap"
              >
                <span className="text-xs sm:text-sm group-hover:scale-125 transition-transform">🪡</span>
                <span>Bordados</span>
              </motion.button>
            </div>

            {/* Mobile quick scroll pill helper */}
            <div className="flex sm:hidden items-center justify-center gap-1.5 text-[11px] text-stone-500 font-medium mt-3 bg-stone-100/80 px-3 py-1 rounded-full">
              <span>Toque em qualquer curso para ver a ementa</span>
              <ChevronRight className="h-3 w-3 text-emerald-600" />
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="bg-stone-900 rounded-3xl p-8 text-white grid grid-cols-1 md:grid-cols-3 gap-6 text-center border border-stone-850" id="impact-metrics">
        {stats.map((stat, idx) => (
          <div key={idx} className="space-y-1.5">
            <span className="block font-mono text-3xl md:text-4xl font-black text-emerald-400 tracking-tight">
              {stat.value}
            </span>
            <span className="block text-xs md:text-sm text-stone-400 font-medium">
              {stat.label}
            </span>
          </div>
        ))}
      </section>

      {/* Mural de Agradecimento aos Doadores & Depoimentos Dinâmico */}
      <DonorCommentsShowcase 
        donations={donations} 
        setActiveTab={setActiveTab} 
      />

      {/* Offered Activities / 3D Holographic Workshop Passes */}
      <section className="space-y-10" id="workshops-list">
        <div className="text-center max-w-2xl mx-auto space-y-3 bg-white/90 backdrop-blur-md rounded-3xl border border-emerald-100/90 p-6 sm:p-8 shadow-xs">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100/70 text-emerald-800 border border-emerald-200/80 rounded-full text-xs font-bold uppercase tracking-wider mx-auto">
            <span>🎟️ Passaportes do Saber</span>
          </div>
          <h2 className="font-sans font-extrabold text-2xl md:text-4xl text-stone-900 tracking-tight">
            Nossos Cursos e Oficinas Comunitárias
          </h2>
          <p className="text-stone-700 text-sm md:text-base leading-relaxed font-medium">
            Selecione seu passaporte comunitário para conferir a ementa detalhada, horários, fotos e garantir sua inscrição gratuita.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {activities.map((act, index) => {
            return (
              <motion.div 
                key={index}
                variants={itemVariants}
                id={`activity-card-${index}`}
                className="w-full flex justify-center"
              >
                <div className="ticket-canvas">
                  <div 
                    className={`ticket-wrapper ${act.themeClass}`}
                    onClick={() => handleOpenWorkshop(act.id)}
                    title={`Clique para acessar a ementa e detalhes de ${act.title}`}
                  >
                    <div className="ticket">
                      {/* Main Ticket Body */}
                      <div className="t-main">
                        <div className="t-content">
                          <div className="t-header">
                            <div className="t-logo">
                              <span className="t-logo-icon">{act.emoji}</span>
                              <span className="font-extrabold text-xs uppercase tracking-wide text-stone-100">
                                Casa Sandríssima
                              </span>
                            </div>
                            <div className="t-type">{act.typeTag}</div>
                          </div>

                          <div className="t-title">
                            {act.title}
                          </div>
                          
                          <div className="t-subtitle">
                            {act.description}
                          </div>

                          <div className="t-details">
                            <div className="t-detail-item">
                              <span className="t-label">Horários</span>
                              <span className="t-value">{act.schedule}</span>
                            </div>
                            <div className="t-detail-item">
                              <span className="t-label">Investimento</span>
                              <span className="t-value">{act.investment}</span>
                            </div>
                            <div className="t-detail-item">
                              <span className="t-label">Local</span>
                              <span className="t-value">{act.venue}</span>
                            </div>
                            <div className="t-detail-item">
                              <span className="t-label">Status</span>
                              <span className="t-value text-emerald-400">Vagas Abertas</span>
                            </div>
                          </div>
                        </div>

                        {/* Perforation Cutout Line */}
                        <div className="t-perforation">
                          <div className="t-perf-line"></div>
                        </div>
                      </div>

                      {/* Ticket Stub Bottom */}
                      <div className="t-stub">
                        <div className="t-barcode-container">
                          <div className="t-barcode"></div>
                          <div className="t-barcode-id">{act.barcodeId}</div>
                        </div>
                        <div className="t-admit">
                          <div className="t-admit-text">{act.admitLabel}</div>
                          <div className="t-admit-num">{act.admitNum}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* "Sobre Nós" Segment */}
      <section className="bg-white/80 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-emerald-100/70 shadow-sm" id="about-us-info">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <h2 className="font-sans font-extrabold text-2xl md:text-3xl text-stone-900 tracking-tight">
              Sobre Nós • História da Semente
            </h2>
            <div className="space-y-4 text-stone-600 text-sm md:text-base leading-relaxed">
              <p>
                A <strong>Casa Sandríssima</strong> é consolidada como uma instituição comunitária ativa que direciona seus esforços diretamente para a valorização de famílias que convivem com desigualdades severas.
              </p>
              <p>
                Nosso pilar fundamental é a <strong>educação popular</strong>, operando como um canal aberto de escuta coletiva, dignidade, intercâmbio cultural e fortalecimento das estruturas e redes familiares. Acreditamos na pluralidade comunitária e no engajamento cívico.
              </p>
              <p>
                Além das aulas técnicas e metodologias esportivo-culturais, nossa sede abriga reuniões participativas, doação de suprimentos essenciais e debates sociológicos sobre inserção produtiva de minorias.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 pt-4 border-t border-stone-200/60" id="embedded-socials">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 text-emerald-700 p-2.5 rounded-xl">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs font-mono tracking-wider uppercase text-stone-500 block">Sede da Casa</span>
                  <span className="text-sm font-bold text-stone-850 block">Rua Filomena Ana Rita, 390 • Franca/SP</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 text-emerald-700 p-2.5 rounded-xl">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs font-mono tracking-wider uppercase text-stone-500 block">Atendimento</span>
                  <span className="text-sm font-bold text-stone-850 block">(16) 99277-4601</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Core Values Showcase */}
          <div className="lg:col-span-6 bg-white p-6 md:p-8 rounded-2xl border border-stone-150 shadow-sm space-y-6" id="core-pillars">
            <h3 className="font-sans font-extrabold text-lg text-stone-900 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-emerald-600" />
              Por que nos apoiar?
            </h3>
            
            <div className="space-y-4">
              <div className="flex gap-4 p-3 hover:bg-stone-50 rounded-xl transition-all">
                <span className="text-2xl font-mono font-black text-emerald-250 italic">01</span>
                <div>
                  <h4 className="font-bold text-sm text-stone-900">Educação Solidária e Livre</h4>
                  <p className="text-stone-500 text-xs md:text-sm mt-0.5">Disponibilizamos suporte pedagógico livre e monitorias técnicas de forma cem por cento gratuita.</p>
                </div>
              </div>
              <div className="flex gap-4 p-3 hover:bg-stone-50 rounded-xl transition-all">
                <span className="text-2xl font-mono font-black text-emerald-250 italic">02</span>
                <div>
                  <h4 className="font-bold text-sm text-stone-900">Inclusão Direta de Famílias</h4>
                  <p className="text-stone-500 text-xs md:text-sm mt-0.5">Fornecemos suporte direto a mães, pais e jovens estimulando o autoemprego e a inclusão social.</p>
                </div>
              </div>
              <div className="flex gap-4 p-3 hover:bg-stone-50 rounded-xl transition-all">
                <span className="text-2xl font-mono font-black text-emerald-250 italic">03</span>
                <div>
                  <h4 className="font-bold text-sm text-stone-900">Gestão Transparente</h4>
                  <p className="text-stone-500 text-xs md:text-sm mt-0.5">Controlamos cada insumo e ajuda financeira fornecendo governança de modo aberto aos associados.</p>
                </div>
              </div>
            </div>

            <TactileButton 
              onClick={() => setActiveTab('doacoes')}
              variant="primary"
              size="lg"
              className="w-full"
              id="about-card-donate-btn"
              icon={<Heart className="h-5 w-5 fill-white" />}
            >
              Fazer Minha Doação de Apoio
            </TactileButton>
          </div>

        </div>
      </section>

    </motion.div>
  );
}
