import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  BookOpen, 
  Scissors, 
  Calendar, 
  Users, 
  Shield, 
  ArrowUpRight, 
  CheckCircle2, 
  Activity, 
  Palette, 
  Coins, 
  Camera, 
  Edit3, 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  RotateCcw, 
  Upload, 
  Sparkles, 
  Check
} from 'lucide-react';
import { ActiveTab, Workshop } from '../types';
import { useModal } from './ModalContext';
import { useFirebase } from '../firebaseContext';

interface ProjetosViewProps {
  setActiveTab: (tab: ActiveTab) => void;
}

const getProjectIcon = (id: string) => {
  switch (id) {
    case 'karate': return Trophy;
    case 'english': return BookOpen;
    case 'sewing': return Scissors;
    case 'pilates': return Activity;
    case 'embroidery': return Palette;
    default: return Trophy;
  }
};

const getProjectEmoji = (id: string) => {
  switch (id) {
    case 'karate': return "🥋";
    case 'english': return "🇬🇧";
    case 'sewing': return "🧵";
    case 'pilates': return "🧘";
    case 'embroidery': return "🪡";
    default: return "✨";
  }
};

const getProjectShortLabel = (id: string) => {
  switch (id) {
    case 'karate': return "Karatê";
    case 'english': return "Inglês";
    case 'sewing': return "Costura";
    case 'pilates': return "Pilates";
    case 'embroidery': return "Bordados";
    default: return id;
  }
};

