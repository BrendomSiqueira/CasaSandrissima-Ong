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
      title: "Aulas de Karatê",
      description: "Aulas gratuitas para promover disciplina, autocontrole, autodefesa e desenvolvimento motor para crianças e jovens.",
      detail: "Mais do que uma simples arte marcial, é uma ferramenta poderosa de transformação pessoal e cidadania.",
      icon: Trophy,
      bgColor: "bg-orange-55 shadow-orange-100",
      iconColor: "text-orange-600 bg-orange-100",
    },
    {
      id: 'english',
      title: "Aulas de Inglês",
      description: "Aulas preparatórias e dinâmicas que ensinam do vocabulário essencial às práticas de conversação reais.",
      detail: "Aprender um novo idioma vai muito além de conhecer novas palavras — é abrir portas para um mundo de oportunidades.",
      icon: BookOpen,
      bgColor: "bg-blue-55 shadow-blue-100",
      iconColor: "text-blue-600 bg-blue-100",
    },
    {
      id: 'sewing',
      title: "Aulas de Costura",
      description: "Oficinas práticas focadas no desenvolvimento técnico de modelagem, corte, costura e customizações.",
      detail: "Facilita a autonomia, geração de renda e reintegração com criatividade na comunidade local.",
      icon: Scissors,
      bgColor: "bg-purple-55 shadow-purple-100",
      iconColor: "text-purple-600 bg-purple-100",
    },
    {
      id: 'pilates',
      title: "Aulas de Pilates",
      description: "Toda sexta-feira, das 09h às 10h da manhã. Sessões focadas em postura, flexibilidade e fortalecimento do core/powerhouse de forma segura.",
      detail: "Apenas 40 reais mensais! Sede: Rua Filomena Ana Rita, 390 - Jardim Ipanema.",
      icon: Activity,
      bgColor: "bg-teal-55 shadow-teal-100",
      iconColor: "text-teal-600 bg-teal-100",
    },
    {
      id: 'embroidery',
      title: "Aulas de Bordados",
      description: "Toda terça-feira, das 13h às 16h. Curso de bordado livre, artístico e tradicional, aproximando afeto, terapia ocupacional e arte.",
      detail: "Totalmente de graça! Ideal para desenvolvimento pessoal, terapia, socialização e geração de renda.",
      icon: Palette,
      bgColor: "bg-rose-55 shadow-rose-100",
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
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
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

          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            {/* Visual Abstract Semente Graphic */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 bg-stone-55 rounded-full border border-stone-200/60 p-2 flex items-center justify-center shadow-lg shadow-stone-200/50 my-4 sm:my-0" id="hero-visual-graphic">
              {/* Animated subtle outer orbit rings */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-10px] sm:inset-[-14px] rounded-full border border-dashed border-emerald-300/40 pointer-events-none"
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-100/20 via-stone-100/30 to-emerald-50/20 animate-pulse pointer-events-none"></div>
              
              <img
                src={logoImg}
                alt="Logo Casa Sandríssima"
                className="relative z-10 w-full h-full rounded-full object-cover shadow-sm hover:scale-[1.02] transition-transform duration-300 select-none"
                referrerPolicy="no-referrer"
              />
              
              {/* Floating interactive course tags - desktop & tablet absolute floating */}
              {/* 1. Karatê */}
              <motion.button
                id="hero-orbit-karate"
                onClick={() => handleOpenWorkshop('karate')}
                animate={{ 
                  y: [0, -6, 0],
                  scale: [1, 1.03, 1]
                }}
                transition={{ 
                  duration: 3.2, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                whileHover={{ scale: 1.1, y: -8 }}
                whileTap={{ scale: 0.95 }}
                title="Ver detalhes da oficina de Karatê"
                className="absolute -top-2.5 left-2 sm:-top-3 sm:left-4 z-20 bg-white/95 backdrop-blur-xs py-1 sm:py-1.5 px-2.5 sm:px-3.5 rounded-full shadow-lg hover:shadow-orange-200/60 text-[11px] sm:text-xs font-bold text-stone-800 border border-orange-200/80 flex items-center gap-1 sm:gap-1.5 cursor-pointer transition-colors hover:border-orange-400 group"
              >
                <span className="text-xs sm:text-sm group-hover:scale-125 transition-transform">🥋</span>
                <span className="whitespace-nowrap">Karatê Grátis</span>
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping ml-0.5 hidden sm:inline-block" />
              </motion.button>

              {/* 2. Inglês */}
              <motion.button
                id="hero-orbit-english"
                onClick={() => handleOpenWorkshop('english')}
                animate={{ 
                  y: [0, -5, 0],
                  x: [0, 3, 0],
                  scale: [1, 1.03, 1]
                }}
                transition={{ 
                  duration: 3.8, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 0.4
                }}
                whileHover={{ scale: 1.1, y: -7 }}
                whileTap={{ scale: 0.95 }}
                title="Ver detalhes do curso de Inglês"
                className="absolute top-1/4 -right-4 sm:-right-8 md:-right-10 z-20 bg-white/95 backdrop-blur-xs py-1 sm:py-1.5 px-2.5 sm:px-3.5 rounded-full shadow-lg hover:shadow-blue-200/60 text-[11px] sm:text-xs font-bold text-stone-800 border border-blue-200/80 flex items-center gap-1 sm:gap-1.5 cursor-pointer transition-colors hover:border-blue-400 group"
              >
                <span className="text-xs sm:text-sm group-hover:scale-125 transition-transform">🇬🇧</span>
                <span className="whitespace-nowrap">Inglês</span>
              </motion.button>

              {/* 3. Pilates */}
              <motion.button
                id="hero-orbit-pilates"
                onClick={() => handleOpenWorkshop('pilates')}
                animate={{ 
                  y: [0, -6, 0],
                  scale: [1, 1.04, 1]
                }}
                transition={{ 
                  duration: 4.2, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 0.9
                }}
                whileHover={{ scale: 1.1, y: -8 }}
                whileTap={{ scale: 0.95 }}
                title="Ver detalhes das aulas de Pilates"
                className="absolute bottom-8 -right-3 sm:bottom-12 sm:-right-6 z-20 bg-white/95 backdrop-blur-xs py-1 sm:py-1.5 px-2.5 sm:px-3.5 rounded-full shadow-lg hover:shadow-teal-200/60 text-[11px] sm:text-xs font-bold text-stone-800 border border-teal-200/80 flex items-center gap-1 sm:gap-1.5 cursor-pointer transition-colors hover:border-teal-400 group"
              >
                <span className="text-xs sm:text-sm group-hover:scale-125 transition-transform">🧘</span>
                <span className="whitespace-nowrap">Pilates</span>
              </motion.button>

              {/* 4. Bordados */}
              <motion.button
                id="hero-orbit-embroidery"
                onClick={() => handleOpenWorkshop('embroidery')}
                animate={{ 
                  y: [0, 6, 0],
                  scale: [1, 1.03, 1]
                }}
                transition={{ 
                  duration: 3.5, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 1.3
                }}
                whileHover={{ scale: 1.1, y: 8 }}
                whileTap={{ scale: 0.95 }}
                title="Ver detalhes da oficina de Bordados"
                className="absolute -bottom-2.5 left-1/4 sm:-bottom-3 sm:left-1/3 z-20 bg-white/95 backdrop-blur-xs py-1 sm:py-1.5 px-2.5 sm:px-3.5 rounded-full shadow-lg hover:shadow-rose-200/60 text-[11px] sm:text-xs font-bold text-stone-800 border border-rose-200/80 flex items-center gap-1 sm:gap-1.5 cursor-pointer transition-colors hover:border-rose-400 group"
              >
                <span className="text-xs sm:text-sm group-hover:scale-125 transition-transform">🪡</span>
                <span className="whitespace-nowrap">Bordados</span>
              </motion.button>

              {/* 5. Costura */}
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
                whileHover={{ scale: 1.1, y: -7 }}
                whileTap={{ scale: 0.95 }}
                title="Ver detalhes da oficina de Costura"
                className="absolute bottom-10 -left-4 sm:bottom-16 sm:-left-8 z-20 bg-white/95 backdrop-blur-xs py-1 sm:py-1.5 px-2.5 sm:px-3.5 rounded-full shadow-lg hover:shadow-purple-200/60 text-[11px] sm:text-xs font-bold text-stone-800 border border-purple-200/80 flex items-center gap-1 sm:gap-1.5 cursor-pointer transition-colors hover:border-purple-400 group"
              >
                <span className="text-xs sm:text-sm group-hover:scale-125 transition-transform">🧵</span>
                <span className="whitespace-nowrap">Costura</span>
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

      {/* Offered Activities Cards Grid */}
      <section className="space-y-10" id="workshops-list">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="font-sans font-extrabold text-2xl md:text-4.2xl text-stone-900 tracking-tight">
            Nossos Pilares de Apoio
          </h2>
          <p className="text-stone-600 text-sm md:text-base leading-relaxed">
            Oferecemos oficinas práticas e teóricas gratuitas com foco no desenvolvimento integral e fomento de novas perspectivas sociais.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activities.map((act, index) => {
            const Icon = act.icon;
            return (
              <motion.div 
                key={index}
                variants={itemVariants}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                id={`activity-card-${index}`}
                onClick={() => handleOpenWorkshop(act.id)}
                className="bg-white rounded-2xl p-6 border border-stone-150 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/10 transition-all text-left flex flex-col justify-between cursor-pointer group"
              >
                <div className="space-y-4">
                  <div className={`w-fit p-3 rounded-xl ${act.iconColor} group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-sans font-bold text-lg text-stone-900 group-hover:text-emerald-700 transition-colors">{act.title}</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">{act.description}</p>
                  <p className="text-xs text-stone-500 border-l-2 border-stone-200 pl-3 leading-relaxed italic">
                    "{act.detail}"
                  </p>
                </div>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenWorkshop(act.id);
                  }}
                  className="mt-6 text-sm font-semibold text-emerald-700 hover:text-emerald-800 hover:underline inline-flex items-center gap-1 cursor-pointer w-fit"
                >
                  Saiba mais sobre a oficina <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
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
