import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Image as ImageIcon, 
  Sparkles, 
  ZoomIn, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  User, 
  Tag, 
  Heart, 
  Filter, 
  Eye, 
  Download,
  Share2,
  Plus,
  Pencil,
  Trash2,
  Upload,
  Check,
  Camera
} from 'lucide-react';
import { useFirebase } from '../firebaseContext';
import { useModal } from './ModalContext';
import { GalleryPhoto, ActiveTab } from '../types';
import logoImg from '../assets/images/casa_sandrissima_green_white_logo_original.png';
import TactileButton from './TactileButton';

interface GaleriaViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenLoginModal?: (reason?: 'galeria' | 'doacoes' | 'portal' | 'geral') => void;
}

// Curated high-definition photos of Casa Sandríssima's projects and community activities
const INITIAL_GALLERY_ITEMS: GalleryPhoto[] = [
  {
    id: 'photo_1',
    title: 'Graduação de Faixas no Karatê Solidário',
    category: 'karate',
    categoryLabel: '🥋 Karatê & Disciplina',
    imageUrl: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=1200&q=80',
    description: 'Cerimônia de graduação e entrega de novas faixas para os alunos da turma matutina no tatame da Casa Sandríssima.',
    date: '14/05/2026',
    author: 'Sensei Marcelo & Coordenação',
    tags: ['Karatê', 'Faixas', 'Shotokan', 'Crianças']
  },
  {
    id: 'photo_2',
    title: 'Oficina de Modelagem e Costura Criativa',
    category: 'costura',
    categoryLabel: '🧵 Costura & Modelagem',
    imageUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80',
    description: 'Alunas praticando corte de moldes e montagem de ecobags e peças de vestuário para geração de renda familiar.',
    date: '10/05/2026',
    author: 'Profa. Carla Antunes',
    tags: ['Costura', 'Autonomia', 'Mulheres', 'Artesanato']
  },
  {
    id: 'photo_3',
    title: 'Bordado Livre em Ponto Rococó e Flores',
    category: 'bordado',
    categoryLabel: '🪡 Bordados & Arte',
    imageUrl: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=1200&q=80',
    description: 'Exercícios práticos de bordado com bastidor, promovendo terapia ocupacional, afeto e socialização comunitária.',
    date: '06/05/2026',
    author: 'Equipe Voluntária de Arte',
    tags: ['Bordado', 'Arte-Terapia', 'Cultura']
  },
  {
    id: 'photo_4',
    title: 'Sessão Matinal de Pilates e Postura',
    category: 'pilates',
    categoryLabel: '🧘 Pilates & Saúde',
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
    description: 'Aula prática de alinhamento postural, alongamentos no solo e respiração guiada para adultos e idosos do bairro.',
    date: '02/05/2026',
    author: 'Instrutora de Pilates',
    tags: ['Pilates', 'Saúde', 'Melhor Idade', 'Bem-Estar']
  },
  {
    id: 'photo_5',
    title: 'Aula Interativa de Conversação em Inglês',
    category: 'ingles',
    categoryLabel: '🇬🇧 Inglês Comunitário',
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
    description: 'Dinâmicas lúdicas em grupo para prática de diálogos diários e vocabulário básico com jovens da comunidade.',
    date: '28/04/2026',
    author: 'Prof. de Línguas Estrangeiras',
    tags: ['Inglês', 'Juventude', 'Educação Popular']
  },
  {
    id: 'photo_6',
    title: 'Distribuição de Kits Escolares e Materiais',
    category: 'eventos',
    categoryLabel: '🎁 Ações & Eventos',
    imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80',
    description: 'Entrega comunitária de cadernos, estojos e livros didáticos arrecadados com apoio de associados e apoiadores.',
    date: '15/04/2026',
    author: 'Diretoria Casa Sandríssima',
    tags: ['Doações', 'Kits Escolares', 'Comunidade', 'Apoio']
  },
  {
    id: 'photo_7',
    title: 'Ensaio de Katas e Concentração Infantil',
    category: 'karate',
    categoryLabel: '🥋 Karatê & Disciplina',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
    description: 'Alunos infantis aprendendo a importância do respeito, postura e reverência antes do treino no dojo comunitário.',
    date: '08/04/2026',
    author: 'Sensei Marcelo',
    tags: ['Karatê', 'Ética', 'Crianças']
  },
  {
    id: 'photo_8',
    title: 'Exposição dos Trabalhos de Costura e Bordados',
    category: 'comunidade',
    categoryLabel: '✨ Exposições & Feiras',
    imageUrl: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=1200&q=80',
    description: 'Bazar solidário com peças artesanais confeccionadas pelos alunos, com arrecadação revertida para compra de insumos.',
    date: '22/03/2026',
    author: 'Comitê de Mães e Alunas',
    tags: ['Bazar', 'Feira', 'Geração de Renda']
  }
];