export default function ProjetosView({ setActiveTab: _setActiveTab }: ProjetosViewProps) {
  const { alert } = useModal();
  const { workshops, updateWorkshop, resetWorkshops, isMaster } = useFirebase();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('karate');
  
  // Master Editing States
  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);
  const [isChangingPhotoModalOpen, setIsChangingPhotoModalOpen] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<Workshop | null>(null);
  
  // Photo direct upload state
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const directFileInputRef = useRef<HTMLInputElement>(null);

  // Active workshop
  const currentProj: Workshop = workshops.find(p => p.id === selectedProjectId) || workshops[0] || {
    id: 'karate',
    title: "🥋 Karatê – Disciplina e Autoconhecimento",
    subTitle: "Transformando Vidas Através da Disciplina e do Movimento",
    description: "Nossa ONG oferece aulas de karatê gratuitas...",
    longDesc: "Mais do que uma simples arte marcial...",
    color: "from-orange-500 to-amber-600",
    accentBg: "bg-orange-50 text-orange-700 border-orange-100",
    timetable: "Terças e Quintas: 18h30 às 20h00",
    targetPublic: "Crianças e Adolescentes (7 a 17 anos)",
    requirements: "Vontade de aprender...",
    cost: "Totalmente de graça",
    items: ["Iniciação ao estilo Shotokan"],
  };

  const SelectedIcon = getProjectIcon(currentProj.id);

  // Open Full Editor for Master
  const handleOpenEditModal = () => {
    setEditingDraft({
      ...currentProj,
      items: [...currentProj.items]
    });
    setIsEditingModalOpen(true);
  };

  // Open Direct Photo Editor for Master
  const handleOpenPhotoModal = () => {
    setPhotoUrlInput(currentProj.imageUrl || '');
    setPhotoPreview(currentProj.imageUrl || null);
    setIsChangingPhotoModalOpen(true);
  };

  // File to base64 converter
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, forDraft = false) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2.5 * 1024 * 1024) {
        alert("A imagem selecionada é muito pesada (máx 2.5MB). Escolha uma imagem mais leve para salvar.", "Arquivo muito grande", "warning");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (forDraft && editingDraft) {
          setEditingDraft({ ...editingDraft, imageUrl: result });
        } else {
          setPhotoPreview(result);
          setPhotoUrlInput(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save changes from Edit Modal
  const handleSaveDraft = async () => {
    if (!editingDraft) return;
    try {
      await updateWorkshop(editingDraft);
      setIsEditingModalOpen(false);
      setSaveSuccessNotice(`As alterações da oficina "${editingDraft.title}" foram salvas com sucesso!`);
      setTimeout(() => setSaveSuccessNotice(null), 4000);
    } catch (err: any) {
      alert("Houve uma falha ao salvar as alterações. Tente novamente.", "Erro ao salvar", "error");
    }
  };

  // Save Direct Photo change
  const handleSavePhoto = async () => {
    const newImage = photoPreview || photoUrlInput.trim() || undefined;
    const updated: Workshop = {
      ...currentProj,
      imageUrl: newImage
    };
    try {
      await updateWorkshop(updated);
      setIsChangingPhotoModalOpen(false);
      setSaveSuccessNotice("Foto da oficina atualizada com sucesso!");
      setTimeout(() => setSaveSuccessNotice(null), 4000);
    } catch (err: any) {
      alert("Houve uma falha ao atualizar a foto. Tente novamente.", "Erro", "error");
    }
  };

  // Remove Photo
  const handleRemovePhoto = async () => {
    const updated: Workshop = {
      ...currentProj,
      imageUrl: undefined
    };
    try {
      await updateWorkshop(updated);
      setIsChangingPhotoModalOpen(false);
      setSaveSuccessNotice("Foto personalizada removida. Restaurado o tema visual padrão.");
      setTimeout(() => setSaveSuccessNotice(null), 4000);
    } catch (err: any) {
      alert("Não foi possível remover a imagem.", "Erro", "error");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="space-y-10 py-8 relative"
      id="projetos-view-wrapper"
    >
      {/* Toast feedback */}
      <AnimatePresence>
        {saveSuccessNotice && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-emerald-700 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-medium border border-emerald-500/30"
          >
            <Check className="h-5 w-5 text-emerald-200" />
            <span>{saveSuccessNotice}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Master Control Banner */}
      {isMaster && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm"
          id="master-mode-toolbar"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-950 text-sm">Privilégio Master Ativo</span>
                <span className="bg-amber-200/80 text-amber-900 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase">
                  Acesso Total
                </span>
              </div>
              <p className="text-xs text-amber-800/90 mt-0.5">
                Como usuário <strong>Master</strong>, você pode alterar a foto de perfil/banner desta área e editar quaisquer textos, dias, horários e ementas configurados.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={handleOpenEditModal}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              id="btn-master-edit-workshop"
            >
              <Edit3 className="h-4 w-4" />
              Editar Esta Oficina
            </button>
            
            <button
              onClick={handleOpenPhotoModal}
              className="px-4 py-2 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              id="btn-master-change-photo"
            >
              <Camera className="h-4 w-4 text-amber-700" />
              Alterar Foto
            </button>

            <button
              onClick={async () => {
                if (confirm("Deseja restaurar todas as 5 oficinas para as configurações originais padrão?")) {
                  await resetWorkshops();
                  setSaveSuccessNotice("Oficinas restauradas para o padrão inicial.");
                  setTimeout(() => setSaveSuccessNotice(null), 3000);
                }
              }}
              title="Restaurar dados originais padrão"
              className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 rounded-xl transition-all cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
      
      {/* Page header */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="font-sans font-extrabold text-3xl md:text-4xl text-stone-900 tracking-tight" id="projetos-title">
          Nossas Oficinas Comunitárias
        </h1>
        <p className="text-stone-600 text-sm md:text-base leading-relaxed">
          Nossas turmas são formadas com o máximo aproveitamento pedagógico e de infraestrutura. Clique abaixo para explorar a ementa técnica, quadro de horários e requisitos de cada oficina.
        </p>
      </section>

      {/* Selector Tabs */}
      <section className="flex flex-wrap justify-center gap-3" id="projects-horizontal-tabs">
        {workshops.map((proj) => (
          <button
            key={proj.id}
            id={`tab-btn-${proj.id}`}
            onClick={() => setSelectedProjectId(proj.id)}
            className={`px-5 py-3 rounded-xl border text-sm font-bold tracking-tight transition-all cursor-pointer flex items-center gap-2 ${
              selectedProjectId === proj.id 
                ? 'bg-stone-900 border-stone-900 text-white shadow-md shadow-stone-900/10 scale-102' 
                : 'bg-white border-stone-200 hover:bg-stone-50 text-stone-600'
            }`}
          >
            <span>{getProjectEmoji(proj.id)}</span>
            <span>{getProjectShortLabel(proj.id)}</span>
          </button>
        ))}
      </section>

      {/* Main Feature Layout */}
      <section className="bg-white/90 backdrop-blur-md rounded-3xl border border-emerald-100/80 shadow-lg p-6 md:p-10 relative" id="project-detailed-board">
        
        {/* Master quick edit badge in the corner */}
        {isMaster && (
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={handleOpenEditModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 border border-amber-300/80 rounded-full text-xs font-semibold cursor-pointer transition-colors"
            >
              <Edit3 className="h-3.5 w-3.5 text-amber-700" />
              Editar Dados (Master)
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Block: Image & Basic properties info */}
          <div className="lg:col-span-4 space-y-6 text-left">
            
            {/* Image / Banner Box with Master direct photo trigger */}
            <div className="relative group rounded-2xl overflow-hidden shadow-sm">
              {currentProj.imageUrl ? (
                <div className="h-52 md:h-60 w-full relative overflow-hidden bg-stone-900">
                  <img 
                    src={currentProj.imageUrl} 
                    alt={currentProj.title} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                </div>
              ) : (
                <div className={`h-52 md:h-60 bg-gradient-to-tr ${currentProj.color} flex items-center justify-center relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/10"></div>
                  <SelectedIcon className="h-20 w-20 text-white/90 relative z-10" />
                </div>
              )}

              {/* Price / Category Pill */}
              <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur px-3 py-1 rounded-xl text-[10px] font-mono tracking-wider font-bold uppercase text-stone-800 border border-stone-100 z-10 shadow-xs">
                {currentProj.cost === "Totalmente de graça" ? "Oficina Gratuita" : currentProj.cost}
              </div>

              {/* Master Change Photo Overlay */}
              {isMaster && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4 text-white z-20">
                  <button
                    onClick={handleOpenPhotoModal}
                    className="px-3.5 py-2 bg-white text-stone-900 hover:bg-stone-100 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <Camera className="h-4 w-4 text-amber-600" />
                    Alterar Foto de Perfil
                  </button>
                  <span className="text-[11px] text-stone-200 text-center font-medium">
                    Permissão exclusiva de Master
                  </span>
                </div>
              )}
            </div>

            {/* Quick button to change photo if on mobile or outside hover */}
            {isMaster && (
              <button
                onClick={handleOpenPhotoModal}
                className="w-full py-2 bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-dashed border-amber-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer lg:hidden"
              >
                <Camera className="h-3.5 w-3.5 text-amber-700" />
                Alterar Foto Desta Oficina
              </button>
            )}

            {/* Timetable, Timings layout */}
            <div className="space-y-4" id="project-meta-info">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold font-mono uppercase text-stone-400 tracking-wider">Metadados da Oficina</h4>
                {isMaster && (
                  <button 
                    onClick={handleOpenEditModal}
                    className="text-[11px] text-amber-700 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="h-3 w-3" /> Editar
                  </button>
                )}
              </div>
              
              <div className="space-y-3.5 text-sm text-stone-650">
                <div className="flex gap-2.5 items-start bg-stone-50/80 p-2.5 rounded-xl border border-stone-150/70">
                  <Calendar className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-stone-850 block text-xs">Dias e Horários:</span>
                    <span className="text-xs text-stone-700 font-medium">{currentProj.timetable}</span>
                  </div>
                </div>
                
                <div className="flex gap-2.5 items-start bg-stone-50/80 p-2.5 rounded-xl border border-stone-150/70">
                  <Users className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-stone-850 block text-xs">Público-Alvo:</span>
                    <span className="text-xs text-stone-700">{currentProj.targetPublic}</span>
                  </div>
                </div>

                <div className="flex gap-2.5 items-start bg-stone-50/80 p-2.5 rounded-xl border border-stone-150/70">
                  <Coins className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-stone-850 block text-xs">Custo / Contribuição:</span>
                    <span className="text-xs font-semibold text-emerald-700">{currentProj.cost}</span>
                  </div>
                </div>
                
                <div className="flex gap-2.5 items-start bg-stone-50/80 p-2.5 rounded-xl border border-stone-150/70">
                  <Shield className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-stone-850 block text-xs">Requisitos Mínimos:</span>
                    <span className="text-xs leading-relaxed text-stone-700">{currentProj.requirements}</span>
                  </div>
                </div>
              </div>

              {currentProj.updatedAt && (
                <div className="text-[10px] text-stone-400 font-mono text-center">
                  Atualizado em {new Date(currentProj.updatedAt).toLocaleDateString('pt-BR')} por {currentProj.updatedBy || 'Master'}
                </div>
              )}
            </div>
          </div>

          {/* Right Block: Long copywriting & Content syllabus */}
          <div className="lg:col-span-8 flex flex-col justify-between text-left space-y-6">
            <div className="space-y-4">
              <span className={`inline-block px-3 py-1 text-xs font-bold rounded-lg ${currentProj.accentBg}`}>
                {currentProj.subTitle}
              </span>
              <h2 className="font-sans font-extrabold text-2xl md:text-3.5xl text-stone-900 tracking-tight">
                {currentProj.title}
              </h2>
              <p className="text-stone-600 text-sm md:text-base leading-relaxed">
                {currentProj.description}
              </p>
              <p className="text-stone-500 text-sm leading-relaxed font-sans mt-2 whitespace-pre-line">
                {currentProj.longDesc}
              </p>
            </div>

            {/* Syllabus Segment */}
            <div className="space-y-4 pt-4 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <h4 className="text-stone-850 font-bold text-sm">O que o aluno aprende na prática:</h4>
                {isMaster && (
                  <button 
                    onClick={handleOpenEditModal}
                    className="text-xs text-amber-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="h-3 w-3" /> Editar Tópicos
                  </button>
                )}
              </div>
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
                {isMaster && (
                  <button
                    onClick={handleOpenEditModal}
                    className="px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1 border border-amber-300"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-amber-700" />
                    Editar Oficina
                  </button>
                )}
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

      {/* MODAL 1: Master Photo Alteration Modal */}
      <AnimatePresence>
        {isChangingPhotoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-6 text-left border border-stone-200"
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                    <Camera className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-base">Alterar Foto de Perfil da Oficina</h3>
                    <p className="text-xs text-stone-500">{currentProj.title}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsChangingPhotoModalOpen(false)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Photo Preview */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-700">Visualização Prévia</label>
                <div className="h-44 w-full rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 relative flex items-center justify-center">
                  {photoPreview ? (
                    <img 
                      src={photoPreview} 
                      alt="Prévia" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="text-center p-4 text-stone-400 space-y-1">
                      <ImageIcon className="h-8 w-8 mx-auto text-stone-300" />
                      <p className="text-xs">Nenhuma foto personalizada carregada</p>
                      <p className="text-[10px] text-stone-400">Será exibido o gradiente ilustrativo padrão.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload or URL options */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Opção 1: Carregar Foto do Computador/Celular</label>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    accept="image/*" 
                    onChange={(e) => handleFileChange(e, false)}
                    className="hidden" 
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 active:scale-98 text-stone-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-stone-300 cursor-pointer transition-all"
                  >
                    <Upload className="h-4 w-4 text-stone-600" />
                    Selecionar Arquivo de Imagem (JPG, PNG, WebP)
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Opção 2: Ou Cole o Link Direto da Imagem (URL)</label>
                  <input
                    type="url"
                    value={photoUrlInput}
                    onChange={(e) => {
                      setPhotoUrlInput(e.target.value);
                      setPhotoPreview(e.target.value.trim() || null);
                    }}
                    placeholder="https://exemplo.com/foto-oficina.jpg"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-emerald-600 focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                {currentProj.imageUrl ? (
                  <button
                    onClick={handleRemovePhoto}
                    className="px-3 py-2 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remover Foto
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsChangingPhotoModalOpen(false)}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSavePhoto}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="h-4 w-4" />
                    Salvar Foto
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Full Workshop Content Editor (Master) */}
      <AnimatePresence>
        {isEditingModalOpen && editingDraft && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 md:p-8 space-y-6 text-left border border-stone-200 my-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-4 sticky -top-6 bg-white pt-2 z-10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs">
                    <Edit3 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-lg">Painel Master: Editar Oficina</h3>
                    <p className="text-xs text-stone-500">Altere textos, horários, fotos e ementa em tempo real</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsEditingModalOpen(false)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form Fields */}
              <div className="space-y-4 text-xs">
                
                {/* Título & Subtítulo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Título da Oficina</label>
                    <input
                      type="text"
                      value={editingDraft.title}
                      onChange={(e) => setEditingDraft({ ...editingDraft, title: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Subtítulo / Chamada</label>
                    <input
                      type="text"
                      value={editingDraft.subTitle}
                      onChange={(e) => setEditingDraft({ ...editingDraft, subTitle: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Dias e Horários & Público-Alvo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200/80">
                    <label className="block font-bold text-amber-950 mb-1">📅 Dias e Horários Configurados</label>
                    <input
                      type="text"
                      value={editingDraft.timetable}
                      onChange={(e) => setEditingDraft({ ...editingDraft, timetable: e.target.value })}
                      placeholder="Ex: Terças e Quintas: 18h30 às 20h00"
                      className="w-full px-3 py-2 text-xs border border-amber-300 rounded-xl bg-white focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                    />
                    <span className="text-[10px] text-amber-800/80 mt-1 block">Ex: Terças-feiras: 13h00 às 16h00</span>
                  </div>

                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                    <label className="block font-bold text-stone-800 mb-1">👥 Público-Alvo</label>
                    <input
                      type="text"
                      value={editingDraft.targetPublic}
                      onChange={(e) => setEditingDraft({ ...editingDraft, targetPublic: e.target.value })}
                      placeholder="Ex: Crianças e Adolescentes (7 a 17 anos)"
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Custo & Requisitos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">💰 Custo / Contribuição</label>
                    <input
                      type="text"
                      value={editingDraft.cost}
                      onChange={(e) => setEditingDraft({ ...editingDraft, cost: e.target.value })}
                      placeholder="Ex: Totalmente de graça ou R$ 40,00 mensais"
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">🛡️ Requisitos Mínimos</label>
                    <input
                      type="text"
                      value={editingDraft.requirements}
                      onChange={(e) => setEditingDraft({ ...editingDraft, requirements: e.target.value })}
                      placeholder="Ex: Vontade de aprender e autorização assinada..."
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Descrição Resumida */}
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Descrição Resumida</label>
                  <textarea
                    rows={2}
                    value={editingDraft.description}
                    onChange={(e) => setEditingDraft({ ...editingDraft, description: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                {/* Descrição Completa / Detalhada */}
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Descrição Detalhada / Apresentação</label>
                  <textarea
                    rows={3}
                    value={editingDraft.longDesc}
                    onChange={(e) => setEditingDraft({ ...editingDraft, longDesc: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                {/* Imagem da Oficina */}
                <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-stone-800 flex items-center gap-1.5">
                      <Camera className="h-4 w-4 text-amber-600" />
                      Foto de Perfil / Imagem da Oficina
                    </label>
                    {editingDraft.imageUrl && (
                      <button
                        type="button"
                        onClick={() => setEditingDraft({ ...editingDraft, imageUrl: undefined })}
                        className="text-[11px] text-rose-600 hover:underline font-semibold cursor-pointer"
                      >
                        Remover Foto
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={editingDraft.imageUrl || ''}
                      onChange={(e) => setEditingDraft({ ...editingDraft, imageUrl: e.target.value || undefined })}
                      placeholder="Link direto da imagem (URL) ou use o botão de upload ao lado"
                      className="flex-1 px-3 py-2 text-xs border border-stone-300 rounded-xl bg-white"
                    />
                    <input 
                      type="file" 
                      ref={directFileInputRef} 
                      accept="image/*" 
                      onChange={(e) => handleFileChange(e, true)}
                      className="hidden" 
                    />
                    <button
                      type="button"
                      onClick={() => directFileInputRef.current?.click()}
                      className="px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold rounded-xl cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <Upload className="h-3.5 w-3.5" /> Upload
                    </button>
                  </div>
                  {editingDraft.imageUrl && (
                    <div className="h-24 w-full rounded-xl overflow-hidden border border-stone-200 mt-2">
                      <img 
                        src={editingDraft.imageUrl} 
                        alt="Prévia" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )}
                </div>

                {/* Itens da Ementa */}
                <div className="space-y-2 pt-2 border-t border-stone-100">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-stone-800">Tópicos da Ementa ("O que o aluno aprende"):</label>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingDraft({
                          ...editingDraft,
                          items: [...editingDraft.items, "Novo tópico prático de aprendizado"]
                        });
                      }}
                      className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3 w-3" /> Adicionar Tópico
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {editingDraft.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => {
                            const nextItems = [...editingDraft.items];
                            nextItems[idx] = e.target.value;
                            setEditingDraft({ ...editingDraft, items: nextItems });
                          }}
                          className="flex-1 px-3 py-1.5 text-xs border border-stone-300 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const nextItems = editingDraft.items.filter((_, i) => i !== idx);
                            setEditingDraft({ ...editingDraft, items: nextItems });
                          }}
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100 sticky -bottom-6 bg-white pb-2">
                <button
                  type="button"
                  onClick={() => setIsEditingModalOpen(false)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="h-4 w-4" />
                  Salvar Alterações
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
