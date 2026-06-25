/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Search, 
  Heart, 
  User, 
  Settings, 
  BookOpen, 
  Download, 
  ArrowRight, 
  Lock, 
  Phone, 
  Mail, 
  LogOut, 
  Wifi, 
  WifiOff, 
  Copy, 
  Smartphone, 
  CheckCircle,
  Menu,
  ChevronRight,
  BookOpenCheck,
  CreditCard,
  X,
  FileCheck,
  AlertCircle,
  Bell,
  BellRing,
  Check,
  FileText,
  Type,
  Trophy,
  Sparkles,
  Award,
  Zap,
  Cloud,
  RefreshCw
} from 'lucide-react';
import { Book, UserProfile, PaymentRecord, checkBookAccess, BADGE_DEFINITIONS } from '../types';
import { SUBSCRIPTION_PLANS } from '../data/initialData';
import Logo from './Logo';
import Reader from './Reader';
import GoogleDriveTab from './GoogleDriveTab';

import { googleSignIn, logoutUser, initAuth, db, OperationType, handleFirestoreError } from '../lib/firebase';
import { listEmails, sendEmail, GmailMessage } from '../lib/gmail';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AppFlowProps {
  books: Book[];
  user: UserProfile;
  payments: PaymentRecord[];
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onAddPayment: (payment: PaymentRecord) => void;
  onUpdateBookOfflineStatus: (bookId: string, status: 'none' | 'downloading' | 'downloaded') => void;
  isOfflineSystemMode: boolean;
  setIsOfflineSystemMode: (val: boolean) => void;
  onImportBook: (book: Book) => void;
}

