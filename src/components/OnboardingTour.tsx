/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Cloud, 
  Compass, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  X,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string;
  tab?: 'library' | 'favorites' | 'gmail' | 'profile' | 'settings' | 'drive';
  placement?: 'top' | 'bottom' | 'center';
}

const steps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao IMSTUD! 🎓',
    description: 'Boas-vindas à sua Biblioteca Digital. Vamos fazer uma visita rápida para lhe mostrar como ler os seus livros e importar novos materiais diretamente do seu Google Drive.',
    placement: 'center'
  },
  {
    id: 'tab-library',
    title: 'Catálogo da Biblioteca 📚',
    description: 'Esta é a aba principal onde encontra todos os manuais didáticos e manuais oficiais do currículo de Angola, organizados por disciplinas e classes.',
    targetSelector: '#tour-tab-library',
    placement: 'top'
  },
  {
    id: 'first-book',
    title: 'Leitura Interativa 📖',
    description: 'Para iniciar os seus estudos, basta clicar na capa ou título de qualquer livro para abrir o leitor e-book integrado.',
    targetSelector: '#tour-first-book',
    tab: 'library',
    placement: 'bottom'
  },
  {
    id: 'tab-drive',
    title: 'Ligação à sua Nuvem ☁️',
    description: 'Na aba "Drive" pode ligar a sua conta Google real para sincronizar o seu acervo pessoal e manter os seus estudos integrados.',
    targetSelector: '#tour-tab-drive',
    placement: 'top'
  },
  {
    id: 'drive-picker',
    title: 'Importar via Google Picker 📂',
    description: 'Clique neste botão para pesquisar na sua conta Google Drive e importar PDFs, ePUBs ou resumos de aula diretamente para a estante.',
    targetSelector: '#tour-drive-picker',
    tab: 'drive',
    placement: 'bottom'
  },
  {
    id: 'congratulations',
    title: 'Pronto para Estudar! 🎉',
    description: 'Excelente! Concluiu o seu tutorial de bordo. Agora está pronto para explorar. Pode reiniciar este tutorial a qualquer momento nas Definições do App.',
    placement: 'center'
  }
];

interface OnboardingTourProps {
  activeTab: 'library' | 'favorites' | 'gmail' | 'profile' | 'settings' | 'drive';
  setActiveTab: (tab: 'library' | 'favorites' | 'gmail' | 'profile' | 'settings' | 'drive') => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function OnboardingTour({
  activeTab,
  setActiveTab,
  isOpen,
  onClose
}: OnboardingTourProps) {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  const step = steps[currentStepIdx];

  // Auto-change active tab if the step requires a specific tab to be rendered
  useEffect(() => {
    if (isOpen && step.tab && activeTab !== step.tab) {
      setActiveTab(step.tab);
    }
  }, [currentStepIdx, isOpen, step.tab, activeTab, setActiveTab]);

  // Handle position tracking of highlighted target elements
  useEffect(() => {
    if (!isOpen) return;

    if (!step.targetSelector) {
      setCoords(null);
      return;
    }

    const updatePosition = () => {
      const el = document.querySelector(step.targetSelector!);
      if (el) {
        const rect = el.getBoundingClientRect();
        setCoords({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height
        });
        
        // Scroll target element into view if not visible
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        setCoords(null);
      }
    };

    // Run measurement with a brief delay to allow tab/UI state changes to mount completely
    const timer = setTimeout(updatePosition, 200);

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [currentStepIdx, isOpen, step.targetSelector, activeTab]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStepIdx < steps.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('imstud_onboarding_completed', 'true');
    onClose();
    setCurrentStepIdx(0);
  };

  const handleSkip = () => {
    handleComplete();
  };

  // Safe position calculations for floating tooltips
  const getTooltipStyle = () => {
    if (!coords) {
      // Center placement when no coordinate target exists
      return {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 99999,
        width: '90%',
        maxWidth: '350px'
      };
    }

    const tooltipWidth = 320;
    const padding = 12;

    // Centered horizontal coordinate relative to target, clamped to screen edges
    const left = Math.max(
      padding,
      Math.min(window.innerWidth - tooltipWidth - padding, coords.left + (coords.width - tooltipWidth) / 2)
    );

    // Determine vertical placement dynamically to prevent clipping on small heights
    const spaceBelow = window.innerHeight - (coords.top + coords.height);
    const spaceAbove = coords.top;
    
    let top = coords.top + coords.height + 12; // default: below
    let arrowClass = 'top-[-6px] left-[50%] translate-x-[-50%] border-b-slate-900 border-r-slate-900';

    if (step.placement === 'top' || (spaceBelow < 180 && spaceAbove > spaceBelow)) {
      top = coords.top - 180; // approximate tooltip height offset
      if (top < padding) top = padding;
      arrowClass = 'bottom-[-6px] left-[50%] translate-x-[-50%] border-t-slate-900 border-l-slate-900';
    }

    return {
      position: 'absolute' as const,
      top: `${top}px`,
      left: `${left}px`,
      zIndex: 99999,
      width: `${tooltipWidth}px`
    };
  };

  return (
    <div className="fixed inset-0 overflow-y-auto pointer-events-none z-9999 font-sans select-none">
      {/* Dimmed backdrop overlay - handles pointer-events block selectively */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-950/75 pointer-events-auto backdrop-blur-[2px]"
        onClick={handleSkip}
      />

      {/* Target Highlight Ring */}
      <AnimatePresence>
        {coords && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            style={{
              position: 'absolute',
              top: coords.top - 6,
              left: coords.left - 6,
              width: coords.width + 12,
              height: coords.height + 12,
            }}
            className="rounded-xl border-2 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.65)] bg-amber-500/5 pointer-events-none z-9998"
          />
        )}
      </AnimatePresence>

      {/* Guided Tooltip Card */}
      <motion.div
        layout
        initial={{ scale: 0.93, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={getTooltipStyle()}
        className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 text-white pointer-events-auto z-9999"
      >
        {/* Step progress bar */}
        <div className="flex items-center justify-between mb-3.5 text-[10px] font-mono text-slate-500">
          <div className="flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span className="text-amber-400 font-bold uppercase tracking-wider">Tutorial de Bordo</span>
          </div>
          <span className="font-bold">Passo {currentStepIdx + 1} de {steps.length}</span>
        </div>

        {/* Content */}
        <div className="space-y-1.5 mb-5">
          <h4 className="text-sm font-black tracking-tight text-slate-100 flex items-center space-x-2">
            <span>{step.title}</span>
          </h4>
          <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
            {step.description}
          </p>
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between pt-3.5 border-t border-slate-800/80">
          <button
            type="button"
            onClick={handleSkip}
            className="text-[10px] text-slate-500 hover:text-slate-300 font-bold tracking-wide transition-colors cursor-pointer"
          >
            Saltar Tour
          </button>

          <div className="flex items-center space-x-1.5">
            {currentStepIdx > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="p-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg flex items-center justify-center transition-all cursor-pointer"
                title="Voltar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black rounded-lg flex items-center space-x-1 transition-all cursor-pointer shadow-lg shadow-amber-500/10"
            >
              <span>{currentStepIdx === steps.length - 1 ? 'Concluir 🏁' : 'Seguinte'}</span>
              {currentStepIdx < steps.length - 1 && <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
