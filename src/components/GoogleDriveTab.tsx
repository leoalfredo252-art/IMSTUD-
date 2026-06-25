/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  FolderOpen, 
  Search, 
  RefreshCw, 
  Trash2, 
  Upload, 
  Download, 
  FileText, 
  BookOpen, 
  CheckCircle,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { listDriveFiles, deleteDriveFile, uploadDriveFile, downloadDriveFileContent, DriveFile } from '../lib/drive';
import { Book } from '../types';

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

interface GoogleDriveTabProps {
  accessToken: string | null;
  onGoogleSignIn: () => Promise<void>;
  onImportBook: (book: Book) => void;
  isOffline: boolean;
}

export default function GoogleDriveTab({ 
  accessToken, 
  onGoogleSignIn, 
  onImportBook,
  isOffline 
}: GoogleDriveTabProps) {
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Summary Upload Form States
  const [uploadTitle, setUploadTitle] = useState<string>('Resumo de Aula - IMSTUD');
  const [uploadContent, setUploadContent] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Fetch files when component mounts or token changes
  useEffect(() => {
    if (accessToken && !isOffline) {
      loadFiles();
    }
  }, [accessToken, isOffline]);

  const loadFiles = async (search: string = '') => {
    if (!accessToken) return;
    try {
      setIsLoading(true);
      setError(null);
      const files = await listDriveFiles(accessToken, search);
      setDriveFiles(files);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar ficheiros do Google Drive.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadFiles(searchQuery);
  };

  // Helper to trigger a temporary success message
  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // 1. Google Picker API - Interactive File Selection
  const openPicker = async () => {
    if (!accessToken) {
      alert('Por favor, conecte a sua conta Google primeiro.');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Load Google Client library and Picker module dynamically
      await new Promise<void>((resolve, reject) => {
        if (window.google?.picker) {
          resolve();
          return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = () => {
          window.gapi.load('picker', {
            callback: () => resolve(),
            onerror: () => reject(new Error('Falha ao carregar o módulo Google Picker')),
          });
        };
        script.onerror = () => reject(new Error('Falha ao carregar o script Google API'));
        document.body.appendChild(script);
      });

      // Handle iframe ancestor origin constraints securely
      const pickerOrigin =
        window.location.ancestorOrigins &&
        window.location.ancestorOrigins.length > 0
          ? window.location.ancestorOrigins[window.location.ancestorOrigins.length - 1]
          : window.location.origin;

      // Configure a clean view showing relevant study file types
      const view = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS)
        .setMimeTypes('application/pdf,application/epub+zip,image/jpeg,image/png,text/plain');

      const picker = new window.google.picker.PickerBuilder()
        .addView(view)
        .setOAuthToken(accessToken)
        .setCallback(pickerCallback)
        .setOrigin(pickerOrigin)
        .setTitle('Selecione Ficheiro do Google Drive')
        .build();
        
      picker.setVisible(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao inicializar o Seletor Google Picker.');
    } finally {
      setIsLoading(false);
    }
  };

  // Callback executed when the user picks a file in the Google Picker iframe overlay
  const pickerCallback = async (data: any) => {
    if (data.action === window.google.picker.Action.PICKED) {
      const doc = data.docs[0];
      const fileId = doc.id;
      const fileName = doc.name;
      const mimeType = doc.mimeType;
      
      await handleImportAction(fileId, fileName, mimeType);
    }
  };

  // 2. Import Action logic
  const handleImportAction = async (fileId: string, fileName: string, mimeType: string) => {
    try {
      setIsLoading(true);
      setError(null);

      let bookPages: string[] = [];
      let format: 'text' | 'pdf' | 'epub' | 'images' = 'text';
      let pdfUrl: string | undefined = undefined;

      if (mimeType === 'text/plain') {
        const textContent = await downloadDriveFileContent(accessToken!, fileId);
        // Split content into page blocks by double newlines or standard length
        const paragraphs = textContent.split('\n\n').filter(p => p.trim().length > 0);
        bookPages = paragraphs.length > 0 ? paragraphs : [textContent];
        format = 'text';
      } else if (mimeType === 'application/pdf') {
        // Embed Google Docs Viewer URL inside the app reader
        pdfUrl = `https://docs.google.com/viewer?srcid=${fileId}&pid=explorer&efh=false&a=v&chrome=false&embedded=true`;
        format = 'pdf';
        bookPages = ['Visualização de Documento PDF importado do Google Drive.'];
      } else if (mimeType.startsWith('image/')) {
        pdfUrl = `https://docs.google.com/viewer?srcid=${fileId}&pid=explorer&efh=false&a=v&chrome=false&embedded=true`;
        format = 'images';
        bookPages = ['Visualização de Imagem importada do Google Drive.'];
      } else {
        // ePUB or other files fallback
        pdfUrl = `https://docs.google.com/viewer?srcid=${fileId}&pid=explorer&efh=false&a=v&chrome=false&embedded=true`;
        format = 'epub';
        bookPages = ['Visualização do Livro digital importado do Google Drive.'];
      }

      const importedBook: Book = {
        id: `drive-import-${fileId}`,
        title: fileName,
        author: 'Ficheiro Google Drive',
        classLevel: 'Importado de Drive',
        subject: 'Documentos do Utilizador',
        coverBg: 'bg-indigo-950',
        accentColor: '#3b82f6',
        summary: `Ficheiro importado diretamente da sua cloud Google Drive. Tipo de média: ${mimeType}`,
        pages: bookPages,
        format: format,
        pdfUrl: pdfUrl,
        isPremium: false,
        rating: 5.0,
        downloads: 1,
        offlineStatus: 'none',
        isbn: `DRIVE-${fileId.substring(0, 8).toUpperCase()}`,
        publisher: 'Google Drive Sync',
        year: new Date().getFullYear()
      };

      onImportBook(importedBook);
      triggerSuccess(`Ficheiro "${fileName}" importado com sucesso para a sua Biblioteca!`);
      loadFiles(searchQuery); // Reload drive file list to sync
    } catch (err: any) {
      setError(`Erro ao importar ficheiro: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Delete Drive File (requires explicit confirmation as per guidelines!)
  const handleDeleteAction = async (fileId: string, fileName: string) => {
    // Explicit end-user confirmation dialogue MANDATORY
    const confirmed = window.confirm(
      `ATENÇÃO: Tem a certeza absoluta que deseja eliminar definitivamente o ficheiro "${fileName}" do seu Google Drive real?\n\nEsta acção apagará o ficheiro na cloud e é IRREVERSÍVEL.`
    );
    
    if (!confirmed) return;

    try {
      setIsLoading(true);
      setError(null);
      await deleteDriveFile(accessToken!, fileId);
      triggerSuccess(`Ficheiro "${fileName}" eliminado do Google Drive com sucesso!`);
      loadFiles(searchQuery);
    } catch (err: any) {
      setError(`Falha ao eliminar: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Create and Upload Study Summary to Google Drive
  const handleUploadSummary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim() || !uploadContent.trim()) {
      alert('Por favor introduza o título e conteúdo do resumo para fazer upload.');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      
      const fileName = uploadTitle.endsWith('.txt') ? uploadTitle : `${uploadTitle}.txt`;
      await uploadDriveFile(accessToken!, fileName, uploadContent, 'text/plain');
      
      triggerSuccess(`Resumo "${fileName}" carregado e guardado no seu Google Drive real com sucesso!`);
      setUploadContent('');
      loadFiles(searchQuery); // Reload list
    } catch (err: any) {
      setError(`Falha ao carregar resumo: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const formatBytes = (bytes?: string) => {
    if (!bytes) return 'Desconhecido';
    const num = parseInt(bytes, 10);
    if (isNaN(num)) return 'Desconhecido';
    if (num < 1024) return `${num} B`;
    const kb = num / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const getMimeBadge = (mime: string) => {
    if (mime === 'application/pdf') return 'bg-red-500/10 text-red-400 border-red-500/20';
    if (mime === 'application/epub+zip' || mime.includes('epub')) return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
    if (mime.startsWith('image/')) return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    if (mime === 'text/plain') return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    if (mime === 'application/vnd.google-apps.folder') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return 'bg-slate-800 text-slate-400 border-slate-700/50';
  };

  const getMimeLabel = (mime: string) => {
    if (mime === 'application/pdf') return 'PDF';
    if (mime === 'application/epub+zip') return 'ePUB';
    if (mime.startsWith('image/')) return 'Imagem';
    if (mime === 'text/plain') return 'Texto';
    if (mime === 'application/vnd.google-apps.folder') return 'Pasta';
    return 'Ficheiro';
  };

  // Render Offline Mode Block
  if (isOffline) {
    return (
      <div className="p-6 flex-1 flex flex-col justify-center items-center text-center space-y-4 text-xs">
        <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
          <Cloud className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <span className="font-extrabold text-slate-200 block text-xs">Modo Offline Activo</span>
          <p className="text-[10px] text-slate-500 max-w-xs leading-relaxed">
            A ligação à internet foi desativada no telemóvel simulado. Religue o sinal de rede nas definições de topo para gerir e importar ficheiros do Google Drive.
          </p>
        </div>
      </div>
    );
  }

  // Render Connect Google Drive Section if not connected
  if (!accessToken) {
    return (
      <div className="p-4 flex-1 flex flex-col justify-center items-center text-center space-y-4 text-xs min-h-0">
        <div className="w-12 h-12 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-400 animate-pulse">
          <Cloud className="w-6 h-6" />
        </div>
        <div>
          <span className="font-bold text-slate-200 block text-xs">Vincular Google Drive Real</span>
          <p className="text-[9px] text-slate-500 mt-1 max-w-xs leading-relaxed">
            Conecte a sua conta Google para ler os seus próprios e-books, importar manuais escolares via <strong>Google Picker</strong> e sincronizar os seus resumos de estudo de alta fidelidade.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-xl text-[10px] text-red-300 text-left leading-relaxed relative max-w-xs">
            <span className="font-bold block text-red-400 mb-1">Aviso:</span>
            {error}
          </div>
        )}

        <button
          onClick={onGoogleSignIn}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center space-x-2 transition-colors cursor-pointer text-[11px] shadow-sm shadow-blue-500/20"
        >
          <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
            <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.986 0-.745-.079-1.32-.174-1.886H12.24z" />
          </svg>
          <span>Ligar ao Google Drive</span>
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 flex-1 flex flex-col space-y-4 text-xs min-h-0 overflow-y-auto">
      {/* Tab Header */}
      <div className="shrink-0 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-black uppercase text-amber-500 tracking-wider">Armazenamento Google Cloud</h3>
          <p className="text-[10px] text-slate-500">Faça upload de resumos, pesquise ficheiros e importe manuais.</p>
        </div>
        <button
          id="tour-drive-picker"
          onClick={openPicker}
          disabled={isLoading}
          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center space-x-1 transition-all text-[10px] shadow-sm shadow-amber-500/15 shrink-0"
        >
          <FolderOpen className="w-3.5 h-3.5" />
          <span>Google Picker 📂</span>
        </button>
      </div>

      {/* Success / Error Toasts */}
      {successMsg && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-900/50 rounded-xl text-[10px] text-emerald-300 flex items-start space-x-2 animate-fade-in shrink-0">
          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-xl text-[10px] text-red-300 flex items-start space-x-2 animate-fade-in shrink-0">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Resumo Section */}
      <form onSubmit={handleUploadSummary} className="bg-slate-900 p-3 border border-slate-800 rounded-2xl space-y-2.5 shrink-0">
        <span className="text-[9px] font-extrabold text-amber-500 uppercase tracking-wider block">Fazer Upload de Resumo para o Drive 📤</span>
        
        <div className="space-y-2 text-[10px]">
          <div>
            <span className="block text-[8px] text-slate-500 font-bold uppercase mb-0.5">Título do Ficheiro (.txt)</span>
            <input
              type="text"
              required
              value={uploadTitle}
              onChange={e => setUploadTitle(e.target.value)}
              placeholder="Ex: Resumo de Geometria 10ª Classe"
              className="w-full bg-slate-950/80 border border-slate-800/80 p-1.5 rounded-lg text-[9px] text-slate-200 focus:outline-hidden focus:border-amber-500"
            />
          </div>
          <div>
            <span className="block text-[8px] text-slate-500 font-bold uppercase mb-0.5">Notas de Estudo / Conteúdo do Resumo</span>
            <textarea
              required
              rows={3}
              value={uploadContent}
              onChange={e => setUploadContent(e.target.value)}
              placeholder="Escreva aqui as suas fórmulas, anotações de aula ou resumos para os guardar de forma segura no seu Google Drive..."
              className="w-full bg-slate-950/80 border border-slate-800/80 p-1.5 rounded-lg text-[9px] text-slate-200 font-mono focus:outline-hidden focus:border-amber-500 resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isUploading || isLoading}
          className="w-full py-2 bg-slate-950 hover:bg-slate-900 text-slate-200 hover:text-amber-500 font-bold rounded-xl border border-slate-800 hover:border-amber-500/25 flex items-center justify-center space-x-1.5 transition-all text-[10px]"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>{isUploading ? 'A carregar ficheiro...' : 'Salvar Resumo no Drive Cloud'}</span>
        </button>
      </form>

      {/* Drive File Browser Section */}
      <div className="flex-1 flex flex-col space-y-2 min-h-0">
        <div className="shrink-0 flex items-center justify-between">
          <span className="text-[9px] font-extrabold text-amber-500 uppercase tracking-wider">Explorador de Ficheiros Drive</span>
          <button
            onClick={() => loadFiles(searchQuery)}
            disabled={isLoading}
            className="p-1 text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-50"
            title="Atualizar ficheiros"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Quick Search */}
        <form onSubmit={handleSearchSubmit} className="shrink-0 flex space-x-1">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2 w-3.5 h-3.5 text-slate-600" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Procurar nos seus ficheiros..."
              className="w-full bg-slate-900 border border-slate-800/80 pl-7 pr-2 py-1.5 rounded-xl text-[10px] text-slate-200 focus:outline-hidden focus:border-amber-500"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold border border-slate-800 rounded-xl transition-all text-[10px]"
          >
            Pesquisar
          </button>
        </form>

        {/* Files Viewport */}
        <div className="flex-1 bg-slate-950/40 border border-slate-900 rounded-2xl overflow-y-auto p-2 min-h-[140px] space-y-1.5">
          {isLoading && driveFiles.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center text-slate-500 space-y-2 py-8">
              <RefreshCw className="w-5 h-5 animate-spin text-amber-500" />
              <p className="text-[9px]">A aceder à sua cloud Google Drive real...</p>
            </div>
          ) : driveFiles.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center text-slate-600 space-y-1 py-8 text-center px-4">
              <FolderOpen className="w-5 h-5 text-slate-700 mb-1" />
              <p className="text-[9px] font-bold text-slate-400">Nenhum ficheiro correspondente</p>
              <p className="text-[8px] text-slate-600">Crie um resumo de aula acima ou use o Google Picker para selecionar manuais existentes do seu Drive.</p>
            </div>
          ) : (
            driveFiles.map(file => (
              <div 
                key={file.id} 
                className="bg-slate-900 p-2.5 border border-slate-800/80 hover:border-slate-800 rounded-xl flex items-center justify-between gap-3 transition-colors group"
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-800/60 flex items-center justify-center shrink-0 text-slate-400 group-hover:text-amber-500 transition-colors">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-slate-200 block text-[10px] leading-tight truncate" title={file.name}>
                      {file.name}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[7px] px-1 py-0.2 rounded border font-mono font-bold ${getMimeBadge(file.mimeType)}`}>
                        {getMimeLabel(file.mimeType)}
                      </span>
                      {file.size && (
                        <span className="text-[8px] text-slate-500 font-mono">
                          {formatBytes(file.size)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Operations buttons */}
                <div className="flex items-center space-x-1 shrink-0">
                  {file.mimeType !== 'application/vnd.google-apps.folder' && (
                    <button
                      onClick={() => handleImportAction(file.id, file.name, file.mimeType)}
                      className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-amber-500 border border-slate-800 hover:border-amber-500/20 rounded-lg transition-all"
                      title="Importar para Biblioteca"
                    >
                      <BookOpen className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteAction(file.id, file.name)}
                    className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-500 hover:text-red-400 border border-slate-800 hover:border-red-950/40 rounded-lg transition-all"
                    title="Eliminar ficheiro"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
