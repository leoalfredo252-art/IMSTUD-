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
  AlertCircle
} from 'lucide-react';
import { Book, UserProfile, PaymentRecord } from '../types';
import { SUBSCRIPTION_PLANS } from '../data/initialData';
import Logo from './Logo';
import Reader from './Reader';

interface AppFlowProps {
  books: Book[];
  user: UserProfile;
  payments: PaymentRecord[];
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onAddPayment: (payment: PaymentRecord) => void;
  onUpdateBookOfflineStatus: (bookId: string, status: 'none' | 'downloading' | 'downloaded') => void;
  isOfflineSystemMode: boolean;
  setIsOfflineSystemMode: (val: boolean) => void;
}

export default function AppFlow({
  books,
  user,
  payments,
  onUpdateUser,
  onAddPayment,
  onUpdateBookOfflineStatus,
  isOfflineSystemMode,
  setIsOfflineSystemMode
}: AppFlowProps) {
  // Screens state: 'splash' | 'onboarding' | 'register' | 'login' | 'forgot_password' | 'verification' | 'class_selection' | 'plan_selection' | 'payment' | 'library' | 'profile' | 'settings' | 'reader'
  const [screen, setScreen] = useState<string>('splash');
  
  // Navigation states
  const [activeTab, setActiveTab] = useState<'library' | 'favorites' | 'profile' | 'settings'>('library');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<any>(null);

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

  // Skip splash automatically after 2.5 seconds, or let the user click
  React.useEffect(() => {
    if (screen === 'splash') {
      const timer = setTimeout(() => {
        setScreen('onboarding');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  // Handle manual tab switching inside App main views
  const handleNavClick = (tab: 'library' | 'favorites' | 'profile' | 'settings') => {
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
    setScreen('reader');
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
              <button
                onClick={() => setScreen('register')}
                className="w-full py-3 bg-blue-900 text-white font-bold rounded-xl text-xs hover:bg-blue-800 transition-colors shadow-sm"
              >
                Criar Nova Conta Grátis
              </button>
              <button
                onClick={() => setScreen('login')}
                className="w-full py-3 bg-slate-900 text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-800 transition-colors border border-slate-800"
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

            <div className="grid grid-cols-2 gap-2 text-xs">
              {['5ª Classe', '6ª Classe', '7ª Classe', '8ª Classe', '9ª Classe', '10ª Classe', '11ª Classe', '12ª Classe', 'Universitário'].map(grade => (
                <button
                  key={grade}
                  onClick={() => handleSelectClass(grade)}
                  className="p-3 bg-slate-900 border border-slate-800 rounded-xl font-bold hover:border-amber-500 hover:bg-slate-800 text-slate-200 transition-all text-center"
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
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <Logo variant="horizontal" size="sm" />
              <div className="flex items-center space-x-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] font-bold text-amber-500 font-mono">{user.classLevel || 'Estudante'}</span>
              </div>
            </div>

            {/* TAB CONTENT: LIBRARY SEARCH SHELF */}
            {activeTab === 'library' && (
              <div className="p-4 flex-1 space-y-4">
                
                {/* Search manuals */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Pesquisar manuais escolares..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 pl-9 pr-4 py-2.5 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-hidden"
                  />
                </div>

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
                      
                      // Check if locked based on premium rules
                      const isLocked = book.isPremium && user.subscriptionStatus !== 'active';

                      return (
                        <div 
                          key={book.id}
                          className="p-3 bg-slate-900 border border-slate-800/80 rounded-xl flex space-x-3 hover:border-slate-700 transition-all cursor-pointer relative"
                        >
                          {/* Book cover graphic */}
                          <div 
                            onClick={() => !isLocked && handleOpenBook(book)}
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
                            <div onClick={() => !isLocked && handleOpenBook(book)}>
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
                      const isLocked = book.isPremium && user.subscriptionStatus !== 'active';
                      return (
                        <div 
                          key={book.id}
                          onClick={() => !isLocked && handleOpenBook(book)}
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
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Subscrição do Estudante</span>
                  
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Plano Atual:</span>
                    <span className="font-bold text-amber-500 uppercase">{user.plan}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Estado do Plano:</span>
                    <span className={`font-bold ${user.subscriptionStatus === 'active' ? 'text-emerald-500' : 'text-red-500'}`}>
                      {user.subscriptionStatus === 'active' ? 'Ativo (Premium)' : user.subscriptionStatus === 'pending' ? 'Pendente' : 'Inativo'}
                    </span>
                  </div>

                  {user.subscriptionStatus === 'none' && (
                    <button
                      onClick={() => setScreen('plan_selection')}
                      className="w-full py-2.5 bg-amber-500 text-slate-950 font-bold rounded-xl hover:bg-amber-600 transition-colors text-[10px] mt-2"
                    >
                      Ativar Subscrição
                    </button>
                  )}
                </div>

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

                {/* Log out option */}
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
            />
          </div>
        )}

      </div>
    </div>
  );
}
