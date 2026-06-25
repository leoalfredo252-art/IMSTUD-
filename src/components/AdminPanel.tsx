/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Plus, 
  Check, 
  Trash2, 
  Building, 
  CreditCard, 
  Search, 
  DollarSign,
  AlertCircle,
  FolderOpen,
  Download,
  FileSpreadsheet,
  FileText,
  Upload,
  FileJson,
  Cloud,
  RefreshCw,
  CheckCircle,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Wifi
} from 'lucide-react';
import { Book, UserProfile, PaymentRecord } from '../types';
import { auth, db, getAccessToken, googleSignIn } from '../lib/firebase';
import { createDriveFolder, uploadDriveFile } from '../lib/drive';
import { doc, setDoc } from 'firebase/firestore';
import { jsPDF } from 'jspdf';

interface AdminPanelProps {
  books: Book[];
  users: UserProfile[];
  payments: PaymentRecord[];
  onAddBook: (newBook: Book) => void;
  onApprovePayment: (paymentId: string) => void;
  onDeleteBook: (bookId: string) => void;
}

export default function AdminPanel({ books, users, payments, onAddBook, onApprovePayment, onDeleteBook }: AdminPanelProps) {
  // Tabs within Admin
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'users' | 'books' | 'payments'>('overview');
  
  // Google Drive Admin Backup States
  const [driveToken, setDriveToken] = useState<string | null>(null);
  const [isVerifyingToken, setIsVerifyingToken] = useState(true);
  const [backupFolder, setBackupFolder] = useState<{ id: string; name: string } | null>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupStatus, setBackupStatus] = useState<{ type: 'success' | 'error' | null; message: string | null }>({
    type: null,
    message: null
  });

  useEffect(() => {
    getAccessToken().then(token => {
      setDriveToken(token);
      setIsVerifyingToken(false);
    });
  }, []);

  const handleAdminGoogleLogin = async () => {
    try {
      setIsVerifyingToken(true);
      const res = await googleSignIn();
      if (res) {
        setDriveToken(res.accessToken);
        setBackupStatus({ type: 'success', message: 'Conta Google do Administrador conectada com sucesso!' });
      }
    } catch (err: any) {
      setBackupStatus({ type: 'error', message: `Erro ao conectar conta Google: ${err.message}` });
    } finally {
      setIsVerifyingToken(false);
    }
  };

  const handleCreateDefaultFolder = async () => {
    if (!driveToken) return;
    try {
      setIsBackingUp(true);
      setBackupStatus({ type: null, message: null });
      const folder = await createDriveFolder(driveToken, 'IMSTUD_Library_Backup');
      setBackupFolder({ id: folder.id, name: folder.name });
      setBackupStatus({ type: 'success', message: `Criada com sucesso a pasta de destino: "${folder.name}"` });
    } catch (err: any) {
      setBackupStatus({ type: 'error', message: `Erro ao criar pasta: ${err.message}` });
    } finally {
      setIsBackingUp(false);
    }
  };

  const openFolderPicker = async () => {
    if (!driveToken) return;
    try {
      setIsVerifyingToken(true);
      setBackupStatus({ type: null, message: null });
      // Load scripts if not loaded
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
            onerror: () => reject(new Error('Falha ao carregar o seletor Google Picker')),
          });
        };
        script.onerror = () => reject(new Error('Falha ao carregar o script Google API'));
        document.body.appendChild(script);
      });

      const pickerOrigin = window.location.ancestorOrigins && window.location.ancestorOrigins.length > 0
        ? window.location.ancestorOrigins[window.location.ancestorOrigins.length - 1]
        : window.location.origin;

      const view = new window.google.picker.DocsView(window.google.picker.ViewId.FOLDERS)
        .setMimeTypes('application/vnd.google-apps.folder')
        .setSelectFolderEnabled(true);

      const picker = new window.google.picker.PickerBuilder()
        .addView(view)
        .setOAuthToken(driveToken)
        .setCallback((data: any) => {
          if (data.action === window.google.picker.Action.PICKED) {
            const doc = data.docs[0];
            setBackupFolder({ id: doc.id, name: doc.name });
            setBackupStatus({ type: 'success', message: `Pasta de destino selecionada: "${doc.name}"` });
          }
        })
        .setOrigin(pickerOrigin)
        .setTitle('Selecione a Pasta para Backup da Biblioteca')
        .build();

      picker.setVisible(true);
    } catch (err: any) {
      setBackupStatus({ type: 'error', message: `Erro ao abrir Picker: ${err.message}` });
    } finally {
      setIsVerifyingToken(false);
    }
  };

  const handleStartBackup = async () => {
    if (!driveToken || !backupFolder) return;
    try {
      setIsBackingUp(true);
      setBackupStatus({ type: null, message: null });

      const dateStr = new Date().toISOString().split('T')[0];
      const timeStr = new Date().toTimeString().split(' ')[0].replace(/:/g, '');
      const backupFileName = `imstud_library_backup_${dateStr}_${timeStr}.json`;
      
      // 1. Upload JSON Database Dump
      const booksJson = JSON.stringify(books, null, 2);
      await uploadDriveFile(driveToken, backupFileName, booksJson, 'application/json', backupFolder.id);

      // 2. Upload Human-readable text manifest
      let manifestContent = `=== IMSTUD DIGITAL LIBRARY BACKUP MANIFEST ===\n`;
      manifestContent += `Data de Exportacao: ${new Date().toLocaleDateString('pt-AO')} as ${new Date().toLocaleTimeString('pt-AO')}\n`;
      manifestContent += `Quantidade de Livros Publicados: ${books.length}\n`;
      manifestContent += `=========================================================\n\n`;
      
      books.forEach((b, idx) => {
        manifestContent += `[${idx + 1}] ${b.title}\n`;
        manifestContent += `    Autor: ${b.author}\n`;
        manifestContent += `    Classe: ${b.classLevel}\n`;
        manifestContent += `    Disciplina: ${b.subject}\n`;
        manifestContent += `    Formato: ${b.format}\n`;
        manifestContent += `    ISBN: ${b.isbn}\n`;
        manifestContent += `    Paginas: ${b.pages.length}\n`;
        if (b.pdfUrl) manifestContent += `    PDF URL: ${b.pdfUrl}\n`;
        manifestContent += `---------------------------------------------------------\n`;
      });

      const manifestFileName = `MANUALS_MANIFEST_${dateStr}_${timeStr}.txt`;
      await uploadDriveFile(driveToken, manifestFileName, manifestContent, 'text/plain', backupFolder.id);

      setBackupStatus({
        type: 'success',
        message: `Copia de seguranca efectuada com sucesso na pasta "${backupFolder.name}"! Foram salvos os ficheiros "${backupFileName}" e "${manifestFileName}" no Google Drive.`
      });
    } catch (err: any) {
      setBackupStatus({ type: 'error', message: `Falha ao efectuar backup: ${err.message}` });
    } finally {
      setIsBackingUp(false);
    }
  };

  // Google Drive Connection Diagnostic Testing
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<{
    status: 'success' | 'warning' | 'error' | null;
    timestamp: string;
    authenticated: boolean;
    tokenInfoOk: boolean;
    scopesChecked: { scope: string; description: string; active: boolean; required: boolean }[];
    driveApiOk: boolean;
    driveApiError: string | null;
    userInfo: { email: string; name: string } | null;
    expiresIn: number | null;
    networkLatency: number | null;
  } | null>(null);

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setDiagnosticResult(null);
    const startTime = Date.now();

    if (!driveToken) {
      setDiagnosticResult({
        status: 'error',
        timestamp: new Date().toLocaleTimeString('pt-AO'),
        authenticated: false,
        tokenInfoOk: false,
        scopesChecked: [],
        driveApiOk: false,
        driveApiError: 'Administrador não autenticado. Ligue a sua conta Google primeiro.',
        userInfo: null,
        expiresIn: null,
        networkLatency: null
      });
      setIsTestingConnection(false);
      return;
    }

    try {
      // 1. Fetch tokeninfo to validate token and check scopes
      const tokenInfoRes = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${driveToken}`);
      const latency = Date.now() - startTime;
      
      if (!tokenInfoRes.ok) {
        throw new Error(`Endpoint de validação de token do Google retornou código HTTP ${tokenInfoRes.status}`);
      }

      const tokenInfo = await tokenInfoRes.json();
      
      // The scopes string is space separated in the response
      const activeScopes = tokenInfo.scope ? tokenInfo.scope.split(' ') : [];

      const scopesToCheck = [
        { scope: 'https://www.googleapis.com/auth/drive.file', required: true, description: 'Permissão para criar, ler e editar pastas/arquivos criados por este aplicativo.' },
        { scope: 'https://www.googleapis.com/auth/drive', required: false, description: 'Acesso completo de leitura e escrita ao Google Drive.' },
        { scope: 'https://www.googleapis.com/auth/drive.metadata.readonly', required: false, description: 'Permissão para ler apenas os metadados dos arquivos existentes.' }
      ];

      const checkedScopes = scopesToCheck.map(item => ({
        scope: item.scope,
        description: item.description,
        active: activeScopes.includes(item.scope),
        required: item.required
      }));

      const hasRequiredScopes = checkedScopes.every(s => !s.required || s.active);

      // 2. Validate Drive API by attempting to list files/folders
      let driveApiOk = false;
      let driveApiError: string | null = null;

      try {
        const driveTestRes = await fetch('https://www.googleapis.com/drive/v3/files?pageSize=1', {
          headers: { Authorization: `Bearer ${driveToken}` }
        });
        
        if (driveTestRes.ok) {
          driveApiOk = true;
        } else {
          const errData = await driveTestRes.json().catch(() => ({}));
          driveApiError = errData?.error?.message || `Erro da API Google Drive: HTTP ${driveTestRes.status}`;
        }
      } catch (err: any) {
        driveApiError = err.message || 'Erro de rede ou CORS ao aceder à API do Drive';
      }

      let userInfo: { email: string; name: string } | null = null;
      if (tokenInfo.email) {
        userInfo = {
          email: tokenInfo.email,
          name: tokenInfo.email.split('@')[0]
        };
      }

      let finalStatus: 'success' | 'warning' | 'error' = 'success';
      if (!driveApiOk) {
        finalStatus = 'error';
      } else if (!hasRequiredScopes) {
        finalStatus = 'warning';
      }

      setDiagnosticResult({
        status: finalStatus,
        timestamp: new Date().toLocaleTimeString('pt-AO'),
        authenticated: true,
        tokenInfoOk: true,
        scopesChecked: checkedScopes,
        driveApiOk,
        driveApiError,
        userInfo,
        expiresIn: tokenInfo.expires_in ? parseInt(tokenInfo.expires_in, 10) : null,
        networkLatency: latency
      });

    } catch (err: any) {
      setDiagnosticResult({
        status: 'error',
        timestamp: new Date().toLocaleTimeString('pt-AO'),
        authenticated: true,
        tokenInfoOk: false,
        scopesChecked: [],
        driveApiOk: false,
        driveApiError: `Falha no teste de diagnóstico: ${err.message}`,
        userInfo: null,
        expiresIn: null,
        networkLatency: null
      });
    } finally {
      setIsTestingConnection(false);
    }
  };
  
  // State for Add Book Form
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newClassLevel, setNewClassLevel] = useState('10ª Classe');
  const [newSubject, setNewSubject] = useState('Matemática');
  const [newSummary, setNewSummary] = useState('');
  const [newPage1, setNewPage1] = useState('');
  const [newFormat, setNewFormat] = useState<'text' | 'images' | 'pdf' | 'epub'>('text');
  const [newPageImagesUrl, setNewPageImagesUrl] = useState('');
  const [newPdfUrl, setNewPdfUrl] = useState('');
  const [newEpubUrl, setNewEpubUrl] = useState('');

  // Search filter inside tables
  const [searchTerm, setSearchTerm] = useState('');

  const [showBulkUpload, setShowBulkUpload] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error' | null; message: string | null }>({
    type: null,
    message: null
  });

  const getRandomCoverBg = (subject: string): string => {
    const bgs = [
      'bg-teal-900',
      'bg-pink-900',
      'bg-lime-900',
      'bg-amber-900',
      'bg-indigo-900',
      'bg-emerald-950',
      'bg-amber-950',
      'bg-red-950',
      'bg-zinc-900',
      'bg-violet-950'
    ];
    const hash = subject.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return bgs[hash % bgs.length];
  };

  const getRandomAccentColor = (subject: string): string => {
    const accents = [
      '#0d9488', // teal
      '#db2777', // pink
      '#84cc16', // lime
      '#d97706', // amber
      '#4f46e5', // indigo
      '#059669', // emerald
      '#ca8a04', // yellow/amber
      '#dc2626', // red
      '#4b5563', // gray/zinc
      '#7c3aed'  // violet
    ];
    const hash = subject.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return accents[hash % accents.length];
  };

  const handleJsonFile = (file: File) => {
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      setUploadStatus({
        type: 'error',
        message: 'Por favor, envie apenas ficheiros com extensão .json'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);
        
        const rawBooks = Array.isArray(data) ? data : [data];
        if (rawBooks.length === 0) {
          setUploadStatus({
            type: 'error',
            message: 'O ficheiro JSON está vazio ou não contém manuais.'
          });
          return;
        }

        let importCount = 0;
        let errorCount = 0;

        rawBooks.forEach((item, index) => {
          if (!item.title || !item.author || !item.subject || !item.classLevel) {
            errorCount++;
            return;
          }

          const formattedBook: Book = {
            id: item.id || `book-bulk-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`,
            title: item.title,
            author: item.author,
            classLevel: item.classLevel,
            subject: item.subject,
            coverBg: item.coverBg || getRandomCoverBg(item.subject),
            accentColor: item.accentColor || getRandomAccentColor(item.subject),
            summary: item.summary || `Manual didático de ${item.subject} para a ${item.classLevel}.`,
            pages: Array.isArray(item.pages) && item.pages.length > 0
              ? item.pages
              : [
                  `Capítulo 1: Introdução ao Estudo\n\nConteúdo pedagógico inicial do manual de ${item.subject}.`,
                  `Capítulo 2: Exercícios Práticos\n\nExercícios de fixação concebidos segundo as diretrizes curriculares nacionais.`
                ],
            format: item.format || 'text',
            pageImages: Array.isArray(item.pageImages) ? item.pageImages : undefined,
            pdfUrl: item.pdfUrl || undefined,
            epubUrl: item.epubUrl || undefined,
            isPremium: typeof item.isPremium === 'boolean' ? item.isPremium : true,
            rating: typeof item.rating === 'number' ? item.rating : 5.0,
            downloads: typeof item.downloads === 'number' ? item.downloads : 0,
            isbn: item.isbn || `978-989-1-${Math.floor(100000 + Math.random() * 900000)}`,
            offlineStatus: item.offlineStatus || 'none',
            publisher: item.publisher || 'IAM_IM Academic Press',
            year: typeof item.year === 'number' ? item.year : 2026
          };

          onAddBook(formattedBook);
          importCount++;
        });

        if (importCount > 0) {
          setUploadStatus({
            type: 'success',
            message: `Sucesso! Foram importados ${importCount} manuais com sucesso.${
              errorCount > 0 ? ` (${errorCount} manuais ignorados por falta de campos obrigatórios)` : ''
            }`
          });
        } else {
          setUploadStatus({
            type: 'error',
            message: 'Erro: Nenhum manual no ficheiro cumpre os requisitos mínimos obrigatórios (title, author, subject, classLevel).'
          });
        }
      } catch (err) {
        setUploadStatus({
          type: 'error',
          message: 'Erro ao analisar o ficheiro JSON. Verifique se a sintaxe está correta.'
        });
      }
    };
    reader.readAsText(file);
  };

  // Helper to log administrative exports in the firestore audit_logs
  const logExportAction = async (format: 'JSON' | 'CSV' | 'PDF', count: number) => {
    try {
      const logId = `log-${Date.now()}`;
      const actorEmail = auth.currentUser?.email || 'admin@imstud.co.ao';
      const actorUid = auth.currentUser?.uid || 'system';
      const timestamp = new Date().toISOString();
      let details = '';
      let action = '';

      if (format === 'PDF') {
        action = 'Exportação de Relatório PDF';
        details = `Descarregado relatório executivo em formato PDF contendo métricas financeiras, registo de pagamentos e a listagem de estudantes com subscrição ativa (${count} estudantes ativos).`;
      } else {
        action = `Exportação de Estudantes (${format})`;
        details = `Descarregado ficheiro de arquivo de estudantes no formato ${format} contendo ${count} registos de alunos e respetivas classes para fins de arquivo administrativo.`;
      }

      const logRef = doc(db, 'audit_logs', logId);
      await setDoc(logRef, {
        id: logId,
        action,
        actorEmail,
        actorUid,
        details,
        timestamp,
        targetId: 'users_collection'
      });
    } catch (err) {
      console.error('Error logging export to audit_logs:', err);
    }
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const activeStudentsList = users.filter(u => u.subscriptionStatus === 'active');

      // PDF Dimensions
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Color definitions
      const primaryColor = [15, 23, 42]; // slate-900 (#0f172a)
      const accentColor = [217, 119, 6]; // amber-600 (#d97706)
      const lightBg = [248, 250, 252]; // slate-50

      // Title & Header Banner
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, pageWidth, 40, 'F');

      // Logo Accent Line
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.rect(0, 40, pageWidth, 2, 'F');

      // Header Text
      doc.setTextColor(255, 255, 255);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(20);
      doc.text("IMSTUD ACADEMIC PRESS", 14, 18);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      doc.text("SISTEMA DE GESTÃO DE BIBLIOTECAS ESCOLARES DIGITAIS DE ANGOLA", 14, 25);
      doc.text("Relatório Executivo Administrativo & Financeiro", 14, 30);

      const todayStr = new Date().toLocaleDateString('pt-AO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      doc.setFontSize(8);
      doc.setTextColor(190, 200, 210);
      doc.text(`Gerado em: ${todayStr}`, pageWidth - 14, 30, { align: 'right' });

      let y = 52;

      // SECTION 1: KEY PERFORMANCE METRICS
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(13);
      doc.text("1. Resumo das Métricas de Desempenho", 14, y);
      y += 6;

      // Table of metrics
      doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
      doc.rect(14, y, pageWidth - 28, 28, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(14, y, pageWidth - 28, 28, 'S');

      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.text("Métrica Operacional", 18, y + 6);
      doc.text("Valor / Estado", pageWidth - 18, y + 6, { align: 'right' });

      // Draw line
      doc.setDrawColor(200, 210, 220);
      doc.line(18, y + 9, pageWidth - 18, y + 9);

      doc.setFont("Helvetica", "normal");
      doc.text("Receita Total Confirmada (Kz)", 18, y + 14);
      doc.setFont("Helvetica", "bold");
      doc.text(`${totalRevenue.toLocaleString('pt-AO')} Kz`, pageWidth - 18, y + 14, { align: 'right' });

      doc.setFont("Helvetica", "normal");
      doc.text("Estudantes Ativos (Premium)", 18, y + 19);
      doc.setFont("Helvetica", "bold");
      doc.text(`${activeStudentsList.length.toString()} Aluno(s)`, pageWidth - 18, y + 19, { align: 'right' });

      doc.setFont("Helvetica", "normal");
      doc.text("Comprovativos Bancários Pendentes", 18, y + 24);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(220, 50, 50);
      doc.text(`${pendingPaymentsCount.toString()} Pendente(s)`, pageWidth - 18, y + 24, { align: 'right' });

      y += 38;

      // SECTION 2: FINANCIAL LOGS (TRANSACTIONS)
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(13);
      doc.text("2. Extrato de Transações Financeiras", 14, y);
      y += 6;

      // Draw payments table headers
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(14, y, pageWidth - 28, 7, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.text("Referência", 16, y + 5);
      doc.text("Plano Solicitado", 45, y + 5);
      doc.text("Método de Pagamento", 85, y + 5);
      doc.text("Valor Depositado", 130, y + 5, { align: 'right' });
      doc.text("Estado", pageWidth - 16, y + 5, { align: 'right' });

      y += 7;

      if (payments.length === 0) {
        doc.setFillColor(245, 247, 250);
        doc.rect(14, y, pageWidth - 28, 10, 'F');
        doc.setTextColor(100, 116, 139);
        doc.setFont("Helvetica", "italic");
        doc.setFontSize(8.5);
        doc.text("Não existem pagamentos registados de momento.", 16, y + 6);
        y += 10;
      } else {
        payments.forEach((p, idx) => {
          if (idx % 2 === 0) {
            doc.setFillColor(245, 247, 250);
            doc.rect(14, y, pageWidth - 28, 6, 'F');
          }
          doc.setTextColor(50, 50, 50);
          doc.setFont("Helvetica", "normal");
          doc.setFontSize(8);
          doc.text(p.reference || '-', 16, y + 4.5);
          doc.text(p.planName || '-', 45, y + 4.5);
          doc.text(p.method || '-', 85, y + 4.5);
          doc.text(`${p.amount.toLocaleString('pt-AO')} Kz`, 130, y + 4.5, { align: 'right' });

          if (p.status === 'Confirmado') {
            doc.setTextColor(16, 124, 65);
            doc.setFont("Helvetica", "bold");
          } else {
            doc.setTextColor(180, 100, 10);
            doc.setFont("Helvetica", "bold");
          }
          doc.text(p.status || '-', pageWidth - 16, y + 4.5, { align: 'right' });
          y += 6;
        });
      }

      y += 10;

      // Check page overflow
      if (y > pageHeight - 80) {
        doc.addPage();
        y = 20;
      }

      // SECTION 3: ACTIVE STUDENTS
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(13);
      doc.text("3. Cadastro de Estudantes com Plano Ativo", 14, y);
      y += 6;

      // Table of active students
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(14, y, pageWidth - 28, 7, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.text("Nome Completo", 16, y + 5);
      doc.text("E-mail de Acesso", 60, y + 5);
      doc.text("Classe", 115, y + 5);
      doc.text("Plano Ativo", 145, y + 5);
      doc.text("Data de Adesão", pageWidth - 16, y + 5, { align: 'right' });

      y += 7;

      if (activeStudentsList.length === 0) {
        doc.setFillColor(245, 247, 250);
        doc.rect(14, y, pageWidth - 28, 10, 'F');
        doc.setTextColor(100, 116, 139);
        doc.setFont("Helvetica", "italic");
        doc.setFontSize(8.5);
        doc.text("Não existem estudantes com plano ativo (premium) de momento.", 16, y + 6);
        y += 10;
      } else {
        activeStudentsList.forEach((student, idx) => {
          // Page overflow check
          if (y > pageHeight - 20) {
            doc.addPage();
            y = 20;
            // Re-draw table header for continuous page
            doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            doc.rect(14, y, pageWidth - 28, 7, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFont("Helvetica", "bold");
            doc.setFontSize(8);
            doc.text("Nome Completo", 16, y + 5);
            doc.text("E-mail de Acesso", 60, y + 5);
            doc.text("Classe", 115, y + 5);
            doc.text("Plano Ativo", 145, y + 5);
            doc.text("Data de Adesão", pageWidth - 16, y + 5, { align: 'right' });
            y += 7;
          }

          if (idx % 2 === 0) {
            doc.setFillColor(245, 247, 250);
            doc.rect(14, y, pageWidth - 28, 6, 'F');
          }
          doc.setTextColor(50, 50, 50);
          doc.setFont("Helvetica", "normal");
          doc.setFontSize(8);
          doc.text(student.name || '-', 16, y + 4.5);
          doc.text(student.email || '-', 60, y + 4.5);
          doc.text(student.classLevel || '-', 115, y + 4.5);
          doc.setFont("Helvetica", "bold");
          doc.text((student.plan || '-').toUpperCase(), 145, y + 4.5);
          doc.setFont("Helvetica", "normal");
          doc.text(student.joinedDate || '-', pageWidth - 16, y + 4.5, { align: 'right' });
          y += 6;
        });
      }

      // Add visual footer to pages
      const pageCount = (doc.internal as any).getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setDrawColor(220, 225, 230);
        doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);
        
        doc.setFont("Helvetica", "italic");
        doc.setFontSize(7.5);
        doc.setTextColor(120, 130, 140);
        doc.text("Este documento é confidencial, emitido pela IMSTUD Academic Press.", 14, pageHeight - 10);
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - 14, pageHeight - 10, { align: 'right' });
      }

      // Save PDF file
      doc.save(`imstud_relatorio_executivo_${new Date().toISOString().split('T')[0]}.pdf`);
      
      // Log action in Firestore Audit Logs
      logExportAction('PDF', activeStudentsList.length);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Erro ao gerar relatório PDF administrativo.');
    }
  };

  const handleDownloadJSON = () => {
    try {
      const exportData = users.map(u => ({
        id: u.id,
        nome: u.name,
        email: u.email,
        classe: u.classLevel,
        plano: u.plan,
        estado_subscricao: u.subscriptionStatus,
        data_adesao: u.joinedDate
      }));
      
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(exportData, null, 2)
      )}`;
      
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `iam_im_estudantes_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      // Log action in audit logs
      logExportAction('JSON', users.length);
    } catch (err) {
      console.error('Error exporting students to JSON:', err);
      alert('Erro ao exportar os dados dos estudantes para JSON.');
    }
  };

  const handleDownloadCSV = () => {
    try {
      // Header columns
      const headers = ['ID', 'Nome', 'E-mail', 'Classe', 'Plano', 'Estado Subscricao', 'Data Adesao'];
      
      // Create CSV rows
      const rows = users.map(u => [
        u.id,
        u.name.replace(/"/g, '""'), // Escape double quotes
        u.email,
        u.classLevel,
        u.plan,
        u.subscriptionStatus,
        u.joinedDate
      ]);
      
      // CSV format with UTF-8 BOM for Excel compatibility
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(val => `"${val}"`).join(','))
      ].join('\n');
      
      const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', url);
      downloadAnchor.setAttribute('download', `iam_im_estudantes_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      URL.revokeObjectURL(url);

      // Log action in audit logs
      logExportAction('CSV', users.length);
    } catch (err) {
      console.error('Error exporting students to CSV:', err);
      alert('Erro ao exportar os dados dos estudantes para CSV.');
    }
  };

  // Handle book insertion
  const handleSubmitBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newAuthor || !newSummary) {
      alert('Por favor preencha todos os campos obrigatórios!');
      return;
    }

    if (newFormat === 'text' && !newPage1) {
      alert('Por favor insira o conteúdo do primeiro capítulo!');
      return;
    }

    if (newFormat === 'images' && !newPageImagesUrl) {
      alert('Por favor insira pelo menos um link de imagem JPG!');
      return;
    }

    if (newFormat === 'pdf' && !newPdfUrl) {
      alert('Por favor insira o URL do manual em PDF!');
      return;
    }

    if (newFormat === 'epub' && !newEpubUrl) {
      alert('Por favor insira o URL do ficheiro EPUB!');
      return;
    }

    // Split page images URL by commas
    const imagesArray = newFormat === 'images' 
      ? newPageImagesUrl.split(',').map(url => url.trim()).filter(url => url.length > 0)
      : undefined;

    const createdBook: Book = {
      id: `book-${Date.now()}`,
      title: newTitle,
      author: newAuthor,
      classLevel: newClassLevel,
      subject: newSubject,
      coverBg: newFormat === 'images' ? 'bg-teal-900' : newFormat === 'pdf' ? 'bg-red-950' : newFormat === 'epub' ? 'bg-amber-950' : 'bg-indigo-950',
      accentColor: newFormat === 'images' ? '#0d9488' : newFormat === 'pdf' ? '#dc2626' : newFormat === 'epub' ? '#ca8a04' : '#d97706',
      summary: newSummary,
      format: newFormat,
      pages: newFormat === 'text' 
        ? [
            `Capítulo 1: Introdução ao Estudo\n\n${newPage1}`,
            `Capítulo 2: Exercícios de Fixação\n\nManuais produzidos e licenciados pela IAM_IM para o estudante angolano.`
          ]
        : newFormat === 'pdf'
        ? [
            `Página PDF 1: Conteúdo encriptado e protegido.\n\nEste livro está no formato PDF de Alta Fidelidade.\nURL do PDF: ${newPdfUrl}`,
            `Página PDF 2: Exercícios complementares digitais.`
          ]
        : newFormat === 'epub'
        ? [
            `Página EPUB 1: Conteúdo líquido auto-adaptável.\n\nEste livro está no formato EPUB de fluxo contínuo.\nURL do EPUB: ${newEpubUrl}`,
            `Página EPUB 2: Perguntas de auto-avaliação.`
          ]
        : imagesArray?.map((_, i) => `Página Visual ${i + 1}`) || ['Página Única'],
      pageImages: imagesArray,
      pdfUrl: newFormat === 'pdf' ? newPdfUrl : undefined,
      epubUrl: newFormat === 'epub' ? newEpubUrl : undefined,
      isPremium: true,
      rating: 5.0,
      downloads: 0,
      offlineStatus: 'none',
      isbn: `978-989-9-${Math.floor(10000 + Math.random() * 90000)}`,
      publisher: 'IAM_IM Academic Press',
      year: 2026
    };

    onAddBook(createdBook);
    
    // Reset Form
    setNewTitle('');
    setNewAuthor('');
    setNewSummary('');
    setNewPage1('');
    setNewPageImagesUrl('');
    setNewPdfUrl('');
    setNewEpubUrl('');
    setNewFormat('text');
    setShowAddForm(false);
  };

  // Calculations for dashboard
  const totalRevenue = payments
    .filter(p => p.status === 'Confirmado')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const pendingPaymentsCount = payments.filter(p => p.status === 'Pendente').length;
  const activeSubscribers = users.filter(u => u.subscriptionStatus === 'active').length;

  // Filtered Users
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.classLevel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtered Books
  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.classLevel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtered Payments
  const filteredPayments = payments.filter(p => 
    p.reference.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.method.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-slate-50 min-h-screen p-4 md:p-8">
      {/* Title */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="p-1 bg-amber-500 text-slate-950 rounded-lg"><TrendingUp className="w-5 h-5" /></span>
            Painel Administrativo IAM_IM
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Gestão operacional de subscrições, validação de comprovativos bancários e publicação de manuais digitais.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Action tabs buttons */}
          <div className="flex bg-slate-200/60 p-1 rounded-xl gap-1">
            <button
              onClick={() => { setActiveSubTab('overview'); setSearchTerm(''); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeSubTab === 'overview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => { setActiveSubTab('users'); setSearchTerm(''); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeSubTab === 'users' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Estudantes ({users.length})
            </button>
            <button
              onClick={() => { setActiveSubTab('books'); setSearchTerm(''); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeSubTab === 'books' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Catálogo ({books.length})
            </button>
            <button
              onClick={() => { setActiveSubTab('payments'); setSearchTerm(''); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all relative ${
                activeSubTab === 'payments' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pagamentos
              {pendingPaymentsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-[9px] text-white rounded-full flex items-center justify-center font-bold animate-pulse">
                  {pendingPaymentsCount}
                </span>
              )}
            </button>
          </div>

          {/* Global PDF Report Button */}
          <button
            type="button"
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-amber-500 hover:bg-slate-800 hover:text-amber-400 active:scale-95 transition-all rounded-xl text-xs font-extrabold shadow-sm cursor-pointer border border-slate-800"
            title="Gerar Relatório Executivo Administrativo & Financeiro em PDF"
          >
            <FileText className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>Gerar Relatório PDF</span>
          </button>
        </div>
      </div>

      {/* OVERVIEW SCREEN */}
      {activeSubTab === 'overview' && (
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Key Metrics cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Receita Confirmada</span>
                <span className="text-xl font-black text-slate-900 mt-1 block">
                  {totalRevenue.toLocaleString('pt-AO')} Kz
                </span>
                <span className="text-[10px] text-emerald-600 font-bold">↑ 100% este mês</span>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Alunos Premium</span>
                <span className="text-xl font-black text-slate-900 mt-1 block">{activeSubscribers}</span>
                <span className="text-[10px] text-slate-500">Subscrições Ativas</span>
              </div>
              <div className="p-3 bg-blue-50 text-blue-900 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Manuais no Catálogo</span>
                <span className="text-xl font-black text-slate-900 mt-1 block">{books.length}</span>
                <span className="text-[10px] text-slate-500">Angolan Curriculum</span>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Comprovativos Pendentes</span>
                <span className="text-xl font-black text-slate-900 mt-1 block text-red-600">{pendingPaymentsCount}</span>
                <span className="text-[10px] text-red-500 font-semibold animate-pulse">Aguardando Aprovação</span>
              </div>
              <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                <CreditCard className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Graphical Analytics & Partnerships */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Custom SVG chart inside overview */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-md font-bold text-slate-900">Curva de Adesão Estudantil</h3>
                  <p className="text-xs text-slate-500">Crescimento simulado de leituras efetuadas por semana em Angola.</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 bg-amber-100 text-amber-800 rounded">Métricas Ativas</span>
              </div>

              {/* Responsive SVG Chart */}
              <div className="h-48 w-full bg-slate-50 rounded-xl p-2 relative flex flex-col justify-between">
                <div className="flex-1 flex items-end justify-between px-6 pt-6">
                  {/* Bars representing weeks */}
                  {[
                    { label: 'Sem 1', val: 35, count: '350 acessos' },
                    { label: 'Sem 2', val: 55, count: '550 acessos' },
                    { label: 'Sem 3', val: 40, count: '400 acessos' },
                    { label: 'Sem 4', val: 78, count: '780 acessos' },
                    { label: 'Sem 5', val: 95, count: '950 acessos' },
                    { label: 'Sem 6', val: 120, count: '1.200 acessos' }
                  ].map((bar, index) => (
                    <div key={index} className="flex flex-col items-center flex-1 group">
                      <span className="text-[9px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity mb-1 font-mono">
                        {bar.count}
                      </span>
                      {/* Bar fill */}
                      <div 
                        style={{ height: `${(bar.val / 130) * 100}%` }} 
                        className="w-8 bg-blue-900 group-hover:bg-amber-500 transition-colors rounded-t-md min-h-[5px]" 
                      />
                      <span className="text-[10px] font-medium text-slate-400 mt-2">{bar.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Partner institutions list */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-amber-500" /> Instituições Associadas (B2B)
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">Complexo Escolar Cardeal Dom Alexandre</span>
                    <span className="text-[10px] text-slate-500 block">Luanda • 340 Contas</span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">Ativo</span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">Colégio Sol Nascente</span>
                    <span className="text-[10px] text-slate-500 block">Huambo • 210 Contas</span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">Ativo</span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">Instituto Politécnico do Bengo</span>
                    <span className="text-[10px] text-slate-500 block">Caxito • Em negociação</span>
                  </div>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold">Análise</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STUDENTS TABLE */}
      {activeSubTab === 'users' && (
        <div className="max-w-7xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          {/* Table Toolbar */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <span className="text-sm font-bold text-slate-800">Registos de Estudantes</span>
              
              {/* Export Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadJSON}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 hover:text-slate-900 rounded-xl text-[10px] font-bold transition-all shadow-xs cursor-pointer"
                  title="Descarregar lista de estudantes em JSON"
                >
                  <Download className="w-3.5 h-3.5 text-amber-500" />
                  <span>Exportar JSON</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-800 hover:bg-emerald-100 hover:text-emerald-900 rounded-xl text-[10px] font-bold transition-all shadow-xs cursor-pointer"
                  title="Descarregar lista de estudantes em CSV"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Exportar CSV</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-150 text-rose-800 hover:bg-rose-100 hover:text-rose-900 rounded-xl text-[10px] font-bold transition-all shadow-xs cursor-pointer"
                  title="Descarregar relatório executivo PDF contendo os estudantes ativos"
                >
                  <FileText className="w-3.5 h-3.5 text-rose-600" />
                  <span>Exportar PDF</span>
                </button>
              </div>
            </div>
            
            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Pesquisar por nome ou classe..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:border-blue-900"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-mono tracking-wider">
                  <th className="p-4 font-bold">Nome / E-mail</th>
                  <th className="p-4 font-bold">Classe</th>
                  <th className="p-4 font-bold">Plano</th>
                  <th className="p-4 font-bold">Estado Subscrição</th>
                  <th className="p-4 font-bold">Data Adesão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      Nenhum estudante encontrado com o termo de pesquisa.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="p-4">
                        <div className="flex items-center space-x-2.5">
                          <img src={u.avatar} alt="avatar" className="w-8 h-8 rounded-full border border-slate-150" />
                          <div>
                            <span className="font-bold text-slate-900 block">{u.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-700 font-semibold">{u.classLevel}</td>
                      <td className="p-4">
                        <span className="font-bold text-slate-900 uppercase">{u.plan}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                          u.subscriptionStatus === 'active' 
                            ? 'bg-emerald-100 text-emerald-800'
                            : u.subscriptionStatus === 'pending'
                              ? 'bg-red-100 text-red-800 animate-pulse'
                              : 'bg-slate-100 text-slate-500'
                        }`}>
                          {u.subscriptionStatus === 'active' ? 'Ativo (Premium)' : u.subscriptionStatus === 'pending' ? 'Pendente Aprovação' : 'Sem Plano'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 font-mono">{u.joinedDate}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CATALOG MANAGEMENT (Add manual) */}
      {activeSubTab === 'books' && (
        <div className="max-w-7xl mx-auto space-y-6">
          {/* GOOGLE DRIVE LIBRARY BACKUP SYSTEM */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl shadow-slate-950/20">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 relative">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Cloud className="w-5 h-5 text-blue-400" />
                  <span className="text-xs font-black uppercase text-blue-400 tracking-wider">Cópia de Segurança Cloud (Google Drive)</span>
                </div>
                <h3 className="text-lg font-black tracking-tight text-slate-100">Backup Integral da Biblioteca</h3>
                <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                  Garante a persistência e salvaguarda do catálogo de manuais didáticos. Exporte a base de dados de livros e o manifesto em pastas específicas do seu Google Drive corporativo ou pessoal via <strong className="text-amber-400">Google Picker</strong>.
                </p>
              </div>

              <div className="shrink-0">
                {!driveToken ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAdminGoogleLogin}
                      disabled={isVerifyingToken}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center space-x-2 transition-all cursor-pointer text-xs shadow-lg shadow-blue-500/10"
                    >
                      <RefreshCw className={`w-4 h-4 ${isVerifyingToken ? 'animate-spin' : ''}`} />
                      <span>Ligar Administrador ao Google Drive</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={isTestingConnection}
                      className="px-3 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-blue-400 border border-slate-700/60 rounded-xl flex items-center space-x-1.5 transition-all text-xs cursor-pointer font-bold"
                    >
                      <Activity className={`w-4 h-4 ${isTestingConnection ? 'animate-pulse text-amber-400' : 'text-blue-400'}`} />
                      <span>{isTestingConnection ? 'A testar...' : 'Testar Conexão 🛠️'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={isTestingConnection || isVerifyingToken || isBackingUp}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-blue-400 border border-slate-700/60 rounded-xl flex items-center space-x-1.5 transition-all text-xs cursor-pointer font-semibold"
                      title="Testar saúde da ligação e validar permissões"
                    >
                      <Activity className={`w-4 h-4 ${isTestingConnection ? 'animate-pulse text-amber-400' : 'text-blue-400'}`} />
                      <span>{isTestingConnection ? 'A testar...' : 'Testar Conexão 🛠️'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={openFolderPicker}
                      disabled={isVerifyingToken || isBackingUp}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-amber-400 border border-slate-700/60 rounded-xl flex items-center space-x-1.5 transition-all text-xs cursor-pointer"
                    >
                      <FolderOpen className="w-4 h-4" />
                      <span>{backupFolder ? 'Mudar Pasta 📂' : 'Selecionar Pasta de Destino'}</span>
                    </button>
                    {!backupFolder && (
                      <button
                        type="button"
                        onClick={handleCreateDefaultFolder}
                        disabled={isBackingUp}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700/60 rounded-xl flex items-center space-x-1.5 transition-all text-xs cursor-pointer"
                      >
                        <Plus className="w-4 h-4 text-blue-400" />
                        <span>Criar Pasta Padrão</span>
                      </button>
                    )}
                    {backupFolder && (
                      <button
                        type="button"
                        onClick={handleStartBackup}
                        disabled={isBackingUp}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl flex items-center space-x-1.5 transition-all text-xs cursor-pointer shadow-lg shadow-amber-500/15"
                      >
                        <CheckCircle className={`w-4 h-4 ${isBackingUp ? 'animate-spin' : ''}`} />
                        <span>{isBackingUp ? 'A sincronizar...' : 'Iniciar Backup da Biblioteca 🚀'}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Selected folder badge */}
            {driveToken && (
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Administrador autenticado no Google Drive.</span>
                  {backupFolder ? (
                    <span>Pasta de destino ativa: <strong className="text-amber-400 bg-slate-950/85 px-2 py-0.5 rounded border border-slate-800">"{backupFolder.name}" (ID: {backupFolder.id})</strong></span>
                  ) : (
                    <span className="text-amber-500/90 font-semibold">Escolha ou crie uma pasta no Drive acima para activar a sincronização.</span>
                  )}
                </div>
              </div>
            )}

            {/* Real-time Diagnostics Result Panel */}
            {diagnosticResult && (
              <div className="mt-5 p-5 bg-slate-950 border border-slate-800/80 rounded-xl animate-fade-in text-slate-200 relative">
                <button
                  type="button"
                  onClick={() => setDiagnosticResult(null)}
                  className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 text-xs font-bold font-mono transition-colors cursor-pointer"
                >
                  [ Fechar X ]
                </button>

                <div className="flex items-center space-x-2.5 mb-4">
                  <Activity className={`w-4 h-4 ${diagnosticResult.status === 'success' ? 'text-emerald-400 animate-pulse' : diagnosticResult.status === 'warning' ? 'text-amber-400' : 'text-red-400'}`} />
                  <div>
                    <h4 className="text-xs font-black uppercase text-slate-300 tracking-wider">Relatório de Diagnóstico de Conexão</h4>
                    <p className="text-[10px] text-slate-500">Executado em {diagnosticResult.timestamp}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono mb-4">
                  {/* Left Column: Core States */}
                  <div className="bg-slate-900/50 border border-slate-800/50 p-3 rounded-lg space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Estado do Sistema</span>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Autenticado:</span>
                      <span className={`font-bold ${diagnosticResult.authenticated ? 'text-emerald-400' : 'text-red-400'}`}>
                        {diagnosticResult.authenticated ? '✅ SIM' : '❌ NÃO'}
                      </span>
                    </div>

                    {diagnosticResult.userInfo && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Utilizador:</span>
                        <span className="text-blue-400 font-bold truncate max-w-[150px]" title={diagnosticResult.userInfo.email}>
                          {diagnosticResult.userInfo.email}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Validação do Token:</span>
                      <span className={`font-bold ${diagnosticResult.tokenInfoOk ? 'text-emerald-400' : 'text-red-400'}`}>
                        {diagnosticResult.tokenInfoOk ? '✅ OK' : '❌ FALHOU'}
                      </span>
                    </div>

                    {diagnosticResult.expiresIn !== null && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Validade do Token:</span>
                        <span className="text-amber-400 font-bold">
                          {Math.round(diagnosticResult.expiresIn / 60)} min restantes
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Latência de Rede:</span>
                      {diagnosticResult.networkLatency !== null ? (
                        <span className={`font-bold flex items-center space-x-1 ${diagnosticResult.networkLatency < 150 ? 'text-emerald-400' : diagnosticResult.networkLatency < 350 ? 'text-amber-400' : 'text-red-400'}`}>
                          <Wifi className="w-3.5 h-3.5" />
                          <span>{diagnosticResult.networkLatency} ms</span>
                        </span>
                      ) : (
                        <span className="text-slate-500">N/A</span>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Google Drive API Check */}
                  <div className="bg-slate-900/50 border border-slate-800/50 p-3 rounded-lg space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Acesso à API do Drive</span>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Drive API Reachability:</span>
                      <span className={`font-bold ${diagnosticResult.driveApiOk ? 'text-emerald-400' : 'text-red-400'}`}>
                        {diagnosticResult.driveApiOk ? '✅ DISPONÍVEL' : '❌ INDISPONÍVEL'}
                      </span>
                    </div>

                    {diagnosticResult.driveApiError ? (
                      <div className="p-2 bg-red-950/30 border border-red-900/40 rounded text-[10px] text-red-300 leading-normal max-h-[80px] overflow-y-auto font-mono">
                        <span className="font-bold text-red-400 block uppercase mb-0.5">Log de Erro:</span>
                        {diagnosticResult.driveApiError}
                      </div>
                    ) : (
                      <div className="p-2 bg-emerald-950/30 border border-emerald-900/40 rounded text-[10px] text-emerald-300 leading-normal">
                        Acesso de consulta rápida à API do Google Drive validado com sucesso. Leitura de arquivos liberada.
                      </div>
                    )}
                  </div>
                </div>

                {/* Scopes Grid Checklist */}
                {diagnosticResult.scopesChecked.length > 0 && (
                  <div className="bg-slate-900/40 border border-slate-800/40 p-3.5 rounded-lg mb-4 text-xs font-mono">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">Permissões de Escopos OAuth (Scopes)</span>
                    <div className="space-y-2">
                      {diagnosticResult.scopesChecked.map((s, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-800/40 last:border-0 last:pb-0">
                          <div className="space-y-0.5 max-w-[80%]">
                            <span className="text-blue-400 font-bold text-[10px] break-all block">{s.scope}</span>
                            <span className="text-[10px] text-slate-400 leading-snug block">{s.description}</span>
                          </div>
                          <div className="shrink-0 flex items-center space-x-1.5">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${s.active ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/60' : 'bg-red-950 text-red-400 border border-red-900/60'}`}>
                              {s.active ? 'Ativo' : 'Em Falta'}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              ({s.required ? 'Obrigatório' : 'Opcional'})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Diagnostic summary status message */}
                <div className={`p-3 rounded-xl border text-[11px] leading-relaxed flex items-center space-x-2 ${
                  diagnosticResult.status === 'success' 
                    ? 'bg-emerald-950/45 border-emerald-900/60 text-emerald-300' 
                    : diagnosticResult.status === 'warning'
                      ? 'bg-amber-950/45 border-amber-900/60 text-amber-300'
                      : 'bg-red-950/45 border-red-900/60 text-red-300'
                }`}>
                  {diagnosticResult.status === 'success' ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span>
                    {diagnosticResult.status === 'success' && 'Diagnóstico concluído com sucesso! A conexão com o Google Drive está perfeitamente funcional e autorizada.'}
                    {diagnosticResult.status === 'warning' && 'Diagnóstico parcial concluído. Conexão ativa, mas algumas permissões de escopo opcionais não estão ativas.'}
                    {diagnosticResult.status === 'error' && `Diagnóstico falhou: ${diagnosticResult.driveApiError || 'Verifique as suas credenciais, re-autentique e tente novamente.'}`}
                  </span>
                </div>
              </div>
            )}

            {/* Status alerts */}
            {backupStatus.message && (
              <div className={`mt-4 p-3 rounded-xl border flex items-start space-x-2 text-xs leading-relaxed animate-fade-in ${
                backupStatus.type === 'success' 
                  ? 'bg-emerald-950/40 border-emerald-900/50 text-emerald-300' 
                  : 'bg-red-950/40 border-red-900/50 text-red-300'
              }`}>
                {backupStatus.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                )}
                <span>{backupStatus.message}</span>
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-md font-bold text-slate-900">Manuais Didáticos Publicados</h3>
                <p className="text-xs text-slate-500">Edite, delete ou insira novos livros no currículo nacional.</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowBulkUpload(!showBulkUpload);
                    if (showAddForm) setShowAddForm(false);
                  }}
                  className={`flex items-center space-x-1.5 px-3 py-2 border font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer ${
                    showBulkUpload
                      ? 'bg-amber-500 text-slate-950 border-amber-500 hover:bg-amber-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
                  <span>{showBulkUpload ? 'Fechar Importador' : 'Importar JSON em Massa'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(!showAddForm);
                    if (showBulkUpload) setShowBulkUpload(false);
                  }}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-blue-900 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showAddForm ? 'Cancelar Edição' : 'Publicar Novo Livro'}</span>
                </button>
              </div>
            </div>

            {/* Drag and Drop Bulk Upload JSON Zone */}
            {showBulkUpload && (
              <div className="border border-blue-200 bg-blue-50/10 p-6 rounded-2xl mb-6 space-y-4 animate-fade-in text-xs text-slate-700">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-blue-900 uppercase tracking-widest block">Importação de Manuais em Massa</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">Submeta um ficheiro JSON estruturado para catalogar múltiplos manuais instantaneamente.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      const sampleJson = [
                        {
                          title: "Manual de Química Física",
                          author: "Dr. António Manuel",
                          classLevel: "11ª Classe",
                          subject: "Química",
                          isbn: "978-989-123-456-7",
                          summary: "Estudo avançado das reações e termodinâmica química para o ensino secundário em Angola.",
                          isPremium: true,
                          format: "text",
                          pages: [
                            "Capítulo 1: Introdução ao Estudo da Química Física\n\nEste capítulo aborda as transformações de energia e estados fundamentais.",
                            "Capítulo 2: Exercícios de Consolidação\n\nResolva as equações de equilíbrio termodinâmico apresentadas."
                          ]
                        }
                      ];
                      navigator.clipboard.writeText(JSON.stringify(sampleJson, null, 2));
                      alert('Modelo de JSON copiado para a área de transferência! Cole no seu ficheiro local.');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-[10px] cursor-pointer shadow-xs transition-colors"
                  >
                    <FileJson className="w-3.5 h-3.5 text-amber-500" />
                    <span>Copiar Modelo JSON</span>
                  </button>
                </div>

                {uploadStatus.message && (
                  <div className={`p-3.5 rounded-xl border flex items-start space-x-2.5 ${
                    uploadStatus.type === 'success' 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                    {uploadStatus.type === 'success' ? (
                      <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <span className="font-bold block text-[11px] capitalize">{uploadStatus.type === 'success' ? 'Sucesso' : 'Erro de Importação'}</span>
                      <p className="text-[10px] leading-relaxed mt-0.5">{uploadStatus.message}</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setUploadStatus({ type: null, message: null })}
                      className="text-slate-400 hover:text-slate-600 font-bold px-1.5"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Drag and Drop Box */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const files = e.dataTransfer.files;
                    if (files && files.length > 0) {
                      handleJsonFile(files[0]);
                    }
                  }}
                  onClick={() => document.getElementById('bulk-json-input')?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer text-center relative ${
                    isDragging
                      ? 'border-amber-500 bg-amber-50/30'
                      : 'border-slate-200 bg-white hover:border-blue-900 hover:bg-slate-50/50'
                  }`}
                >
                  <input
                    id="bulk-json-input"
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files && files.length > 0) {
                        handleJsonFile(files[0]);
                      }
                    }}
                  />
                  <div className="p-3 bg-blue-50 dark:bg-slate-900 rounded-full mb-3 text-blue-900 dark:text-amber-500">
                    <Upload className="w-6 h-6 animate-pulse" />
                  </div>
                  <p className="font-bold text-slate-800 text-xs">Arraste e largue o ficheiro JSON de Manuais aqui</p>
                  <p className="text-[10px] text-slate-400 mt-1">ou clique para explorar os seus ficheiros locais (Apenas ficheiros .json de metadados)</p>
                </div>

                {/* Help Collapsible visual guide */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1.5 font-mono text-[9px] text-slate-500 max-h-48 overflow-y-auto">
                  <span className="font-bold text-slate-700 block">Exemplo do Formato Suportado (JSON):</span>
                  <pre className="whitespace-pre-wrap leading-relaxed select-all">
{`[
  {
    "title": "Manual de Química Física",
    "author": "Dr. António Manuel",
    "classLevel": "11ª Classe",
    "subject": "Química",
    "isbn": "978-989-123-456-7",
    "summary": "Descrição breve do livro...",
    "isPremium": true,
    "format": "text",
    "pages": [
      "Capítulo 1: Reações Químicas\\n\\n...",
      "Capítulo 2: Termodinâmica\\n\\n..."
    ]
  }
]`}
                  </pre>
                </div>
              </div>
            )}

            {/* Expandable book form */}
            {showAddForm && (
              <form onSubmit={handleSubmitBook} className="border border-amber-200/60 bg-amber-50/20 p-5 rounded-2xl mb-6 space-y-4 animate-fade-in text-xs text-slate-700">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-widest block">Novo Manual de Ensino - Formulário Oficial</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Título do Livro</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Manual de Biologia Celular"
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Autor / Ministério</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Prof. Dr. Ismael Diogo"
                      value={newAuthor}
                      onChange={e => setNewAuthor(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Classe Curricular</label>
                    <select
                      value={newClassLevel}
                      onChange={e => setNewClassLevel(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                    >
                      <option value="5ª Classe">5ª Classe</option>
                      <option value="6ª Classe">6ª Classe</option>
                      <option value="7ª Classe">7ª Classe</option>
                      <option value="8ª Classe">8ª Classe</option>
                      <option value="9ª Classe">9ª Classe</option>
                      <option value="10ª Classe">10ª Classe</option>
                      <option value="11ª Classe">11ª Classe</option>
                      <option value="12ª Classe">12ª Classe</option>
                      <option value="Universitário">Universitário</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Disciplina</label>
                    <select
                      value={newSubject}
                      onChange={e => setNewSubject(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                    >
                      <option value="Matemática">Matemática</option>
                      <option value="Língua Portuguesa">Língua Portuguesa</option>
                      <option value="Física">Física</option>
                      <option value="Química">Química</option>
                      <option value="Biologia">Biologia</option>
                      <option value="História">História</option>
                      <option value="Informática">Informática</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Ano Letivo de Homologação</label>
                    <input
                      type="number"
                      disabled
                      value={2026}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-100 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Sinopse Curta (Resumo)</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Breve descrição dos temas pedagógicos abordados no livro didático..."
                    value={newSummary}
                    onChange={e => setNewSummary(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">Formato de Lançamento do Manual</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewFormat('text')}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                        newFormat === 'text'
                          ? 'border-blue-900 bg-blue-50 text-blue-900'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Texto Corrido
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewFormat('images')}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                        newFormat === 'images'
                          ? 'border-teal-600 bg-teal-50/50 text-teal-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Imagens JPG
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewFormat('pdf')}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                        newFormat === 'pdf'
                          ? 'border-red-600 bg-red-50 text-red-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Documento PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewFormat('epub')}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                        newFormat === 'epub'
                          ? 'border-amber-600 bg-amber-50 text-amber-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Fluxo ePUB
                    </button>
                  </div>
                </div>

                {newFormat === 'text' && (
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Conteúdo do Capítulo 1 (Para o Leitor E-book)</label>
                    <textarea
                      rows={4}
                      required={newFormat === 'text'}
                      placeholder="Insira as páginas do primeiro capítulo..."
                      value={newPage1}
                      onChange={e => setNewPage1(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-mono"
                    />
                  </div>
                )}

                {newFormat === 'images' && (
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">URLs das Páginas JPG (Separadas por Vírgula)</label>
                    <textarea
                      rows={4}
                      required={newFormat === 'images'}
                      placeholder="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c, https://images.unsplash.com/photo-1512820790803-83ca734da794"
                      value={newPageImagesUrl}
                      onChange={e => setNewPageImagesUrl(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-mono"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Insira os endereços das imagens JPG enviadas pelas editoras/produtoras. Cada URL representará uma página correspondente no Leitor Integrado DRM.
                    </p>
                  </div>
                )}

                {newFormat === 'pdf' && (
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Link ou Endereço do Ficheiro PDF Seguro</label>
                    <input
                      type="text"
                      required={newFormat === 'pdf'}
                      placeholder="Ex: https://ia800203.us.archive.org/20/items/manual_quimica_angola/manual_quimica_angola.pdf"
                      value={newPdfUrl}
                      onChange={e => setNewPdfUrl(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-mono"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Insira o link direto para o ficheiro PDF de alta resolução do livro 100% físico. O leitor irá incorporá-lo de forma segura e responsiva para PCs, telemóveis e tablets, sem permissões de download ou cópia externa.
                    </p>
                  </div>
                )}

                {newFormat === 'epub' && (
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Link do Ficheiro ePUB de Fluxo Líquido</label>
                    <input
                      type="text"
                      required={newFormat === 'epub'}
                      placeholder="Ex: https://www.w3.org/publishing/epub3/epub-spec.epub"
                      value={newEpubUrl}
                      onChange={e => setNewEpubUrl(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-mono"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Insira o endereço do ficheiro ePUB para leitura líquida reajustável com temas e tamanhos de letra dinâmicos.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  className="px-4 py-2.5 bg-blue-900 text-white font-bold rounded-xl shadow-xs hover:bg-blue-950 transition-all"
                >
                  Confirmar e Lançar Manual
                </button>
              </form>
            )}

            {/* Books table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-mono tracking-wider">
                    <th className="p-3 font-bold">Título / Autor</th>
                    <th className="p-3 font-bold">Classe</th>
                    <th className="p-3 font-bold">Disciplina</th>
                    <th className="p-3 font-bold">Downloads Offline</th>
                    <th className="p-3 font-bold text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBooks.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50/50">
                      <td className="p-3">
                        <div>
                          <span className="font-bold text-slate-900 block">{b.title}</span>
                          <span className="text-[10px] text-slate-400">{b.author} • ISBN {b.isbn}</span>
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-slate-700">{b.classLevel}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-semibold">{b.subject}</span>
                      </td>
                      <td className="p-3 font-mono text-slate-500">{b.downloads.toLocaleString()} vezes</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`Tem a certeza que deseja excluir o livro "${b.title}"?`)) {
                              onDeleteBook(b.id);
                            }
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex"
                          title="Remover Livro"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENTS APPROVAL LIST */}
      {activeSubTab === 'payments' && (
        <div className="max-w-7xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-xs p-6">
          <div className="mb-6">
            <h3 className="text-md font-bold text-slate-900">Histórico de Transações e Comprovativos</h3>
            <p className="text-xs text-slate-500">Valide depósitos, referências de transferência e libere os planos pendentes dos estudantes.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-mono tracking-wider">
                  <th className="p-3 font-bold">Referência / Plano</th>
                  <th className="p-3 font-bold">Valor Kz</th>
                  <th className="p-3 font-bold">Canal de Pagamento</th>
                  <th className="p-3 font-bold">Data</th>
                  <th className="p-3 font-bold">Estado</th>
                  <th className="p-3 font-bold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="p-3">
                      <div>
                        <span className="font-mono font-bold text-slate-900 block">{p.reference}</span>
                        <span className="text-[10px] text-slate-400">Assinatura: {p.planName}</span>
                      </div>
                    </td>
                    <td className="p-3 font-bold text-slate-900">{p.amount.toLocaleString('pt-AO')} Kz</td>
                    <td className="p-3 text-slate-600 font-semibold">{p.method}</td>
                    <td className="p-3 text-slate-500 font-mono">{p.date}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.status === 'Confirmado' 
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.status === 'Pendente'
                            ? 'bg-red-100 text-red-800 animate-pulse'
                            : 'bg-slate-100 text-slate-400'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {p.status === 'Pendente' ? (
                        <button
                          onClick={() => onApprovePayment(p.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors text-[10px]"
                        >
                          Confirmar Depósito
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold font-mono">Liberado ✓</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
