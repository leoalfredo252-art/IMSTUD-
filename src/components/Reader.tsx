/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Type, 
  Moon, 
  Sun, 
  Bookmark, 
  Download, 
  Check, 
  Lock, 
  Wifi, 
  WifiOff, 
  FileText,
  BookmarkCheck,
  Smartphone,
  Tablet,
  Laptop,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Search,
  Maximize2,
  Printer,
  ShieldCheck,
  Info,
  BookOpen,
  Layout,
  BookMarked,
  Sliders,
  ChevronDown,
  Trophy,
  Sparkles,
  Award,
  Zap,
  Cloud
} from 'lucide-react';
import { Book, UserProfile, BADGE_DEFINITIONS } from '../types';

interface ReaderProps {
  book: Book;
  user: UserProfile;
  onBack: () => void;
  onUpdateOfflineStatus: (bookId: string, status: 'none' | 'downloading' | 'downloaded') => void;
  isOfflineSystemMode: boolean; // Simulator of the device connection
  initialFormat?: 'pdf' | 'images' | 'text' | 'epub';
  onUpdateUser?: (updated: Partial<UserProfile>) => void;
}

export default function Reader({ 
  book, 
  user, 
  onBack, 
  onUpdateOfflineStatus, 
  isOfflineSystemMode,
  initialFormat = 'pdf',
  onUpdateUser
}: ReaderProps) {
  // Main state defining which optimized interface is open
  const [activeFormat, setActiveFormat] = useState<'pdf' | 'images' | 'text' | 'epub'>(initialFormat);
  
  // General states
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [showToast, setShowToast] = useState<string | null>(null);

  // PDF Interface specific states
  const [pdfZoom, setPdfZoom] = useState<number>(100);
  const [pdfSearchQuery, setPdfSearchQuery] = useState<string>('');
  const [pdfRotation, setPdfRotation] = useState<number>(0);
  const [showPdfThumbnails, setShowPdfThumbnails] = useState<boolean>(false);
  const [pdfMatchIndex, setPdfMatchIndex] = useState<number>(-1);

  // Responsive PDF Rendering specific states
  const [screenWidth, setScreenWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [detectedDevice, setDetectedDevice] = useState<'phone' | 'tablet' | 'pc'>('pc');
  const [isAutoResponsive, setIsAutoResponsive] = useState<boolean>(true);
  const [forcedDevice, setForcedDevice] = useState<'none' | 'phone' | 'tablet' | 'pc'>('none'); // User can override to see the adaptive effect!

  // ePUB Interface specific states
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>('sepia');
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans' | 'mono'>('serif');

  // JPEG Interface specific states
  const [imageZoom, setImageZoom] = useState<'fit' | 'fill' | 'zoom-in'>('fit');

  // Sync format changes if initialFormat prop changes
  useEffect(() => {
    setActiveFormat(initialFormat);
    setCurrentPage(0);
  }, [initialFormat]);

  // Alert toast trigger
  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => {
      setShowToast(null);
    }, 3000);
  };

  // Gamification completion states
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [gainedXp, setGainedXp] = useState<number>(0);
  const [unlockedBadgesThisTime, setUnlockedBadgesThisTime] = useState<any[]>([]);

  const isCompleted = user.completedBooks?.includes(book.id) || false;

  const handleCompleteBook = () => {
    if (isCompleted) {
      triggerToast("Este manual já foi marcado como concluído!");
      return;
    }

    const xpReward = 150; // XP gained per completed book
    const currentCompleted = user.completedBooks || [];
    const currentXp = user.xp || 0;
    const currentBadges = user.badges || ['primeiro-passo'];

    const nextCompleted = [...currentCompleted, book.id];
    const nextXp = currentXp + xpReward;

    // Check newly unlocked badges
    const newlyUnlockedIds: string[] = [];
    const newlyUnlockedObjects: any[] = [];

    const checkAndAddBadge = (id: string) => {
      if (!currentBadges.includes(id) && !newlyUnlockedIds.includes(id)) {
        newlyUnlockedIds.push(id);
        const def = BADGE_DEFINITIONS.find(b => b.id === id);
        if (def) newlyUnlockedObjects.push(def);
      }
    };

    // Subject checks
    const subjectLower = book.subject.toLowerCase();
    const titleLower = book.title.toLowerCase();
    if (subjectLower.includes('matemática') || subjectLower.includes('algebra') || subjectLower.includes('geometria') || titleLower.includes('matemática')) {
      checkAndAddBadge('explorador-matematica');
    }
    if (subjectLower.includes('física') || titleLower.includes('física')) {
      checkAndAddBadge('fisico-aprendiz');
    }
    if (subjectLower.includes('história') || titleLower.includes('história')) {
      checkAndAddBadge('historiador-junior');
    }
    if (subjectLower.includes('química') || titleLower.includes('química')) {
      checkAndAddBadge('quimico-iniciante');
    }
    if (subjectLower.includes('geografia') || titleLower.includes('geografia')) {
      checkAndAddBadge('geografo');
    }

    // Format check
    if (activeFormat === 'epub') {
      checkAndAddBadge('saber-digital');
    }

    // Offline check
    if (book.offlineStatus === 'downloaded' || isOfflineSystemMode) {
      checkAndAddBadge('leitor-offline');
    }

    // Count check
    if (nextCompleted.length >= 3) {
      checkAndAddBadge('rato-biblioteca');
    }

    // XP threshold check
    if (nextXp >= 500) {
      checkAndAddBadge('mestre-saber');
    }

    const nextBadges = Array.from(new Set([...currentBadges, ...newlyUnlockedIds]));

    setGainedXp(xpReward);
    setUnlockedBadgesThisTime(newlyUnlockedObjects);
    setShowCelebration(true);

    if (onUpdateUser) {
      onUpdateUser({
        xp: nextXp,
        completedBooks: nextCompleted,
        badges: nextBadges
      });
    }

    triggerToast(`Manual concluído! Ganhou +${xpReward} XP de Aprendizagem!`);
  };

  const startDownload = () => {
    onUpdateOfflineStatus(book.id, 'downloading');
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setDownloadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        onUpdateOfflineStatus(book.id, 'downloaded');
        triggerToast("Manual guardado localmente em cache segura!");
      }
    }, 400);
  };

  // Prevent right clicks and copy events
  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      triggerToast("Cópia bloqueada! Protegido por direitos de autor.");
    };
    
    document.addEventListener('copy', handleCopy);
    return () => {
      document.removeEventListener('copy', handleCopy);
    };
  }, []);

  // Monitor Window Resize and classify Device Type
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenWidth(width);
      
      // Determine Device Type
      if (width < 768) {
        setDetectedDevice('phone');
      } else if (width < 1024) {
        setDetectedDevice('tablet');
      } else {
        setDetectedDevice('pc');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate and apply Adaptive Zoom & Layout based on Device Mode
  useEffect(() => {
    if (!isAutoResponsive) return;

    // Use forcedDevice if specified by user, otherwise use detectedDevice
    const currentTargetDevice = forcedDevice !== 'none' ? forcedDevice : detectedDevice;
    
    let simulatedWidth = screenWidth;
    // For forced/simulated rendering, we simulate widths if actual screen is larger
    if (forcedDevice === 'phone' && screenWidth >= 768) {
      simulatedWidth = 375;
    } else if (forcedDevice === 'tablet' && screenWidth >= 1024) {
      simulatedWidth = 768;
    } else if (forcedDevice === 'pc' && screenWidth < 1024) {
      simulatedWidth = 1200;
    }

    let optimalZoom = 100;

    if (currentTargetDevice === 'phone') {
      // Small screen fitting
      const availableWidth = Math.max(280, simulatedWidth - 32);
      optimalZoom = Math.max(45, Math.min(80, Math.floor((availableWidth / 600) * 100)));
    } else if (currentTargetDevice === 'tablet') {
      // Medium screen fitting
      const sidebarWidth = showPdfThumbnails ? 160 : 0;
      const availableWidth = Math.max(500, simulatedWidth - sidebarWidth - 48);
      optimalZoom = Math.max(70, Math.min(100, Math.floor((availableWidth / 600) * 100)));
    } else {
      // Large PC screen fitting
      const sidebarWidth = showPdfThumbnails ? 192 : 0;
      const availableWidth = Math.max(800, simulatedWidth - sidebarWidth - 96);
      optimalZoom = Math.max(90, Math.min(140, Math.floor((availableWidth / 600) * 100)));
    }

    setPdfZoom(optimalZoom);
  }, [screenWidth, detectedDevice, isAutoResponsive, showPdfThumbnails, forcedDevice]);

  // DRM Enforcement watermark rendering
  const renderDRMWatermark = () => {
    return (
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden opacity-[0.04] flex items-center justify-center flex-col rotate-[-25deg] z-10">
        <span className="text-3xl md:text-5xl font-extrabold font-mono tracking-widest uppercase text-slate-800 dark:text-slate-200">
          IMSTUD PROTECTED
        </span>
        <span className="text-sm md:text-lg font-bold font-mono text-slate-800 dark:text-slate-200 mt-2">
          ESTUDANTE: {user.email} • ID: {user.id}
        </span>
        <span className="text-xs md:text-sm font-mono text-slate-800 dark:text-slate-200 mt-1">
          LICENÇA DE LEITURA ENCRIPTADA • DISPOSITIVO AUTORIZADO
        </span>
      </div>
    );
  };

  const isOfflineAndNotDownloaded = isOfflineSystemMode && book.offlineStatus !== 'downloaded';

  // Dynamic ePUB pagination calculation to preserve perfect screen fitting across themes/sizes
  const dynamicEpubPages = useMemo(() => {
    const combinedText = book.pages.join("\n\n");
    let charsPerPage = 1100; // default md
    if (fontSize === 'sm') charsPerPage = 1600;
    else if (fontSize === 'lg') charsPerPage = 750;
    else if (fontSize === 'xl') charsPerPage = 450;

    const words = combinedText.split(/\s+/);
    const resultPages: string[] = [];
    let currentChunk: string[] = [];
    let currentLength = 0;

    for (const word of words) {
      currentChunk.push(word);
      currentLength += word.length + 1; // including space
      if (currentLength >= charsPerPage) {
        resultPages.push(currentChunk.join(" "));
        currentChunk = [];
        currentLength = 0;
      }
    }
    if (currentChunk.length > 0) {
      resultPages.push(currentChunk.join(" "));
    }
    return resultPages.length > 0 ? resultPages : [combinedText];
  }, [book.pages, fontSize]);

  // Adjust current page if it goes out of bounds when font size changes
  useEffect(() => {
    if (activeFormat === 'epub') {
      if (currentPage >= dynamicEpubPages.length) {
        setCurrentPage(Math.max(0, dynamicEpubPages.length - 1));
      }
    }
  }, [fontSize, activeFormat, dynamicEpubPages.length]);

  // Total pages based on format
  const isImageBook = book.format === 'images' && book.pageImages && book.pageImages.length > 0;
  
  // Use pages array or pageImages if exists
  const hasPageImages = book.pageImages && book.pageImages.length > 0;
  const pdfTotalPages = book.pages.length + (book.pdfUrl ? 5 : 2); // PDF has simulated professional layout pages
  const totalPagesCount = 
    activeFormat === 'images' && hasPageImages 
      ? book.pageImages!.length 
      : activeFormat === 'pdf' 
        ? pdfTotalPages
        : activeFormat === 'epub'
          ? dynamicEpubPages.length
          : book.pages.length;

  const handleNextPage = () => {
    if (currentPage < totalPagesCount - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // Typography settings mappings for ePUB
  const fontSizeClasses = {
    sm: 'text-sm leading-relaxed',
    md: 'text-base md:text-lg leading-relaxed md:leading-loose',
    lg: 'text-lg md:text-xl leading-relaxed md:leading-loose',
    xl: 'text-xl md:text-2xl leading-relaxed md:leading-loose'
  };

  const fontFamilyClasses = {
    serif: 'font-serif',
    sans: 'font-sans',
    mono: 'font-mono'
  };

  const themeClasses = {
    light: 'bg-[#fafafa] text-slate-900 border-slate-200',
    sepia: 'bg-[#f4ecd8] text-[#4a3525] border-[#ebdcb9]',
    dark: 'bg-[#121214] text-slate-200 border-slate-900'
  };

  // PDF Simulated Content Pages representing 100% Transition from Physical to Digital
  const getPdfSimulatedPageContent = (pageIndex: number) => {
    // Generate beautiful academic text simulating direct print of school manual scans
    const academicPages = [
      {
        header: `MINISTÉRIO DA EDUCAÇÃO DE ANGOLA • MANUAL DE ${book.subject.toUpperCase()}`,
        title: `CAPÍTULO I: FUNDAMENTOS TEÓRICOS E PRÁTICOS`,
        body: `O processo de transição do ensino tradicional para as metodologias científicas avançadas constitui o principal vector das novas directrizes curriculares nacionais angolanas.

Este manual didático, originalmente impresso em papel couché de 80g de alta resistência, foi digitalizado com tecnologia de compressão adaptativa para que possa ser lido com total clareza em smartphones, tablets e computadores pessoais.

A estrutura deste capítulo baseia-se na formulação de perguntas-chave e exercícios experimentais. No território da República de Angola, a aplicação deste conhecimento prático é impulsionada pela industrialização e expansão de infraestruturas nas províncias de Luanda, Benguela, Huambo, e Cabinda.`,
        footer: `IMSTUD Secure PDF Server • Licenciado para uso pessoal de ${user.name}`
      },
      {
        header: `DIRECTIVA CURRICULAR NACIONAL • CLASSE: ${book.classLevel.toUpperCase()}`,
        title: `SECCÃO 1.2: APLICAÇÃO DOS CONCEITOS E FORMULÁRIO`,
        body: `1. Definições Iniciais:
Todo o corpo teórico estruturado neste volume baseia-se em axiomas e leis universais da disciplina de ${book.subject}.

2. Formulário e Resolução Simplificada:
Dada a relevância dos dados, os alunos deverão organizar cadernos de laboratório individuais. A transição digital da IAM_IM garante que os estudantes possam simular estes esquemas de cálculo de forma simples e intuitiva.

3. Exercícios de fixação de competências:
a) Classifique o impacto dos elementos discutidos no quotidiano angolano.
b) Desenvolva uma hipótese baseada nas observações empíricas apresentadas no quadro sinótico.`,
        footer: `ISBN: ${book.isbn} • Editora Original: ${book.publisher}`
      },
      {
        header: `MINISTÉRIO DA EDUCAÇÃO DE ANGOLA • MANUAL DE ${book.subject.toUpperCase()}`,
        title: `SECÇÃO 1.3: ESTUDOS DE CASO E IMPACTO SOCIO-ECONÓMICO`,
        body: `A evolução histórica das Ciências Sociais e Exactas em África, e mais especificamente em Angola, demonstra a necessidade urgente de dotar os jovens quadros de ferramentas de análise crítica.

Através deste manual digitalizado em PDF de alta resolução, o aluno tem acesso a mapas conceituais e representações gráficas que mimetizam perfeitamente o livro 100% físico distribuído pelo Ministério de Educação.

Projectos de desenvolvimento comunitário nas províncias do leste de Angola beneficiam directamente do estudo sistemático destas matérias. Recomenda-se a leitura atenta e a realização das fichas de trabalho em anexo no final do capítulo.`,
        footer: `IMSTUD Secure PDF Server • Licenciado para uso pessoal de ${user.name}`
      },
      {
        header: `EXERCÍCIOS DE AUTO-AVALIAÇÃO E PREPARAÇÃO PARA EXAMES`,
        title: `FICHA PEDAGÓGICA Nº 1 - REVISÕES GERAIS`,
        body: `Resolva no seu caderno físico de exercícios as seguintes questões:

Questão 1: Explique por palavras suas a diferença fundamental entre a teoria clássica e o modelo moderno aplicado neste manual.

Questão 2: Comente a frase: "A educação é a arma mais poderosa que podes usar para mudar o mundo." - Nelson Mandela. Como se enquadra na transição digital de Angola?

Questão 3: Utilizando as fórmulas e esquemas das páginas anteriores, calcule a variação média dos parâmetros apresentados no gráfico hipotético de rendimento escolar.`,
        footer: `Página Homologada pelo Ministério de Educação • Ano: ${book.year}`
      },
      {
        header: `APÊNDICE METODOLÓGICO • INFORMAÇÃO COMPLEMENTAR`,
        title: `GUIA DE REFERÊNCIA RÁPIDA E GLOSSÁRIO`,
        body: `Termos Técnicos Utilizados neste Manual:
- Metodologia de Estudo Dinâmico: Sistema pedagógico que une a teoria contida nos manuais físicos à interactividade dos suportes digitais seguros.
- DRM (Digital Rights Management): Tecnologia de segurança implementada pela IAM_IM que assegura a integridade do manual, impedindo cópias ilegais.
- Transição Físico-Digital: Processo de migração de manuais escolares impressos para visualizadores digitais dinâmicos adaptados a qualquer e-crã.

Fim do capítulo demonstrativo. Todos os manuais da plataforma estão licenciados para estudo individual.`,
        footer: `© IMSTUD Secure Reading Module. Todos os direitos reservados à IAM_IM.`
      }
    ];

    const index = pageIndex % academicPages.length;
    return academicPages[index];
  };

  // Check if search query matches page text
  useEffect(() => {
    if (pdfSearchQuery.trim() === '') {
      setPdfMatchIndex(-1);
      return;
    }
    
    // Simple search scanner
    let matched = -1;
    for (let i = 0; i < totalPagesCount; i++) {
      const pageText = activeFormat === 'pdf' 
        ? (getPdfSimulatedPageContent(i).body + getPdfSimulatedPageContent(i).title).toLowerCase()
        : (book.pages[i] || '').toLowerCase();
        
      if (pageText.includes(pdfSearchQuery.toLowerCase())) {
        matched = i;
        break;
      }
    }
    
    if (matched !== -1) {
      setPdfMatchIndex(matched);
      setCurrentPage(matched);
      triggerToast(`Palavra encontrada na Página ${matched + 1}!`);
    } else {
      setPdfMatchIndex(-1);
    }
  }, [pdfSearchQuery, activeFormat]);

  return (
    <div className="flex flex-col h-full min-h-screen bg-slate-950 text-slate-100 overflow-hidden relative">
      
      {/* Dynamic Toast Alert */}
      {showToast && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-amber-500 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-full shadow-2xl z-50 animate-bounce flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4" />
          <span>{showToast}</span>
        </div>
      )}

      {/* CORE READER TOP NAVIGATION NAVBAR */}
      <div className="bg-slate-900 border-b border-slate-800 p-3.5 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center space-x-2 md:space-x-3.5">
          <button 
            onClick={onBack}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Voltar à Biblioteca"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="max-w-[140px] md:max-w-xs">
            <h2 className="font-extrabold text-xs md:text-sm text-slate-200 truncate leading-tight">{book.title}</h2>
            <p className="text-[9px] md:text-[10px] text-slate-400 truncate mt-0.5">
              {book.author} • <span className="text-amber-500 font-semibold">{book.classLevel}</span>
            </p>
          </div>
        </div>

        {/* Dynamic Mode Switcher (Adapts state and menus dynamically without lag) */}
        <div className="flex bg-slate-950/80 border border-slate-800 rounded-xl p-0.5 max-w-fit shrink-0">
          <button 
            onClick={() => {
              setActiveFormat('pdf');
              setCurrentPage(0);
              triggerToast("Menu de Leitura: Modo PDF Seguro Activo");
            }}
            className={`px-2.5 py-1 text-[9px] md:text-xs font-bold rounded-lg transition-all flex items-center space-x-1 cursor-pointer ${
              activeFormat === 'pdf' 
                ? 'bg-red-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Visualizador PDF Seguro"
          >
            <FileText className="w-3 h-3" />
            <span className="hidden sm:inline">PDF</span>
          </button>

          <button 
            onClick={() => {
              setActiveFormat('images');
              setCurrentPage(0);
              triggerToast("Menu de Leitura: Modo JPEG Visual Activo");
            }}
            className={`px-2.5 py-1 text-[9px] md:text-xs font-bold rounded-lg transition-all flex items-center space-x-1 cursor-pointer ${
              activeFormat === 'images' 
                ? 'bg-teal-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Visualizador de Imagens de Produtoras"
          >
            <Smartphone className="w-3 h-3" />
            <span className="hidden sm:inline">JPEG</span>
          </button>

          <button 
            onClick={() => {
              setActiveFormat('epub');
              setCurrentPage(0);
              triggerToast("Menu de Leitura: Modo PUB Líquido Activo");
            }}
            className={`px-2.5 py-1 text-[9px] md:text-xs font-bold rounded-lg transition-all flex items-center space-x-1 cursor-pointer ${
              activeFormat === 'epub' 
                ? 'bg-amber-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="E-book Líquido Adaptável"
          >
            <Type className="w-3 h-3" />
            <span className="hidden sm:inline">ePUB</span>
          </button>
        </div>

        {/* Bookmark & DRM Status Indicator */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Network Status indicator */}
          <div className="hidden sm:flex items-center text-[9px] px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 mr-1">
            {isOfflineSystemMode ? (
              <span className="flex items-center text-red-500 font-bold gap-1">
                <WifiOff className="w-3 h-3" /> Offline
              </span>
            ) : (
              <span className="flex items-center text-emerald-500 font-bold gap-1">
                <Wifi className="w-3 h-3" /> DRM Online
              </span>
            )}
          </div>

          <button 
            onClick={() => {
              setIsBookmarked(!isBookmarked);
              triggerToast(isBookmarked ? "Marcador removido!" : "Página marcada nos favoritos!");
            }}
            className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer ${isBookmarked ? 'text-amber-500' : 'text-slate-400'}`}
            title="Marcar Página de Estudo"
          >
            {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE MENU ACCORDING TO USER PREFERENCE */}

      {/* ----------------- 1. PDF OPTIMIZED INTERFACE MENU ----------------- */}
      {activeFormat === 'pdf' && (
        <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
          
          {/* PDF Toolbar Area */}
          <div className="bg-slate-900/90 border-b border-slate-800 p-2 flex flex-wrap items-center justify-between text-xs space-y-1.5 md:space-y-0 px-4">
            
            {/* Page navigation controls */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={handlePrevPage}
                disabled={currentPage === 0}
                className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center space-x-1.5 font-mono">
                <input 
                  type="text"
                  value={currentPage + 1}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val) && val >= 1 && val <= totalPagesCount) {
                      setCurrentPage(val - 1);
                    }
                  }}
                  className="w-10 p-1 text-center bg-slate-950 border border-slate-800 rounded-md font-bold text-slate-200"
                />
                <span className="text-slate-500">/</span>
                <span className="text-slate-400 font-bold">{totalPagesCount}</span>
              </div>

              <button 
                onClick={handleNextPage}
                disabled={currentPage === totalPagesCount - 1}
                className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Responsive PDF Rendering & Device Adaptation Engine */}
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              {/* Zoom Controls with auto-responsive bypass */}
              <div className="flex items-center bg-slate-950 p-0.5 border border-slate-800 rounded-lg">
                <button 
                  onClick={() => {
                    setIsAutoResponsive(false);
                    if (pdfZoom > 40) setPdfZoom(prev => Math.max(40, prev - 10));
                    triggerToast("Zoom Manual. Toque em 'Auto' para repor ajuste inteligente.");
                  }}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                  title="Diminuir Zoom (Manual)"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-1.5 text-[9px] font-mono font-bold text-slate-300 select-none">{pdfZoom}%</span>
                <button 
                  onClick={() => {
                    setIsAutoResponsive(false);
                    if (pdfZoom < 200) setPdfZoom(prev => Math.min(200, prev + 10));
                    triggerToast("Zoom Manual. Toque em 'Auto' para repor ajuste inteligente.");
                  }}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                  title="Aumentar Zoom (Manual)"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Responsive Layout & Target Device Badge */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => {
                    setIsAutoResponsive(true);
                    setForcedDevice('none');
                    triggerToast("Ajuste Adaptativo Inteligente Activado!");
                  }}
                  className={`px-2 py-1 rounded-lg border text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    isAutoResponsive && forcedDevice === 'none'
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-extrabold shadow-sm'
                      : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                  title="Ajustar automaticamente ao tamanho real do ecrã"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isAutoResponsive && forcedDevice === 'none' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                  <span>Auto</span>
                </button>

                {/* Device Emulators (Allows previewing other layouts effortlessly) */}
                <div className="flex bg-slate-950 p-0.5 border border-slate-800/80 rounded-lg">
                  <button
                    onClick={() => {
                      setIsAutoResponsive(true);
                      setForcedDevice('phone');
                      triggerToast("Simulador: Forçado layout de Telemóvel");
                    }}
                    className={`p-1 rounded cursor-pointer transition-colors ${
                      isAutoResponsive && (forcedDevice === 'phone' || (forcedDevice === 'none' && detectedDevice === 'phone'))
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                    title="Simular Layout Telemóvel (Ideal para ecrãs pequenos)"
                  >
                    <Smartphone className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => {
                      setIsAutoResponsive(true);
                      setForcedDevice('tablet');
                      triggerToast("Simulador: Forçado layout de Tablet");
                    }}
                    className={`p-1 rounded cursor-pointer transition-colors ${
                      isAutoResponsive && (forcedDevice === 'tablet' || (forcedDevice === 'none' && detectedDevice === 'tablet'))
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                    title="Simular Layout Tablet"
                  >
                    <Tablet className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => {
                      setIsAutoResponsive(true);
                      setForcedDevice('pc');
                      triggerToast("Simulador: Forçado layout de PC");
                    }}
                    className={`p-1 rounded cursor-pointer transition-colors ${
                      isAutoResponsive && (forcedDevice === 'pc' || (forcedDevice === 'none' && detectedDevice === 'pc'))
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                    title="Simular Layout PC / Desktop"
                  >
                    <Laptop className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <button 
                onClick={() => setPdfRotation(prev => (prev + 90) % 360)}
                className="p-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                title="Rodar Página 90º"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>

              <button 
                onClick={() => {
                  setShowPdfThumbnails(!showPdfThumbnails);
                  triggerToast(showPdfThumbnails ? "Painel lateral fechado" : "Painel lateral aberto");
                }}
                className={`p-1.5 bg-slate-950 border rounded-lg cursor-pointer hidden md:block ${
                  showPdfThumbnails ? 'border-red-600 text-red-500' : 'border-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Miniaturas do Documento"
              >
                <Layout className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Search and Secure block icons */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-1/2 transform -translate-y-1/2" />
                <input 
                  type="text"
                  placeholder="Pesquisar manual..."
                  value={pdfSearchQuery}
                  onChange={(e) => setPdfSearchQuery(e.target.value)}
                  className="pl-7 pr-2.5 py-1 bg-slate-950 border border-slate-800 text-slate-200 rounded-md text-[10px] w-32 focus:outline-none focus:border-red-600"
                />
              </div>

              {/* Secure Download Block Icon */}
              <button 
                onClick={() => triggerToast("Download bloqueado! Este manual está seguro contra partilhas externas.")}
                className="p-1.5 bg-slate-950 hover:bg-red-950/30 border border-slate-800 hover:border-red-500/30 rounded-lg text-slate-400 hover:text-red-400 transition-all cursor-pointer"
                title="Guardar PDF (Bloqueado por DRM)"
              >
                <Download className="w-3.5 h-3.5" />
              </button>

              {/* Print Block Icon */}
              <button 
                onClick={() => triggerToast("Impressão bloqueada! O manual do estudante é 100% digital e intransferível.")}
                className="p-1.5 bg-slate-950 hover:bg-red-950/30 border border-slate-800 hover:border-red-500/30 rounded-lg text-slate-400 hover:text-red-400 transition-all cursor-pointer"
                title="Imprimir Manual (Protegido)"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* PDF Main Workspace - Highly optimized layout mimicking real PDF applications */}
          <div className="flex-1 flex overflow-hidden relative">
            
            {/* Sidebar Thumbnails Panel (Visible only on medium screens and larger) */}
            {showPdfThumbnails && (
              <div className="w-48 bg-slate-900 border-r border-slate-800 p-3 overflow-y-auto space-y-3 shrink-0 hidden md:block">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">Páginas do Manual</p>
                {Array.from({ length: totalPagesCount }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx)}
                    className={`w-full text-left p-2 rounded-xl transition-all border flex items-center space-x-2.5 ${
                      currentPage === idx
                        ? 'bg-red-600/10 border-red-500 text-white font-bold'
                        : 'bg-slate-950/50 border-transparent text-slate-400 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="w-8 h-10 bg-slate-800 border border-slate-700/60 rounded text-[9px] flex items-center justify-center font-mono font-bold shrink-0">
                      {idx + 1}
                    </div>
                    <div className="truncate">
                      <p className="text-[9px] text-slate-300">Pág. {idx + 1}</p>
                      <span className="text-[8px] text-slate-500 block">Digitalizada</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Simulated PDF Paper Canvas */}
            <div className="flex-1 overflow-auto p-4 md:p-8 flex flex-col justify-start items-center bg-slate-950 select-none space-y-6">
              {isOfflineAndNotDownloaded ? (
                /* Offline block screen (DRM Enforcement) */
                <div className="my-auto text-center p-8 bg-slate-900 border border-slate-800 rounded-2xl max-w-sm mx-auto animate-fade-in shadow-xl">
                  <div className="w-16 h-16 bg-red-950/40 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                    <Lock className="w-8 h-8 animate-bounce" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-200">Manual Seguro Offline</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    O PDF de <span className="font-semibold text-slate-100">"{book.title}"</span> está encriptado localmente para protecção de direitos de autor. Active o download seguro para estudar offline.
                  </p>
                  
                  <button
                    onClick={startDownload}
                    className="mt-6 w-full flex items-center justify-center space-x-2 py-2 px-4 bg-red-600 text-white font-bold rounded-xl text-xs shadow-md hover:bg-red-700 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descarregar Livro (Estudo Offline)</span>
                  </button>
                </div>
              ) : (
                <>
                {/* The high-fidelity PDF page simulator */}
                <div 
                  className="bg-[#e4e6eb] dark:bg-[#111] p-4 rounded-xl flex justify-center items-center relative transition-all duration-300 w-full"
                  onContextMenu={(e) => e.preventDefault()}
                >
                  {book.pdfUrl && book.pdfUrl.includes('google.com') ? (
                    <div 
                      className="bg-white text-slate-900 rounded-lg shadow-2xl relative border-t-[3px] border-amber-500 transition-all duration-300 overflow-hidden w-full flex flex-col"
                      style={{ 
                        width: '100%',
                        maxWidth: '650px',
                        height: '620px',
                      }}
                    >
                      <div className="bg-slate-900 text-slate-300 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-[10px]">
                        <span className="font-bold flex items-center gap-1.5 text-amber-500">
                          <Cloud className="w-3.5 h-3.5" /> Leitor Cloud Seguro
                        </span>
                        <span className="font-mono text-slate-500 truncate max-w-[240px]">{book.title}</span>
                      </div>
                      <iframe 
                        src={book.pdfUrl}
                        className="w-full flex-1 border-0"
                        title={book.title}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div 
                      className="bg-white text-slate-900 rounded-lg shadow-2xl relative select-none border-t-[3px] border-red-600 transition-all duration-300 overflow-hidden"
                      style={{ 
                        width: '100%',
                        maxWidth: `${600 * (pdfZoom / 100)}px`,
                        minHeight: `${780 * (pdfZoom / 100)}px`,
                        padding: `${Math.max(12, Math.min(48, 48 * (pdfZoom / 100)))}px`,
                        transform: `rotate(${pdfRotation}deg)`,
                        userSelect: 'none',
                        WebkitUserSelect: 'none'
                      }}
                    >
                      {/* Floating anti-sharing and copyright watermarks */}
                      {renderDRMWatermark()}

                      {/* PDF Header information */}
                      <div className="border-b border-slate-200 pb-2 mb-4 flex justify-between items-center text-slate-400 tracking-wider font-mono"
                           style={{ fontSize: `${Math.max(6, Math.min(10, 9 * (pdfZoom / 100)))}px` }}>
                        <span className="truncate max-w-[200px]">{getPdfSimulatedPageContent(currentPage).header}</span>
                        <span className="text-red-600 font-bold">DOCUMENTO DRM SEGURO</span>
                      </div>

                      {/* Book Cover simulated overlay on page 1 */}
                      {currentPage === 0 && (
                        <div className="bg-slate-50 border border-slate-200/60 rounded-xl mb-4 flex items-center space-x-3"
                             style={{ padding: `${Math.max(6, Math.min(16, 16 * (pdfZoom / 100)))}px` }}>
                          <div className={`rounded-lg shadow-md shrink-0 flex flex-col justify-between p-1.5 text-white ${book.coverBg}`}
                               style={{ width: `${Math.max(36, Math.min(56, 56 * (pdfZoom / 100)))}px`, height: `${Math.max(48, Math.min(80, 80 * (pdfZoom / 100)))}px` }}>
                            <span className="font-mono uppercase font-bold" style={{ fontSize: `${Math.max(5, Math.min(7, 7 * (pdfZoom / 100)))}px` }}>{book.subject}</span>
                            <span className="font-extrabold truncate" style={{ fontSize: `${Math.max(6, Math.min(9, 9 * (pdfZoom / 100)))}px` }}>{book.title}</span>
                          </div>
                          <div>
                            <h5 className="font-extrabold text-slate-800" style={{ fontSize: `${Math.max(9, Math.min(13, 13 * (pdfZoom / 100)))}px` }}>Transição Oficial para o Digital</h5>
                            <p className="text-slate-500 leading-relaxed mt-0.5" style={{ fontSize: `${Math.max(7, Math.min(10, 10 * (pdfZoom / 100)))}px` }}>
                              Este manual pedagógico foi homologado sob licença pessoal para <span className="text-slate-800 font-bold">{user.email}</span>.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Academic Simulated Page Title */}
                      <h3 className="font-black text-slate-900 border-l-4 border-red-600 leading-snug tracking-tight mb-4"
                          style={{ 
                            fontSize: `${Math.max(10, Math.min(18, 17 * (pdfZoom / 100)))}px`,
                            paddingLeft: `${Math.max(6, Math.min(14, 14 * (pdfZoom / 100)))}px`
                          }}>
                        {getPdfSimulatedPageContent(currentPage).title}
                      </h3>

                      {/* Academic Body - Scan simulation */}
                      <div className="text-slate-800 font-sans tracking-normal text-justify whitespace-pre-line select-none"
                           style={{ 
                             fontSize: `${Math.max(8, Math.min(13, 12 * (pdfZoom / 100)))}px`,
                             lineHeight: `${Math.max(11, Math.min(24, 21 * (pdfZoom / 100)))}px`
                           }}>
                        {getPdfSimulatedPageContent(currentPage).body}
                      </div>

                      {/* Render extra publisher PDF file notice if exists */}
                      {book.pdfUrl && currentPage === 1 && (
                        <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 text-red-950 font-sans leading-relaxed"
                             style={{ fontSize: `${Math.max(8, Math.min(11, 11 * (pdfZoom / 100)))}px` }}>
                          <span className="font-extrabold text-red-900 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-red-600" /> Ficheiro PDF Original Publicado
                          </span>
                          <p className="text-red-800/80 mt-1">
                            Este manual contém uma referência externa oficial em PDF fornecida directamente pelo autor ou publicadora.
                          </p>
                          <div className="mt-2 bg-white border border-red-200 rounded-lg p-2 font-mono text-slate-600 break-all select-none"
                               style={{ fontSize: `${Math.max(6, Math.min(9, 9 * (pdfZoom / 100)))}px` }}>
                            <span className="font-bold text-slate-800 block">URL de Origem do PDF:</span>
                            {book.pdfUrl}
                          </div>
                        </div>
                      )}

                      {/* PDF Footer decoration */}
                      <div className="absolute left-6 right-6 border-t border-slate-100 pt-2.5 flex justify-between items-center text-slate-400 font-mono"
                           style={{ 
                             bottom: `${Math.max(8, Math.min(24, 24 * (pdfZoom / 100)))}px`,
                             fontSize: `${Math.max(6, Math.min(10, 8 * (pdfZoom / 100)))}px` 
                           }}>
                        <span>Página {currentPage + 1} de {totalPagesCount}</span>
                        <span>{getPdfSimulatedPageContent(currentPage).footer}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Completion Reward Card for PDF */}
                {currentPage === totalPagesCount - 1 && (
                  <div className="w-full max-w-[600px] p-5 bg-gradient-to-r from-amber-500/10 via-indigo-950/40 to-blue-500/10 border border-amber-500/20 rounded-2xl text-center space-y-4 shadow-xl select-none">
                    <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto text-amber-500">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-slate-100 uppercase tracking-tight">Última Página Alcançada! 🎉</h4>
                      <p className="text-[10px] text-slate-400">
                        Completou com sucesso a leitura deste manual escolar em PDF. Reivindique o seu XP de Aprendizagem e registe esta conquista.
                      </p>
                    </div>
                    <button
                      onClick={handleCompleteBook}
                      disabled={isCompleted}
                      className={`w-full py-2.5 rounded-xl font-extrabold text-xs transition-all duration-300 cursor-pointer shadow-md flex items-center justify-center space-x-2 ${
                        isCompleted 
                          ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 cursor-default' 
                          : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black'
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>Manual Concluído (XP Resgatado)</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-slate-950" />
                          <span>Concluir Leitura & Resgatar +150 XP!</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
                </>
              )}
            </div>
          </div>
        </div>
      )}


      {/* ----------------- 2. JPEG OPTIMIZED INTERFACE MENU ----------------- */}
      {activeFormat === 'images' && (
        <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
          
          {/* JPEG Specific Toolbar */}
          <div className="bg-slate-900/95 border-b border-slate-800 p-2.5 flex items-center justify-between px-4 text-xs shrink-0">
            <div className="flex items-center space-x-3">
              <span className="text-[10px] uppercase font-mono font-bold text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-lg">JPG Visual</span>
              
              <div className="flex items-center space-x-1.5 font-mono text-slate-400">
                <button 
                  onClick={handlePrevPage}
                  disabled={currentPage === 0}
                  className="p-1 rounded bg-slate-950 hover:bg-slate-800 disabled:opacity-20 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-slate-200 font-bold">{currentPage + 1}</span>
                <span>/</span>
                <span>{totalPagesCount}</span>
                <button 
                  onClick={handleNextPage}
                  disabled={currentPage === totalPagesCount - 1}
                  className="p-1 rounded bg-slate-950 hover:bg-slate-800 disabled:opacity-20 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Image Zoom controller */}
            <div className="flex bg-slate-950 rounded-lg p-0.5 border border-slate-800">
              <button 
                onClick={() => {
                  setImageZoom('fit');
                  triggerToast("Imagem ajustada ao e-crã");
                }} 
                className={`px-2 py-1 text-[9px] font-bold rounded-md transition-all cursor-pointer ${
                  imageZoom === 'fit' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-500'
                }`}
              >
                Ajustar
              </button>
              <button 
                onClick={() => {
                  setImageZoom('zoom-in');
                  triggerToast("Lupa visual activada: deslize a imagem");
                }} 
                className={`px-2 py-1 text-[9px] font-bold rounded-md transition-all cursor-pointer ${
                  imageZoom === 'zoom-in' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-500'
                }`}
              >
                Lupa 1.5x
              </button>
            </div>
            
            {/* Download blocked feedback */}
            <button 
              onClick={() => triggerToast("Não é possível partilhar ou descarregar imagens deste manual didático.")}
              className="p-1.5 bg-slate-950 hover:bg-red-950/30 border border-slate-800 rounded-lg text-slate-400 hover:text-red-400 cursor-pointer"
              title="Guardar Imagem"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Workspace Area for Image Viewing */}
          <div className="flex-1 overflow-auto p-4 flex flex-col justify-start items-center bg-black relative space-y-6">
            {isOfflineAndNotDownloaded ? (
              /* Offline DRM shield for images */
              <div className="text-center p-8 bg-slate-900 border border-slate-800 rounded-2xl max-w-sm">
                <Lock className="w-8 h-8 text-red-500 mx-auto mb-3 animate-bounce" />
                <h4 className="text-sm font-bold text-slate-200">Imagem Protegida por DRM</h4>
                <p className="text-xs text-slate-400 mt-2">
                  Esta página visual encontra-se encriptada. Ligue-se à rede ou utilize a cache segura local.
                </p>
                <button
                  onClick={startDownload}
                  className="mt-5 px-4 py-2 bg-teal-600 text-white font-bold rounded-xl text-xs cursor-pointer hover:bg-teal-700 transition-colors"
                >
                  Autorizar Cache Offline
                </button>
              </div>
            ) : (
              <>
              <div 
                className="relative select-none max-w-full flex justify-center"
                style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                onContextMenu={(e) => e.preventDefault()}
              >
                {/* floating watermark protection */}
                {renderDRMWatermark()}

                <div 
                  className={`relative rounded-xl overflow-hidden border border-slate-800 max-h-[560px] bg-slate-950 transition-all duration-300 ${
                    imageZoom === 'zoom-in' ? 'overflow-auto cursor-zoom-out' : ''
                  }`}
                  onClick={() => setImageZoom(prev => prev === 'fit' ? 'zoom-in' : 'fit')}
                >
                  <img 
                    src={
                      hasPageImages 
                        ? book.pageImages![currentPage] 
                        : 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800&auto=format&fit=crop&q=80'
                    } 
                    alt={`Página Visual ${currentPage + 1}`}
                    className={`rounded transition-all duration-300 pointer-events-none select-none object-contain ${
                      imageZoom === 'zoom-in' ? 'w-[150%] max-w-none scale-105' : 'w-full h-auto max-h-[520px]'
                    }`}
                    referrerPolicy="no-referrer"
                    draggable={false}
                  />
                  {/* Subtle watermarked overlay protection */}
                  <div className="absolute inset-0 bg-transparent pointer-events-none" />
                </div>
              </div>

              {/* Completion Reward Card for JPEG images */}
              {currentPage === totalPagesCount - 1 && (
                <div className="w-full max-w-[480px] p-5 bg-gradient-to-r from-amber-500/10 via-indigo-950/40 to-blue-500/10 border border-amber-500/20 rounded-2xl text-center space-y-4 shadow-xl select-none">
                  <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto text-amber-500">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-slate-100 uppercase tracking-tight">Última Página Alcançada! 🎉</h4>
                    <p className="text-[10px] text-slate-400">
                      Completou com sucesso a leitura deste manual escolar visual. Reivindique o seu XP de Aprendizagem e registe esta conquista.
                    </p>
                  </div>
                  <button
                    onClick={handleCompleteBook}
                    disabled={isCompleted}
                    className={`w-full py-2.5 rounded-xl font-extrabold text-xs transition-all duration-300 cursor-pointer shadow-md flex items-center justify-center space-x-2 ${
                      isCompleted 
                        ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 cursor-default' 
                        : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black'
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Manual Concluído (XP Resgatado)</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-slate-950" />
                        <span>Concluir Leitura & Resgatar +150 XP!</span>
                      </>
                    )}
                  </button>
                </div>
              )}
              </>
            )}
          </div>
        </div>
      )}


      {/* ----------------- 3. ePUB / TEXT OPTIMIZED INTERFACE MENU ----------------- */}
      {activeFormat === 'epub' && (
        <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
          
          {/* ePUB Control Panel Toolbar */}
          <div className="bg-slate-900/95 border-b border-slate-800 p-2.5 flex flex-wrap items-center justify-between px-4 text-xs shrink-0 gap-2">
            
            {/* Quick stats and Font Selector */}
            <div className="flex items-center space-x-3">
              <span className="text-[10px] uppercase font-mono font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">ePUB Fluído</span>
              
              {/* Font Family selector */}
              <div className="flex bg-slate-950 rounded-lg p-0.5 border border-slate-800">
                <button 
                  onClick={() => setFontFamily('serif')}
                  className={`px-2 py-1 text-[9px] font-serif font-bold rounded-md transition-all cursor-pointer ${
                    fontFamily === 'serif' ? 'bg-amber-600 text-white' : 'text-slate-500'
                  }`}
                >
                  Serif
                </button>
                <button 
                  onClick={() => setFontFamily('sans')}
                  className={`px-2 py-1 text-[9px] font-sans font-bold rounded-md transition-all cursor-pointer ${
                    fontFamily === 'sans' ? 'bg-amber-600 text-white' : 'text-slate-500'
                  }`}
                >
                  Sans
                </button>
                <button 
                  onClick={() => setFontFamily('mono')}
                  className={`px-2 py-1 text-[9px] font-mono font-bold rounded-md transition-all cursor-pointer ${
                    fontFamily === 'mono' ? 'bg-amber-600 text-white' : 'text-slate-500'
                  }`}
                >
                  Mono
                </button>
              </div>
            </div>

            {/* Font sizing controller */}
            <div className="flex items-center space-x-2">
              <span className="text-[10px] text-slate-400">Letra:</span>
              <div className="flex bg-slate-950 rounded-lg p-0.5 border border-slate-800">
                <button 
                  onClick={() => { setFontSize('sm'); triggerToast("Tamanho de letra reduzido"); }} 
                  className={`px-2 py-0.5 text-[9px] font-bold rounded transition-all cursor-pointer ${fontSize === 'sm' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-500'}`}
                >
                  A-
                </button>
                <button 
                  onClick={() => { setFontSize('md'); triggerToast("Tamanho de letra normal"); }} 
                  className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all cursor-pointer ${fontSize === 'md' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-500'}`}
                >
                  A
                </button>
                <button 
                  onClick={() => { setFontSize('lg'); triggerToast("Tamanho de letra aumentado"); }} 
                  className={`px-2 py-0.5 text-xs font-bold rounded transition-all cursor-pointer ${fontSize === 'lg' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-500'}`}
                >
                  A+
                </button>
              </div>
            </div>

            {/* Reading theme colors (Day, Sepia, Night) */}
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] text-slate-400">Tema:</span>
              <div className="flex bg-slate-950 rounded-lg p-0.5 border border-slate-800">
                <button 
                  onClick={() => { setTheme('light'); triggerToast("Tema de leitura: Dia"); }} 
                  className={`p-1 rounded-md transition-all cursor-pointer ${theme === 'light' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
                  title="Claro"
                >
                  <Sun className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => { setTheme('sepia'); triggerToast("Tema de leitura: Sépia"); }} 
                  className={`px-1.5 py-0.5 text-[9px] font-bold rounded-md transition-all cursor-pointer ${theme === 'sepia' ? 'bg-[#f4ecd8] text-[#5c4033] shadow-xs' : 'text-slate-500'}`}
                  title="Sépia"
                >
                  S
                </button>
                <button 
                  onClick={() => { setTheme('dark'); triggerToast("Tema de leitura: Noite"); }} 
                  className={`p-1 rounded-md transition-all cursor-pointer ${theme === 'dark' ? 'bg-slate-700 text-yellow-400 shadow-xs' : 'text-slate-500'}`}
                  title="Escuro"
                >
                  <Moon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* ePUB Reading canvas */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center items-start bg-slate-950">
            {isOfflineAndNotDownloaded ? (
              <div className="text-center p-8 bg-slate-900 border border-slate-800 rounded-2xl max-w-sm my-auto">
                <Lock className="w-8 h-8 text-red-500 mx-auto mb-3 animate-bounce" />
                <h4 className="text-sm font-bold text-slate-200">Texto Cifrado DRM</h4>
                <p className="text-xs text-slate-400 mt-2">
                  As chaves de encriptação requerem verificação de assinatura da licença escolar.
                </p>
                <button
                  onClick={startDownload}
                  className="mt-5 px-4 py-2 bg-amber-600 text-slate-950 font-bold rounded-xl text-xs cursor-pointer hover:bg-amber-700 transition-colors"
                >
                  Sincronizar Assinatura
                </button>
              </div>
            ) : (
              <div 
                className={`w-full max-w-2xl p-6 md:p-10 border rounded-2xl shadow-xl transition-colors duration-300 relative ${themeClasses[theme]}`}
                style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                onContextMenu={(e) => e.preventDefault()}
              >
                {/* Floating DRM anti-copy watermark */}
                {renderDRMWatermark()}

                {/* Academic Header inside the book page */}
                <div className="flex justify-between items-center text-[9px] opacity-60 uppercase font-bold mb-6 tracking-widest border-b pb-2">
                  <span>{book.subject} • {book.classLevel}</span>
                  <span>ePUB de Estudo</span>
                </div>

                {/* ePUB Text Content area */}
                <div className={`${fontFamilyClasses[fontFamily]} ${fontSizeClasses[fontSize]} text-justify leading-relaxed md:leading-loose space-y-4`}>
                  <h3 className="text-base md:text-xl font-bold uppercase tracking-tight text-amber-700 dark:text-amber-400 mb-4">
                    Página de Leitura {currentPage + 1}
                  </h3>
                  
                  {/* Check if epubUrl or default page content */}
                  {book.epubUrl && currentPage === 0 ? (
                    <div className="bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/20 text-xs my-4 space-y-2">
                      <span className="font-extrabold text-amber-800 dark:text-amber-300 block">Link de Recurso ePUB Configurado:</span>
                      <p className="font-mono text-[10px] truncate">{book.epubUrl}</p>
                      <p className="text-[10px] text-slate-500">
                        * O leitor de fluxo líquido adaptou este recurso digitalizado directamente da fonte escolar do autor.
                      </p>
                    </div>
                  ) : null}

                  <p className="whitespace-pre-line">
                    {dynamicEpubPages[currentPage] || "Fim das páginas de texto re-ajustável. Desfrute da flexibilidade do ePUB para fazer leituras de longa duração, minimizando o cansaço ocular."}
                  </p>
                </div>

                {/* Completion Reward Card */}
                {currentPage === totalPagesCount - 1 && (
                  <div className="mt-8 p-5 bg-gradient-to-r from-amber-500/10 via-indigo-950/40 to-blue-500/10 border border-amber-500/20 rounded-2xl text-center space-y-4 shadow-xl max-w-md mx-auto">
                    <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto text-amber-500">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-slate-100 uppercase tracking-tight">Última Página Alcançada! 🎉</h4>
                      <p className="text-[10px] text-slate-400">
                        Completou com sucesso a leitura deste manual escolar. Reivindique o seu XP de Aprendizagem e registe esta conquista no seu percurso académico.
                      </p>
                    </div>
                    <button
                      onClick={handleCompleteBook}
                      disabled={isCompleted}
                      className={`w-full py-2.5 rounded-xl font-extrabold text-xs transition-all duration-300 cursor-pointer shadow-md flex items-center justify-center space-x-2 ${
                        isCompleted 
                          ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 cursor-default' 
                          : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black'
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>Manual Concluído (XP Resgatado)</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-slate-950" />
                          <span>Concluir Leitura & Resgatar +150 XP!</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Simple page pagination indicator */}
                <div className="mt-8 pt-4 border-t opacity-40 text-center text-[10px] font-mono">
                  Manual: {book.title} • Página {currentPage + 1} de {totalPagesCount}
                </div>
              </div>
            )}
          </div>

          {/* Simple footer page selector for ePUB */}
          <div className="bg-slate-900/90 border-t border-slate-800 p-3.5 flex items-center justify-between shrink-0 px-6">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-35 text-xs font-bold text-slate-300 rounded-xl cursor-pointer"
            >
              Anterior
            </button>
            <span className="text-xs font-mono text-slate-400">Pág. {currentPage + 1} de {totalPagesCount}</span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPagesCount - 1}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-35 text-xs font-bold text-slate-300 rounded-xl cursor-pointer"
            >
              Próxima
            </button>
          </div>
        </div>
      )}

      {/* Reader global footer block notice */}
      <div className="text-center py-2 text-[9px] text-slate-500 font-mono bg-slate-900 border-t border-slate-800 shrink-0">
        © IMSTUD Secure Reading Module. Todos os direitos reservados à IAM_IM.
      </div>

      {/* CELEBRATION MODAL OVERLAY */}
      {showCelebration && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 text-center space-y-5 shadow-2xl relative overflow-hidden my-auto">
            {/* Ambient glows inside modal */}
            <div className="absolute -left-12 -top-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none animate-pulse" />
            <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none animate-pulse" />

            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto shadow-lg relative animate-bounce">
                <Trophy className="w-10 h-10 text-slate-950" />
                <Sparkles className="w-5 h-5 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest block font-mono">CONQUISTA ACADÉMICA!</span>
              <h3 className="text-lg font-black text-white leading-tight">Manual Concluído com Sucesso!</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed max-w-xs mx-auto font-sans">
                Parabéns! Completou a leitura de <strong className="text-slate-200">"{book.title}"</strong>. A secretaria escolar registou o seu avanço pedagógico.
              </p>
            </div>

            {/* Gained XP Banner */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center space-x-3.5">
              <Zap className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse" />
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block font-bold leading-none font-sans">XP DE APRENDIZAGEM</span>
                <span className="text-lg font-black text-amber-400 font-mono leading-none">+{gainedXp} XP</span>
              </div>
            </div>

            {/* Unlocked Badges Presentation */}
            {unlockedBadgesThisTime.length > 0 && (
              <div className="space-y-2.5">
                <span className="text-[9px] font-extrabold uppercase text-slate-500 tracking-wider block font-sans">Novas Medalhas Desbloqueadas! ({unlockedBadgesThisTime.length})</span>
                <div className="space-y-2">
                  {unlockedBadgesThisTime.map(badge => (
                    <div key={badge.id} className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center space-x-3 text-left">
                      <span className="text-2xl shrink-0">{badge.icon}</span>
                      <div className="min-w-0 flex-1">
                        <span className="font-black text-white text-[11px] block truncate">{badge.title}</span>
                        <span className="text-[9px] text-slate-400 block leading-tight font-sans">{badge.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setShowCelebration(false)}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs rounded-xl transition-all duration-300 shadow-md cursor-pointer uppercase tracking-wider font-mono"
            >
              Continuar a Estudar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
