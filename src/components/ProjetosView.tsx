import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, BookOpen, Scissors, Calendar, Users, Shield, ArrowUpRight, CheckCircle2, Activity, Palette, Coins } from 'lucide-react';
import { ActiveTab } from '../types';
import { useModal } from './ModalContext';

interface ProjetosViewProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export default function ProjetosView({ setActiveTab }: ProjetosViewProps) {
  const { alert } = useModal();
  const [selectedProject, setSelectedProject] = useState<'karate' | 'english' | 'sewing' | 'pilates' | 'embroidery'>('karate');

  const projects = [
    {
      id: 'karate' as const,
      title: "🥋 Karatê – Disciplina e Autoconhecimento",
      subTitle: "Transformando Vidas Através da Disciplina e do Movimento",
      description: "Nossa ONG oferece aulas de karatê gratuitas como parte de seu compromisso em promover o desenvolvimento físico, emocional e social de crianças e jovens da periferia de Franca/SP. O esporte transmite ética e dedicação.",
      longDesc: "Mais do que uma simples arte marcial, o karatê é uma ferramenta de cidadania. Nosso sensei ensina de técnicas de katas a combate ético, promovendo disciplina pessoal, desenvolvimento de reflexos motores, resiliência mental e integração social.",
      icon: Trophy,
      color: "from-orange-500 to-amber-600",
      accentBg: "bg-orange-50 text-orange-700 border-orange-100",
      timetable: "Terças e Quintas: 18h30 às 20h00",
      targetPublic: "Crianças e Adolescentes (7 a 17 anos)",
      requirements: "Vontade de aprender e autorização assinada pelos pais/responsáveis. Fornecemos o kimono conforme estoque.",
      cost: "Totalmente de graça",
      items: [
        "Iniciação ao estilo Shotokan",
        "Participação em torneios regionais solidários",
        "Apostila teórica sobre a história das artes marciais",
        "Graduações de faixas sem taxa de exames"
      ],
      stats: { students: 58, volunteers: 2, limit: 60 }
    },
    {
      id: 'english' as const,
      title: "Inglês – Conexão Global",
      subTitle: "Abrindo Portas para o Futuro profissional",
      description: "Aulas de inglês gratuitas com o objetivo de ampliar as oportunidades de aprendizado escolar e crescimento profissional na comunidade. Para crianças, jovens e adultos interessados.",
      longDesc: "Aprender um novo idioma vai muito além de dominar regras sintáticas — é assegurar autonomia no mercado e no ambiente digital. Nosso curso é prático e enfoca conversação básica, músicas, vocabulário cotidiano e preparação técnica para o mercado.",
      icon: BookOpen,
      color: "from-blue-500 to-indigo-600",
      accentBg: "bg-blue-50 text-blue-700 border-blue-100",
      timetable: "Quartas e Sábados: 14h00 às 15h30",
      targetPublic: "A partir de 9 anos (Crianças, Jovens e Adultos)",
      requirements: "Caderno e estojo de uso pessoal. Material didático exclusivo fornecido de forma impressa pela ONG.",
      cost: "Totalmente de graça",
      items: [
        "Metodologia focada em diálogos cotidianos (Conversação)",
        "Gramática descomplicada e lúdica",
        "Oficinas culturais de países anglófonos",
        "Preparação simulada para exames escolares"
      ],
      stats: { students: 44, volunteers: 1, limit: 50 }
    },
    {
      id: 'sewing' as const,
      title: "🧵 Costura e Modelagem – Autonomia Financeira",
      subTitle: "Costurando Sonhos e Oportunidades Empreendedoras",
      description: "Oficinas de corte, costura e modelagem gratuitas com o propósito de promover autonomia e geração de renda imediata para pessoas da comunidade. Focado principalmente em chefes de família.",
      longDesc: "A costura é uma forma extraordinária de expressão, criatividade, terapia em grupo e, acima de tudo, fomento financeiro. Nossos participantes dominam do manuseio de máquinas retas e overloques à modelagem de roupas infantis e consertos gerais.",
      icon: Scissors,
      color: "from-purple-500 to-pink-600",
      accentBg: "bg-purple-50 text-purple-700 border-purple-100",
      timetable: "Segundas e Sextas: 14h00 às 16h30",
      targetPublic: "Adultos (foco em geração de renda para chefes de família)",
      requirements: "Apenas vontade de criar! Não é preciso conhecimento prévio de corte ou agulhas.",
      cost: "Totalmente de graça",
      items: [
        "Aulas de modelagem básica passo-a-passo",
        "Manutenção básica preventora de máquinas",
        "Confecção de vestimentas, panos de prato e ecobags",
        "Dicas essenciais de precificação e vendas caseiras"
      ],
      stats: { students: 31, volunteers: 2, limit: 35 }
    },
    {
      id: 'pilates' as const,
      title: "🧘 Pilates e Bem-Estar – Qualidade de Vida",
      subTitle: "Fortalecendo Mente e Corpo para a Saúde Integral",
      description: "Oferecemos aulas semanais de pilates com foco em postura, alongamento, equilíbrio e fortalecimento do corpo de forma saudável e segura.",
      longDesc: "Nosso projeto de pilates promove a saúde preventiva e ativa na comunidade através de exercícios de solo, alongamentos dirigidos e controle consciente da respiração. Ideal para reduzir cansaço físico, melhorar a saúde das articulações e proporcionar integração social. Ministrado com carinho todas as sextas das 9h às 10h da manhã na sede da nossa ONG.",
      icon: Activity,
      color: "from-teal-500 to-emerald-600",
      accentBg: "bg-teal-50 text-teal-700 border-teal-100",
      timetable: "Sextas-feiras: 09h00 às 10h00",
      targetPublic: "Adultos e Idosos (comunidade em geral)",
      requirements: "Roupas elásticas que facilitem o alongamento técnico. Colchonetes integrados fornecidos pela sede.",
      cost: "Apenas R$ 40,00 mensais",
      items: [
        "Exercícios adaptados de solo (Mat Pilates)",
        "Fortalecimentos musculares profundos e alinhamentos da coluna",
        "Exercícios de respiração intercostal e reeducação motora de equilíbrio",
        "Meditações e alongamentos funcionais anticansaço"
      ],
      stats: { students: 28, volunteers: 1, limit: 30 }
    },
    {
      id: 'embroidery' as const,
      title: "🪡 Curso de Bordado Livre",
      subTitle: "Tornando Linhas, Pontos e Tradição em Obras de Arte",
      description: "Nossa oficina de bordado livre ensina pontos tradicionais e criativos como ferramenta de socialização, arteterapia e autonomia financeira.",
      longDesc: "O bordado artístico livre é uma terapia focada e repleta de afeto. Os participantes dominam técnicas estruturadas de bordado em tecidos, desenvolvendo acabamentos finos e habilidades ideais para fabricação de artigos de decoração e vestuários. O curso acontece às terças das 13h às 16h na nossa sede no Jardim Ipanema, totalmente de graça.",
      icon: Palette,
      color: "from-rose-500 to-pink-600",
      accentBg: "bg-rose-50 text-rose-700 border-rose-100",
      timetable: "Terças-feiras: 13h00 às 16h00",
      targetPublic: "Comunidade em geral (a partir de 14 anos)",
      requirements: "Bastidores, linhas, agulhas e tecidos piloto fornecidos inteiramente de graça pela ONG.",
      cost: "Totalmente de graça",
      items: [
        "Introdução prática a pontos bases (Ponto atrás, corrente, nó francês e rococó)",
        "Desenho artístico e transferência de riscos originais para panos",
        "Harmonias cromáticas e acabamento invisível de avesso",
        "Orientação focada em empreendedorismo, precificação e vendas"
      ],
      stats: { students: 18, volunteers: 1, limit: 20 }
    },
  ];