export default function GaleriaView({ setActiveTab, onOpenLoginModal }: GaleriaViewProps) {
  const { user } = useFirebase();
  const { alert, confirm } = useModal();
  
  const [photos, setPhotos] = useState<GalleryPhoto[]>(() => {
    try {
      const saved = localStorage.getItem('cs_gallery_photos');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Erro ao carregar fotos do storage:', e);
    }
    return INITIAL_GALLERY_ITEMS;
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activePhoto, setActivePhoto] = useState<GalleryPhoto | null>(null);

  // Photo Creation & Editing Modal State
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);
  const [photoForm, setPhotoForm] = useState({
    title: '',
    category: 'karate' as GalleryPhoto['category'],
    imageUrl: '',
    description: '',
    date: new Date().toLocaleDateString('pt-BR'),
    author: '',
    tags: ''
  });

  useEffect(() => {
    try {
      localStorage.setItem('cs_gallery_photos', JSON.stringify(photos));
    } catch (e) {
      console.warn('Erro ao salvar fotos no storage:', e);
    }
  }, [photos]);

  const categories = [
    { id: 'all', label: 'Todas as Fotos' },
    { id: 'karate', label: '🥋 Karatê' },
    { id: 'costura', label: '🧵 Costura' },
    { id: 'bordado', label: '🪡 Bordados' },
    { id: 'pilates', label: '🧘 Pilates' },
    { id: 'ingles', label: '🇬🇧 Inglês' },
    { id: 'eventos', label: '🎁 Ações & Eventos' },
    { id: 'comunidade', label: '✨ Exposições' }
  ];

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'karate': return '🥋 Karatê & Disciplina';
      case 'costura': return '🧵 Costura & Modelagem';
      case 'bordado': return '🪡 Bordados & Arte';
      case 'pilates': return '🧘 Pilates & Saúde';
      case 'ingles': return '🇬🇧 Inglês Comunitário';
      case 'eventos': return '🎁 Ações & Eventos';
      case 'comunidade': return '✨ Exposições & Feiras';
      default: return 'Geral';
    }
  };

  const filteredPhotos = selectedCategory === 'all'
    ? photos
    : photos.filter(p => p.category === selectedCategory);

  const handleNextPhoto = () => {
    if (!activePhoto) return;
    const currentIndex = filteredPhotos.findIndex(p => p.id === activePhoto.id);
    const nextIndex = (currentIndex + 1) % filteredPhotos.length;
    setActivePhoto(filteredPhotos[nextIndex]);
  };

  const handlePrevPhoto = () => {
    if (!activePhoto) return;
    const currentIndex = filteredPhotos.findIndex(p => p.id === activePhoto.id);
    const prevIndex = (currentIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
    setActivePhoto(filteredPhotos[prevIndex]);
  };

  // Open modal to add a new photo
  const handleOpenAddModal = () => {
    setEditingPhoto(null);
    setPhotoForm({
      title: '',
      category: 'karate',
      imageUrl: '',
      description: '',
      date: new Date().toLocaleDateString('pt-BR'),
      author: user?.displayName || user?.email?.split('@')[0] || 'Coordenação',
      tags: 'Comunidade, Oficina'
    });
    setIsPhotoModalOpen(true);
  };

  // Open modal to edit existing photo
  const handleOpenEditModal = (photo: GalleryPhoto, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingPhoto(photo);
    setPhotoForm({
      title: photo.title,
      category: photo.category,
      imageUrl: photo.imageUrl,
      description: photo.description,
      date: photo.date,
      author: photo.author,
      tags: photo.tags.join(', ')
    });
    setIsPhotoModalOpen(true);
  };

  // Save new or edited photo
  const handleSavePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoForm.title.trim() || !photoForm.imageUrl.trim()) {
      await alert('Por favor, preencha o título e o link/imagem da foto.', 'Campos Obrigatórios', 'warn');
      return;
    }

    const tagList = photoForm.tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    if (editingPhoto) {
      // Update
      const updated: GalleryPhoto = {
        ...editingPhoto,
        title: photoForm.title.trim(),
        category: photoForm.category,
        categoryLabel: getCategoryLabel(photoForm.category),
        imageUrl: photoForm.imageUrl.trim(),
        description: photoForm.description.trim(),
        date: photoForm.date.trim(),
        author: photoForm.author.trim() || 'Equipe Casa Sandríssima',
        tags: tagList.length ? tagList : ['Casa Sandríssima']
      };

      setPhotos(prev => prev.map(p => p.id === editingPhoto.id ? updated : p));
      if (activePhoto && activePhoto.id === editingPhoto.id) {
        setActivePhoto(updated);
      }
      setIsPhotoModalOpen(false);
      await alert('Fotografia atualizada com sucesso!', 'Galeria Atualizada', 'info');
    } else {
      // Create
      const newPhoto: GalleryPhoto = {
        id: `photo_${Date.now()}`,
        title: photoForm.title.trim(),
        category: photoForm.category,
        categoryLabel: getCategoryLabel(photoForm.category),
        imageUrl: photoForm.imageUrl.trim(),
        description: photoForm.description.trim(),
        date: photoForm.date.trim(),
        author: photoForm.author.trim() || 'Equipe Casa Sandríssima',
        tags: tagList.length ? tagList : ['Casa Sandríssima']
      };

      setPhotos(prev => [newPhoto, ...prev]);
      setIsPhotoModalOpen(false);
      await alert('Nova foto adicionada ao acervo da galeria!', 'Publicação Concluída', 'info');
    }
  };

  // Delete photo
  const handleDeletePhoto = async (photoId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const confirmed = await confirm(
      'Tem certeza de que deseja remover esta fotografia da galeria pública?',
      'Excluir Fotografia',
      'warn'
    );
    if (confirmed) {
      setPhotos(prev => prev.filter(p => p.id !== photoId));
      if (activePhoto && activePhoto.id === photoId) {
        setActivePhoto(null);
      }
      await alert('Fotografia removida com sucesso.', 'Remoção Concluída', 'info');
    }
  };

  // Image Upload helper (converts to Base64)
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2.5 * 1024 * 1024) {
      alert('A imagem selecionada é muito pesada (máx 2.5MB). Recomendamos usar uma imagem menor ou um link direto.', 'Arquivo Grande', 'warn');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoForm(prev => ({ ...prev, imageUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="py-6 space-y-8" id="galeria-main-wrapper">
      
      {/* Header Banner - Public & Welcoming */}
      <section className="bg-gradient-to-r from-emerald-900 to-stone-900 text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden" id="galeria-header-banner">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-800/80 rounded-full border border-emerald-600/50 text-[11px] font-semibold text-emerald-200 uppercase tracking-wider">
              <ImageIcon className="h-3.5 w-3.5 text-emerald-300" />
              <span>Acervo Comunitário & Momentos</span>
            </div>
            <h1 className="font-sans font-extrabold text-2xl sm:text-4xl text-white tracking-tight" id="galeria-main-heading">
              Galeria de Fotos
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              Explore os registros fotográficos de nossas oficinas, aulas práticas e eventos solidários. Um acervo aberto que celebra as conquistas dos alunos e voluntários da <strong>Casa Sandríssima</strong>.
            </p>
          </div>

          {/* Admin / Authenticated Editor Controls */}
          {user ? (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3.5 rounded-2xl flex items-center gap-3 shrink-0" id="galeria-admin-badge">
              <div className="text-left text-xs">
                <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Modo Editor Ativo</span>
                </div>
                <span className="text-stone-300 text-[11px] font-mono block truncate max-w-[160px] mt-0.5">
                  {user.displayName || user.email}
                </span>
              </div>
              <TactileButton
                type="button"
                id="btn-add-new-photo"
                onClick={handleOpenAddModal}
                variant="primary"
                size="sm"
                icon={<Plus className="h-4 w-4" />}
              >
                Nova Foto
              </TactileButton>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2 text-stone-400 text-xs bg-stone-800/50 px-3 py-2 rounded-xl border border-stone-700/50">
              <Camera className="h-4 w-4 text-emerald-400" />
              <span>Visualização aberta a todos</span>
            </div>
          )}
        </div>
      </section>

      {/* Categories Filter Tabs */}
      <section className="flex overflow-x-auto no-scrollbar sm:flex-wrap items-center sm:justify-center gap-2 py-1 px-1 -mx-2 sm:mx-0" id="galeria-category-filters">
        {categories.map((cat) => (
          <button
            key={cat.id}
            id={`filter-btn-${cat.id}`}
            onClick={() => {
              if (cat.id === selectedCategory) return;
              setSelectedCategory(cat.id);
            }}
            className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 touch-manipulation active:scale-95 ${
              selectedCategory === cat.id
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200/50'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            <span>{cat.label}</span>
          </button>
        ))}
      </section>

      {/* Floating Add Photo Button on mobile if logged in */}
      {user && (
        <div className="md:hidden flex justify-end">
          <button
            onClick={handleOpenAddModal}
            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-md cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Adicionar Foto ao Acervo</span>
          </button>
        </div>
      )}

      {/* Photos Grid - Accessible to everyone */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" id="galeria-photos-grid">
        {filteredPhotos.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-stone-200 p-8 space-y-3">
            <ImageIcon className="h-10 w-10 text-stone-400 mx-auto" />
            <h3 className="font-bold text-stone-800 text-base">Nenhuma foto encontrada nesta categoria</h3>
            <p className="text-xs text-stone-500">Selecione outra categoria ou adicione novas fotos ao acervo.</p>
          </div>
        ) : (
          filteredPhotos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              id={`photo-card-${photo.id}`}
              onClick={() => setActivePhoto(photo)}
              className="group bg-white rounded-2xl border border-stone-200/80 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all overflow-hidden flex flex-col cursor-pointer relative"
            >
              {/* Image Container */}
              <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                
                {/* Category Badge */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-lg text-[10px] font-bold text-stone-800 shadow-sm border border-stone-100">
                  {photo.categoryLabel}
                </div>

                {/* Exclusive Editor Controls (Only visible to logged in users) */}
                {user && (
                  <div 
                    className="absolute top-3 right-3 flex items-center gap-1.5 z-10" 
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={(e) => handleOpenEditModal(photo, e)}
                      title="Editar Foto"
                      className="p-2 rounded-xl bg-white/90 hover:bg-white text-stone-700 hover:text-emerald-700 shadow-md backdrop-blur transition-transform hover:scale-110 cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeletePhoto(photo.id, e)}
                      title="Excluir Foto"
                      className="p-2 rounded-xl bg-white/90 hover:bg-rose-50 text-stone-700 hover:text-rose-600 shadow-md backdrop-blur transition-transform hover:scale-110 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                {/* Zoom hover indicator */}
                <div className="absolute inset-0 bg-stone-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <div className="bg-white/90 text-stone-900 p-2.5 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                    <ZoomIn className="h-5 w-5" />
                  </div>
                </div>
              </div>

              {/* Photo Metadata */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3 text-left">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-stone-400">
                    <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{photo.date}</span>
                  </div>
                  <h3 className="font-sans font-bold text-sm text-stone-900 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
                    {photo.title}
                  </h3>
                  <p className="text-stone-500 text-xs line-clamp-2 leading-relaxed font-sans">
                    {photo.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="pt-2 border-t border-stone-100 flex flex-wrap gap-1">
                  {photo.tags.slice(0, 3).map((tag, tIdx) => (
                    <span key={tIdx} className="bg-stone-100 text-stone-600 px-2 py-0.5 rounded text-[10px] font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </section>

      {/* Lightbox Modal for Photo Details and Zoom (Everyone can see) */}
      <AnimatePresence>
        {activePhoto && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md"
            id="galeria-lightbox-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setActivePhoto(null);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-stone-900 rounded-3xl shadow-2xl overflow-hidden border border-stone-800 flex flex-col max-h-[90vh]"
              id="galeria-lightbox-content"
            >
              {/* Close button */}
              <button
                onClick={() => setActivePhoto(null)}
                id="lightbox-close-btn"
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 hover:bg-black text-white transition-colors cursor-pointer"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Nav Arrows */}
              <button
                onClick={handlePrevPhoto}
                id="lightbox-prev-btn"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/60 hover:bg-black text-white transition-colors cursor-pointer"
                aria-label="Foto Anterior"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <button
                onClick={handleNextPhoto}
                id="lightbox-next-btn"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/60 hover:bg-black text-white transition-colors cursor-pointer"
                aria-label="Próxima Foto"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* Main Image */}
              <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[300px] sm:min-h-[450px]">
                <img
                  src={activePhoto.imageUrl}
                  alt={activePhoto.title}
                  className="max-h-[65vh] w-auto max-w-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Footer info panel */}
              <div className="p-6 bg-stone-900 text-white space-y-3 text-left border-t border-stone-800">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-emerald-700/80 rounded-lg text-xs font-bold text-emerald-100">
                      {activePhoto.categoryLabel}
                    </span>
                    <span className="text-xs font-mono text-stone-400">
                      📅 {activePhoto.date}
                    </span>
                    <span className="text-xs font-mono text-stone-400">
                      📸 {activePhoto.author}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {/* If logged in, provide quick edit/delete in lightbox */}
                    {user && (
                      <>
                        <button
                          onClick={() => handleOpenEditModal(activePhoto)}
                          className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeletePhoto(activePhoto.id)}
                          className="px-3 py-1.5 bg-stone-800 hover:bg-rose-900/60 text-rose-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Excluir
                        </button>
                      </>
                    )}

                    <button
                      onClick={async () => {
                        const link = document.createElement('a');
                        link.href = activePhoto.imageUrl;
                        link.download = `casa-sandrissima-${activePhoto.id}.jpg`;
                        link.target = '_blank';
                        link.click();
                        await alert("Fotografia aberta/salva no seu dispositivo.", "Download Concluído", "info");
                      }}
                      className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer text-stone-200"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Baixar Foto
                    </button>
                  </div>
                </div>

                <h3 className="font-sans font-bold text-lg text-white">
                  {activePhoto.title}
                </h3>
                <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
                  {activePhoto.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {activePhoto.tags.map((tag, idx) => (
                    <span key={idx} className="bg-stone-800 text-stone-300 px-2 py-0.5 rounded text-[11px]">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal for Creating / Editing Photos (Only Accessible to Logged-in Users) */}
      <AnimatePresence>
        {isPhotoModalOpen && user && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsPhotoModalOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                    <Camera className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-base">
                      {editingPhoto ? 'Editar Fotografia' : 'Adicionar Nova Fotografia'}
                    </h3>
                    <p className="text-xs text-stone-500">
                      Preencha as informações para atualizar o acervo comunitário.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(false)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSavePhoto} className="p-6 space-y-4 overflow-y-auto text-left">
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                    Título da Fotografia *
                  </label>
                  <input
                    type="text"
                    required
                    value={photoForm.title}
                    onChange={(e) => setPhotoForm({ ...photoForm, title: e.target.value })}
                    placeholder="Ex: Cerimônia de Graduação no Karatê"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                    Categoria da Oficina / Ação *
                  </label>
                  <select
                    value={photoForm.category}
                    onChange={(e) => setPhotoForm({ ...photoForm, category: e.target.value as GalleryPhoto['category'] })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="karate">🥋 Karatê & Disciplina</option>
                    <option value="costura">🧵 Costura & Modelagem</option>
                    <option value="bordado">🪡 Bordados & Arte</option>
                    <option value="pilates">🧘 Pilates & Saúde</option>
                    <option value="ingles">🇬🇧 Inglês Comunitário</option>
                    <option value="eventos">🎁 Ações & Eventos</option>
                    <option value="comunidade">✨ Exposições & Feiras</option>
                  </select>
                </div>

                {/* Image URL & File Upload */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                    Link da Imagem (URL ou Upload) *
                  </label>
                  <input
                    type="url"
                    required
                    value={photoForm.imageUrl}
                    onChange={(e) => setPhotoForm({ ...photoForm, imageUrl: e.target.value })}
                    placeholder="https://exemplo.com/foto.jpg"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  
                  <div className="flex items-center gap-2 pt-1">
                    <label className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 rounded-xl text-xs font-medium cursor-pointer flex items-center gap-1.5 transition-colors">
                      <Upload className="h-3.5 w-3.5" />
                      <span>Ou carregar do dispositivo</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageFileUpload}
                      />
                    </label>
                    {photoForm.imageUrl && (
                      <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="h-3.5 w-3.5" /> Imagem carregada
                      </span>
                    )}
                  </div>

                  {photoForm.imageUrl && (
                    <div className="mt-2 aspect-video rounded-xl overflow-hidden border border-stone-200 bg-stone-100 max-h-36">
                      <img src={photoForm.imageUrl} alt="Prévia" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                    Descrição do Momento
                  </label>
                  <textarea
                    rows={2}
                    value={photoForm.description}
                    onChange={(e) => setPhotoForm({ ...photoForm, description: e.target.value })}
                    placeholder="Relate o objetivo pedagógico ou social deste momento..."
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Date & Author */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                      Data
                    </label>
                    <input
                      type="text"
                      value={photoForm.date}
                      onChange={(e) => setPhotoForm({ ...photoForm, date: e.target.value })}
                      placeholder="DD/MM/AAAA"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                      Autor / Fotógrafo
                    </label>
                    <input
                      type="text"
                      value={photoForm.author}
                      onChange={(e) => setPhotoForm({ ...photoForm, author: e.target.value })}
                      placeholder="Ex: Sensei Marcelo"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                    Tags (separadas por vírgula)
                  </label>
                  <input
                    type="text"
                    value={photoForm.tags}
                    onChange={(e) => setPhotoForm({ ...photoForm, tags: e.target.value })}
                    placeholder="Ex: Karatê, Crianças, Graduação"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Submit Actions */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2.5">
                  <TactileButton
                    type="button"
                    onClick={() => setIsPhotoModalOpen(false)}
                    variant="secondary"
                    size="sm"
                  >
                    Cancelar
                  </TactileButton>
                  <TactileButton
                    type="submit"
                    variant="primary"
                    size="sm"
                    icon={<Check className="h-4 w-4" />}
                  >
                    {editingPhoto ? 'Salvar Alterações' : 'Publicar Foto'}
                  </TactileButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