export default function AppFlow({
  books,
  user,
  payments,
  onUpdateUser,
  onAddPayment,
  onUpdateBookOfflineStatus,
  isOfflineSystemMode,
  setIsOfflineSystemMode,
  onImportBook
}: AppFlowProps) {
  // Screens state: 'splash' | 'onboarding' | 'register' | 'login' | 'forgot_password' | 'verification' | 'class_selection' | 'plan_selection' | 'payment' | 'library' | 'profile' | 'settings' | 'reader'
  const [screen, setScreen] = useState<string>('splash');
  
  // Navigation states
  const [activeTab, setActiveTab] = useState<'library' | 'favorites' | 'gmail' | 'profile' | 'settings' | 'drive'>('library');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<any>(null);
  const [blockedBook, setBlockedBook] = useState<Book | null>(null);
  const [showFormatSelector, setShowFormatSelector] = useState<boolean>(false);
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'images' | 'text' | 'epub'>('pdf');

  // Google OAuth / Gmail / Firebase Synchronization States
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const [isGoogleSignedIn, setIsGoogleSignedIn] = useState(false);
  const [gmailMessages, setGmailMessages] = useState<GmailMessage[]>([]);
  const [googleLoginError, setGoogleLoginError] = useState<string | null>(null);
  const [isLoadingGmail, setIsLoadingGmail] = useState(false);
  const [gmailError, setGmailError] = useState<string | null>(null);
  const [gmailSubject, setGmailSubject] = useState('Dúvida Curricular - IMSTUD');
  const [gmailBody, setGmailBody] = useState('');
  const [isSendingGmail, setIsSendingGmail] = useState(false);
  const [selectedMailDetail, setSelectedMailDetail] = useState<GmailMessage | null>(null);

  // Search & Filter parameters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('Todos');
  const [favoritesList, setFavoritesList] = useState<string[]>(['book-1', 'book-4']); // pre-favorited

  // Form states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // Payment method states
  const [paymentMethod, setPaymentMethod] = useState<'mc_express' | 'bank_transfer'>('mc_express');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [receiptUploaded, setReceiptUploaded] = useState(false);

  // Notification states
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    title: string;
    message: string;
    date: string;
    read: boolean;
    type: 'success' | 'info' | 'warning';
  }>>([
    {
      id: 'notif-welcome',
      title: 'Bem-vindo ao IMSTUD! 🎓',
      message: 'A maior biblioteca escolar digital de Angola. Explore manuais oficiais da iniciação ao universitário.',
      date: 'Hoje',
      read: true,
      type: 'info'
    }
  ]);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const prevStatusRef = React.useRef<string | null>(null);

  // Monitor subscription status to trigger notification on activation
  React.useEffect(() => {
    if (prevStatusRef.current === null) {
      prevStatusRef.current = user.subscriptionStatus;
      return;
    }

    if (prevStatusRef.current === 'pending' && user.subscriptionStatus === 'active') {
      const newNotif = {
        id: `notif-${Date.now()}`,
        title: 'Subscrição Ativada! 🎉',
        message: `Excelente notícia! O seu pagamento para o plano ${user.plan.toUpperCase()} foi verificado e aprovado com sucesso. Todos os manuais premium foram desbloqueados para si!`,
        date: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' }),
        read: false,
        type: 'success' as const
      };
      setNotifications(prev => [newNotif, ...prev]);
      setShowNotificationCenter(true);
    }
    prevStatusRef.current = user.subscriptionStatus;
  }, [user.subscriptionStatus, user.plan]);

  // Skip splash automatically after 2.5 seconds, or let the user click
  React.useEffect(() => {
    if (screen === 'splash') {
      const timer = setTimeout(() => {
        setScreen('onboarding');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  // Handle Google authentication & Firestore Sync on load
  React.useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleAccessToken(token);
        setIsGoogleSignedIn(true);
        onUpdateUser({
          id: user.uid,
          name: user.displayName || user.email?.split('@')[0].toUpperCase() || 'Estudante Google',
          email: user.email || '',
          avatar: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'
        });
      },
      () => {
        setGoogleAccessToken(null);
        setIsGoogleSignedIn(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setGoogleLoginError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleAccessToken(res.accessToken);
        setIsGoogleSignedIn(true);
        
        // Sync user document with Firestore if it exists, otherwise create it
        const docRef = doc(db, 'users', res.user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const fsData = docSnap.data();
          onUpdateUser({
            id: res.user.uid,
            name: fsData.name || res.user.displayName || 'Estudante Google',
            email: fsData.email || res.user.email || '',
            phone: fsData.phone || '9XX XXX XXX',
            classLevel: fsData.classLevel || '10ª Classe',
            plan: (fsData.plan || 'free') as any,
            subscriptionStatus: (fsData.subscriptionStatus || 'none') as any,
            avatar: fsData.avatar || res.user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
            devices: fsData.devices || []
          });
          setScreen('library');
        } else {
          const newUserDoc = {
            id: res.user.uid,
            name: res.user.displayName || 'Estudante Google',
            email: res.user.email || '',
            phone: '9XX XXX XXX',
            classLevel: '10ª Classe',
            plan: 'free' as const,
            subscriptionStatus: 'none' as const,
            joinedDate: new Date().toISOString().split('T')[0],
            avatar: res.user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
            devices: []
          };
          try {
            await setDoc(doc(db, 'users', res.user.uid), newUserDoc);
          } catch (err) {
            handleFirestoreError(err, OperationType.CREATE, `users/${res.user.uid}`);
          }
          onUpdateUser(newUserDoc);
          setScreen('class_selection');
        }
      }
    } catch (err: any) {
      console.error('Google Sign-In Error caught:', err);
      const errMsg = err.message || String(err);
      if (errMsg.includes('auth/popup-closed-by-user') || err.code === 'auth/popup-closed-by-user') {
        setGoogleLoginError(
          'O popup de autenticação foi fechado ou bloqueado. Se estiver no visualizador do AI Studio, clique em "Abrir num novo separador" (Open in New Tab) no canto superior direito para dar as devidas permissões.'
        );
      } else if (errMsg.includes('Pending promise was never set') || errMsg.includes('INTERNAL ASSERTION FAILED')) {
        setGoogleLoginError(
          'O navegador interrompeu o processo do Google Auth. Por favor, recarregue a página ou clique em "Abrir num novo separador" (Open in New Tab) no canto superior direito.'
        );
      } else {
        setGoogleLoginError(`Erro na autenticação: ${errMsg}`);
      }
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await logoutUser();
      setGoogleAccessToken(null);
      setIsGoogleSignedIn(false);
      onUpdateUser({
        id: 'user-01',
        name: 'Estudante Convidado',
        email: 'estudante@imstud.co.ao',
        phone: '924111222',
        classLevel: '10ª Classe',
        plan: 'free' as const,
        subscriptionStatus: 'none' as const,
        joinedDate: '2026-06-24',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
        devices: []
      });
      setScreen('onboarding');
    } catch (err: any) {
      alert(`Erro ao terminar sessão: ${err.message}`);
    }
  };

  // Automatically fetch emails when activeTab shifts to gmail
  React.useEffect(() => {
    if (activeTab === 'gmail' && googleAccessToken) {
      handleFetchEmails();
    }
  }, [activeTab, googleAccessToken]);

  const handleFetchEmails = async () => {
    if (!googleAccessToken) return;
    setIsLoadingGmail(true);
    setGmailError(null);
    try {
      const list = await listEmails(googleAccessToken);
      setGmailMessages(list);
    } catch (err: any) {
      setGmailError(err.message || 'Erro ao carregar correspondências.');
    } finally {
      setIsLoadingGmail(false);
    }
  };

  const handleSendGmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleAccessToken) {
      alert('Conecte primeiro a sua conta Google para enviar e-mails.');
      return;
    }
    if (!gmailBody.trim()) {
      alert('Por favor introduza a sua mensagem.');
      return;
    }
    setIsSendingGmail(true);
    try {
      await sendEmail(
        googleAccessToken,
        'leoalfredo252@gmail.com', // Alfredo Leopoldino's Support Email
        gmailSubject,
        gmailBody
      );
      alert('A sua mensagem foi enviada do seu Gmail real com sucesso para a secretaria corporativa da IAM_IM!');
      setGmailBody('');
      // Refresh inbox to see sent mail
      handleFetchEmails();
    } catch (err: any) {
      alert(`Erro ao enviar e-mail: ${err.message}`);
    } finally {
      setIsSendingGmail(false);
    }
  };

  // Handle manual tab switching inside App main views
  const handleNavClick = (tab: 'library' | 'favorites' | 'gmail' | 'profile' | 'settings' | 'drive') => {
    setActiveTab(tab);
    setScreen('library');
    setSelectedBook(null);
  };

  // Toggle book favorites
  const toggleFavorite = (bookId: string) => {
    setFavoritesList(prev => 
      prev.includes(bookId) ? prev.filter(id => id !== bookId) : [...prev, bookId]
    );
  };

  // Handle registration submission
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) {
      alert('Por favor preencha os dados de registo!');
      return;
    }
    // Update user profile representation
    onUpdateUser({
      name: regName,
      email: regEmail,
      phone: regPhone || '9XX XXX XXX',
      subscriptionStatus: 'none',
      plan: 'free'
    });
    setScreen('verification');
  };

  // Handle login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      alert('Por favor preencha o email e senha!');
      return;
    }
    
    // Quick demo auto-login
    onUpdateUser({
      name: loginEmail.split('@')[0].toUpperCase(),
      email: loginEmail,
    });
    setScreen('library');
  };

  // Pre-fill student demo credentials for easy evaluations
  const handlePreFillDemo = () => {
    setLoginEmail('alfredo.leopoldino@iamim.com');
    setLoginPassword('imstud2026');
  };

  // Confirm verification code
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) {
      alert('Introduza o código de verificação enviado!');
      return;
    }
    setScreen('class_selection');
  };

  // Select Grade Class
  const handleSelectClass = (grade: string) => {
    onUpdateUser({ classLevel: grade });
    setScreen('plan_selection');
  };

  // Start Subscription Purchase
  const handleSelectPlan = (plan: any) => {
    setSelectedPlanForPayment(plan);
    setScreen('payment');
  };

  // Submit subscription payment simulation
  const handleConfirmPayment = () => {
    if (paymentMethod === 'mc_express' && !paymentPhone) {
      alert('Por favor insira o número de telemóvel associado ao Multicaixa Express!');
      return;
    }
    
    setIsProcessingPayment(true);

    // Simulate Angolan API checkout delays
    setTimeout(() => {
      setIsProcessingPayment(false);
      
      const referenceCode = `REF-${Math.floor(100000 + Math.random() * 900000)}`;
      const amount = selectedPlanForPayment.price;

      // Create simulated invoice
      const newInvoice: PaymentRecord = {
        id: `pay-${Date.now()}`,
        planName: selectedPlanForPayment.name,
        amount: amount,
        date: new Date().toISOString().split('T')[0],
        method: paymentMethod === 'mc_express' ? 'Multicaixa Express' : 'Transferência Bancária',
        status: paymentMethod === 'mc_express' ? 'Confirmado' : 'Pendente',
        reference: referenceCode
      };

      onAddPayment(newInvoice);

      if (paymentMethod === 'mc_express') {
        // Multicaixa instant activation
        onUpdateUser({
          plan: selectedPlanForPayment.id,
          subscriptionStatus: 'active'
        });
        alert(`Transação de ${amount} Kz efetuada com sucesso através do Multicaixa Express! A sua subscrição está ativa.`);
        setScreen('library');
      } else {
        // Bank Transfer needs approval in Admin Panel
        onUpdateUser({
          plan: selectedPlanForPayment.id,
          subscriptionStatus: 'pending'
        });
        alert(`Comprovativo enviado com sucesso! Referência: ${referenceCode}. Aguarde que um administrador da IAM_IM aprove a transação para desbloquear os seus livros.`);
        setScreen('library');
      }
    }, 1500);
  };

  // Subject categories list in Angola
  const subjects = ['Todos', 'Matemática', 'Língua Portuguesa', 'Física', 'Química', 'História', 'Informática'];

  // Book filtering logic
  const filteredBooks = books.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'Todos' || b.subject === selectedSubject;
    
    // Only show books relevant to current grade, or show all if university
    const matchesClass = user.classLevel === 'Universitário' || b.classLevel === user.classLevel || b.classLevel === '7ª Classe'; // Show some variety

    return matchesSearch && matchesSubject;
  });

  const favoritesOnly = books.filter(b => favoritesList.includes(b.id));

  // Simulates downloading to IndexedDB
  const handleOpenBook = (book: Book) => {
    // Check if offline, and book downloaded
    if (isOfflineSystemMode && book.offlineStatus !== 'downloaded') {
      alert(`O livro "${book.title}" não está disponível offline. Conecte-se à Internet ou use o simulador de download.`);
    }
    setSelectedBook(book);
    
    // Set default format suggestion based on book format, but let them choose
    if (book.format === 'images') {
      setSelectedFormat('images');
    } else if (book.format === 'pdf') {
      setSelectedFormat('pdf');
    } else if (book.format === 'epub') {
      setSelectedFormat('epub');
    } else {
      setSelectedFormat('pdf'); // default preference is always PDF!
    }
    
    setShowFormatSelector(true);
  };

  return (
    <div className="bg-slate-900 text-slate-100 flex flex-col justify-between overflow-hidden relative" style={{ height: '780px', width: '100%', maxWidth: '380px', borderRadius: '40px', border: '12px solid #1e293b', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
      
      {/* 1. TOP STATUS BAR (Dynamic Network Connection toggle) */}
      <div className="bg-slate-950 p-2 text-[11px] font-mono flex justify-between items-center z-50 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Smartphone className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-bold text-slate-300">IMSTUD Network Status</span>
        </div>
        
        {/* Toggle Internet connection simulator button */}
        <button
          onClick={() => {
            setIsOfflineSystemMode(!isOfflineSystemMode);
            // If going offline, close book reader if not downloaded
            if (!isOfflineSystemMode && selectedBook && selectedBook.offlineStatus !== 'downloaded') {
              setScreen('library');
              setSelectedBook(null);
            }
          }}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[9px] font-bold transition-all ${
            isOfflineSystemMode 
              ? 'bg-red-950/70 border border-red-700/50 text-red-400' 
              : 'bg-emerald-950/70 border border-emerald-700/50 text-emerald-400'
          }`}
          title="Clique para ligar ou desligar o sinal de rede para simular o teste DRM Offline"
        >
          {isOfflineSystemMode ? (
            <>
              <WifiOff className="w-3 h-3" />
              <span>Offline (Modo Voo)</span>
            </>
          ) : (
            <>
              <Wifi className="w-3 h-3" />
              <span>Online (Ativo)</span>
            </>
          )}
        </button>
      </div>

      {/* 2. BODY CONTENT - RENDERING BY STATE */}
      <div className="flex-1 bg-slate-950 overflow-y-auto overflow-x-hidden relative flex flex-col">
        
        {/* SPLASH SCREEN */}
        {screen === 'splash' && (
          <div className="my-auto flex flex-col items-center text-center p-6 justify-center h-full animate-fade-in">
            <Logo variant="vertical" size="lg" showSlogan={true} />
            <div className="mt-16 text-slate-500 text-[10px] font-mono">
              <span>Powered by IAM_IM</span>
            </div>
          </div>
        )}

        {/* ONBOARDING */}
        {screen === 'onboarding' && (
          <div className="flex flex-col justify-between p-6 h-full text-center">
            <div className="my-auto space-y-6">
              <div className="flex justify-center">
                <Logo variant="icon" size="lg" />
              </div>
              <h2 className="text-xl font-black text-slate-100 tracking-tight">
                Democratizando o Saber em Angola
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                Milhares de estudantes não possuem livros didáticos por conta de custos de importação e escassez. O IMSTUD digitaliza o currículo nacional de forma econômica e offline.
              </p>
              
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl max-w-xs mx-auto">
                <span className="text-[10px] font-bold text-amber-500 uppercase block mb-0.5">Fase 1 MVP Ativa</span>
                <p className="text-[10px] text-slate-400">Biblioteca digital de manuais, modo offline, DRM seguro e subscrições ultra-baratas.</p>
              </div>
            </div>

            <div className="space-y-3">
              {googleLoginError && (
                <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-xl text-[10px] text-red-300 text-left leading-relaxed animate-fade-in relative">
                  <span className="font-bold block text-red-400 mb-1">Aviso de Autenticação:</span>
                  {googleLoginError}
                  <button 
                    type="button"
                    onClick={() => setGoogleLoginError(null)} 
                    className="absolute top-2 right-2 text-red-400 hover:text-white text-xs font-bold font-mono px-1"
                  >
                    ✕
                  </button>
                </div>
              )}
              <button
                onClick={handleGoogleLogin}
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-500 transition-colors border border-blue-700 flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.986 0-.745-.079-1.32-.174-1.886H12.24z" />
                </svg>
                <span>Entrar com Conta Google</span>
              </button>
              <button
                onClick={() => setScreen('register')}
                className="w-full py-2.5 bg-blue-950/40 text-slate-300 border border-slate-800 font-semibold rounded-xl text-[11px] hover:bg-slate-800 transition-colors shadow-xs"
              >
                Criar Nova Conta Local
              </button>
              <button
                onClick={() => setScreen('login')}
                className="w-full py-2.5 bg-slate-900 text-slate-400 font-semibold rounded-xl text-[11px] hover:bg-slate-800 transition-colors border border-slate-800/60"
              >
                Já Tenho Conta • Entrar
              </button>
              <p className="text-[9px] text-slate-500 font-mono mt-2">
                Innovation Through Learning © IAM_IM
              </p>
            </div>
          </div>
        )}

        {/* REGISTRATION */}
        {screen === 'register' && (
          <div className="p-6 h-full flex flex-col justify-between">
            <div>
              <div className="mb-6">
                <Logo variant="horizontal" size="sm" />
                <h3 className="text-lg font-bold text-slate-100 mt-4">Crie o seu perfil escolar</h3>
                <p className="text-[11px] text-slate-400 mt-1">Preencha os dados do estudante para desbloquear os manuais homologados.</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Nome Completo do Estudante</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Alfredo Leopoldino"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">E-mail para Acesso</label>
                  <input
                    type="email"
                    required
                    placeholder="Ex: alfredo@gmail.com"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Número de Telemóvel (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: 924123456"
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                    className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Criar Senha Segura</label>
                  <input
                    type="password"
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-900 text-white font-bold rounded-xl text-xs hover:bg-blue-800 transition-colors shadow-sm"
                >
                  Registar Conta Estudantil
                </button>
              </form>
            </div>

            <div className="text-center pt-4">
              <button onClick={() => setScreen('login')} className="text-xs text-amber-500 font-bold hover:underline">
                Já possui conta? Inicie Sessão
              </button>
            </div>
          </div>
        )}

        {/* LOGIN */}
        {screen === 'login' && (
          <div className="p-6 h-full flex flex-col justify-between">
            <div>
              <div className="mb-6">
                <Logo variant="horizontal" size="sm" />
                <h3 className="text-lg font-bold text-slate-100 mt-4">Bem-vindo de volta!</h3>
                <p className="text-[11px] text-slate-400 mt-1">Insira os seus dados de estudante homologado no IMSTUD.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">E-mail Registado</label>
                  <input
                    type="email"
                    required
                    placeholder="Ex: estudante@gmail.com"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-slate-400 font-semibold">Senha de Acesso</label>
                    <button 
                      type="button" 
                      onClick={() => setScreen('forgot_password')} 
                      className="text-[10px] text-amber-500 font-bold hover:underline"
                    >
                      Esqueceu?
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="Insira a sua senha"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-900 text-white font-bold rounded-xl text-xs hover:bg-blue-800 transition-colors shadow-sm"
                >
                  Iniciar Sessão Académica
                </button>
                
                <div className="flex items-center my-3 text-slate-600">
                  <div className="flex-1 border-t border-slate-800"></div>
                  <span className="mx-2 text-[10px] uppercase font-bold">Ou</span>
                  <div className="flex-1 border-t border-slate-800"></div>
                </div>

                {googleLoginError && (
                  <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-xl text-[10px] text-red-300 text-left leading-relaxed animate-fade-in relative mb-3">
                    <span className="font-bold block text-red-400 mb-1">Aviso de Autenticação:</span>
                    {googleLoginError}
                    <button 
                      type="button"
                      onClick={() => setGoogleLoginError(null)} 
                      className="absolute top-2 right-2 text-red-400 hover:text-white text-xs font-bold font-mono px-1"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.986 0-.745-.079-1.32-.174-1.886H12.24z" />
                  </svg>
                  <span>Entrar com Google</span>
                </button>
              </form>

              {/* Sandbox Quick Access Accounts for evaluation */}
              <div className="mt-6 border border-dashed border-slate-800 p-3 rounded-xl bg-slate-900/40 text-center">
                <span className="text-[10px] text-amber-500 font-bold block mb-1">Acesso Rápido de Testes (Sandbox)</span>
                <p className="text-[9px] text-slate-500 mb-2">Use contas criadas para testar de imediato as subscrições:</p>
                <button
                  onClick={handlePreFillDemo}
                  className="px-3 py-1 bg-amber-500 text-slate-950 rounded-md font-bold text-[9px] hover:bg-amber-600 transition-colors"
                >
                  Preencher Conta Universitário
                </button>
              </div>
            </div>

            <div className="text-center pt-4">
              <button onClick={() => setScreen('register')} className="text-xs text-slate-400 font-bold hover:underline">
                Não tem conta? <span className="text-amber-500">Crie uma aqui</span>
              </button>
            </div>
          </div>
        )}

        {/* FORGOT PASSWORD */}
        {screen === 'forgot_password' && (
          <div className="p-6 h-full flex flex-col justify-between">
            <div>
              <div className="mb-6">
                <Logo variant="horizontal" size="sm" />
                <h3 className="text-lg font-bold text-slate-100 mt-4">Recuperar Senha</h3>
                <p className="text-[11px] text-slate-400 mt-1">Digite o seu e-mail para receber um link de redefinição de credenciais de acesso.</p>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                alert(`O link de redefinição de senha foi enviado para ${recoveryEmail}!`);
                setScreen('login');
              }} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">E-mail Cadastrado</label>
                  <input
                    type="email"
                    required
                    placeholder="Ex: estudante@gmail.com"
                    value={recoveryEmail}
                    onChange={e => setRecoveryEmail(e.target.value)}
                    className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-900 text-white font-bold rounded-xl text-xs hover:bg-blue-800 transition-colors"
                >
                  Enviar Código de Recuperação
                </button>
              </form>
            </div>

            <div className="text-center">
              <button onClick={() => setScreen('login')} className="text-xs text-amber-500 font-bold hover:underline">
                Voltar para o Login
              </button>
            </div>
          </div>
        )}

        {/* VERIFICATION (OTP SMS) */}
        {screen === 'verification' && (
          <div className="p-6 h-full flex flex-col justify-between">
            <div>
              <div className="mb-6">
                <Logo variant="horizontal" size="sm" />
                <h3 className="text-lg font-bold text-slate-100 mt-4">Verificação de Segurança</h3>
                <p className="text-[11px] text-slate-400 mt-1">Um código PIN de 4 dígitos foi enviado para o seu telemóvel/email para garantir que é uma pessoa real.</p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">PIN de Segurança (Simulado: 1234)</label>
                  <input
                    type="text"
                    required
                    placeholder="Introduza o PIN"
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value)}
                    className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 font-mono text-center text-lg tracking-widest focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-900 text-white font-bold rounded-xl text-xs hover:bg-blue-800 transition-colors"
                >
                  Verificar Código
                </button>
              </form>
            </div>

            <div className="text-center">
              <p className="text-[10px] text-slate-500">Não recebeu? <span className="text-amber-500 font-bold cursor-pointer hover:underline" onClick={() => alert('PIN re-enviado: 1234')}>Re-enviar código</span></p>
            </div>
          </div>
        )}

        {/* CLASS SELECTION */}
        {screen === 'class_selection' && (
          <div className="p-6 h-full">
            <h3 className="text-md font-bold text-slate-100 mb-2">Selecione o seu Ano Letivo</h3>
            <p className="text-[11px] text-slate-400 mb-4">Escolha a sua classe para organizarmos a sua biblioteca de acordo com os programas escolares de Angola.</p>

            <div className="grid grid-cols-2 gap-1.5 text-[11px] max-h-[350px] overflow-y-auto pr-1">
              {[
                'Iniciação (Pré-escolar)', 
                '1ª Classe', 
                '2ª Classe', 
                '3ª Classe', 
                '4ª Classe', 
                '5ª Classe', 
                '6ª Classe', 
                '7ª Classe', 
                '8ª Classe', 
                '9ª Classe', 
                '10ª Classe', 
                '11ª Classe', 
                '12ª Classe', 
                'Universitário'
              ].map(grade => (
                <button
                  key={grade}
                  onClick={() => handleSelectClass(grade)}
                  className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl font-bold hover:border-amber-500 hover:bg-slate-800 text-slate-200 transition-all text-center"
                >
                  {grade}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PLAN SELECTION */}
        {screen === 'plan_selection' && (
          <div className="p-6 h-full space-y-4">
            <div>
              <h3 className="text-md font-bold text-slate-100">Escolha o seu Plano IMSTUD</h3>
              <p className="text-[10px] text-slate-400 mt-1">Tenha acesso a todos os manuais escolares digitais sem limitações e sem carregar dados móveis.</p>
            </div>

            <div className="space-y-3">
              {SUBSCRIPTION_PLANS.map(plan => {
                const isPopular = plan.id === 'high_school';
                return (
                  <div 
                    key={plan.id}
                    onClick={() => handleSelectPlan(plan)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                      isPopular ? 'border-amber-500 bg-slate-900/80 shadow-md' : 'border-slate-800 bg-slate-900'
                    } hover:border-amber-500`}
                  >
                    {isPopular && (
                      <span className="absolute -top-2.5 right-4 text-[9px] font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full uppercase">
                        Mais Popular
                      </span>
                    )}
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-slate-100">{plan.name}</span>
                      <span className="text-xs font-black text-amber-500 font-mono">{plan.price} Kz <span className="text-[9px] text-slate-500">/{plan.period}</span></span>
                    </div>
                    <p className="text-[10px] text-slate-400">{plan.description}</p>
                    
                    {/* Render minimal feature indicators */}
                    <div className="mt-2 flex items-center space-x-2 text-[8px] text-slate-500">
                      <span>✓ Leitura Offline</span>
                      <span>•</span>
                      <span>✓ Multi-dispositivos</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center">
              <button 
                onClick={() => {
                  onUpdateUser({ plan: 'free', subscriptionStatus: 'none' });
                  setScreen('library');
                }}
                className="text-xs text-slate-500 font-semibold hover:underline"
              >
                Continuar com Versão Gratuita Limitada
              </button>
            </div>
          </div>
        )}

        {/* SUBSCRIPTION PAYMENT FLOW */}
        {screen === 'payment' && selectedPlanForPayment && (
          <div className="p-6 h-full flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <button onClick={() => setScreen('plan_selection')} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
                <h3 className="text-sm font-bold text-slate-100">Checkout do Estudante</h3>
              </div>

              {/* Order receipt brief */}
              <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
                <span className="text-[9px] text-slate-400 font-mono uppercase tracking-widest block">Subscrição do Plano</span>
                <span className="text-xs font-bold text-slate-200 block mt-0.5">{selectedPlanForPayment.name}</span>
                <div className="border-t border-slate-800 mt-2 pt-2 flex justify-between items-center">
                  <span className="text-xs text-slate-400">Total Mensal</span>
                  <span className="text-sm font-bold text-amber-500">{selectedPlanForPayment.price} Kz</span>
                </div>
              </div>

              {/* Choose Payment methods popular in Angola */}
              <div>
                <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1.5">Canal de Pagamento</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('mc_express')}
                    className={`p-2.5 border rounded-xl font-bold transition-all text-center flex flex-col items-center justify-center ${
                      paymentMethod === 'mc_express' 
                        ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>Multicaixa Express</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`p-2.5 border rounded-xl font-bold transition-all text-center flex flex-col items-center justify-center ${
                      paymentMethod === 'bank_transfer' 
                        ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>Transferência Bancária</span>
                  </button>
                </div>
              </div>

              {/* Multicaixa Details */}
              {paymentMethod === 'mc_express' && (
                <div className="space-y-2 text-xs animate-fade-in">
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Insira o seu telemóvel associado ao Multicaixa Express. Irá receber uma notificação direta de pagamento no seu banco comercial angolano (BAI, BFA, etc.).
                  </p>
                  <input
                    type="text"
                    required
                    placeholder="Telemóvel Express (ex: 924555123)"
                    value={paymentPhone}
                    onChange={e => setPaymentPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-hidden font-mono"
                  />
                </div>
              )}

              {/* Bank Transfer Details */}
              {paymentMethod === 'bank_transfer' && (
                <div className="space-y-3 text-[10px] text-slate-400 animate-fade-in">
                  <div className="bg-slate-900 p-2.5 border border-slate-800 rounded-xl font-mono text-[9px] text-slate-300">
                    <span className="block font-bold text-amber-500">CONTA BANCÁRIA IAM_IM</span>
                    <span>BANCO: BAI (Angola)</span>
                    <span className="block mt-1">IBAN: AO06 0040 0000 1234 5678 9012 3</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText('AO06004000001234567890123');
                        alert('IBAN Copiado para a área de transferência!');
                      }}
                      className="text-amber-500 font-bold block mt-1 hover:underline"
                    >
                      Copiar IBAN ✓
                    </button>
                  </div>
                  
                  {/* Simulate mock upload */}
                  <div className="border border-dashed border-slate-800 p-3 rounded-xl text-center bg-slate-900/20">
                    <span className="text-[9px] text-slate-400 block mb-1">Upload de Comprovativo Bancário</span>
                    {receiptUploaded ? (
                      <span className="text-emerald-500 font-bold flex items-center justify-center gap-1.5">
                        <FileCheck className="w-3.5 h-3.5" /> Comprovativo_BAI_2026.pdf ✓
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setReceiptUploaded(true)}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-[9px] transition-colors"
                      >
                        Carregar Ficheiro (Simular)
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleConfirmPayment}
              disabled={isProcessingPayment}
              className={`w-full py-3 text-xs font-bold rounded-xl shadow-xs transition-all ${
                isProcessingPayment 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
              }`}
            >
              {isProcessingPayment ? 'Processando transacção em Angola...' : `Confirmar Subscrição (${selectedPlanForPayment.price} Kz)`}
            </button>
          </div>
        )}

        {/* LIBRARY LANDING VIEW (Includes sub-tabs Favorites, Profile, Settings) */}
        {screen === 'library' && (
          <div className="flex-1 flex flex-col">
            
            {/* Header with grade indicator */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950 relative z-20">
              <Logo variant="horizontal" size="sm" />
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <button 
                    onClick={() => {
                      setShowNotificationCenter(!showNotificationCenter);
                      // Mark notifications as read when opening the notification center
                      if (!showNotificationCenter) {
                        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                      }
                    }}
                    className={`p-1.5 rounded-lg border text-slate-400 hover:text-white transition-all cursor-pointer relative ${
                      showNotificationCenter ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'
                    }`}
                    title="Notificações"
                  >
                    {notifications.some(n => !n.read) ? (
                      <BellRing className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                    ) : (
                      <Bell className="w-3.5 h-3.5" />
                    )}
                    {notifications.some(n => !n.read) && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-slate-950" />
                    )}
                  </button>

                  {/* NOTIFICATION CENTER DROPDOWN */}
                  {showNotificationCenter && (
                    <div className="absolute right-0 mt-2 w-64 bg-slate-950 border border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-slate-900 text-left">
                      <div className="p-3 bg-slate-900 flex justify-between items-center">
                        <span className="text-[10px] font-extrabold uppercase text-slate-300 tracking-wider flex items-center gap-1">
                          <Bell className="w-3 h-3 text-amber-500" /> Notificações
                        </span>
                        <button 
                          onClick={() => {
                            setNotifications([]);
                            setShowNotificationCenter(false);
                          }} 
                          className="text-[8px] text-slate-500 hover:text-slate-300 uppercase font-bold"
                        >
                          Limpar tudo
                        </button>
                      </div>
                      
                      <div className="max-h-48 overflow-y-auto divide-y divide-slate-900">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-[10px] text-slate-500 italic">
                            Sem notificações recentes.
                          </div>
                        ) : (
                          notifications.map(notif => (
                            <div key={notif.id} className="p-3 space-y-1 hover:bg-slate-900/40 transition-colors">
                              <div className="flex items-center justify-between">
                                <span className={`text-[10px] font-bold ${notif.type === 'success' ? 'text-emerald-400' : 'text-slate-200'}`}>
                                  {notif.title}
                                </span>
                                <span className="text-[8px] text-slate-500 font-mono">{notif.date}</span>
                              </div>
                              <p className="text-[9px] text-slate-400 leading-relaxed">
                                {notif.message}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] font-bold text-amber-500 font-mono">{user.classLevel || 'Estudante'}</span>
                </div>
              </div>
            </div>

            {/* TOP DYNAMIC SEARCH BAR */}
            <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800/80 relative z-10">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Pesquisar manual por título ou autor..."
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    if (activeTab !== 'library') {
                      setActiveTab('library');
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500/50 pl-8.5 pr-8 py-1.5 rounded-xl text-[11px] text-slate-100 placeholder-slate-500 focus:outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1.5 p-1 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* TAB CONTENT: LIBRARY SEARCH SHELF */}
            {activeTab === 'library' && (
              <div className="p-4 flex-1 space-y-4">
                
                {/* Subject categories slider */}
                <div className="flex space-x-1 overflow-x-auto pb-1 scrollbar-none">
                  {subjects.map(sub => (
                    <button
                      key={sub}
                      onClick={() => setSelectedSubject(sub)}
                      className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all shrink-0 ${
                        selectedSubject === sub 
                          ? 'bg-blue-900 text-white' 
                          : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>

                {/* Subscriptions alert if student is free */}
                {user.plan === 'free' && (
                  <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex items-center justify-between text-xs animate-pulse">
                    <div>
                      <span className="font-bold text-amber-500">Acesso Gratuito Limitado</span>
                      <p className="text-[10px] text-slate-400">Assine por 500 Kz para liberar todos os manuais.</p>
                    </div>
                    <button 
                      onClick={() => setScreen('plan_selection')}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg font-bold text-[9px] transition-colors"
                    >
                      Ver Planos
                    </button>
                  </div>
                )}

                {/* Pending verification notice */}
                {user.subscriptionStatus === 'pending' && (
                  <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center justify-between text-xs animate-pulse">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <div>
                        <span className="font-bold text-red-500">Pagamento Pendente</span>
                        <p className="text-[10px] text-slate-400">O seu comprovativo bancário está a ser validado.</p>
                      </div>
                    </div>
                    <span className="text-[8px] font-mono font-bold bg-red-950 text-red-400 px-1.5 py-0.5 rounded">Aguardando</span>
                  </div>
                )}

                {/* Books list rendering */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Manuais Didáticos</span>
                  
                  {filteredBooks.length === 0 ? (
                    <div className="text-center p-6 text-slate-600 text-xs">
                      Nenhum manual didático corresponde aos termos inseridos.
                    </div>
                  ) : (
                    filteredBooks.map(book => {
                      const isFavorited = favoritesList.includes(book.id);
                      
                      // Check access using our new granular checkBookAccess helper
                      const accessResult = checkBookAccess(book, user);
                      const isLocked = !accessResult.hasAccess;

                      return (
                        <div 
                          key={book.id}
                          className="p-3 bg-slate-900 border border-slate-800/80 rounded-xl flex space-x-3 hover:border-slate-700 transition-all cursor-pointer relative"
                        >
                          {/* Book cover graphic */}
                          <div 
                            onClick={() => isLocked ? setBlockedBook(book) : handleOpenBook(book)}
                            className={`w-12 h-16 ${book.coverBg} rounded-md border border-slate-800 shadow-sm flex flex-col justify-between p-1.5 shrink-0 relative`}
                          >
                            {isLocked && (
                              <div className="absolute inset-0 bg-slate-950/80 rounded-md flex items-center justify-center text-amber-500">
                                <Lock className="w-4 h-4" />
                              </div>
                            )}
                            <div className="text-[6px] font-mono opacity-60 text-white uppercase">{book.subject}</div>
                            <div className="text-[7px] font-bold text-white leading-tight line-clamp-2">{book.title}</div>
                            <div className="text-[5px] font-bold text-amber-500 uppercase self-end">{book.classLevel}</div>
                          </div>

                          {/* Info */}
                          <div className="flex-1 flex flex-col justify-between min-w-0">
                            <div onClick={() => isLocked ? setBlockedBook(book) : handleOpenBook(book)}>
                              <div className="flex items-center space-x-1.5">
                                <span className="text-xs font-bold text-slate-200 block truncate">{book.title}</span>
                              </div>
                              <span className="text-[9px] text-slate-500 block truncate mt-0.5">{book.author}</span>
                              <span className="text-[8px] text-slate-400 block mt-1">{book.summary.substring(0, 50)}...</span>
                            </div>

                            {/* Actions bar inside list */}
                            <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-800/40">
                              <span className="text-[8px] font-mono text-amber-500 font-semibold">{book.classLevel}</span>
                              
                              <div className="flex items-center space-x-2">
                                {/* Favorite trigger */}
                                <button
                                  onClick={(e) => { e.stopPropagation(); toggleFavorite(book.id); }}
                                  className={`p-1 rounded-sm hover:bg-slate-800 transition-colors ${
                                    isFavorited ? 'text-red-500' : 'text-slate-500'
                                  }`}
                                >
                                  <Heart className="w-3.5 h-3.5 fill-current" />
                                </button>
                                
                                {/* Download status tag */}
                                {book.offlineStatus === 'downloaded' && (
                                  <span className="text-[8px] bg-emerald-950 text-emerald-400 font-bold px-1.5 py-0.5 rounded">
                                    Offline
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: FAVORITES SHELF */}
            {activeTab === 'favorites' && (
              <div className="p-4 flex-1 space-y-4">
                <h3 className="text-sm font-bold text-slate-200">Os Seus Favoritos</h3>
                <p className="text-[10px] text-slate-500">Aceda rapidamente aos livros didáticos e manuais que marcou como preferidos de estudo.</p>

                <div className="space-y-3">
                  {favoritesOnly.length === 0 ? (
                    <div className="text-center py-12 text-slate-600 text-xs">
                      Não marcou nenhum livro como favorito ainda.
                    </div>
                  ) : (
                    favoritesOnly.map(book => {
                      const accessResult = checkBookAccess(book, user);
                      const isLocked = !accessResult.hasAccess;
                      return (
                        <div 
                          key={book.id}
                          onClick={() => isLocked ? setBlockedBook(book) : handleOpenBook(book)}
                          className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex space-x-3 cursor-pointer"
                        >
                          <div className={`w-10 h-14 ${book.coverBg} rounded-md flex flex-col justify-between p-1 shrink-0`}>
                            <span className="text-[5px] text-white opacity-60 uppercase">{book.subject}</span>
                            <span className="text-[6px] font-bold text-white line-clamp-2">{book.title}</span>
                            <span className="text-[5px] text-amber-500 text-right">{book.classLevel}</span>
                          </div>
                          <div className="min-w-0 flex-1 flex flex-col justify-center">
                            <span className="text-xs font-bold text-slate-200 block truncate">{book.title}</span>
                            <span className="text-[9px] text-slate-500 block truncate">{book.author}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: STUDENT PROFILE */}
            {activeTab === 'profile' && (
              <div className="p-6 flex-1 space-y-5 text-xs">
                {/* Profile card details */}
                <div className="flex items-center space-x-4 border-b border-slate-800 pb-5">
                  <img src={user.avatar} alt="avatar" className="w-12 h-12 rounded-full border border-slate-700" />
                  <div>
                    <h4 className="text-sm font-black text-slate-100">{user.name}</h4>
                    <span className="text-[10px] text-slate-500 font-mono block">{user.email}</span>
                  </div>
                </div>

                {/* Subscription metadata */}
                {user.subscriptionStatus === 'active' ? (
                  <div className="p-4 bg-emerald-950/25 border border-emerald-500/30 rounded-2xl space-y-3.5 relative overflow-hidden">
                    {/* Decorative subtle background glow */}
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-extrabold text-emerald-400 uppercase tracking-widest">Subscrição Premium</span>
                      <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider bg-emerald-500 text-emerald-950 px-2 py-0.5 rounded-full shadow-xs">
                        <CheckCircle className="w-2.5 h-2.5" /> Ativo
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-400 block font-bold">Plano de Leitura Activo:</span>
                      <div className="flex items-baseline space-x-1.5">
                        <span className="text-sm font-black text-white uppercase">{user.plan}</span>
                        <span className="text-[9px] text-slate-500">• Renova mensalmente</span>
                      </div>
                      <p className="text-[10px] text-slate-300 leading-relaxed pt-1">
                        O seu acesso está 100% desbloqueado. Todos os manuais escolares premium e recursos DRM para leitura offline estão prontos para o seu sucesso académico.
                      </p>
                    </div>

                    <div className="pt-2 border-t border-emerald-500/10 flex items-center justify-between text-[9px] text-emerald-400 font-bold">
                      <span className="flex items-center gap-1">
                        <BookOpenCheck className="w-3.5 h-3.5" /> Leituras ilimitadas
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Download className="w-3.5 h-3.5" /> DRM Offline Ativo
                      </span>
                    </div>
                  </div>
                ) : user.subscriptionStatus === 'pending' ? (
                  <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-2xl space-y-3.5 relative overflow-hidden animate-pulse">
                    {/* Decorative subtle background glow */}
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-extrabold text-amber-500 uppercase tracking-widest">Validação em Curso</span>
                      <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider bg-amber-500 text-amber-950 px-2 py-0.5 rounded-full shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-950 animate-ping inline-block" /> Pendente
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-400 block font-bold">Plano Solicitado:</span>
                      <span className="text-sm font-black text-amber-400 uppercase block">{user.plan}</span>
                      <p className="text-[10px] text-slate-300 leading-relaxed pt-1">
                        O seu comprovativo bancário de transferência foi enviado com sucesso à secretaria corporativa da IAM_IM e está sob validação manual.
                      </p>
                    </div>

                    <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60 space-y-1.5">
                      <span className="text-[8px] font-extrabold uppercase text-slate-400 tracking-wider block">Fluxo de Desbloqueio</span>
                      <div className="flex items-center space-x-1.5 text-[9px]">
                        <span className="text-emerald-500 font-bold">✓ Comprovativo Enviado</span>
                        <span className="text-slate-600">→</span>
                        <span className="text-amber-400 font-bold animate-pulse">Validação Administrativa</span>
                      </div>
                    </div>

                    <p className="text-[8.5px] text-slate-500 italic">
                      Nota: Geralmente as validações manuais ocorrem dentro de 5 a 15 minutos em dias úteis escolares.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Subscrição do Estudante</span>
                      <span className="text-[9px] font-bold uppercase text-red-400 bg-red-950/40 border border-red-900/30 px-1.5 py-0.5 rounded">
                        Gratuito
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Plano Atual:</span>
                      <span className="font-bold text-slate-200 uppercase">{user.plan}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Estado do Plano:</span>
                      <span className="font-bold text-red-500">Inativo</span>
                    </div>

                    <p className="text-[9.5px] text-slate-400 leading-relaxed">
                      Aceda a todos os manuais oficiais da primária ao universitário subscrevendo os nossos pacotes didáticos acessíveis.
                    </p>

                    <button
                      onClick={() => setScreen('plan_selection')}
                      className="w-full py-2.5 bg-amber-500 text-slate-950 font-bold rounded-xl hover:bg-amber-600 transition-colors text-[10px] mt-2 cursor-pointer shadow-md"
                    >
                      Ativar Subscrição Estudantil
                    </button>
                  </div>
                )}

                {/* Gamificação: XP e Badges */}
                {(() => {
                  const xp = user.xp || 0;
                  const currentBadges = user.badges || ['primeiro-passo'];
                  const completedCount = user.completedBooks?.length || 0;
                  
                  // Level calculation
                  let lvl = 1;
                  let minXp = 0;
                  let maxXp = 150;
                  let title = 'Leitor Iniciante 📖';
                  let badgeColor = 'from-blue-500 to-indigo-600';
                  
                  if (xp > 150 && xp <= 350) {
                    lvl = 2;
                    minXp = 151;
                    maxXp = 350;
                    title = 'Curioso do Saber 🔍';
                    badgeColor = 'from-teal-500 to-emerald-600';
                  } else if (xp > 350 && xp <= 600) {
                    lvl = 3;
                    minXp = 351;
                    maxXp = 600;
                    title = 'Desbravador de Páginas 🧭';
                    badgeColor = 'from-purple-500 to-fuchsia-600';
                  } else if (xp > 600 && xp <= 1000) {
                    lvl = 4;
                    minXp = 601;
                    maxXp = 1000;
                    title = 'Especialista Académico 🎓';
                    badgeColor = 'from-amber-500 to-orange-600';
                  } else if (xp > 1000) {
                    lvl = 5;
                    minXp = 1001;
                    maxXp = 2500;
                    title = 'Mestre da Biblioteca 🏆';
                    badgeColor = 'from-rose-500 to-pink-600';
                  }

                  const percent = Math.min(100, Math.max(0, ((xp - minXp) / (maxXp - minXp)) * 100));
                  const nextXpRequired = maxXp - xp;

                  return (
                    <div className="space-y-4 p-4.5 bg-slate-900 border border-slate-800 rounded-2xl">
                      {/* Title Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Trophy className="w-4 h-4 text-amber-500 animate-pulse" />
                          <span className="text-[10px] font-black text-slate-200 uppercase tracking-wider font-mono">Percurso de Aprendizagem</span>
                        </div>
                        <span className="text-[8px] bg-indigo-950 text-indigo-400 font-extrabold px-2 py-0.5 rounded-full font-mono">
                          {completedCount} {completedCount === 1 ? 'Manual Concluído' : 'Manuais Concluídos'}
                        </span>
                      </div>

                      {/* Level and XP Meter */}
                      <div className="flex items-center space-x-3.5 bg-slate-950 p-3 rounded-xl border border-slate-800/40">
                        {/* Level badge circle */}
                        <div className={`w-11 h-11 shrink-0 bg-gradient-to-tr ${badgeColor} rounded-full flex flex-col items-center justify-center shadow-md border border-white/10`}>
                          <span className="text-[8px] font-black opacity-85 leading-none">NÍVEL</span>
                          <span className="text-sm font-black font-mono leading-tight">{lvl}</span>
                        </div>

                        {/* Rank and ProgressBar */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between mb-1">
                            <h4 className="text-[10px] font-black text-white truncate font-sans">{title}</h4>
                            <span className="text-[9px] font-mono font-bold text-amber-400 shrink-0">{xp} / {maxXp} XP</span>
                          </div>
                          
                          {/* Progress bar container */}
                          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-[1px]">
                            <div 
                              className={`h-full rounded-full bg-gradient-to-r ${badgeColor} transition-all duration-500`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>

                          <span className="text-[8px] text-slate-500 font-mono block mt-1">
                            {nextXpRequired > 0 ? `Faltam ${nextXpRequired} XP para atingir o Nível ${lvl + 1}` : 'Atingiu o patamar supremo escolar!'}
                          </span>
                        </div>
                      </div>

                      {/* Medals Grid header */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-1">
                          <Award className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-[10px] font-bold text-slate-400 font-mono">Minhas Medalhas de Conquista</span>
                        </div>

                        {/* Badges interactive list */}
                        <div className="grid grid-cols-2 gap-2">
                          {BADGE_DEFINITIONS.map(badgeDef => {
                            const isUnlocked = currentBadges.includes(badgeDef.id);
                            return (
                              <div 
                                key={badgeDef.id} 
                                className={`p-2.5 rounded-xl border flex flex-col justify-between text-left transition-all duration-300 relative overflow-hidden ${
                                  isUnlocked 
                                    ? 'bg-slate-950/80 border-amber-500/30 text-slate-100 shadow-xs' 
                                    : 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-45'
                                }`}
                              >
                                {isUnlocked && (
                                  <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-amber-500/15 border border-amber-500/30 rounded-full flex items-center justify-center">
                                    <Check className="w-2 h-2 text-amber-500 stroke-[3px]" />
                                  </div>
                                )}
                                <div className="space-y-1.5">
                                  <span className={`text-xl block ${!isUnlocked && 'grayscale'}`}>{badgeDef.icon}</span>
                                  <div>
                                    <span className="text-[9px] font-black block truncate leading-tight font-mono">{badgeDef.title}</span>
                                    <span className="text-[8px] text-slate-400 block leading-tight font-sans line-clamp-2 mt-0.5">{badgeDef.description}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Registered devices for DRM control */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Dispositivos Autorizados DRM</span>
                  <p className="text-[9px] text-slate-500">Em conformidade com as regras de DRM contra cópia ilegal, a sua conta limita a leitura offline nos seus aparelhos registados.</p>
                  
                  <div className="space-y-2">
                    {user.devices.map(dev => (
                      <div key={dev.id} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Smartphone className="w-4 h-4 text-slate-400" />
                          <div>
                            <span className="font-bold text-slate-200 block text-[10px]">{dev.name} ({dev.type})</span>
                            <span className="text-[8px] text-slate-500 block">Último acesso: {dev.lastActive}</span>
                          </div>
                        </div>
                        <span className="text-[8px] bg-emerald-950 text-emerald-400 font-bold px-2 py-0.5 rounded">
                          Autorizado
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Google Log out alternative if connected */}
                {googleAccessToken ? (
                  <button
                    onClick={handleGoogleLogout}
                    className="w-full py-2.5 bg-red-950/20 border border-red-900/40 text-red-400 hover:bg-red-950/40 rounded-xl font-bold font-mono transition-all text-[10px]"
                  >
                    Desvincular Conta Google & Sair ✕
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (confirm('Tem a certeza que deseja sair do IMSTUD?')) {
                        setScreen('onboarding');
                      }
                    }}
                    className="w-full py-2.5 border border-slate-800 text-red-500 hover:bg-red-950/20 rounded-xl font-bold font-mono transition-colors text-[10px]"
                  >
                    Terminar Sessão Estudantil
                  </button>
                )}
              </div>
            )}

            {/* TAB CONTENT: GMAIL COMMUNICATIONS & SECRETARIAT */}
            {activeTab === 'gmail' && (
              <div className="p-4 flex-1 flex flex-col space-y-4 text-xs min-h-0">
                <div className="shrink-0">
                  <h3 className="text-xs font-black uppercase text-amber-500 tracking-wider">Secretaria Escolar Digital</h3>
                  <p className="text-[10px] text-slate-500">Contacte Alfredo Leopoldino da IAM_IM e acompanhe circulares no seu e-mail real.</p>
                </div>

                {!googleAccessToken ? (
                  <div className="flex-1 flex flex-col justify-center items-center text-center p-4 space-y-4">
                    <div className="w-12 h-12 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-400 animate-pulse">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-200 block text-xs">Vincular Gmail Oficial</span>
                      <p className="text-[9px] text-slate-500 mt-1 max-w-xs leading-relaxed">
                        Conecte a sua conta de e-mail real para enviar comunicações, reportar problemas pedagógicos, e gerir a sua jornada escolar com segurança.
                      </p>
                    </div>

                    {googleLoginError && (
                      <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-xl text-[10px] text-red-300 text-left leading-relaxed animate-fade-in relative max-w-xs">
                        <span className="font-bold block text-red-400 mb-1">Aviso de Autenticação:</span>
                        {googleLoginError}
                        <button 
                          type="button"
                          onClick={() => setGoogleLoginError(null)} 
                          className="absolute top-2 right-2 text-red-400 hover:text-white text-xs font-bold font-mono px-1"
                        >
                          ✕
                        </button>
                      </div>
                    )}

                    <button
                      onClick={handleGoogleLogin}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center space-x-2 transition-colors cursor-pointer text-[11px]"
                    >
                      <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                        <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.986 0-.745-.079-1.32-.174-1.886H12.24z" />
                      </svg>
                      <span>Vincular Conta Google</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 flex-1 flex flex-col min-h-0 overflow-y-auto pr-1">
                    {/* Send Message to IAM_IM */}
                    <form onSubmit={handleSendGmail} className="bg-slate-900 p-3 border border-slate-800 rounded-2xl space-y-2.5 shrink-0">
                      <span className="text-[9px] font-extrabold text-amber-500 uppercase tracking-wider block">Enviar E-mail à IAM_IM</span>
                      
                      <div className="space-y-2 text-[10px]">
                        <div>
                          <span className="block text-[8px] text-slate-500 font-bold uppercase mb-0.5">Destinatário (Suporte Alfredo Leopoldino)</span>
                          <input
                            type="text"
                            disabled
                            value="leoalfredo252@gmail.com"
                            className="w-full bg-slate-950/80 border border-slate-800/80 p-1.5 rounded-lg text-[9px] text-slate-400 font-mono"
                          />
                        </div>
                        <div>
                          <span className="block text-[8px] text-slate-500 font-bold uppercase mb-0.5">Assunto Académico</span>
                          <select
                            value={gmailSubject}
                            onChange={e => setGmailSubject(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 p-1.5 rounded-lg text-[9.5px] text-slate-200"
                          >
                            <option value="Dúvida Curricular - IMSTUD">Dúvida Curricular / Pedagógica</option>
                            <option value="Suporte Técnico DRM - IMSTUD">Suporte Técnico de Leitura Offline</option>
                            <option value="Confirmação de Pagamento - IMSTUD">Confirmação de Pagamento de Subscrição</option>
                            <option value="Sugestão de Melhoria - IMSTUD">Sugestão de Livros de Iniciação a 5ª classe</option>
                          </select>
                        </div>
                        <div>
                          <span className="block text-[8px] text-slate-500 font-bold uppercase mb-0.5">Mensagem</span>
                          <textarea
                            value={gmailBody}
                            onChange={e => setGmailBody(e.target.value)}
                            placeholder="Olá Alfredo Leopoldino, gostaria de esclarecer uma dúvida sobre os manuais da primária..."
                            rows={3}
                            className="w-full bg-slate-950 border border-slate-800 p-1.5 rounded-lg text-[9.5px] text-slate-100 placeholder-slate-600 focus:outline-hidden"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSendingGmail}
                        className="w-full py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 font-bold rounded-lg transition-colors text-[10px]"
                      >
                        {isSendingGmail ? 'A enviar correio...' : 'Enviar Email via Gmail API ✉'}
                      </button>
                    </form>

                    {/* School Inbox Section */}
                    <div className="flex-1 flex flex-col min-h-[160px] space-y-2 mt-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Caixa de Correio Real</span>
                        <button
                          onClick={handleFetchEmails}
                          className="text-[9px] text-amber-500 font-bold hover:underline"
                        >
                          Atualizar ⟳
                        </button>
                      </div>

                      {isLoadingGmail ? (
                        <div className="text-center py-6 text-slate-500 text-[10px]">
                          A obter e-mails reais do seu Gmail...
                        </div>
                      ) : gmailError ? (
                        <div className="text-center py-4 text-red-400 bg-red-950/20 rounded-xl border border-red-900/40 p-2 text-[9px]">
                          {gmailError}
                        </div>
                      ) : gmailMessages.length === 0 ? (
                        <div className="text-center py-6 text-slate-600 text-[10px]">
                          Nenhum e-mail recente encontrado no seu Gmail.
                        </div>
                      ) : (
                        <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                          {gmailMessages.map(msg => (
                            <div
                              key={msg.id}
                              onClick={() => setSelectedMailDetail(selectedMailDetail?.id === msg.id ? null : msg)}
                              className={`p-2 bg-slate-900 border rounded-xl cursor-pointer transition-all ${
                                selectedMailDetail?.id === msg.id ? 'border-amber-500 bg-slate-900/80 shadow-md' : 'border-slate-800/50'
                              }`}
                            >
                              <div className="flex justify-between items-start text-[8px]">
                                <span className="font-bold text-slate-200 truncate max-w-[150px]">{msg.from.split('<')[0]}</span>
                                <span className="text-slate-500 font-mono shrink-0">{msg.date.split(',')[1]?.trim() || msg.date}</span>
                              </div>
                              <span className="text-[9px] text-amber-400 font-bold block truncate mt-0.5">{msg.subject}</span>
                              <p className={`text-[8.5px] text-slate-400 mt-1 leading-relaxed ${selectedMailDetail?.id === msg.id ? '' : 'line-clamp-2'}`}>
                                {msg.snippet}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: SYSTEM CONFIG / SETTINGS */}
            {activeTab === 'settings' && (
              <div className="p-6 flex-1 space-y-5 text-xs text-slate-300">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Definições da Aplicação</span>
                
                <div className="space-y-4">
                  {/* Language */}
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-200 block">Idioma Oficial</span>
                      <span className="text-[9px] text-slate-500">Padrão do Currículo de Angola</span>
                    </div>
                    <span className="font-bold text-slate-400">Português (AO)</span>
                  </div>

                  {/* Cache and Memory storage DRM */}
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-200 block">Armazenamento Local DRM</span>
                      <span className="text-[9px] text-slate-500">Espaço em cache para livros offline</span>
                    </div>
                    <button
                      onClick={() => alert('Cache de e-books limpa com sucesso. Os ficheiros encriptados foram removidos do IndexedDB.')}
                      className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 rounded-lg text-[9px] font-bold border border-slate-800"
                    >
                      Limpar Livros Offline
                    </button>
                  </div>

                  {/* Terms and conditions */}
                  <div className="border-t border-slate-800 pt-4 space-y-2">
                    <span className="font-bold text-slate-200 block">Avisos Legais</span>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Este software está licenciado para uso educativo exclusivo do utilizador registado. A cópia, distribuição comercial ou partilha ilegal do binário decifrado constitui infração penal nos termos da Lei dos Direitos de Autor de Angola.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: GOOGLE DRIVE & GOOGLE PICKER INTEGRATION */}
            {activeTab === 'drive' && (
              <GoogleDriveTab
                accessToken={googleAccessToken}
                onGoogleSignIn={handleGoogleLogin}
                onImportBook={onImportBook}
                isOffline={isOfflineSystemMode}
              />
            )}

            {/* SUBTLE GOOGLE DRIVE SYNC STATUS STRIP */}
            <div className="bg-slate-950 px-3 py-1 flex items-center justify-between text-[8px] font-mono border-t border-slate-900 select-none shrink-0 z-55">
              <div className="flex items-center space-x-1.5 min-w-0">
                <span className="relative flex h-1.5 w-1.5">
                  {googleAccessToken && !isOfflineSystemMode ? (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </>
                  ) : (
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-slate-600"></span>
                  )}
                </span>
                <span className="text-slate-500 truncate">
                  {isOfflineSystemMode
                    ? 'Drive: Modo Offline'
                    : googleAccessToken
                    ? 'Drive: Ligado e Sincronizado'
                    : 'Drive: Desconectado'}
                </span>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                {googleAccessToken ? (
                  <button
                    onClick={handleGoogleLogin}
                    className="text-amber-500 hover:text-amber-400 font-bold flex items-center space-x-1 uppercase tracking-wider transition-colors cursor-pointer"
                    title="Renovar ligação ao Google Drive"
                  >
                    <RefreshCw className="w-2.5 h-2.5 animate-spin" style={{ animationDuration: '6s' }} />
                    <span>Re-autenticar</span>
                  </button>
                ) : (
                  <button
                    onClick={handleGoogleLogin}
                    className="text-blue-400 hover:text-blue-300 font-bold flex items-center space-x-1 uppercase tracking-wider transition-colors cursor-pointer"
                    title="Ligar conta Google Drive"
                  >
                    <span>Ligar Drive</span>
                  </button>
                )}
              </div>
            </div>

            {/* NAV FOOTER (Kindle / Duolingo layout style) */}
            <div className="bg-slate-950 border-t border-slate-900 p-2 flex justify-between items-center text-[10px] z-55">
              <button
                onClick={() => handleNavClick('library')}
                className={`flex flex-col items-center flex-1 py-1 transition-colors ${
                  activeTab === 'library' ? 'text-amber-500 font-bold' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <BookOpen className="w-4 h-4 mb-1" />
                <span>Biblioteca</span>
              </button>

              <button
                onClick={() => handleNavClick('favorites')}
                className={`flex flex-col items-center flex-1 py-1 transition-colors ${
                  activeTab === 'favorites' ? 'text-amber-500 font-bold' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Heart className="w-4 h-4 mb-1" />
                <span>Favoritos</span>
              </button>

              <button
                onClick={() => handleNavClick('gmail')}
                className={`flex flex-col items-center flex-1 py-1 transition-colors ${
                  activeTab === 'gmail' ? 'text-amber-500 font-bold' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Mail className="w-4 h-4 mb-1" />
                <span>Secretaria</span>
              </button>

              <button
                onClick={() => handleNavClick('drive')}
                className={`flex flex-col items-center flex-1 py-1 transition-colors relative ${
                  activeTab === 'drive' ? 'text-amber-500 font-bold' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <div className="relative">
                  <Cloud className="w-4 h-4 mb-1" />
                  {googleAccessToken && !isOfflineSystemMode && (
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  )}
                </div>
                <span>Drive</span>
              </button>

              <button
                onClick={() => handleNavClick('profile')}
                className={`flex flex-col items-center flex-1 py-1 transition-colors ${
                  activeTab === 'profile' ? 'text-amber-500 font-bold' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <User className="w-4 h-4 mb-1" />
                <span>Perfil</span>
              </button>

              <button
                onClick={() => handleNavClick('settings')}
                className={`flex flex-col items-center flex-1 py-1 transition-colors ${
                  activeTab === 'settings' ? 'text-amber-500 font-bold' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Settings className="w-4 h-4 mb-1" />
                <span>Definições</span>
              </button>
            </div>
          </div>
        )}

        {/* E-BOOK READER DISPLAY MODAL */}
        {screen === 'reader' && selectedBook && (
          <div className="absolute inset-0 bg-slate-950 z-50 animate-fade-in flex flex-col h-full">
            <Reader
              book={selectedBook}
              user={user}
              onBack={() => setScreen('library')}
              onUpdateOfflineStatus={onUpdateBookOfflineStatus}
              isOfflineSystemMode={isOfflineSystemMode}
              initialFormat={selectedFormat}
              onUpdateUser={onUpdateUser}
            />
          </div>
        )}

        {/* CHOSEN READING FORMAT SELECTOR MODAL */}
        {showFormatSelector && selectedBook && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative flex flex-col">
              
              {/* Close Button */}
              <button 
                onClick={() => setShowFormatSelector(false)}
                className="absolute right-4 top-4 p-1.5 rounded-full bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer z-10"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header preview of the Book */}
              <div className={`p-5 ${selectedBook.coverBg} border-b border-slate-800 flex flex-col justify-end min-h-[120px] relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent z-0" />
                <div className="relative z-10">
                  <span className="text-[9px] font-mono font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded uppercase">
                    {selectedBook.subject} • {selectedBook.classLevel}
                  </span>
                  <h4 className="text-sm font-extrabold text-white mt-1 leading-tight">{selectedBook.title}</h4>
                  <p className="text-[10px] text-slate-300 mt-0.5">{selectedBook.author}</p>
                </div>
              </div>

              {/* Modal Content - Format choices */}
              <div className="p-5 space-y-4 max-h-[440px] overflow-y-auto">
                <div className="text-center">
                  <h3 className="text-sm font-extrabold text-slate-100">Escolha de Visualização Profissional</h3>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Selecione a sua preferência de leitura optimizada para este manual didático.
                  </p>
                </div>

                {/* Formats Grid */}
                <div className="space-y-2.5">
                  {/* 1. PDF - The principal option */}
                  <button
                    onClick={() => setSelectedFormat('pdf')}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start space-x-3 cursor-pointer ${
                      selectedFormat === 'pdf'
                        ? 'bg-red-500/10 border-red-500/50 shadow-md ring-1 ring-red-500/20'
                        : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${selectedFormat === 'pdf' ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-400'}`}>
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200 text-xs">Leitura em PDF Seguro</span>
                        <span className="text-[8px] bg-red-600 text-white font-bold font-mono px-1.5 py-0.2 rounded uppercase tracking-wider">Principal</span>
                      </div>
                      <p className="text-[9px] text-slate-400 mt-1 leading-relaxed">
                        Transição de manuais 100% físicos para o digital seguro na plataforma. Adaptável a telemóveis, tablets e PCs, com renderização de alta fidelidade e bloqueio de cópia ou download externo.
                      </p>
                    </div>
                  </button>

                  {/* 2. JPEG - Image format */}
                  <button
                    onClick={() => setSelectedFormat('images')}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start space-x-3 cursor-pointer ${
                      selectedFormat === 'images'
                        ? 'bg-teal-500/10 border-teal-500/50 shadow-md ring-1 ring-teal-500/20'
                        : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${selectedFormat === 'images' ? 'bg-teal-500/20 text-teal-400' : 'bg-slate-800 text-slate-400'}`}>
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <span className="font-bold text-slate-200 text-xs">Leitura em JPEG (Visual)</span>
                      <p className="text-[9px] text-slate-400 mt-1 leading-relaxed">
                        Páginas fotográficas de alta definição. Ideal para gráficos detalhados, tabelas científicas e esquemas visuais complexos da editora.
                      </p>
                    </div>
                  </button>

                  {/* 3. ePUB / PUB - Flow text */}
                  <button
                    onClick={() => setSelectedFormat('epub')}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start space-x-3 cursor-pointer ${
                      selectedFormat === 'epub'
                        ? 'bg-amber-500/10 border-amber-500/50 shadow-md ring-1 ring-amber-500/20'
                        : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${selectedFormat === 'epub' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                      <Type className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <span className="font-bold text-slate-200 text-xs">Leitura em PUB (Fluído)</span>
                      <p className="text-[9px] text-slate-400 mt-1 leading-relaxed">
                        Formato líquido e redimensionável. Personalize o tamanho do texto e os temas visuais (Dia, Noite, Sépia) para conforto em leituras prolongadas.
                      </p>
                    </div>
                  </button>
                </div>

                {/* DRM Protection Statement */}
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/60 flex items-start space-x-2 text-[9px] text-slate-400 leading-normal">
                  <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <p>
                    <span className="font-bold text-slate-300">Proteção de Direitos IAM_IM:</span> Qualquer ficheiro lido está sob encriptação militar DRM. É estritamente proibida a partilha, cópia de trechos ou download externo fora da plataforma.
                  </p>
                </div>
              </div>

              {/* Start reading button */}
              <div className="p-5 border-t border-slate-800 bg-slate-950/40 flex space-x-3">
                <button
                  onClick={() => setShowFormatSelector(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer text-center"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setShowFormatSelector(false);
                    setScreen('reader');
                  }}
                  className="flex-1 py-2.5 px-4 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl text-xs shadow-md transition-colors cursor-pointer text-center"
                >
                  Iniciar Estudo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BLOCKED BOOK ACCESS MODAL (Plan Selection & Class Correction Options) */}
        {blockedBook && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative">
              
              {/* Close Button */}
              <button 
                onClick={() => setBlockedBook(null)}
                className="absolute right-4 top-4 p-1 rounded-full bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Decorative cover preview background header */}
              <div className={`p-6 ${blockedBook.coverBg} border-b border-slate-800 flex flex-col justify-end min-h-[140px] relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent z-0" />
                <div className="relative z-10">
                  <span className="text-[9px] font-mono font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded uppercase">
                    {blockedBook.subject}
                  </span>
                  <h4 className="text-sm font-extrabold text-white mt-1 leading-tight">{blockedBook.title}</h4>
                  <p className="text-[10px] text-slate-300 mt-0.5">{blockedBook.author}</p>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4 text-xs">
                <div className="flex items-start space-x-3 bg-red-500/10 border border-red-500/20 p-3.5 rounded-2xl">
                  <Lock className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] font-bold text-red-400 block">Acesso Reservado / Bloqueado</span>
                    <p className="text-[10px] text-slate-300 leading-relaxed mt-0.5">
                      {checkBookAccess(blockedBook, user).reason || 'Este manual exige uma subscrição correspondente à sua classe para ser aberto no leitor digital.'}
                    </p>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 space-y-1.5 font-mono">
                  <div className="flex justify-between border-b border-slate-800/60 pb-1">
                    <span>O seu plano atual:</span>
                    <span className="font-bold text-slate-200 capitalize">{user.plan === 'free' ? 'Grátis (Limitado)' : user.plan}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/60 pb-1">
                    <span>A sua classe configurada:</span>
                    <span className="font-bold text-slate-200">{user.classLevel || 'Não Definida'}</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span>Classe recomendada do manual:</span>
                    <span className="font-bold text-amber-500">{blockedBook.classLevel}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => {
                      setBlockedBook(null);
                      setScreen('plan_selection');
                    }}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Adquirir / Atualizar Subscrição</span>
                  </button>

                  <button
                    onClick={() => {
                      setBlockedBook(null);
                      setScreen('class_selection');
                    }}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Alterar Meu Ano Letivo (Classe)</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