  const currentProj = projects.find(p => p.id === selectedProject)!;
  const SelectedIcon = currentProj.icon;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="space-y-12 py-8"
      id="projetos-view-wrapper"
    >
      
      {/* Page header */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="font-sans font-extrabold text-3xl md:text-4.2xl text-stone-900 tracking-tight" id="projetos-title">
          Nossas Oficinas Comunitárias
        </h1>
        <p className="text-stone-600 text-sm md:text-base leading-relaxed">
          Nossas turmas são formadas com o máximo aproveitamento pedagógico e de infraestrutura. Clique abaixo para explorar a ementa técnica, quadro de horários e requisitos de cada oficina.
        </p>
      </section>

      {/* Selector Tabs */}
      <section className="flex flex-wrap justify-center gap-3" id="projects-horizontal-tabs">
        {projects.map((proj) => (
          <button
            key={proj.id}
            id={`tab-btn-${proj.id}`}
            onClick={() => setSelectedProject(proj.id)}
            className={`px-5 py-3 rounded-xl border text-sm font-bold tracking-tight transition-all cursor-pointer flex items-center gap-2 ${
              selectedProject === proj.id 
                ? 'bg-stone-900 border-stone-900 text-white shadow-md shadow-stone-900/10' 
                : 'bg-white border-stone-200 hover:bg-stone-50 text-stone-600'
            }`}
          >
            {proj.id === 'karate' && "🥋"}
            {proj.id === 'sewing' && "🧵"}
            {proj.id === 'pilates' && "🧘"}
            {proj.id === 'embroidery' && "🪡"}
            {proj.id === 'karate' ? "Karatê" : proj.id === 'english' ? "Inglês" : proj.id === 'sewing' ? "Costura" : proj.id === 'pilates' ? "Pilates" : "Bordados"}
          </button>
        ))}
      </section>

      {/* Main Feature Layout */}
      <section className="bg-white rounded-3xl border border-stone-200/80 shadow-md p-6 md:p-10" id="project-detailed-board">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Block: Image & Basic properties info */}
          <div className="lg:col-span-4 space-y-6 text-left">
            <div className={`h-48 md:h-56 bg-gradient-to-tr ${currentProj.color} rounded-2xl flex items-center justify-center relative overflow-hidden shadow-sm`}>
              <div className="absolute inset-0 bg-black/10"></div>
              <SelectedIcon className="h-16 w-16 text-white relative z-10" />
              <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur px-3 py-1 rounded-xl text-[10px] font-mono tracking-wider font-bold uppercase text-stone-800 border border-stone-100">
                {currentProj.cost === "Totalmente de graça" ? "Oficina Gratuita" : currentProj.cost}
              </div>
            </div>

