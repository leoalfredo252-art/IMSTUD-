/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
  Smartphone
} from 'lucide-react';
import { Book, UserProfile } from '../types';

interface ReaderProps {
  book: Book;
  user: UserProfile;
  onBack: () => void;
  onUpdateOfflineStatus: (bookId: string, status: 'none' | 'downloading' | 'downloaded') => void;
  isOfflineSystemMode: boolean; // Simulator of the device connection
}

export default function Reader({ book, user, onBack, onUpdateOfflineStatus, isOfflineSystemMode }: ReaderProps) {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>('light');
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);

  const handleNextPage = () => {
    if (currentPage < book.pages.length - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
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
      }
    }, 400);
  };

  // Typography settings mappings
  const fontSizeClasses = {
    sm: 'text-sm leading-relaxed',
    md: 'text-base md:text-lg leading-relaxed',
    lg: 'text-lg md:text-xl leading-relaxed',
    xl: 'text-xl md:text-2xl leading-relaxed'
  };

  const themeClasses = {
    light: 'bg-white text-slate-900 border-slate-200',
    sepia: 'bg-[#f4ecd8] text-[#5c4033] border-[#ebdcb9]',
    dark: 'bg-slate-950 text-slate-200 border-slate-900'
  };

  const renderDRMWatermark = () => {
    return (
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden opacity-[0.04] flex items-center justify-center flex-col rotate-[-25deg]">
        <span className="text-3xl font-extrabold font-mono tracking-widest uppercase text-slate-800">
          IMSTUD PROTECTED
        </span>
        <span className="text-sm font-semibold font-mono text-slate-800 mt-2">
          ID: {user.email} - DISPOSITIVO ATIVO
        </span>
        <span className="text-xs font-mono text-slate-800">
          LICENÇA INDIVIDUAL ENCRIPTADA
        </span>
      </div>
    );
  };

  // If system is offline, and book isn't downloaded, show DRM Block Screen
  const isOfflineAndNotDownloaded = isOfflineSystemMode && book.offlineStatus !== 'downloaded';

  return (
    <div className={`flex flex-col h-full min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'}`}>
      
      {/* Reader Navbar */}
      <div className={`p-4 border-b flex items-center justify-between ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'} shadow-sm`}>
        <div className="flex items-center space-x-3">
          <button 
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Voltar para a Biblioteca"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-bold text-xs md:text-sm line-clamp-1">{book.title}</h2>
            <p className="text-[10px] text-slate-500 line-clamp-1">{book.author} • {book.classLevel}</p>
          </div>
        </div>

        {/* Reader Config Options */}
        <div className="flex items-center space-x-2">
          {/* Offline indicator */}
          <div className="hidden sm:flex items-center text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {isOfflineSystemMode ? (
              <span className="flex items-center text-red-600 dark:text-red-400 font-bold gap-1">
                <WifiOff className="w-3.5 h-3.5" /> Modo Sem Rede
              </span>
            ) : (
              <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-bold gap-1">
                <Wifi className="w-3.5 h-3.5" /> Online
              </span>
            )}
          </div>

          {/* FontSize adjuster */}
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
            <button 
              onClick={() => setFontSize('sm')} 
              className={`px-2 py-1 text-xs font-bold rounded ${fontSize === 'sm' ? 'bg-white dark:bg-slate-700 shadow-xs' : 'text-slate-500'}`}
            >
              A
            </button>
            <button 
              onClick={() => setFontSize('md')} 
              className={`px-2 py-1 text-sm font-bold rounded ${fontSize === 'md' ? 'bg-white dark:bg-slate-700 shadow-xs' : 'text-slate-500'}`}
            >
              A
            </button>
            <button 
              onClick={() => setFontSize('lg')} 
              className={`px-2 py-1 text-base font-bold rounded ${fontSize === 'lg' ? 'bg-white dark:bg-slate-700 shadow-xs' : 'text-slate-500'}`}
            >
              A+
            </button>
          </div>

          {/* Theme switcher */}
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
            <button 
              onClick={() => setTheme('light')} 
              className={`p-1.5 rounded ${theme === 'light' ? 'bg-white dark:bg-slate-700 shadow-xs text-amber-500' : 'text-slate-500'}`}
              title="Tema Claro"
            >
              <Sun className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setTheme('sepia')} 
              className={`p-1.5 rounded text-xs font-bold ${theme === 'sepia' ? 'bg-[#f4ecd8] text-[#5c4033] shadow-xs' : 'text-slate-500'}`}
              title="Tema Sépia"
            >
              S
            </button>
            <button 
              onClick={() => setTheme('dark')} 
              className={`p-1.5 rounded ${theme === 'dark' ? 'bg-slate-700 text-yellow-400 shadow-xs' : 'text-slate-500'}`}
              title="Tema Escuro"
            >
              <Moon className="w-4 h-4" />
            </button>
          </div>

          {/* Bookmark */}
          <button 
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${isBookmarked ? 'text-amber-500' : 'text-slate-400'}`}
            title="Marcar Página"
          >
            {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Reading Frame */}
      <div className="flex-1 max-w-3xl w-full mx-auto p-4 md:p-8 flex flex-col justify-between overflow-y-auto">
        
        {isOfflineAndNotDownloaded ? (
          /* Offline block screen (DRM Enforcement) */
          <div className="my-auto text-center p-8 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md mx-auto">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-950/50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400">
              <Lock className="w-8 h-8 animate-bounce" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Conteúdo Protegido por DRM</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              O livro <span className="font-bold">"{book.title}"</span> está encriptado e exige conexão ativa à internet ou autorização de download offline para ser descriptografado de forma segura.
            </p>
            
            <button
              onClick={startDownload}
              className="mt-6 w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-blue-950 text-white font-bold rounded-xl text-sm shadow-sm hover:bg-blue-900 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Descarregar Livro (Simular Ativação)</span>
            </button>
            <p className="text-[10px] text-slate-400 mt-2">
              Isso simula o download do binário encriptado para o IndexedDB local.
            </p>
          </div>
        ) : (
          /* Book Content */
          <div className={`relative flex-1 p-6 md:p-10 border rounded-2xl shadow-xs overflow-hidden transition-all duration-300 min-h-[350px] ${themeClasses[theme]}`}>
            
            {/* DRM Anti-Copy Shield and Watermark */}
            {renderDRMWatermark()}

            {/* Simulated text layout - unselectable via CSS rules */}
            <div className={`select-none leading-relaxed break-words h-full ${fontSizeClasses[fontSize]}`} style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
              
              {/* Header inside the book page */}
              <div className="flex justify-between items-center text-[10px] opacity-60 uppercase font-bold mb-6 tracking-widest">
                <span>{book.subject} • {book.classLevel}</span>
                {isBookmarked && <span className="text-amber-500">Página Marcada</span>}
              </div>

              {/* The dynamic book page paragraph */}
              <div className="whitespace-pre-line text-justify font-serif tracking-normal leading-relaxed md:leading-loose">
                {book.pages[currentPage] || "Fim do conteúdo demonstrativo do manual didático. A equipa da IAM_IM está a trabalhar com o Ministério de Educação para expandir mais capítulos."}
              </div>
            </div>
          </div>
        )}

        {/* Offline Action Bar (Download trigger) */}
        {!isOfflineAndNotDownloaded && book.offlineStatus !== 'downloaded' && (
          <div className="mt-4 bg-amber-50 border border-amber-200/60 p-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Download className="w-4 h-4 text-amber-700" />
              <div className="text-xs">
                <span className="font-bold text-amber-900">Poupar Saldo de Internet?</span>
                <p className="text-amber-700/80">Descarregue este manual agora para continuar a estudar mesmo offline.</p>
              </div>
            </div>
            {book.offlineStatus === 'downloading' ? (
              <div className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1.5 rounded-lg">
                Descarregando {downloadProgress}%
              </div>
            ) : (
              <button
                onClick={startDownload}
                className="text-xs font-bold text-white bg-amber-700 px-3 py-1.5 rounded-lg hover:bg-amber-800 transition-colors shrink-0"
              >
                Descarregar (Grátis)
              </button>
            )}
          </div>
        )}

        {/* Downloader Confirmation Notification */}
        {book.offlineStatus === 'downloaded' && (
          <div className="mt-4 bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between">
            <span className="text-xs text-emerald-800 font-bold flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" /> Manual Autorizado Offline
            </span>
            <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
              Licença DRM Validada
            </span>
          </div>
        )}

        {/* Pagination control buttons */}
        {!isOfflineAndNotDownloaded && (
          <div className="flex items-center justify-between mt-6 select-none">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              className={`flex items-center space-x-1 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                currentPage === 0
                  ? 'text-slate-300 pointer-events-none'
                  : theme === 'dark' 
                    ? 'text-slate-300 hover:bg-slate-900 bg-slate-900' 
                    : 'text-slate-700 hover:bg-slate-200 bg-slate-200'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            {/* Page indicator */}
            <div className="text-xs font-mono text-slate-500">
              Página <span className="font-bold text-slate-800 dark:text-slate-300">{currentPage + 1}</span> de <span className="font-bold">{book.pages.length}</span>
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === book.pages.length - 1}
              className={`flex items-center space-x-1 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                currentPage === book.pages.length - 1
                  ? 'text-slate-300 pointer-events-none'
                  : theme === 'dark' 
                    ? 'text-slate-300 hover:bg-slate-900 bg-slate-900' 
                    : 'text-slate-700 hover:bg-slate-200 bg-slate-200'
              }`}
            >
              <span>Próxima</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      
      {/* Footer copyright note */}
      <div className="text-center pb-4 text-[9px] text-slate-400 font-mono">
        © IMSTUD Secure Reading Module. Todos os direitos reservados à IAM_IM.
      </div>
    </div>
  );
}
