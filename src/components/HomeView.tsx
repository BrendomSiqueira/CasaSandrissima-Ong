import React from 'react';
import { motion } from 'motion/react';
import { Sprout, BookOpen, Scissors, Trophy, GraduationCap, MapPin, Phone, Mail, ChevronRight, Heart, Activity, Palette, Image as ImageIcon } from 'lucide-react';
import { ActiveTab } from '../types';
import logoImg from '../assets/images/casa_sandrissima_green_white_logo_1779323893215.png';
import { useFirebase } from '../firebaseContext';

interface HomeViewProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export default function HomeView({ setActiveTab }: HomeViewProps) {
  const { students, associates, donations } = useFirebase();

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
      title: "Aulas de Karatê",
      description: "Aulas gratuitas para promover disciplina, autocontrole, autodefesa e desenvolvimento motor para crianças e jovens.",
      detail: "Mais do que uma simples arte marcial, é uma ferramenta poderosa de transformação pessoal e cidadania.",
      icon: Trophy,
      bgColor: "bg-orange-55 shadow-orange-100",
      iconColor: "text-orange-600 bg-orange-100",
    },
    {
      title: "Aulas de Inglês",
      description: "Aulas preparatórias e dinâmicas que ensinam do vocabulário essencial às práticas de conversação reais.",
      detail: "Aprender um novo idioma vai muito além de conhecer novas palavras — é abrir portas para um mundo de oportunidades.",
      icon: BookOpen,
      bgColor: "bg-blue-55 shadow-blue-100",
      iconColor: "text-blue-600 bg-blue-100",
    },
    {
      title: "Aulas de Costura",
      description: "Oficinas práticas focadas no desenvolvimento técnico de modelagem, corte, costura e customizações.",
      detail: "Facilita a autonomia, geração de renda e reintegração com criatividade na comunidade local.",
      icon: Scissors,
      bgColor: "bg-purple-55 shadow-purple-100",
      iconColor: "text-purple-600 bg-purple-100",
    },
    {
      title: "Aulas de Pilates",
      description: "Toda sexta-feira, das 09h às 10h da manhã. Sessões focadas em postura, flexibilidade e fortalecimento do core/powerhouse de forma segura.",
      detail: "Apenas 40 reais mensais! Sede: Rua Filomena Ana Rita, 390 - Jardim Ipanema.",
      icon: Activity,
      bgColor: "bg-teal-55 shadow-teal-100",
      iconColor: "text-teal-600 bg-teal-100",
    },
    {
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
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-stone-50 rounded-3xl p-8 md:p-16 border border-emerald-100/40 shadow-sm" id="hero-section">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-100/20 via-transparent to-transparent opacity-60"></div>
        
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
              <button 
                id="hero-donate-btn"
                onClick={() => setActiveTab('doacoes')}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-md shadow-emerald-200/50 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <Heart className="h-4 w-4 fill-white" />
                Quero Apoiar a Causa
              </button>
              <button 
                id="hero-projects-btn"
                onClick={() => setActiveTab('projetos')}
                className="px-6 py-3 bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 font-medium rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                Ver Projetos
                <ChevronRight className="h-4 w-4 text-stone-400" />
              </button>
              <button 
                id="hero-galeria-btn"
                onClick={() => setActiveTab('galeria')}
                className="px-5 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 font-medium rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                <ImageIcon className="h-4 w-4 text-emerald-600" />
                Galeria de Fotos
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            {/* Visual Abstract Semente Graphic */}
            <div className="relative w-72 h-72 md:w-80 md:h-80 bg-stone-55 rounded-full border border-stone-200/50 p-2 flex items-center justify-center shadow-md shadow-stone-200/40" id="hero-visual-graphic">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-100/10 via-stone-100/30 to-emerald-50/10 animate-pulse"></div>
              <img
                src={logoImg}
                alt="Logo Casa Sandríssima"
                className="relative z-10 w-full h-full rounded-full object-cover shadow-sm hover:scale-[1.02] hover:rotate-2 transition-transform duration-305"
                referrerPolicy="no-referrer"
              />
              
              {/* Floating tags */}
              <div className="absolute -top-2 left-6 z-20 bg-white py-1.5 px-3 rounded-full shadow-md text-xs font-semibold text-stone-700 border border-stone-100 flex items-center gap-1.5 animate-bounce">
                🥋 Karatê Grátis
              </div>
              <div className="absolute top-1/3 -right-8 z-20 bg-white py-1.5 px-3 rounded-full shadow-md text-xs font-semibold text-stone-700 border border-stone-100 flex items-center gap-1.5">
                Inglês
              </div>
              <div className="absolute bottom-16 -right-4 z-20 bg-white py-1.5 px-3 rounded-full shadow-md text-xs font-semibold text-stone-700 border border-stone-100 flex items-center gap-1.5">
                🧘 Pilates
              </div>
              <div className="absolute -bottom-2 left-1/3 z-20 bg-white py-1.5 px-3 rounded-full shadow-md text-xs font-semibold text-stone-700 border border-stone-100 flex items-center gap-1.5">
                🪡 Bordados
              </div>
              <div className="absolute bottom-14 -left-6 z-20 bg-white py-1.5 px-3 rounded-full shadow-md text-xs font-semibold text-stone-700 border border-stone-100 flex items-center gap-1.5">
                🧵 Costura
              </div>
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

      {/* Mural de Agradecimento aos Doadores */}
      <section className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200 shadow-sm space-y-6" id="donor-gratitude-wall">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-stone-100 pb-4">
          <div className="text-left">
            <h3 className="font-sans font-extrabold text-xl text-stone-900 flex items-center gap-2">
              <Heart className="h-5 w-5 text-emerald-600 fill-emerald-600/10" />
              Mural de Doadores & Apoiadores
            </h3>
            <p className="text-xs text-stone-500">Nossa profunda gratidão a todos os amigos que ajudam a cultivar este projeto comunitário.</p>
          </div>
          <span className="text-[10px] font-mono uppercase bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full font-bold tracking-wider select-none shrink-0 border border-emerald-100">
            {donations.filter((doan) => doan.approved === true).length} Recados Exibidos
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center" id="donors-grid">
          {donations
            .filter((doan) => doan.approved === true)
            .map((doan) => (
              <div key={doan.id} className="parent donor-card-parent" id={`donor-card-${doan.id}`}>
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
                    <span className="title" title={doan.donorName}>{doan.donorName}</span>
                    <span className="text">
                      "{doan.description || 'Apoiador oficial da Casa Sandríssima, fortalecendo nossa comunidade!'}"
                    </span>
                  </div>

                  <div className="bottom">
                    <div className="social-buttons-container">
                      <button 
                        className="social-button social-button1" 
                        title="Instagram"
                        onClick={() => window.open('https://instagram.com', '_blank')}
                      >
                        <svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg" className="svg">
                          <path d="M 9.9980469 3 C 6.1390469 3 3 6.1419531 3 10.001953 L 3 20.001953 C 3 23.860953 6.1419531 27 10.001953 27 L 20.001953 27 C 23.860953 27 27 23.858047 27 19.998047 L 27 9.9980469 C 27 6.1390469 23.858047 3 19.998047 3 L 9.9980469 3 z M 22 7 C 22.552 7 23 7.448 23 8 C 23 8.552 22.552 9 22 9 C 21.448 9 21 8.552 21 8 C 21 7.448 21.448 7 22 7 z M 15 9 C 18.309 9 21 11.691 21 15 C 21 18.309 18.309 21 15 21 C 11.691 21 9 18.309 9 15 C 9 11.691 11.691 9 15 9 z M 15 11 A 4 4 0 0 0 11 15 A 4 4 0 0 0 15 19 A 4 4 0 0 0 19 15 A 4 4 0 0 0 15 11 z"></path>
                        </svg>
                      </button>
                      <button 
                        className="social-button social-button2" 
                        title="Twitter / X"
                        onClick={() => window.open('https://twitter.com', '_blank')}
                      >
                        <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" className="svg">
                          <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"></path>
                        </svg>
                      </button>
                      <button 
                        className="social-button social-button3" 
                        title="Comunidade"
                        onClick={() => setActiveTab('doacoes')}
                      >
                        <svg viewBox="0 0 640 512" xmlns="http://www.w3.org/2000/svg" className="svg">
                          <path d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.933,167.465,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z"></path>
                        </svg>
                      </button>
                    </div>

                    <div className="view-more" onClick={() => setActiveTab('doacoes')}>
                      <button className="view-more-button">Apoiar</button>
                      <svg className="svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m6 9 6 6 6-6"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          {donations.filter((doan) => doan.approved === true).length === 0 && (
            <div className="col-span-full py-10 text-center text-stone-400 text-xs font-semibold">
              Nenhuma mensagem de apoio aprovada no momento. Seja o pioneiro!
            </div>
          )}
        </div>
      </section>

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
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                id={`activity-card-${index}`}
                className="bg-white rounded-2xl p-6 border border-stone-150 hover:border-emerald-100 hover:shadow-xl hover:shadow-emerald-500/5 transition-all text-left flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className={`w-fit p-3 rounded-xl ${act.iconColor}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-sans font-bold text-lg text-stone-900">{act.title}</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">{act.description}</p>
                  <p className="text-xs text-stone-500 border-l-2 border-stone-200 pl-3 leading-relaxed italic">
                    "{act.detail}"
                  </p>
                </div>
                
                <button 
                  onClick={() => setActiveTab('projetos')}
                  className="mt-6 text-sm font-semibold text-emerald-700 hover:text-emerald-800 hover:underline inline-flex items-center gap-1 cursor-pointer w-fit"
                >
                  Saiba mais sobre a oficina <ChevronRight className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* "Sobre Nós" Segment */}
      <section className="bg-stone-50 rounded-3xl p-8 md:p-12 border border-stone-200/50" id="about-us-info">
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

            <button 
              onClick={() => setActiveTab('doacoes')}
              className="w-full py-3 bg-emerald-650 hover:bg-emerald-700 text-white font-semibold rounded-xl text-center shadow-md transition-all cursor-pointer block"
              id="about-card-donate-btn"
            >
              Fazer Minha Doação de Apoio
            </button>
          </div>

        </div>
      </section>

    </motion.div>
  );
}