            {/* Timetable, Timings layout */}
            <div className="space-y-4" id="project-meta-info bg">
              <h4 className="text-xs font-bold font-mono uppercase text-stone-400 tracking-wider">Metadados da Oficina</h4>
              
              <div className="space-y-3.5 text-sm text-stone-650">
                <div className="flex gap-2.5 items-start">
                  <Calendar className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-stone-850 block">Dias e Horários:</span>
                    <span className="text-xs">{currentProj.timetable}</span>
                  </div>
                </div>
                
                <div className="flex gap-2.5 items-start">
                  <Users className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-stone-850 block">Público-Alvo:</span>
                    <span className="text-xs">{currentProj.targetPublic}</span>
                  </div>
                </div>

                <div className="flex gap-2.5 items-start">
                  <Coins className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-stone-850 block">Custo / Contribuição:</span>
                    <span className="text-xs font-semibold text-emerald-700">{currentProj.cost}</span>
                  </div>
                </div>
                
                <div className="flex gap-2.5 items-start">
                  <Shield className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-stone-850 block">Requisitos Mínimos:</span>
                    <span className="text-xs leading-relaxed">{currentProj.requirements}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Block: Long copywriting & Content syllabus */}
          <div className="lg:col-span-8 flex flex-col justify-between text-left space-y-6">
            <div className="space-y-4">
              <span className={`inline-block px-3 py-1 text-xs font-bold rounded-lg ${currentProj.accentBg}`}>
                {currentProj.subTitle}
              </span>
              <h2 className="font-sans font-extrabold text-2xl md:text-3xl text-stone-900 tracking-tight">
                {currentProj.title}
              </h2>
              <p className="text-stone-600 text-sm md:text-base leading-relaxed">
                {currentProj.description}
              </p>
              <p className="text-stone-500 text-sm leading-relaxed font-sans mt-2">
                {currentProj.longDesc}
              </p>
            </div>

            {/* Syllabus Segment */}
            <div className="space-y-4 pt-4 border-t border-stone-100">
              <h4 className="text-stone-850 font-bold text-sm">O que o aluno aprende na prática:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3" id="project-checklist-grid">
                {currentProj.items.map((it, idx) => (
                  <div key={idx} className="flex gap-2.5 items-start bg-stone-50 p-3 rounded-lg border border-stone-150 text-xs text-stone-650">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{it}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons list */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-emerald-50/40 p-4 rounded-xl border border-emerald-100/60 gap-4 mt-6" id="project-action-box">
              <div className="text-left">
                <span className="text-xs text-emerald-800 font-semibold block">Inscrições abertas!</span>
                <span className="text-[11px] text-emerald-700 leading-normal block">Preencha e converse com nossa secretaria para cadastrar o aluno.</span>
              </div>
              <div className="flex gap-3 shrink-0">
                <button 
                  onClick={async () => {
                    await alert(
                      "Direcionando para contato de pré-matrícula!\n\nTelefone de Contato da nossa secretaria em Franca/SP:\n(16) 99277-4601 (WhatsApp)",
                      "Pré-Matrícula do Aluno",
                      "info"
                    );
                  }}
                  className="px-4 py-2 bg-emerald-650 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
                  id="project-enroll-redirect-btn"
                >
                  Matrícula Rápida <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

    </motion.div>
  );
}
